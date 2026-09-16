const prisma = require("../config/prisma");

async function getDashboardSummary() {
  const [
    totalUsers,
    totalItems,
    totalCategories,
    totalLoans,
    pendingLoans,
    approvedLoans,
    borrowedLoans,
    returnedLoans,
    rejectedLoans,
    cancelledLoans,
    totalAvailableStock,
    totalStock,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        isActive: true,
      },
    }),

    prisma.item.count({
      where: {
        isActive: true,
      },
    }),

    prisma.category.count(),

    prisma.loan.count(),

    prisma.loan.count({
      where: {
        status: "MENUNGGU",
      },
    }),

    prisma.loan.count({
      where: {
        status: "DISETUJUI",
      },
    }),

    prisma.loan.count({
      where: {
        status: "DIPINJAM",
      },
    }),

    prisma.loan.count({
      where: {
        status: "DIKEMBALIKAN",
      },
    }),

    prisma.loan.count({
      where: {
        status: "DITOLAK",
      },
    }),

    prisma.loan.count({
      where: {
        status: "DIBATALKAN",
      },
    }),

    prisma.item.aggregate({
      where: {
        isActive: true,
      },
      _sum: {
        available: true,
      },
    }),

    prisma.item.aggregate({
      where: {
        isActive: true,
      },
      _sum: {
        quantity: true,
      },
    }),
  ]);

  return {
    totalUsers,
    totalItems,
    totalCategories,
    totalLoans,
    pendingLoans,
    approvedLoans,
    borrowedLoans,
    returnedLoans,
    rejectedLoans,
    cancelledLoans,
    totalAvailableStock: totalAvailableStock._sum.available || 0,
    totalStock: totalStock._sum.quantity || 0,
  };
}

async function getLoanStatistics() {
  const statuses = [
    "MENUNGGU",
    "DISETUJUI",
    "DITOLAK",
    "DIPINJAM",
    "DIKEMBALIKAN",
    "DIBATALKAN",
  ];

  const statistics = await Promise.all(
    statuses.map(async (status) => {
      const total = await prisma.loan.count({
        where: {
          status,
        },
      });

      return {
        status,
        total,
      };
    })
  );

  return statistics;
}

async function getPopularItems() {
  const groupedLoans = await prisma.loan.groupBy({
    by: ["itemId"],
    where: {
      status: {
        in: [
          "DISETUJUI",
          "DIPINJAM",
          "DIKEMBALIKAN",
        ],
      },
    },
    _sum: {
      quantity: true,
    },
    _count: {
      itemId: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 5,
  });

  const itemIds = groupedLoans.map((loan) => loan.itemId);

  const items = await prisma.item.findMany({
    where: {
      id: {
        in: itemIds,
      },
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  return groupedLoans.map((loan) => {
    const item = items.find(
      (item) => item.id === loan.itemId
    );

    return {
      itemId: loan.itemId,
      name: item?.name || "Barang tidak ditemukan",
      code: item?.code || null,
      totalBorrowed: loan._sum.quantity || 0,
      totalTransactions: loan._count.itemId,
    };
  });
}

async function getRecentLoans() {
  return prisma.loan.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      item: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
}

async function getDashboard() {
  const [
    summary,
    loanStatistics,
    popularItems,
    recentLoans,
  ] = await Promise.all([
    getDashboardSummary(),
    getLoanStatistics(),
    getPopularItems(),
    getRecentLoans(),
  ]);

  return {
    summary,
    loanStatistics,
    popularItems,
    recentLoans,
  };
}

module.exports = {
  getDashboard,
  getDashboardSummary,
  getLoanStatistics,
  getPopularItems,
  getRecentLoans,
};