/* Shared event helpers. Upcoming vs past is computed from the event date
   (and time, if present) in America/Los_Angeles. */
(function (global) {
  const TZ = "America/Los_Angeles";

  function loadEvents() {
    if (global.__esaEventsPromise) return global.__esaEventsPromise;
    global.__esaEventsPromise = fetch("/events.json?v=20261117c", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Could not load events.json");
        return r.json();
      })
      .then((data) => {
        const list = (data.events || []).map(normalize);
        list.sort((a, b) => a.sortMs - b.sortMs);
        return { timezone: data.timezone || TZ, events: list, updated: data.updated };
      });
    return global.__esaEventsPromise;
  }

  function normalize(ev) {
    const event = Object.assign({}, ev);
    event.sortMs = eventInstantMs(event);
    event.isUpcoming = event.sortMs >= nowInTzMs();
    return event;
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function nowInTzMs() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }).formatToParts(new Date());
    const g = {};
    parts.forEach((p) => { g[p.type] = p.value; });
    const hour = g.hour === "24" ? "00" : g.hour;
    return Date.parse(`${g.year}-${g.month}-${g.day}T${hour}:${g.minute}:${g.second}`);
  }

  function dateForSort(ev) {
    if (ev.sortDate && /^\d{4}-\d{2}-\d{2}$/.test(ev.sortDate)) return ev.sortDate;
    if (ev.date && /^\d{4}-\d{2}-\d{2}$/.test(ev.date)) return ev.date;
    if (ev.date && /^\d{4}-\d{2}$/.test(ev.date)) return ev.date + "-15";
    return "1970-01-01";
  }

  function eventInstantMs(ev) {
    const day = dateForSort(ev);
    const time = ev.time && /^\d{2}:\d{2}/.test(ev.time) ? ev.time : "23:59";
    return Date.parse(`${day}T${time}:00`);
  }

  function formatDate(ev, opts) {
    if (!ev) return "";
    if (ev.dateDisplay) return ev.dateDisplay;
    if (!ev.date) return "";
    if (ev.datePrecision === "month" && /^\d{4}-\d{2}$/.test(ev.date)) {
      const [y, m] = ev.date.split("-").map(Number);
      return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
    }
    const time = ev.time && /^\d{2}:\d{2}/.test(ev.time) ? ev.time : "12:00";
    const d = new Date(`${ev.date}T${time}:00`);
    const options = opts || { weekday: "long", month: "long", day: "numeric", year: "numeric" };
    let out = new Intl.DateTimeFormat("en-US", options).format(d);
    if (ev.time) {
      const start = formatTime(ev.time);
      out += ev.endTime ? `, ${start}–${formatTime(ev.endTime)}` : `, ${start}`;
    }
    return out;
  }

  function formatTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = ((h + 11) % 12) + 1;
    return m === 0 ? `${hr}:00 ${ampm}`.replace(":00 ", " ") : `${hr}:${pad(m)} ${ampm}`;
  }

  function year(ev) {
    const d = ev.sortDate || ev.date || "";
    return d.slice(0, 4);
  }

  function typeClass(type) {
    if (type === "Pride") return "pill";
    if (type === "Beach Cleanup") return "pill pill-leaf";
    if (type === "Fundraiser") return "pill pill-coral";
    if (type === "School Visit" || type === "Parade Prep" || type === "Care Fair") return "pill pill-leaf";
    return "pill pill-sun";
  }

  function bySlug(events, slug) {
    return events.find((e) => e.slug === slug);
  }

  function upcoming(events) {
    return events.filter((e) => e.isUpcoming).sort((a, b) => a.sortMs - b.sortMs);
  }

  function past(events) {
    return events.filter((e) => !e.isUpcoming).sort((a, b) => b.sortMs - a.sortMs);
  }

  function eventPath(ev) { return `/events/${ev.slug}`; }

  function rsvpPath(ev) { return ev ? `/rsvp/${ev.slug}` : "/rsvp"; }

  function fallbackLabel(ev) {
    return ev.shortName || ev.theme || ev.name;
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function imageUrl(path) {
    if (!path) return "";
    return path.charAt(0) === "/" ? path : "/" + path;
  }

  function sanitizeFocus(value) {
    if (!value || typeof value !== "string") return "50% 25%";
    const s = value.trim();
    if (/^[\d.]+%\s+[\d.]+%$/.test(s)) return s;
    return "50% 25%";
  }

  function focusStyle(ev) {
    const f = sanitizeFocus(ev && ev.heroFocus);
    return `--focus:${f};object-position:${f}`;
  }

  function cardThumb(ev) {
    return ev.heroThumb || ev.heroImage || "";
  }

  function media(ev, kind) {
    if (kind === "hero") {
      const full = ev.heroImage || ev.heroThumb;
      if (full) {
        const thumb = ev.heroThumb || ev.heroImage;
        return `<img src="${escapeHtml(imageUrl(full))}" alt="${escapeHtml(ev.name)}" style="${focusStyle(ev)}"${thumb && thumb !== full ? ` srcset="${escapeHtml(imageUrl(thumb))} 600w, ${escapeHtml(imageUrl(full))} 1600w" sizes="(max-width: 700px) 100vw, 560px"` : ""}>`;
      }
      return `<div class="card-fallback" aria-hidden="true"><span>${escapeHtml(fallbackLabel(ev))}</span></div>`;
    }
    return "";
  }

  function cardHtml(ev) {
    const thumb = cardThumb(ev);
    const img = thumb
      ? `<img src="${escapeHtml(imageUrl(thumb))}" alt="" loading="lazy" width="600" height="750" style="${focusStyle(ev)}">`
      : `<div class="card-fallback" aria-hidden="true"><span>${escapeHtml(fallbackLabel(ev))}</span></div>`;
    const tag = ev.isUpcoming ? `<span class="pill pill-sun">Upcoming</span>` : `<span class="${typeClass(ev.type)}">${escapeHtml(ev.type)}</span>`;
    const count = (ev.images || []).length;
    const countLabel = count ? `<span class="meta">${count} photo${count === 1 ? "" : "s"}</span>` : "";
    return `<a class="card" href="${eventPath(ev)}">
      ${img}
      <div class="card-body">
        ${tag}
        <div class="meta">${escapeHtml(formatDate(ev))}</div>
        <h3>${escapeHtml(ev.name)}</h3>
        <p>${escapeHtml(ev.summary)}</p>
        ${countLabel}
      </div>
    </a>`;
  }

  global.ESA = {
    TZ, loadEvents, formatDate, formatTime, year, typeClass, bySlug,
    upcoming, past, eventPath, rsvpPath, escapeHtml, media, cardHtml,
    fallbackLabel, imageUrl, cardThumb, sanitizeFocus, focusStyle,
  };
})(window);
