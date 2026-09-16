const argon2 = require("argon2");
const prisma = require("../config/prisma");

async function getUsers({ page = 1, limit = 10, search, role, isActive }) {
  const skip = (page - 1) * limit;

  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  if (role) {
    where.role = {
      name: role,
    };
  }

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        isActive: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            loans: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      isActive: true,
      roleId: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      loans: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          item: {
            select: { name: true, code: true },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function createUser(data) {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error("Email sudah terdaftar");
    error.statusCode = 409;
    throw error;
  }

  const targetRole = await prisma.role.findUnique({
    where: { name: data.roleName || "WARGA" },
  });

  if (!targetRole) {
    const error = new Error(`Role ${data.roleName} tidak ditemukan`);
    error.statusCode = 404;
    throw error;
  }

  const passwordHash = await argon2.hash(data.password, {
    type: argon2.argon2id,
  });

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      isActive: data.isActive !== false,
      roleId: targetRole.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      isActive: true,
      role: {
        select: { id: true, name: true },
      },
      createdAt: true,
    },
  });

  return user;
}

async function updateUser(id, data) {
  const userId = Number(id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (data.name) updateData.name = data.name.trim();

  if (data.email) {
    const normalizedEmail = data.email.toLowerCase().trim();
    if (normalizedEmail !== user.email) {
      const emailCollision = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (emailCollision) {
        const error = new Error("Email sudah digunakan oleh akun lain");
        error.statusCode = 409;
        throw error;
      }
      updateData.email = normalizedEmail;
    }
  }

  if (data.password && data.password.trim()) {
    updateData.passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
    });
  }

  if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
  if (data.address !== undefined) updateData.address = data.address?.trim() || null;
  if (typeof data.isActive === "boolean") updateData.isActive = data.isActive;

  if (data.roleName) {
    const targetRole = await prisma.role.findUnique({
      where: { name: data.roleName },
    });
    if (!targetRole) {
      const error = new Error(`Role ${data.roleName} tidak ditemukan`);
      error.statusCode = 404;
      throw error;
    }
    updateData.roleId = targetRole.id;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      isActive: true,
      role: {
        select: { id: true, name: true },
      },
      updatedAt: true,
    },
  });

  return updatedUser;
}

async function deleteUser(id) {
  const userId = Number(id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { loans: true },
      },
    },
  });

  if (!user) {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  // If user has existing loans, soft delete by setting isActive to false
  if (user._count.loans > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    return { message: "User memiliki riwayat peminjaman, status diubah menjadi Non-Aktif." };
  }

  // Delete associated sessions first
  await prisma.session.deleteMany({
    where: { userId },
  });

  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: "User berhasil dihapus." };
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
