"use strict";

/** Open Graph / Twitter card helpers for the static build and local server. */

const SITE = "https://www.encinitassasquatchassociation.com";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function clip(s, n) {
  const text = String(s || "").replace(/\s+/g, " ").trim();
  if (text.length <= n) return text;
  const cut = text.slice(0, n - 1);
  const i = cut.lastIndexOf(" ");
  return `${(i > 80 ? cut.slice(0, i) : cut).replace(/[,;:.]+$/, "")}…`;
}

function absoluteImage(image) {
  if (!image) return `${SITE}/og/default.png`;
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE}${image.startsWith("/") ? image : `/${image}`}`;
}

function canonicalUrl(p) {
  if (!p || p === "/") return `${SITE}/`;
  const path = p.startsWith("/") ? p : `/${p}`;
  return `${SITE}${path.replace(/\/+$/, "")}`;
}

function ogBlock(meta) {
  const title = meta.title;
  const description = clip(meta.description, 200);
  const url = canonicalUrl(meta.path);
  const image = absoluteImage(meta.image);
  const type = meta.type || "website";
  return `  <!-- esa-og -->
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:type" content="${esc(type)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@encintassquatch">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">
  <!-- /esa-og -->`;
}

function applyOg(html, meta) {
  const block = ogBlock(meta);
  if (html.includes("<!-- esa-og -->")) {
    return html.replace(/[ \t]*<!-- esa-og -->[\s\S]*?<!-- \/esa-og -->/, block.trimEnd());
  }
  if (html.includes("</head>")) {
    return html.replace("</head>", `${block}\n</head>`);
  }
  return html;
}

const STATIC = {
  "/": {
    title: "Encinitas Sasquatch Association · Believe",
    description:
      "We celebrate Bigfoot’s love of Encinitas, California. Wander often. Wonder always. Join the Encinitas Sasquatch Association.",
    path: "/",
    image: "/og/home.png",
  },
  "/about": {
    title: "About · Encinitas Sasquatch Association",
    description: "Founded in 2016, the Encinitas Sasquatch Association inspires people to believe. Wander often. Wonder always.",
    path: "/about",
    image: "/og/about.png",
  },
  "/events": {
    title: "Event History · Encinitas Sasquatch Association",
    description:
      "A chronological, interactive history of ESA parades, Pride, beach cleanups, and fundraisers — from 2018 through the 10th Holiday Parade.",
    path: "/events",
    image: "/og/events.png",
  },
  "/upcoming": {
    title: "Upcoming Events · Encinitas Sasquatch Association",
    description: "What’s next for the Encinitas Sasquatch Association — the 10th Encinitas Holiday Parade on December 5, 2026, and more.",
    path: "/upcoming",
    image: "/og/upcoming.png",
  },
  "/join": {
    title: "Join the ESA · Encinitas Sasquatch Association",
    description: "Apply to join the Encinitas Sasquatch Association. We welcome anyone and everyone who believes in something.",
    path: "/join",
    image: "/og/join.png",
  },
  "/rsvp": {
    title: "RSVP / Volunteer · Encinitas Sasquatch Association",
    description: "RSVP for an ESA event or volunteer for the float, a beach cleanup, or whatever the trail needs next.",
    path: "/rsvp",
    image: "/og/rsvp.png",
  },
  "/shop": {
    title: "Shop · Encinitas Sasquatch Association",
    description: "The ESA Beach Cleanup Hat — make a statement while making a difference. $18, via Stripe.",
    path: "/shop",
    image: "/og/shop.png",
  },
  "/grow": {
    title: "Grow lima beans · Encinitas Sasquatch Association",
    description: "We believe that Bigfoot loves lima beans. Grow your own and you might just lure in a hungry squatch.",
    path: "/grow",
    image: "/og/grow.png",
  },
  "/404": {
    title: "Trail went cold · Encinitas Sasquatch Association",
    description: "That page could not be found.",
    path: "/404",
    image: "/og/default.png",
  },
};

function findEvent(events, slug) {
  const list = (events && events.events) || events || [];
  return list.find((e) => e && e.slug === slug) || null;
}

function eventImage(ev) {
  if (!ev) return "/og/default.png";
  if (ev.slug === "holiday-parade-2026") return "/og/events/holiday-parade-2026.png";
  return `/og/events/${ev.slug}.png`;
}

function rsvpImage(ev) {
  if (ev && ev.slug === "holiday-parade-2026") return "/og/rsvp-holiday-parade-2026.png";
  return eventImage(ev);
}

function metaForEvent(ev) {
  return {
    title: `${ev.name} · Encinitas Sasquatch Association`,
    description: ev.summary || ev.subhead || ev.name,
    path: `/events/${ev.slug}`,
    image: eventImage(ev),
  };
}

function metaForRsvp(ev) {
  if (!ev) {
    return { ...STATIC["/rsvp"], path: "/rsvp" };
  }
  return {
    title: `RSVP · ${ev.name} · Encinitas Sasquatch Association`,
    description: ev.summary || ev.subhead || `RSVP or volunteer for ${ev.name}.`,
    path: `/rsvp/${ev.slug}`,
    image: rsvpImage(ev),
  };
}

function metaForPath(urlPath, events) {
  const path = String(urlPath || "/").replace(/\/+$/, "") || "/";
  if (STATIC[path]) return { ...STATIC[path] };
  let m = path.match(/^\/events\/([a-z0-9-]+)$/) || path.match(/^\/event\/([a-z0-9-]+)$/);
  if (m) {
    const ev = findEvent(events, m[1]);
    if (!ev) return { ...STATIC["/events"], path };
    return metaForEvent(ev);
  }
  m = path.match(/^\/rsvp\/([a-z0-9-]+)$/);
  if (m) {
    const slug = m[1];
    if (slug === "general") return { ...STATIC["/rsvp"], path: "/rsvp/general" };
    const ev = findEvent(events, slug);
    if (!ev) return { ...STATIC["/rsvp"], path };
    return metaForRsvp(ev);
  }
  return { ...STATIC["/"] };
}

module.exports = {
  SITE,
  STATIC,
  applyOg,
  ogBlock,
  metaForPath,
  metaForEvent,
  metaForRsvp,
  eventImage,
  rsvpImage,
  clip,
  canonicalUrl,
};
