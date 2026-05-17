const jwt = require("jsonwebtoken");
const db = require("./db");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

function signSessionToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name || "",
      type: "session",
    },
    getJwtSecret(),
    { expiresIn: "7d" },
  );
}

function signMagicLinkToken(email) {
  return jwt.sign(
    {
      email,
      type: "magic_link",
    },
    getJwtSecret(),
    { expiresIn: "20m" },
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function extractToken(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return req.cookies?.token || "";
}

function getCurrentUserFromRequest(req) {
  const token = extractToken(req);
  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    if (payload.type !== "session") {
      return null;
    }

    const user = db.prepare("SELECT id, email, name, created_at FROM users WHERE id = ?").get(payload.userId);
    return user || null;
  } catch (error) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getCurrentUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = user;
  return next();
}

module.exports = {
  signSessionToken,
  signMagicLinkToken,
  verifyToken,
  getCurrentUserFromRequest,
  requireAuth,
};
