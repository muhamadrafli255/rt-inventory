const prisma = require("../config/prisma");

async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  });
}

async function getCategoryById(id) {
  return prisma.category.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      items: {
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });
}

async function createCategory(data) {
  return prisma.category.create({
    data: {
      name: data.name,
      description: data.description || null,
    },
  });
}

async function updateCategory(id, data) {
  return prisma.category.update({
    where: {
      id: Number(id),
    },
    data: {
      name: data.name,
      description: data.description || null,
    },
  });
}

async function deleteCategory(id) {
  return prisma.category.delete({
    where: {
      id: Number(id),
    },
  });
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};