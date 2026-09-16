const prisma = require("../config/prisma");

async function getLoans({
  userId,
  role,
  page = 1,
  limit = 10,
  status,
}) {
  const skip = (page - 1) * limit;

  const where = {};

  // WARGA hanya boleh melihat peminjaman miliknya
  if (role !== "ADMIN") {
    where.userId = userId;
  }

  if (status) {
    where.status = status;
  }

  const [loans, total] = await Promise.all([
    prisma.loan.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        item: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.loan.count({
      where,
    }),
  ]);

  return {
    loans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getLoanById(id, userId, role) {
  const where = {
    id: Number(id),
  };

  if (role !== "ADMIN") {
    where.userId = userId;
  }

  return prisma.loan.findFirst({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      item: {
        include: {
          category: true,
        },
      },
    },
  });
}

async function createLoan(userId, data) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findFirst({
      where: {
        id: data.itemId,
        isActive: true,
      },
    });

    if (!item) {
      const error = new Error("Barang tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    if (data.quantity > item.available) {
      const error = new Error(
        `Jumlah barang tersedia hanya ${item.available}`
      );

      error.statusCode = 422;
      throw error;
    }

    if (data.endDate <= data.startDate) {
      const error = new Error(
        "Tanggal selesai harus setelah tanggal mulai"
      );

      error.statusCode = 422;
      throw error;
    }

    const loan = await tx.loan.create({
      data: {
        userId,
        itemId: data.itemId,
        quantity: data.quantity,
        purpose: data.purpose,
        notes: data.notes || null,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "MENUNGGU",
      },
      include: {
        item: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return loan;
  });
}

async function approveLoan(id) {
  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        item: true,
      },
    });

    if (!loan) {
      const error = new Error("Peminjaman tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    if (loan.status !== "MENUNGGU") {
      const error = new Error(
        "Hanya peminjaman berstatus MENUNGGU yang dapat disetujui"
      );

      error.statusCode = 422;
      throw error;
    }

    if (loan.quantity > loan.item.available) {
      const error = new Error(
        "Stok barang sudah tidak mencukupi"
      );

      error.statusCode = 422;
      throw error;
    }

    return tx.loan.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "DISETUJUI",
        approvedAt: new Date(),
      },
      include: {
        item: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  });
}

async function rejectLoan(id, rejectionReason) {
  const loan = await prisma.loan.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!loan) {
    const error = new Error("Peminjaman tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  if (loan.status !== "MENUNGGU") {
    const error = new Error(
      "Hanya peminjaman berstatus MENUNGGU yang dapat ditolak"
    );

    error.statusCode = 422;
    throw error;
  }

  return prisma.loan.update({
    where: {
      id: Number(id),
    },
    data: {
      status: "DITOLAK",
      rejectedAt: new Date(),
      rejectionReason,
    },
  });
}

async function markAsBorrowed(id) {
  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        item: true,
      },
    });

    if (!loan) {
      const error = new Error("Peminjaman tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    if (loan.status !== "DISETUJUI") {
      const error = new Error(
        "Barang hanya dapat diserahkan jika peminjaman sudah disetujui"
      );

      error.statusCode = 422;
      throw error;
    }

    if (loan.quantity > loan.item.available) {
      const error = new Error(
        "Stok tersedia tidak mencukupi"
      );

      error.statusCode = 422;
      throw error;
    }

    const updatedItem = await tx.item.updateMany({
      where: {
        id: loan.itemId,
        available: {
          gte: loan.quantity,
        },
      },
      data: {
        available: {
          decrement: loan.quantity,
        },
      },
    });

    if (updatedItem.count === 0) {
      const error = new Error(
        "Stok barang berubah atau tidak mencukupi"
      );

      error.statusCode = 409;
      throw error;
    }

    return tx.loan.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "DIPINJAM",
      },
      include: {
        item: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  });
}

async function returnLoan(id) {
  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!loan) {
      const error = new Error("Peminjaman tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    if (loan.status !== "DIPINJAM") {
      const error = new Error(
        "Hanya barang berstatus DIPINJAM yang dapat dikembalikan"
      );

      error.statusCode = 422;
      throw error;
    }

    await tx.item.update({
      where: {
        id: loan.itemId,
      },
      data: {
        available: {
          increment: loan.quantity,
        },
      },
    });

    return tx.loan.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "DIKEMBALIKAN",
        returnedAt: new Date(),
      },
      include: {
        item: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  });
}

async function cancelLoan(id, userId, role) {
  const where = {
    id: Number(id),
  };

  if (role !== "ADMIN") {
    where.userId = userId;
  }

  const loan = await prisma.loan.findFirst({
    where,
  });

  if (!loan) {
    const error = new Error("Peminjaman tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  if (loan.status !== "MENUNGGU") {
    const error = new Error(
      "Hanya peminjaman berstatus MENUNGGU yang dapat dibatalkan"
    );

    error.statusCode = 422;
    throw error;
  }

  return prisma.loan.update({
    where: {
      id: Number(id),
    },
    data: {
      status: "DIBATALKAN",
    },
  });
}

module.exports = {
  getLoans,
  getLoanById,
  createLoan,
  approveLoan,
  rejectLoan,
  markAsBorrowed,
  returnLoan,
  cancelLoan,
};