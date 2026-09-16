const { SignJWT, jwtVerify } = require("jose");

function getAccessSecret() {
  return new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
}

function getRefreshSecret() {
  return new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
}

async function createAccessToken(payload) {
  return new SignJWT({
    ...payload,
    type: "access",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(process.env.ACCESS_TOKEN_EXPIRES_IN || "15m")
    .sign(getAccessSecret());
}

async function createRefreshToken(payload) {
  return new SignJWT({
    ...payload,
    type: "refresh",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(process.env.REFRESH_TOKEN_EXPIRES_IN || "30d")
    .sign(getRefreshSecret());
}

async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, getAccessSecret(), {
    algorithms: ["HS256"],
  });

  if (payload.type !== "access") {
    throw new Error("Token bukan access token");
  }

  return payload;
}

async function verifyRefreshToken(token) {
  const { payload } = await jwtVerify(token, getRefreshSecret(), {
    algorithms: ["HS256"],
  });

  if (payload.type !== "refresh") {
    throw new Error("Token bukan refresh token");
  }

  return payload;
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};