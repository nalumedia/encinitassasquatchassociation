#!/usr/bin/env node
/** Build a static `dist/` tree for Vercel (or any static host). */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const DIST = path.join(ROOT, "dist");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (ent.name === ".DS_Store") continue;
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

fs.rmSync(DIST, { recursive: true, force: true });
copyDir(PUBLIC, DIST);
fs.copyFileSync(path.join(ROOT, "events.json"), path.join(DIST, "events.json"));
const configSrc = path.join(ROOT, "config.json");
if (fs.existsSync(configSrc)) {
  fs.copyFileSync(configSrc, path.join(DIST, "config.json"));
}

const events = JSON.parse(fs.readFileSync(path.join(ROOT, "events.json"), "utf8"));
const eventHtml = fs.readFileSync(path.join(PUBLIC, "event.html"), "utf8");
const rsvpHtml = fs.readFileSync(path.join(PUBLIC, "rsvp.html"), "utf8");
const slugs = (events.events || []).map((e) => e.slug).filter(Boolean);

for (const slug of slugs) {
  const ed = path.join(DIST, "events", slug);
  fs.mkdirSync(ed, { recursive: true });
  fs.writeFileSync(path.join(ed, "index.html"), eventHtml);
  const rd = path.join(DIST, "rsvp", slug);
  fs.mkdirSync(rd, { recursive: true });
  fs.writeFileSync(path.join(rd, "index.html"), rsvpHtml);
}
fs.mkdirSync(path.join(DIST, "rsvp", "general"), { recursive: true });
fs.writeFileSync(path.join(DIST, "rsvp", "general", "index.html"), rsvpHtml);

console.log(`Built dist/ with ${slugs.length} event pages and RSVP pages.`);
