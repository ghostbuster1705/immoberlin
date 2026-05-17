require("dotenv").config();

const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const db = require("./db");
const { getCurrentUserFromRequest, requireAuth, signMagicLinkToken, signSessionToken, verifyToken } = require("./auth");
const { sendListingInquiry, sendMagicLink } = require("./mailer");

const app = express();
const PORT = Number(process.env.PORT || 3001);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const DISTRICTS = [
  "Mitte",
  "Prenzlauer Berg",
  "Kreuzberg",
  "Neukölln",
  "Friedrichshain",
  "Schöneberg",
  "Charlottenburg",
  "Tempelhof",
  "Wedding",
  "Lichtenberg",
  "Marzahn",
  "Steglitz",
];

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if ((file.mimetype || "").startsWith("image/")) {
      return cb(null, true);
    }

    return cb(new Error("Only image uploads are allowed"));
  },
});

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir));

function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }

  return false;
}

function parseRules(value) {
  if (!value) {
    return { pets: false, smoking: false, notes: "" };
  }

  if (typeof value === "object") {
    return {
      pets: parseBoolean(value.pets),
      smoking: parseBoolean(value.smoking),
      notes: typeof value.notes === "string" ? value.notes : "",
    };
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return {
        pets: parseBoolean(parsed.pets),
        smoking: parseBoolean(parsed.smoking),
        notes: typeof parsed.notes === "string" ? parsed.notes : "",
      };
    } catch (_error) {
      return { pets: false, smoking: false, notes: value };
    }
  }

  return { pets: false, smoking: false, notes: "" };
}

function parseArrayJson(value, fallback = []) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  return fallback;
}

function formatListingRow(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    district: row.district,
    address: row.address,
    price_month: row.price_month,
    rooms: row.rooms,
    size_m2: row.size_m2,
    available_from: row.available_from,
    available_until: row.available_until,
    description: row.description,
    rules: parseRules(row.rules),
    photos: parseArrayJson(row.photos, []),
    is_furnished: Boolean(row.is_furnished),
    is_direct_only: Boolean(row.is_direct_only),
    status: row.status,
    created_at: row.created_at,
    owner: {
      id: row.owner_id || row.user_id,
      email: row.owner_email,
      name: row.owner_name || "Berlin Host",
    },
  };
}

function getServerUrl(req) {
  if (process.env.SERVER_URL) {
    return process.env.SERVER_URL;
  }

  return `${req.protocol}://${req.get("host")}`;
}

function getListingById(id) {
  return db
    .prepare(
      `
      SELECT l.*, u.id AS owner_id, u.email AS owner_email, u.name AS owner_name
      FROM listings l
      JOIN users u ON u.id = l.user_id
      WHERE l.id = ?
      `,
    )
    .get(id);
}

app.get("/api/listings", (req, res) => {
  const where = ["1=1"];
  const params = [];
  const currentUser = getCurrentUserFromRequest(req);

  if (req.query.mine === "1") {
    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    where.push("l.user_id = ?");
    params.push(currentUser.id);
  } else {
    const status = (req.query.status || "active").toString();
    if (status !== "all") {
      where.push("l.status = ?");
      params.push(status);
    }
  }

  if (req.query.district) {
    where.push("l.district = ?");
    params.push(req.query.district.toString());
  }

  if (req.query.maxPrice) {
    where.push("l.price_month <= ?");
    params.push(Number(req.query.maxPrice));
  }

  if (req.query.rooms) {
    if (req.query.rooms === "3+") {
      where.push("l.rooms >= 3");
    } else {
      where.push("l.rooms = ?");
      params.push(Number(req.query.rooms));
    }
  }

  if (req.query.availableFrom) {
    where.push("date(l.available_until) >= date(?)");
    params.push(req.query.availableFrom.toString());
  }

  if (req.query.furnished !== undefined) {
    where.push("l.is_furnished = ?");
    params.push(parseBoolean(req.query.furnished) ? 1 : 0);
  }

  const limit = Math.min(Number(req.query.limit || 100), 100);
  params.push(limit);

  const rows = db
    .prepare(
      `
      SELECT l.*, u.id AS owner_id, u.email AS owner_email, u.name AS owner_name
      FROM listings l
      JOIN users u ON u.id = l.user_id
      WHERE ${where.join(" AND ")}
      ORDER BY datetime(l.created_at) DESC
      LIMIT ?
      `,
    )
    .all(...params);

  return res.json({
    listings: rows.map(formatListingRow),
    meta: { districts: DISTRICTS },
  });
});

app.get("/api/listings/:id", (req, res) => {
  const row = getListingById(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Listing not found" });
  }

  return res.json({ listing: formatListingRow(row) });
});

app.post("/api/listings", requireAuth, upload.array("photos", 5), (req, res) => {
  const requiredFields = [
    "title",
    "district",
    "address",
    "price_month",
    "rooms",
    "size_m2",
    "available_from",
    "available_until",
    "description",
  ];

  const missing = requiredFields.find((field) => !req.body[field]);
  if (missing) {
    return res.status(400).json({ error: `Missing field: ${missing}` });
  }

  if (!DISTRICTS.includes(req.body.district)) {
    return res.status(400).json({ error: "District is not supported" });
  }

  const photoPaths = (req.files || []).map((file) => `/uploads/${file.filename}`);
  const rules = parseRules(req.body.rules);

  const result = db
    .prepare(
      `
      INSERT INTO listings (
        user_id, title, district, address, price_month, rooms, size_m2,
        available_from, available_until, description, rules, photos,
        is_furnished, is_direct_only, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'active')
      `,
    )
    .run(
      req.user.id,
      req.body.title.trim(),
      req.body.district,
      req.body.address.trim(),
      Number(req.body.price_month),
      Number(req.body.rooms),
      Number(req.body.size_m2),
      req.body.available_from,
      req.body.available_until,
      req.body.description.trim(),
      JSON.stringify(rules),
      JSON.stringify(photoPaths),
      parseBoolean(req.body.is_furnished) ? 1 : 0,
    );

  const created = getListingById(result.lastInsertRowid);
  return res.status(201).json({ listing: formatListingRow(created) });
});

app.put("/api/listings/:id", requireAuth, upload.array("photos", 5), (req, res) => {
  const current = getListingById(req.params.id);
  if (!current) {
    return res.status(404).json({ error: "Listing not found" });
  }

  if (current.user_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  let photos = parseArrayJson(current.photos, []);
  if (req.body.existingPhotos) {
    photos = parseArrayJson(req.body.existingPhotos, photos);
  }

  const newPhotos = (req.files || []).map((file) => `/uploads/${file.filename}`);
  photos = [...photos, ...newPhotos].slice(0, 5);

  const updated = {
    title: req.body.title || current.title,
    district: req.body.district || current.district,
    address: req.body.address || current.address,
    price_month: Number(req.body.price_month || current.price_month),
    rooms: Number(req.body.rooms || current.rooms),
    size_m2: Number(req.body.size_m2 || current.size_m2),
    available_from: req.body.available_from || current.available_from,
    available_until: req.body.available_until || current.available_until,
    description: req.body.description || current.description,
    rules: req.body.rules ? JSON.stringify(parseRules(req.body.rules)) : current.rules,
    is_furnished:
      req.body.is_furnished === undefined ? Number(current.is_furnished) : parseBoolean(req.body.is_furnished) ? 1 : 0,
    status: req.body.status || current.status,
  };

  if (!DISTRICTS.includes(updated.district)) {
    return res.status(400).json({ error: "District is not supported" });
  }

  db.prepare(
    `
      UPDATE listings
      SET title = ?, district = ?, address = ?, price_month = ?, rooms = ?, size_m2 = ?,
          available_from = ?, available_until = ?, description = ?, rules = ?, photos = ?,
          is_furnished = ?, status = ?
      WHERE id = ?
    `,
  ).run(
    updated.title,
    updated.district,
    updated.address,
    updated.price_month,
    updated.rooms,
    updated.size_m2,
    updated.available_from,
    updated.available_until,
    updated.description,
    updated.rules,
    JSON.stringify(photos),
    updated.is_furnished,
    updated.status,
    req.params.id,
  );

  const refreshed = getListingById(req.params.id);
  return res.json({ listing: formatListingRow(refreshed) });
});

app.delete("/api/listings/:id", requireAuth, (req, res) => {
  const listing = getListingById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  if (listing.user_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const photos = parseArrayJson(listing.photos, []);
  photos.forEach((photoPath) => {
    const normalizedPath = photoPath.replace(/^\/+/, "");
    const absolutePath = path.join(__dirname, "..", normalizedPath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  });

  db.prepare("DELETE FROM listings WHERE id = ?").run(req.params.id);
  return res.status(204).send();
});

app.patch("/api/listings/:id/status", requireAuth, (req, res) => {
  const listing = getListingById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  if (listing.user_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const status = req.body.status;
  if (!["active", "taken"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.prepare("UPDATE listings SET status = ? WHERE id = ?").run(status, req.params.id);
  const refreshed = getListingById(req.params.id);
  return res.json({ listing: formatListingRow(refreshed) });
});

app.post("/api/listings/:id/contact", async (req, res, next) => {
  try {
    const listing = getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const senderEmail = (req.body.sender_email || "").trim().toLowerCase();
    const senderName = (req.body.sender_name || "").trim();
    const message = (req.body.message || "").trim();

    if (!senderEmail || !senderName || !message) {
      return res.status(400).json({ error: "sender_email, sender_name, and message are required" });
    }

    db.prepare(
      `
      INSERT INTO messages (listing_id, sender_email, sender_name, message)
      VALUES (?, ?, ?, ?)
      `,
    ).run(req.params.id, senderEmail, senderName, message);

    await sendListingInquiry({
      to: listing.owner_email,
      ownerName: listing.owner_name,
      listingTitle: listing.title,
      district: listing.district,
      senderName,
      senderEmail,
      message,
    });

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/magic-link", async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const name = (req.body.name || "").trim();

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    db.prepare(
      `
      INSERT INTO users (email, name)
      VALUES (?, ?)
      ON CONFLICT(email) DO UPDATE
      SET name = CASE
        WHEN excluded.name IS NULL OR excluded.name = '' THEN users.name
        ELSE excluded.name
      END
      `,
    ).run(email, name || null);

    const token = signMagicLinkToken(email);
    const verifyUrl = `${getServerUrl(req)}/api/auth/verify/${token}`;

    await sendMagicLink(email, verifyUrl);

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/verify/:token", (req, res) => {
  try {
    const payload = verifyToken(req.params.token);
    if (payload.type !== "magic_link" || !payload.email) {
      return res.status(400).send("Invalid magic link.");
    }

    let user = db.prepare("SELECT id, email, name FROM users WHERE email = ?").get(payload.email);
    if (!user) {
      const insert = db.prepare("INSERT INTO users (email) VALUES (?)").run(payload.email);
      user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(insert.lastInsertRowid);
    }

    const sessionToken = signSessionToken(user);
    res.cookie("token", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${CLIENT_URL}/dashboard?login=success`);
  } catch (_error) {
    return res.status(400).send("Magic link expired or invalid.");
  }
});

app.get("/api/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("token");
  return res.status(204).send();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const clientBuildPath = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get(/^\/(?!api|uploads).*/, (_req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Berlin Sublet API running on http://localhost:${PORT}`);
});
