const argon2 = require("argon2");
const prisma = require("../config/prisma");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const {
  hashToken,
  generateSessionId,
} = require("../utils/token");

async function register(data) {
  const {
    name,
    email,
    password,
    phone,
    address,
  } = data;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    const error = new Error("Email sudah digunakan");
    error.statusCode = 409;
    throw error;
  }

  const wargaRole = await prisma.role.findUnique({
    where: {
      name: "WARGA",
    },
  });

  if (!wargaRole) {
    const error = new Error("Role WARGA belum tersedia");
    error.statusCode = 500;
    throw error;
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      phone,
      address,
      roleId: wargaRole.id,
    },
    include: {
      role: true,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role.name,
  };
}

async function login(data, metadata = {}) {
  const {
    email,
    password,
  } = data;

  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    const error = new Error("Email atau password salah");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Akun tidak aktif");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await argon2.verify(
    user.passwordHash,
    password
  );

  if (!isPasswordValid) {
    const error = new Error("Email atau password salah");
    error.statusCode = 401;
    throw error;
  }

  const sessionId = generateSessionId();

  const accessToken = await createAccessToken({
    sub: String(user.id),
    sessionId,
  });

  const refreshToken = await createRefreshToken({
    sub: String(user.id),
    sessionId,
  });

  const refreshTokenHash = hashToken(refreshToken);

  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt,
      userAgent: metadata.userAgent || null,
      ipAddress: metadata.ipAddress || null,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role.name,
    },
    accessToken,
    refreshToken,
  };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    const error = new Error("Refresh token tidak ditemukan");
    error.statusCode = 401;
    throw error;
  }

  let payload;

  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch (error) {
    const authError = new Error("Refresh token tidak valid");
    authError.statusCode = 401;
    throw authError;
  }

  const userId = Number(payload.sub);
  const sessionId = payload.sessionId;

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!session) {
    const error = new Error("Session tidak ditemukan");
    error.statusCode = 401;
    throw error;
  }

  if (session.revokedAt) {
    const error = new Error("Session sudah dicabut");
    error.statusCode = 401;
    throw error;
  }

  if (session.expiresAt < new Date()) {
    const error = new Error("Session sudah kedaluwarsa");
    error.statusCode = 401;
    throw error;
  }

  if (!session.user.isActive) {
    const error = new Error("Akun tidak aktif");
    error.statusCode = 403;
    throw error;
  }

  const incomingTokenHash = hashToken(refreshToken);

  if (incomingTokenHash !== session.refreshTokenHash) {
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const error = new Error(
      "Refresh token tidak cocok. Session dicabut."
    );

    error.statusCode = 401;
    throw error;
  }

  const newAccessToken = await createAccessToken({
    sub: String(userId),
    sessionId,
  });

  const newRefreshToken = await createRefreshToken({
    sub: String(userId),
    sessionId,
  });

  const newRefreshTokenHash = hashToken(newRefreshToken);

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      refreshTokenHash: newRefreshTokenHash,
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      phone: session.user.phone,
      address: session.user.address,
      role: session.user.role.name,
    },
  };
}

async function logout(sessionId) {
  if (!sessionId) {
    return;
  }

  await prisma.session.updateMany({
    where: {
      id: sessionId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    isActive: user.isActive,
    role: user.role.name,
  };
}

async function updateProfile(userId, data) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
    },
    include: {
      role: true,
    },
  });

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    address: updatedUser.address,
    isActive: updatedUser.isActive,
    role: updatedUser.role.name,
  };
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  const isPasswordValid = await argon2.verify(
    user.passwordHash,
    currentPassword
  );

  if (!isPasswordValid) {
    const error = new Error("Password saat ini tidak sesuai");
    error.statusCode = 400;
    throw error;
  }

  const newPasswordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
  });

  await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  return { message: "Password berhasil diperbarui" };
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
};