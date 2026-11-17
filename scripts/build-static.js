#!/usr/bin/env node
/** Build a static `dist/` tree for Vercel (or any static host). */
const fs = require("fs");
const path = require("path");
const { applyOg, metaForEvent, metaForRsvp, STATIC } = require("./og-meta");

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

function writeHtml(dest, html) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

// Make sure copied top-level pages carry the right static OG tags.
for (const [route, meta] of Object.entries(STATIC)) {
  const file = route === "/" ? "index.html" : `${route.replace(/^\//, "")}.html`;
  const dest = path.join(DIST, file);
  if (!fs.existsSync(dest)) continue;
  const html = applyOg(fs.readFileSync(dest, "utf8"), meta);
  fs.writeFileSync(dest, html);
}

for (const ev of events.events || []) {
  if (!ev.slug) continue;
  writeHtml(path.join(DIST, "events", ev.slug, "index.html"), applyOg(eventHtml, metaForEvent(ev)));
  writeHtml(path.join(DIST, "rsvp", ev.slug, "index.html"), applyOg(rsvpHtml, metaForRsvp(ev)));
}
writeHtml(
  path.join(DIST, "rsvp", "general", "index.html"),
  applyOg(rsvpHtml, { ...STATIC["/rsvp"], path: "/rsvp/general" })
);

console.log(`Built dist/ with ${slugs.length} event pages and RSVP pages.`);
