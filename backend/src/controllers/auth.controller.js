const authService = require("../services/auth.service");
const permissionService = require("../services/permission.service");
const { success, error } = require("../utils/apiResponse");
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_COOKIE_NAME,
} = require("../utils/cookie");

async function register(req, res) {
  const user = await authService.register(req.body);

  return res.status(201).json({
    success: true,
    message: "Registrasi berhasil",
    data: user,
  });
}

async function login(req, res, next) {
  try {
    const result = await authService.login(
      req.validated,
      {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      }
    );

    setRefreshTokenCookie(res, result.refreshToken);

    return success(
      res,
      {
        accessToken: result.accessToken,
        user: result.user,
      },
      "Login berhasil"
    );
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res) {
  const refreshToken =
    req.cookies[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

  const result = await authService.refresh(refreshToken);

  setRefreshTokenCookie(res, result.refreshToken);

  return res.json({
    success: true,
    message: "Token berhasil diperbarui",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
}

async function logout(req, res) {
  await authService.logout(req.auth.sessionId);

  clearRefreshTokenCookie(res);

  return res.json({
    success: true,
    message: "Logout berhasil",
  });
}

async function me(req, res) {
  const user = await authService.getCurrentUser(req.auth.userId);

  return res.json({
    success: true,
    message: "Data user berhasil diambil",
    data: user,
  });
}

async function permissions(req, res) {
  const permissions =
    await permissionService.getUserPermissions(
      req.auth.userId
    );

  return res.json({
    success: true,
    message: "Permission berhasil diambil",
    data: permissions,
  });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  permissions,
};