function requirePermission(permissionName) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi",
      });
    }

    const hasPermission =
      req.auth.permissions.includes(permissionName);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Tidak memiliki permission: ${permissionName}`,
      });
    }

    next();
  };
}

function requireAnyPermission(permissionNames) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi",
      });
    }

    const hasPermission = permissionNames.some(
      (permissionName) =>
        req.auth.permissions.includes(permissionName)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "User tidak memiliki permission yang diperlukan",
      });
    }

    next();
  };
}

function requireAllPermissions(permissionNames) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi",
      });
    }

    const hasPermission = permissionNames.every(
      (permissionName) =>
        req.auth.permissions.includes(permissionName)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "User tidak memiliki seluruh permission yang diperlukan",
      });
    }

    next();
  };
}

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
};