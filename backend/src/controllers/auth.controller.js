const authService = require("../services/auth.service");
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

async function login(req, res) {
  const result = await authService.login(req.body, {
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
  });

  setRefreshTokenCookie(res, result.refreshToken);

  return res.json({
    success: true,
    message: "Login berhasil",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
}

async function refresh(req, res) {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

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

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};