const prisma = require("../config/prisma");

async function getUserPermissions(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  return user.role.permissions.map(
    (rolePermission) => rolePermission.permission.name
  );
}

async function userHasPermission(userId, permissionName) {
  const permission = await prisma.rolePermission.findFirst({
    where: {
      role: {
        users: {
          some: {
            id: Number(userId),
          },
        },
      },
      permission: {
        name: permissionName,
      },
    },
  });

  return Boolean(permission);
}

async function userHasAnyPermission(userId, permissionNames) {
  const total = await prisma.rolePermission.count({
    where: {
      role: {
        users: {
          some: {
            id: Number(userId),
          },
        },
      },
      permission: {
        name: {
          in: permissionNames,
        },
      },
    },
  });

  return total > 0;
}

async function userHasAllPermissions(userId, permissionNames) {
  const total = await prisma.rolePermission.count({
    where: {
      role: {
        users: {
          some: {
            id: Number(userId),
          },
        },
      },
      permission: {
        name: {
          in: permissionNames,
        },
      },
    },
  });

  return total === permissionNames.length;
}

module.exports = {
  getUserPermissions,
  userHasPermission,
  userHasAnyPermission,
  userHasAllPermissions,
};