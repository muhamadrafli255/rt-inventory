const crypto = require("crypto");

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function generateSessionId() {
  return crypto.randomUUID();
}

module.exports = {
  hashToken,
  generateSessionId,
};