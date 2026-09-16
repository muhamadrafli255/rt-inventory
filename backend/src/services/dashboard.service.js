const prisma = require("../config/prisma");

async function getDashboardSummary() {
  const [
    totalItems,
    totalUsers,
    totalCategories,
    totalLoans,
    stockAgg,
  ] = await Promise.all([
    prisma.item.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.loan.count(),
    prisma.item.aggregate({
      where: { isActive: true },
      _sum: {
        quantity: true,
        available: true,
      },
    }),
  ]);

  const totalStock = stockAgg._sum.quantity || 0;
  const availableStock = stockAgg._sum.available || 0;

  return {
    totalItems,
    totalUsers,
    totalCategories,
    totalLoans,
    totalStock,
    totalAvailableStock: availableStock,
    availableStock,
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
  const popular = await prisma.loan.groupBy({
    by: ["itemId"],
    _count: {
      itemId: true,
    },
    orderBy: {
      _count: {
        itemId: "desc",
      },
    },
    take: 4,
  });

  if (popular.length === 0) {
    return [];
  }

  const itemIds = popular.map((p) => p.itemId);
  const items = await prisma.item.findMany({
    where: {
      id: { in: itemIds },
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  const itemMap = new Map(items.map((i) => [i.id, i]));

  return popular.map((p) => {
    const item = itemMap.get(p.itemId);
    return {
      id: p.itemId,
      name: item?.name || "Unknown Item",
      code: item?.code || "",
      totalBorrowed: p._count.itemId,
      loanCount: p._count.itemId,
    };
  });
}

async function getRecentLoans() {
  const loans = await prisma.loan.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
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

  return loans;
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

async function getAdminDashboard() {
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

async function getWargaDashboard(userId) {
  const [
    availableStock,
    myLoans,
  ] = await Promise.all([
    prisma.item.aggregate({
      where: {
        isActive: true,
      },
      _sum: {
        available: true,
      },
    }),

    prisma.loan.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    }),
  ]);

  const loanSummary = await prisma.loan.groupBy({
    by: ["status"],
    where: {
      userId,
    },
    _count: {
      status: true,
    },
  });

  const statusSummary = {
    MENUNGGU: 0,
    DISETUJUI: 0,
    DITOLAK: 0,
    DIPINJAM: 0,
    DIKEMBALIKAN: 0,
    DIBATALKAN: 0,
  };

  for (const row of loanSummary) {
    statusSummary[row.status] = row._count.status;
  }

  return {
    summary: {
      totalAvailableStock:
        availableStock._sum.available || 0,

      totalMyLoans: myLoans.length,

      pendingLoans: statusSummary.MENUNGGU,

      approvedLoans: statusSummary.DISETUJUI,

      borrowedLoans: statusSummary.DIPINJAM,

      returnedLoans: statusSummary.DIKEMBALIKAN,

      rejectedLoans: statusSummary.DITOLAK,

      cancelledLoans: statusSummary.DIBATALKAN,
    },

    recentLoans: myLoans,
  };
}

module.exports = {
  getDashboard,
  getDashboardSummary,
  getLoanStatistics,
  getPopularItems,
  getRecentLoans,
  getAdminDashboard,
  getWargaDashboard,
};