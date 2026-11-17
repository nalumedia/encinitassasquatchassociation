#!/usr/bin/env node
"use strict";

/**
 * ESA local site server.
 * Zero dependencies — Node.js built-in http, fs, path, url, querystring, crypto.
 *
 *   node server.js
 *   open http://localhost:3000
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const querystring = require("querystring");
const crypto = require("crypto");

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data", "submissions");
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".map": "application/json",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
};

const PRETTY = {
  "/": "index.html",
  "/events": "events.html",
  "/join": "join.html",
  "/upcoming": "upcoming.html",
  "/shop": "shop.html",
  "/about": "about.html",
  "/rsvp": "rsvp.html",
  "/grow": "grow.html",
  "/404": "404.html",
};

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));
  } catch (err) {
    console.warn("Could not read config.json:", err.message);
    return {};
  }
}

function send(res, status, body, headers) {
  const out = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, headers);
  res.end(out);
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj, null, 2), {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
}

function safeJoin(root, rel) {
  const resolved = path.resolve(root, rel);
  const rootResolved = path.resolve(root) + path.sep;
  if (resolved !== path.resolve(root) && !resolved.startsWith(rootResolved)) {
    return null;
  }
  return resolved;
}

function serveFile(res, filePath, requestPath, method) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const notFound = path.join(PUBLIC, "404.html");
      if (filePath !== notFound && fs.existsSync(notFound)) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        fs.createReadStream(notFound).pipe(res);
      } else {
        send(res, 404, "Not found\n", { "Content-Type": "text/plain; charset=utf-8" });
      }
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    const headers = {
      "Content-Type": type,
      "Content-Length": stat.size,
    };
    if (ext === ".html" || ext === ".css" || ext === ".js" || ext === ".json") {
      headers["Cache-Control"] = "no-cache";
    } else if (ext === ".woff2" || ext === ".woff") {
      headers["Cache-Control"] = "public, max-age=31536000";
    } else {
      headers["Cache-Control"] = "public, max-age=86400";
    }
    res.writeHead(200, headers);
    if (method === "HEAD") return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error("Payload too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseBody(req, raw) {
  const type = (req.headers["content-type"] || "").split(";")[0].trim();
  if (type === "application/json") {
    return raw ? JSON.parse(raw) : {};
  }
  if (type === "application/x-www-form-urlencoded") {
    return querystring.parse(raw);
  }
  // Fall back: try JSON, then form
  try {
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return querystring.parse(raw);
  }
}

function csvEscape(value) {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function asArray(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (value == null || value === "") return [];
  return String(value)
    .split(/[,;]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function requiredNameEmail(fields) {
  const errors = [];
  const name = (fields.name || "").trim();
  const email = (fields.email || "").trim();
  if (!name) errors.push("Name is required.");
  if (!email) errors.push("Email is required.");
  else if (!isValidEmail(email)) errors.push("Please enter a valid email address.");
  return { name, email, errors };
}

function appendCsv(file, headers, row) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, headers.join(",") + "\n", "utf8");
  }
  const line = headers.map((h) => csvEscape(row[h])).join(",") + "\n";
  fs.appendFileSync(file, line, "utf8");
}

function appendJsonArray(file, record) {
  let list = [];
  if (fs.existsSync(file)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
      if (Array.isArray(parsed)) list = parsed;
    } catch (_) {
      list = [];
    }
  }
  list.push(record);
  fs.writeFileSync(file, JSON.stringify(list, null, 2) + "\n", "utf8");
}

/**
 * Optional Airtable sync. Off by default.
 * Enable in config.json and set AIRTABLE_API_KEY in the environment.
 * Never commit or paste the API key into this repo.
 */
async function maybeSyncToAirtable(kind, record) {
  const config = loadConfig();
  const sync = (config && config.airtableSync) || {};
  if (!sync.enabled) return { skipped: true, reason: "airtableSync.enabled is false" };
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) {
    console.warn("Airtable sync is enabled, but AIRTABLE_API_KEY is not set. Skipping.");
    return { skipped: true, reason: "AIRTABLE_API_KEY missing" };
  }
  const table = kind === "join" ? sync.joinTable : sync.rsvpTable;
  if (!sync.baseId || !table) {
    console.warn("Airtable sync is enabled, but baseId or table name is missing. Skipping.");
    return { skipped: true, reason: "baseId or table missing" };
  }
  // Intentionally left as a documented hook. Implement a POST to
  // https://api.airtable.com/v0/{baseId}/{table} with Authorization: Bearer $AIRTABLE_API_KEY
  // when ESA is ready. We do not call Airtable unless this is filled in later.
  console.warn("Airtable sync hook reached, but the HTTP call is not implemented yet. Record saved locally only.");
  return { skipped: true, reason: "hook not implemented — local save only" };
}

async function handleJoin(req, res) {
  const raw = await readBody(req, 200000);
  const fields = parseBody(req, raw);
  const { name, email, errors } = requiredNameEmail(fields);
  if (errors.length) return sendJson(res, 400, { ok: false, errors });

  const volunteer = String(fields.volunteer || "").toLowerCase();
  const donate = String(fields.donate || "").toLowerCase();
  const volunteerYes = volunteer === "yes" || volunteer === "true";
  const donateYes = donate === "yes" || donate === "true";

  const record = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    form: "join",
    name,
    email,
    phone: (fields.phone || "").trim(),
    awesome: (fields.awesome || "").trim(),
    birthday: (fields.birthday || "").trim(),
    volunteer: volunteerYes ? "yes" : "no",
    volunteerSkills: volunteerYes ? asArray(fields.volunteerSkills) : [],
    volunteerSkillsOther: volunteerYes ? (fields.volunteerSkillsOther || "").trim() : "",
    donate: donateYes ? "yes" : "no",
    donationAmount: donateYes ? 40 : "",
    userAgent: (req.headers["user-agent"] || "").slice(0, 300),
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  appendCsv(path.join(DATA_DIR, "join.csv"), [
    "id",
    "submittedAt",
    "name",
    "email",
    "phone",
    "awesome",
    "birthday",
    "volunteer",
    "volunteerSkills",
    "volunteerSkillsOther",
    "donate",
    "donationAmount",
    "userAgent",
  ], {
    ...record,
    volunteerSkills: record.volunteerSkills.join("; "),
  });
  appendJsonArray(path.join(DATA_DIR, "join.json"), record);
  maybeSyncToAirtable("join", record).catch((err) => console.warn("Airtable hook:", err.message));

  const config = loadConfig();
  const donationLink = (((config.stripe || {}).donationPaymentLink) || "").trim();
  sendJson(res, 200, {
    ok: true,
    id: record.id,
    message: `Thank you ${name}. Your application will be reviewed and you will get a welcome letter from the ESA crew soon.`,
    donate: record.donate,
    donationPaymentLink: donateYes && donationLink ? donationLink : null,
    donationPlaceholder: donateYes && !donationLink,
  });
}

async function handleRsvp(req, res) {
  const raw = await readBody(req, 200000);
  const fields = parseBody(req, raw);
  const { name, email, errors } = requiredNameEmail(fields);
  if (errors.length) return sendJson(res, 400, { ok: false, errors });

  const attendance = (fields.attendance || "").trim();
  const record = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    form: "rsvp",
    eventSlug: (fields.eventSlug || "").trim(),
    eventName: (fields.eventName || "").trim(),
    name,
    email,
    phone: (fields.phone || "").trim(),
    attendance: attendance || "attending",
    volunteerRoles: asArray(fields.volunteerRoles),
    volunteerRolesOther: (fields.volunteerRolesOther || "").trim(),
    partySize: (fields.partySize || "").trim(),
    notes: (fields.notes || "").trim(),
    userAgent: (req.headers["user-agent"] || "").slice(0, 300),
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  appendCsv(path.join(DATA_DIR, "rsvp.csv"), [
    "id",
    "submittedAt",
    "eventSlug",
    "eventName",
    "name",
    "email",
    "phone",
    "attendance",
    "volunteerRoles",
    "volunteerRolesOther",
    "partySize",
    "notes",
    "userAgent",
  ], {
    ...record,
    volunteerRoles: record.volunteerRoles.join("; "),
  });
  appendJsonArray(path.join(DATA_DIR, "rsvp.json"), record);
  maybeSyncToAirtable("rsvp", record).catch((err) => console.warn("Airtable hook:", err.message));

  sendJson(res, 200, {
    ok: true,
    id: record.id,
    message: `Got it, ${name}. We'll see you in the wild — or in the group chat.`,
  });
}

function resolveStatic(urlPath) {
  // Root data files that are safe to serve (no secrets).
  if (urlPath === "/events.json") return path.join(ROOT, "events.json");
  if (urlPath === "/config.json") return path.join(ROOT, "config.json");

  const pretty = PRETTY[urlPath];
  if (pretty) return path.join(PUBLIC, pretty);

  // /events/:slug and /event/:slug → event.html
  if (/^\/events\/[a-z0-9-]+\/?$/.test(urlPath) || /^\/event\/[a-z0-9-]+\/?$/.test(urlPath)) {
    return path.join(PUBLIC, "event.html");
  }
  // /rsvp/:slug
  if (/^\/rsvp\/[a-z0-9-]+\/?$/.test(urlPath)) {
    return path.join(PUBLIC, "rsvp.html");
  }

  // Direct file under public, including /events.html etc.
  const rel = urlPath.replace(/^\/+/, "");
  if (!rel) return path.join(PUBLIC, "index.html");
  return safeJoin(PUBLIC, rel);
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || `localhost:${PORT}`;
    const url = new URL(req.url, `http://${host}`);
    const urlPath = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";

    if (req.method === "POST" && urlPath === "/api/join") {
      return await handleJoin(req, res);
    }
    if (req.method === "POST" && urlPath === "/api/rsvp") {
      return await handleRsvp(req, res);
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      return send(res, 405, "Method not allowed\n", { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, HEAD, POST" });
    }

    const filePath = resolveStatic(urlPath);
    if (!filePath) {
      return send(res, 403, "Forbidden\n", { "Content-Type": "text/plain; charset=utf-8" });
    }
    serveFile(res, filePath, urlPath, req.method);
  } catch (err) {
    const status = err.status || (err instanceof SyntaxError ? 400 : 500);
    if (status === 400) return sendJson(res, 400, { ok: false, errors: ["Could not read that request body."] });
    if (status === 413) return sendJson(res, 413, { ok: false, errors: ["That submission is too large."] });
    console.error(err);
    sendJson(res, 500, { ok: false, errors: ["Something went sideways in the woods. Try again?"] });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`ESA site is running at http://localhost:${PORT}`);
  console.log(`Edit events in ${path.join(ROOT, "events.json")}`);
  console.log(`Join/RSVP forms post to Supabase (see public/js/config.js)`);
});
