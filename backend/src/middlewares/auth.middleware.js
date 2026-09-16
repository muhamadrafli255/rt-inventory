const prisma = require("../config/prisma");
const { verifyAccessToken } = require("../utils/jwt");

async function authMiddleware(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authorization header wajib diisi",
      });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Format token harus Bearer <token>",
      });
    }

    const payload = await verifyAccessToken(token);

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
      return res.status(401).json({
        success: false,
        message: "Session tidak ditemukan",
      });
    }

    if (session.revokedAt) {
      return res.status(401).json({
        success: false,
        message: "Session sudah dicabut",
      });
    }

    if (session.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: "Session sudah kedaluwarsa",
      });
    }

    if (!session.user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Akun tidak aktif",
      });
    }

    req.auth = {
      userId,
      sessionId,
      role: session.user.role.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Access token tidak valid atau sudah kedaluwarsa",
    });
  }
}

module.exports = authMiddleware;