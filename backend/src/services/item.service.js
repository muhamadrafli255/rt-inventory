const prisma = require("../config/prisma");

async function getAllItems({
  page = 1,
  limit = 10,
  search = "",
  categoryId,
  condition,
}) {
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
        },
      },
      {
        code: {
          contains: search,
        },
      },
    ];
  }

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  if (condition) {
    where.condition = condition;
  }

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.item.count({
      where,
    }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getItemById(id) {
  return prisma.item.findFirst({
    where: {
      id: Number(id),
      isActive: true,
    },
    include: {
      category: true,
    },
  });
}

async function createItem(data) {
  const category = await prisma.category.findUnique({
    where: {
      id: data.categoryId,
    },
  });

  if (!category) {
    const error = new Error("Kategori tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  return prisma.item.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description || null,
      categoryId: data.categoryId,
      quantity: data.quantity,
      available: data.quantity,
      condition: data.condition,
      imageUrl: data.imageUrl || null,
    },
    include: {
      category: true,
    },
  });
}

async function updateItem(id, data) {
  const existingItem = await prisma.item.findFirst({
    where: {
      id: Number(id),
      isActive: true,
    },
  });

  if (!existingItem) {
    const error = new Error("Barang tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

    if (!category) {
      const error = new Error("Kategori tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }
  }

  const quantity = data.quantity ?? existingItem.quantity;

  if (quantity < existingItem.quantity) {
    const borrowedQuantity =
      existingItem.quantity - existingItem.available;

    if (quantity < borrowedQuantity) {
      const error = new Error(
        `Jumlah barang tidak boleh kurang dari jumlah yang sedang dipinjam (${borrowedQuantity})`
      );

      error.statusCode = 422;
      throw error;
    }
  }

  const available =
    data.available ??
    existingItem.available + (quantity - existingItem.quantity);

  if (available < 0 || available > quantity) {
    const error = new Error(
      "Jumlah tersedia tidak boleh kurang dari 0 atau lebih besar dari jumlah total"
    );

    error.statusCode = 422;
    throw error;
  }

  return prisma.item.update({
    where: {
      id: Number(id),
    },
    data: {
      name: data.name,
      code: data.code,
      description: data.description || null,
      categoryId: data.categoryId,
      quantity,
      available,
      condition: data.condition,
      imageUrl: data.imageUrl || null,
    },
    include: {
      category: true,
    },
  });
}

async function softDeleteItem(id) {
  const existingItem = await prisma.item.findFirst({
    where: {
      id: Number(id),
      isActive: true,
    },
  });

  if (!existingItem) {
    const error = new Error("Barang tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  if (existingItem.available !== existingItem.quantity) {
    const error = new Error(
      "Barang tidak dapat dihapus karena sedang dipinjam"
    );

    error.statusCode = 409;
    throw error;
  }

  return prisma.item.update({
    where: {
      id: Number(id),
    },
    data: {
      isActive: false,
    },
  });
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  softDeleteItem,
};