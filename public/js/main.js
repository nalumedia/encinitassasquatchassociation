(function () {
  const page = document.body.getAttribute("data-page") || "";

  const navItems = [
    { href: "/events", label: "Events", pages: ["events", "event", "upcoming"] },
    { href: "/upcoming", label: "Upcoming", pages: ["upcoming"] },
    { href: "/about", label: "About", pages: ["about"] },
    { href: "/shop", label: "Shop", pages: ["shop"] },
  ];

  function headerHtml() {
    const links = navItems.map((item) => {
      const current = item.pages.includes(page) ? ' aria-current="page"' : "";
      return `<a href="${item.href}"${current}>${item.label}</a>`;
    }).join("");
    const joinCurrent = page === "join" ? ' aria-current="page"' : "";
    return `<header class="site-header">
      <div class="header-inner">
        <a class="logo-lockup" href="/" aria-label="Encinitas Sasquatch Association home">
          <img class="badge" src="/assets/logo-badge.svg" alt="">
          <span class="logo-text">
            <strong>Encinitas Sasquatch Association</strong>
            <span>Est. 2016 · Encinitas, California</span>
          </span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span></span></button>
        <nav class="nav" id="site-nav">
          ${links}
          <a class="nav-cta" href="/join"${joinCurrent}>Join the search</a>
        </nav>
      </div>
    </header>`;
  }

  function footerHtml() {
    return `<footer class="site-footer">
      <div class="footer-grid">
        <div>
          <img src="/assets/logo-badge.svg" alt="" width="56" height="61" style="filter: invert(1) sepia(0.2) saturate(0); width:56px;height:61px;">
          <h3 style="color:var(--paper);margin-top:12px;">Encinitas Sasquatch Association</h3>
          <p class="muted">Wander often. Wonder always. We celebrate Bigfoot’s love of Encinitas, California.</p>
        </div>
        <div>
          <div class="eyebrow" style="color:var(--sun);">Explore</div>
          <p><a href="/events">Event history</a><br>
          <a href="/upcoming">Upcoming events</a><br>
          <a href="/about">About</a><br>
          <a href="/shop">Shop</a><br>
          <a href="/join">Join the ESA</a><br>
          <a href="/rsvp">RSVP / volunteer</a><br>
          <a href="/grow">Grow lima beans</a></p>
        </div>
        <div>
          <div class="eyebrow" style="color:var(--sun);">In the wild</div>
          <nav class="footer-social" aria-label="ESA on social media">
            <a href="https://www.facebook.com/encinitassasquatchassociation/" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34v7.03C18.34 21.25 22 17.09 22 12.07z"/></svg></a>
            <a href="https://twitter.com/encintassquatch" target="_blank" rel="noopener" aria-label="X (Twitter)"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.71 10.39 21.66 2h-1.89l-6.9 7.27L7.36 2H2.2l8.33 11.34L2.2 22h1.89l7.28-7.67L16.64 22H21.8l-8.09-11.61Zm-2.57 2.71-.84-1.13L4.77 3.3h2.9l5.4 7.23.84 1.13 7.04 9.42h-2.9l-5.91-7.98Z"/></svg></a>
            <a href="https://www.instagram.com/encinitassasquatchassociation/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9A4.5 4.5 0 0 1 16.5 21h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9ZM17.4 6.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 8.2A3.8 3.8 0 1 1 12 15.8 3.8 3.8 0 0 1 12 8.2zm0 1.8A2 2 0 1 0 12 14a2 2 0 0 0 0-4z"/></svg></a>
          </nav>
          <p><a href="mailto:info@encinitassasquatchassociation.com">info@encinitassasquatchassociation.com</a><br>
          <a href="https://duckfootbeer.com/">Duck Foot Brewing Co</a></p>
        </div>
      </div>
      <div class="legal">
        <span>© ${new Date().getFullYear()} Encinitas Sasquatch Association. All rights reserved.</span>
        <button class="sighting-trigger" type="button" id="sighting-trigger" title="Something just moved in the trees">A faint track in the sand</button>
      </div>
    </footer>
    <div class="forest-edge" id="forest-edge" aria-hidden="true">
      <img src="/assets/bigfoot-silhouette.svg" alt="" width="110" height="150">
    </div>
    <div class="sighting" id="sighting" hidden role="dialog" aria-labelledby="sighting-title">
      <div class="sighting-card">
        <img class="peek" src="/assets/bigfoot-silhouette.svg" alt="">
        <h2 id="sighting-title">You found him.</h2>
        <p>A well-documented sighting, right here in America’s finest town. The Encinitas Sasquatch Association thanks you for keeping an open mind.</p>
        <p class="meta">The absence of evidence is not evidence of absence.</p>
        <button class="btn btn-sea" type="button" id="sighting-close">Back to the parade route</button>
      </div>
    </div>`;
  }

  const headerMount = document.getElementById("site-header");
  const footerMount = document.getElementById("site-footer");
  if (headerMount) headerMount.innerHTML = headerHtml();
  if (footerMount) footerMount.innerHTML = footerHtml();

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Typewriter on the home hero
  const tw = document.querySelector("[data-typewriter]");
  if (tw) {
    const words = [
      "Believes",
      "Inspires",
      "Unites",
      "Wanders",
      "Wonders",
      "Looks up",
      "Chooses kindness",
      "Discovers",
    ];
    let i = 0, char = 0, dir = 1;
    const textEl = tw.querySelector(".tw-text");
    function tick() {
      const word = words[i];
      char += dir;
      textEl.textContent = word.slice(0, char);
      if (char === word.length) {
        dir = -1;
        setTimeout(tick, 1400);
        return;
      }
      if (char === 0) {
        dir = 1;
        i = (i + 1) % words.length;
      }
      setTimeout(tick, dir === 1 ? 90 : 45);
    }
    tick();
  }

  // Easter egg: footer track, or the logo clicked three times quickly
  const sighting = document.getElementById("sighting");
  const edge = document.getElementById("forest-edge");
  function openSighting() {
    if (edge) edge.classList.add("seen");
    if (sighting) {
      sighting.hidden = false;
      const close = document.getElementById("sighting-close");
      if (close) close.focus();
    }
    try { localStorage.setItem("esa-sighting", "1"); } catch (_) {}
  }
  function closeSighting() {
    if (sighting) sighting.hidden = true;
  }
  const trigger = document.getElementById("sighting-trigger");
  if (trigger) trigger.addEventListener("click", openSighting);
  const closer = document.getElementById("sighting-close");
  if (closer) closer.addEventListener("click", closeSighting);
  if (sighting) {
    sighting.addEventListener("click", (e) => { if (e.target === sighting) closeSighting(); });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSighting();
  });
  let clicks = 0, clickTimer;
  const logo = document.querySelector(".logo-lockup");
  if (logo) {
    logo.addEventListener("click", (e) => {
      // allow navigation, but three rapid clicks still count if they stay
      clicks += 1;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { clicks = 0; }, 600);
      if (clicks >= 3) {
        e.preventDefault();
        openSighting();
        clicks = 0;
      }
    });
  }
  try {
    if (localStorage.getItem("esa-sighting")) {
      if (edge) edge.classList.add("seen");
    }
  } catch (_) {}

  // Home, upcoming, events, event pages hydrate if mounts exist
  if (window.ESA && typeof ESA.loadEvents === "function") {
    if (document.getElementById("upcoming-spotlight") ||
        document.getElementById("timeline-teaser") ||
        document.getElementById("timeline") ||
        document.getElementById("upcoming-list") ||
        document.getElementById("event-page") ||
        document.getElementById("eventSlug")) {
      ESA.loadEvents().then(hydrate).catch((err) => {
        console.error(err);
        const mounts = ["upcoming-spotlight", "timeline-teaser", "timeline", "upcoming-list", "event-page"];
        mounts.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.innerHTML = `<p class="note">The trail map didn’t load. Try refreshing, or come back in a moment.</p>`;
        });
      });
    }
  }


  // Prefill the RSVP select from the URL immediately, so a submit
  // before events.json hydrates still posts the right event slug.
  (function prefillRsvpSlug() {
    const select = document.getElementById("eventSlug");
    if (!select) return;
    const slug = (location.pathname.match(/\/rsvp\/([a-z0-9-]+)/) || [])[1]
      || new URLSearchParams(location.search).get("event");
    if (!slug || slug === "general") return;
    if (![...select.options].some((o) => o.value === slug)) {
      const opt = document.createElement("option");
      opt.value = slug;
      opt.textContent = slug.replace(/-/g, " ");
      select.appendChild(opt);
    }
    select.value = slug;
    const nameField = document.getElementById("eventName");
    if (nameField) nameField.value = slug.replace(/-/g, " ");
  })();

  function eventSlugFromPath() {
    const m = location.pathname.match(/\/events?\/([a-z0-9-]+)\/?$/);
    if (m) return m[1];
    return new URLSearchParams(location.search).get("slug");
  }


  function isParade2026(ev) {
    return ev && ev.slug === "holiday-parade-2026";
  }

  function paradePanel(ev) {
    if (isParade2026(ev) && window.ESA_FESTIVE) return window.ESA_FESTIVE.paradeArtHtml();
    if (ev.heroImage || ev.heroThumb) {
      return `<img src="${ESA.escapeHtml(ESA.imageUrl(ev.heroImage || ev.heroThumb))}" alt="${ESA.escapeHtml(ev.name)}" loading="lazy" style="${ESA.focusStyle(ev)}">`;
    }
    return `<div class="card-fallback"><span>${ESA.escapeHtml(ESA.fallbackLabel(ev))}</span></div>`;
  }

  function hydrate(data) {
    const { events } = data;
    const next = ESA.upcoming(events)[0];
    const spotlight = document.getElementById("upcoming-spotlight");
    if (spotlight) {
      if (!next) {
        spotlight.innerHTML = `<div class="spotlight-copy"><p class="eyebrow">Upcoming</p><h2>The woods are quiet — for now.</h2><p>No dated upcoming events are on the trail just now. Wander the history in the meantime.</p><a class="btn btn-sun" href="/events">Read the history</a></div>`;
      } else {
        const img = paradePanel(next);
        spotlight.innerHTML = `
          <div class="spotlight-copy">
            <p class="eyebrow">Next up · ${ESA.escapeHtml(next.type)}</p>
            <h2>${ESA.escapeHtml(next.name)}</h2>
            ${isParade2026(next) && window.ESA_FESTIVE ? window.ESA_FESTIVE.whenWhereHtml({ compact: true }) : `<p class="meta" style="color:var(--sun);">${ESA.escapeHtml(ESA.formatDate(next))}${next.location ? " · " + ESA.escapeHtml(next.location) : ""}</p>`}
            <p>${ESA.escapeHtml(next.summary)}</p>
            <p class="rsvp-count" data-rsvp-count="${ESA.escapeHtml(next.slug)}" hidden></p>
            <div class="btn-row">
              <a class="btn btn-sun" href="${ESA.eventPath(next)}">Get the details</a>
              <a class="btn btn-ghost" href="${ESA.rsvpPath(next)}" style="border-color:var(--paper);color:var(--paper) !important;">RSVP / volunteer</a>
            </div>
          </div>
          ${img}`;
      }
    }

    const teaser = document.getElementById("timeline-teaser");
    if (teaser) {
      const recent = ESA.past(events).slice(0, 3);
      teaser.innerHTML = recent.map(ESA.cardHtml).join("");
    }

    const upcomingList = document.getElementById("upcoming-list");
    if (upcomingList) {
      const list = ESA.upcoming(events);
      if (!list.length) {
        upcomingList.innerHTML = `<p>Nothing dated is on the trail just now. The event history is still on the <a href="/events">Event History</a> page.</p>`;
      } else {
        upcomingList.innerHTML = list.map((ev, i) => `
          <article class="spotlight-card${i === 0 ? " is-featured" : ""}" style="margin-bottom:24px;">
            <div class="spotlight-copy">
              <p class="eyebrow">${ESA.escapeHtml(ev.type)}</p>
              <h2>${ESA.escapeHtml(ev.name)}</h2>
              ${isParade2026(ev) && window.ESA_FESTIVE ? window.ESA_FESTIVE.whenWhereHtml({ compact: true }) : `<p class="meta" style="color:var(--sun);">${ESA.escapeHtml(ESA.formatDate(ev))}${ev.location ? " · " + ESA.escapeHtml(ev.location) : ""}</p>`}
              <p>${ESA.escapeHtml(ev.summary)}</p>
              <p class="rsvp-count" data-rsvp-count="${ESA.escapeHtml(ev.slug)}" hidden></p>
              <div class="btn-row">
                <a class="btn btn-sun" href="${ESA.eventPath(ev)}">Event page</a>
                <a class="btn btn-ghost" href="${ESA.rsvpPath(ev)}" style="border-color:var(--paper);color:var(--paper) !important;">RSVP / volunteer</a>
              </div>
            </div>
            ${paradePanel(ev)}
          </article>`).join("");
        const featured = upcomingList.querySelector(".spotlight-card.is-featured");
        if (featured) {
          featured.insertAdjacentHTML("afterend", paradeMarqueeHtml(events));
          initTimelineFilms(upcomingList);
        }
      }
    }

    const timeline = document.getElementById("timeline");
    if (timeline) {
      const filters = document.getElementById("timeline-filters");
      const types = ["All", ...Array.from(new Set(events.map((e) => e.type)))];
      if (filters) {
        filters.innerHTML = types.map((t, i) =>
          `<button type="button" data-type="${ESA.escapeHtml(t)}" aria-pressed="${i === 0 ? "true" : "false"}">${ESA.escapeHtml(t)}</button>`
        ).join("");
        filters.addEventListener("click", (e) => {
          const btn = e.target.closest("button");
          if (!btn) return;
          filters.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
          renderTimeline(btn.getAttribute("data-type"));
        });
      }
      function renderTimeline(type) {
        const list = events
          .filter((e) => type === "All" || !type || e.type === type)
          .slice()
          .sort((a, b) => a.sortMs - b.sortMs);
        timeline.innerHTML = list.map((ev) => {
          const thumb = ESA.cardThumb(ev);
          const href = ESA.eventPath(ev);
          const photo = thumb
            ? `<a class="tl-thumb-link" href="${href}"><img class="tl-thumb" src="${ESA.escapeHtml(ESA.imageUrl(thumb))}" alt="" loading="lazy" width="280" height="350" style="${ESA.focusStyle(ev)}"></a>`
            : `<div class="tl-thumb card-fallback" aria-hidden="true"><span>${ESA.escapeHtml(ESA.fallbackLabel(ev))}</span></div>`;
          const n = (ev.images || []).length;
          const count = n ? `<span class="meta">${n} photo${n === 1 ? "" : "s"}</span>` : "";
          return `
          <article class="tl-item ${ev.isUpcoming ? "upcoming" : ""}">
            <div class="tl-dot" aria-hidden="true"><img src="/assets/footprint.svg" alt=""></div>
            <div class="tl-card">
              ${photo}
              <div class="tl-copy">
                <a class="tl-copy-link" href="${href}">
                  <div class="meta">${ESA.year(ev)} · ${ESA.escapeHtml(ESA.formatDate(ev))}</div>
                  <h3>${ESA.escapeHtml(ev.name)}</h3>
                </a>
                <p>${ESA.escapeHtml(ev.summary)}</p>
                ${ev.isUpcoming ? `<span class="pill pill-sun">Upcoming</span>` : `<span class="${ESA.typeClass(ev.type)}">${ESA.escapeHtml(ev.type)}</span>`}
                ${count}
              </div>
              ${filmstripHtml(ev)}
            </div>
          </article>`;
        }).join("");
        initTimelineFilms(timeline);
      }
      renderTimeline("All");
    }

    const eventMount = document.getElementById("event-page");
    if (eventMount) {
      const slug = eventSlugFromPath();
      const ev = ESA.bySlug(events, slug);
      if (!ev) {
        eventMount.innerHTML = `<div class="wrap"><h1>This trail went cold.</h1><p>We couldn’t find an event called <code>${ESA.escapeHtml(slug || "")}</code>. See the <a href="/events">full history</a>.</p></div>`;
        document.title = "Event not found · ESA";
        return;
      }
      document.title = ev.name + " · Encinitas Sasquatch Association";
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", ev.summary);
      const galleryItems = ev.images || [];
      const gallery = galleryItems.map((img, i) => {
        const thumb = img.thumb || img.src;
        const full = img.src || img.thumb;
        return `<figure>
          <button type="button" class="gallery-item" data-index="${i}" aria-label="View photo ${i + 1} of ${galleryItems.length}">
            <img src="${ESA.escapeHtml(ESA.imageUrl(thumb))}" alt="${ESA.escapeHtml(img.alt || ev.name)}" loading="lazy" width="600" height="600" style="--thumb-focus:50% 20%;object-position:50% 20%;">
          </button>
          ${img.caption ? `<figcaption>${ESA.escapeHtml(img.caption)}</figcaption>` : ""}
        </figure>`;
      }).join("");
      const highlights = (ev.highlights || []).map((h) => `<li>${ESA.escapeHtml(h)}</li>`).join("");
      const notes = (ev.notes || []).map((n) => `<p class="note">${ESA.escapeHtml(n)}</p>`).join("");
      const partners = (ev.partners || []).length
        ? `<p class="meta">With ${ESA.escapeHtml(ev.partners.join(", "))}</p>` : "";
      const cta = ev.isUpcoming
        ? `<a class="btn btn-sea" href="${ESA.rsvpPath(ev)}">RSVP / volunteer</a>`
        : `<a class="btn btn-sea" href="/join">Join the search</a>`;
      const isParadePage = isParade2026(ev) && window.ESA_FESTIVE;
      document.body.classList.toggle("is-parade-event", !!isParadePage);
      if (isParadePage) {
        const festive = window.ESA_FESTIVE;
        eventMount.innerHTML = `
        <section class="event-hero">
          <div class="wrap">
            <div>
              <p class="eyebrow">${ESA.escapeHtml(ev.type)}${ev.theme ? " · " + ESA.escapeHtml(ev.theme) : ""}</p>
              <h1>${ESA.escapeHtml(ev.name)}</h1>
              ${festive.whenWhereHtml()}
              ${ev.subhead ? `<p class="typewriter" style="min-height:0;margin:12px 0 16px;">${ESA.escapeHtml(ev.subhead)}</p>` : ""}
              <div class="btn-row" style="margin:18px 0 12px;">
                ${cta}
                <a class="btn btn-ghost" href="/events">All events</a>
              </div>
              <div class="upcoming-hero-tools" id="event-music"></div>
              <p class="rsvp-count" data-rsvp-count="${ESA.escapeHtml(ev.slug)}" hidden></p>
              ${partners}
              ${ev.isUpcoming ? `<span class="pill pill-sun">Upcoming</span>` : `<span class="pill">Past event</span>`}
            </div>
            ${festive.paradeArtHtml()}
          </div>
        </section>
        ${paradeMarqueeHtml(events)}
        ${festive.paradeExpectHtml()}
        ${festive.paradeJoinHtml(ESA.rsvpPath(ev))}
        <section class="section">
          <div class="wrap prose">
            <h2>The story</h2>
            ${ev.body.split(/\n\n/).map((p) => `<p>${ESA.escapeHtml(p)}</p>`).join("")}
            ${highlights ? `<h3>Along the trail</h3><ul class="highlights">${highlights}</ul>` : ""}
            ${notes}
          </div>
        </section>
        ${festive.paradeKitHtml()}
        ${paradeYearsHtml(events)}
        <section class="parade-crew section">
          <div class="wrap">
            <div class="stoke-meter" id="stoke-meter"></div>
            <section class="marching-wall" id="marching-wall" hidden>
              <p class="eyebrow">The crew</p>
              <h2>Who’s marching</h2>
              <p class="marching-empty" id="marching-empty" hidden>No tracks on this trail yet. Be the first to RSVP.</p>
              <ul class="marching-list" id="marching-list"></ul>
            </section>
          </div>
        </section>
        <section>
          <div class="join-band">
            <div>
              <h2>Want in on the next migration?</h2>
              <p>Members get the call when the float needs a crew, the beach needs a rake, or Pride needs more kindness.</p>
            </div>
            <a class="btn btn-sun" href="/join">Join the ESA</a>
          </div>
        </section>`;
        initTimelineFilms(eventMount);
      } else {
        eventMount.innerHTML = `
        <section class="event-hero">
          <div class="wrap">
            <div>
              <p class="eyebrow">${ESA.escapeHtml(ev.type)}${ev.theme ? " · " + ESA.escapeHtml(ev.theme) : ""}</p>
              <h1>${ESA.escapeHtml(ev.name)}</h1>
              <p class="meta">${ESA.escapeHtml(ESA.formatDate(ev))}${ev.location ? " · " + ESA.escapeHtml(ev.location) : ""}</p>
              ${ev.subhead ? `<p class="typewriter" style="min-height:0;margin:12px 0 16px;">${ESA.escapeHtml(ev.subhead)}</p>` : ""}
              <div class="btn-row" style="margin:18px 0 24px;">
                ${cta}
                <a class="btn btn-ghost" href="/events">All events</a>
              </div>
              ${partners}
              ${ev.isUpcoming ? `<span class="pill pill-sun">Upcoming</span>` : `<span class="pill">Past event</span>`}
            </div>
            ${ESA.media(ev, "hero")}
          </div>
        </section>
        <section class="section">
          <div class="wrap prose">
            <h2>The story</h2>
            ${ev.body.split(/\n\n/).map((p) => `<p>${ESA.escapeHtml(p)}</p>`).join("")}
            ${highlights ? `<h3>Along the trail</h3><ul class="highlights">${highlights}</ul>` : ""}
            ${notes}
          </div>
        </section>
        ${gallery ? `<section class="section" style="padding-top:0;"><div class="wrap"><h2>From the field</h2><p class="meta">${galleryItems.length} photo${galleryItems.length === 1 ? "" : "s"} · click any image to enlarge</p><div class="gallery" id="event-gallery">${gallery}</div></div></section>` : (ev.album ? `<section class="section" style="padding-top:0;"><div class="wrap"><p class="note">We’re still gathering photos from this night.</p></div></section>` : "")}
        <section>
          <div class="join-band">
            <div>
              <h2>Want in on the next migration?</h2>
              <p>Members get the call when the float needs a crew, the beach needs a rake, or Pride needs more kindness.</p>
            </div>
            <a class="btn btn-sun" href="/join">Join the ESA</a>
          </div>
        </section>`;
        if (galleryItems.length) initLightbox(galleryItems, ev.name);
      }
    }

    // Prefill RSVP event select if present
    const select = document.getElementById("eventSlug");
    if (select && !select.dataset.filled) {
      const upcoming = ESA.upcoming(events);
      const past = ESA.past(events);
      const rsvpSlug = (location.pathname.match(/\/rsvp\/([a-z0-9-]+)/) || [])[1]
        || new URLSearchParams(location.search).get("event");
      const groups = [];
      if (upcoming.length) {
        groups.push(`<optgroup label="Upcoming">${upcoming.map((e) =>
          `<option value="${ESA.escapeHtml(e.slug)}" ${e.slug === rsvpSlug ? "selected" : ""}>${ESA.escapeHtml(e.name)} — ${ESA.escapeHtml(ESA.formatDate(e))}</option>`
        ).join("")}</optgroup>`);
      }
      groups.push(`<optgroup label="Past / general">${[
        `<option value="general" ${rsvpSlug === "general" || !rsvpSlug && !upcoming.length ? "selected" : ""}>General volunteer — put me in, coach</option>`,
        ...past.map((e) =>
          `<option value="${ESA.escapeHtml(e.slug)}" ${e.slug === rsvpSlug ? "selected" : ""}>${ESA.escapeHtml(e.name)}</option>`
        )
      ].join("")}</optgroup>`);
      select.innerHTML = groups.join("");
      select.dataset.filled = "1";
      const nameField = document.getElementById("eventName");
      const syncName = () => {
        if (!nameField) return;
        if (select.value === "general") nameField.value = "General volunteer";
        else {
          const ev = ESA.bySlug(events, select.value);
          nameField.value = ev ? ev.name : "";
        }
      };
      select.addEventListener("change", syncName);
      syncName();
    }

    initFestive(data, next);
  }

  function initFestive(data, next) {
    const festive = window.ESA_FESTIVE;
    if (!festive) return;
    const events = data.events || [];

    const kitHome = document.getElementById("parade-kit-home");
    if (kitHome) {
      kitHome.innerHTML = isParade2026(next) ? festive.paradeKitHtml() : "";
    }

    const stoke = document.getElementById("stoke-meter");
    if (stoke) festive.initStokeMeter(stoke, events.length);

    festive.paintRsvpCounts(document);

    const upcomingList = document.getElementById("upcoming-list");
    if (upcomingList && upcomingList.querySelector(".spotlight-card") && !festive.prefersReduced()) {
      const firstCard = upcomingList.querySelector(".spotlight-card");
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          festive.burst("small");
        }
      }, { threshold: 0.35 });
      io.observe(firstCard);
    }

    document.querySelectorAll("#upcoming-music, #rsvp-music, #event-music").forEach((el) => {
      festive.initMusicToggle(el);
    });

    const eventHero = document.querySelector("body.is-parade-event .event-hero");
    if (eventHero && !festive.prefersReduced()) {
      const ioEvent = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          ioEvent.disconnect();
          festive.burst("small");
        }
      }, { threshold: 0.2 });
      ioEvent.observe(eventHero);
    }

    if (document.body.classList.contains("is-parade-event")) {
      const slug = eventSlugFromPath();
      if (slug) festive.paintAttendees(slug);
    }

    const rsvpCount = document.getElementById("rsvp-live-count");
    const select = document.getElementById("eventSlug");
    const paradeHero = document.getElementById("rsvp-parade-hero");
    const successArt = document.getElementById("rsvp-success-art");
    if (successArt && !successArt.dataset.filled) {
      successArt.innerHTML = festive.rsvpSuccessArtHtml();
      successArt.dataset.filled = "1";
    }
    const successCamo = document.getElementById("rsvp-success-camo");
    if (successCamo && !successCamo.dataset.filled) {
      successCamo.innerHTML = festive.rsvpSuccessCamoHtml();
      successCamo.dataset.filled = "1";
    }
    const introDefaults = (() => {
      const title = document.getElementById("rsvp-title");
      const lede = document.getElementById("rsvp-lede");
      const eyebrow = document.querySelector("#rsvp-intro .eyebrow");
      return {
        title: title ? title.textContent : "",
        lede: lede ? lede.textContent : "",
        eyebrow: eyebrow ? eyebrow.textContent : "",
      };
    })();
    function themeRsvp(slug) {
      const isParade = slug === "holiday-parade-2026";
      document.body.classList.toggle("is-parade-rsvp", isParade);
      if (paradeHero) {
        if (isParade) {
          if (!paradeHero.dataset.filled) {
            paradeHero.innerHTML = festive.rsvpParadeHeroHtml();
            paradeHero.dataset.filled = "1";
          }
          paradeHero.hidden = false;
        } else {
          paradeHero.hidden = true;
        }
      }
      const title = document.getElementById("rsvp-title");
      const lede = document.getElementById("rsvp-lede");
      const eyebrow = document.querySelector("#rsvp-intro .eyebrow");
      if (isParade) {
        if (eyebrow) eyebrow.textContent = "10th Encinitas Holiday Parade";
        if (title) {
          title.classList.add("pk-lit");
          title.textContent = "Join the march";
        }
        if (lede) {
          lede.textContent = "The route is calling. Wear camo. Come lit. Tell us you’re marching — or that you can help the float, the bubbles, or the glow-stick handoff.";
        }
      } else {
        if (eyebrow) eyebrow.textContent = introDefaults.eyebrow;
        if (title) {
          title.classList.remove("pk-lit");
          title.style.removeProperty("background-image");
          title.textContent = introDefaults.title;
        }
        if (lede) lede.textContent = introDefaults.lede;
      }
    }
    if (rsvpCount && select) {
      const syncCount = () => {
        const slug = select.value;
        themeRsvp(slug);
        festive.paintAttendees(slug);
        if (!slug || slug === "general") {
          rsvpCount.removeAttribute("data-rsvp-count");
          rsvpCount.hidden = true;
          rsvpCount.textContent = "";
          return;
        }
        rsvpCount.setAttribute("data-rsvp-count", slug);
        festive.paintRsvpCounts(rsvpCount.parentElement);
      };
      select.addEventListener("change", syncCount);
      syncCount();
    } else if (!document.body.classList.contains("is-parade-event") && (paradeHero || document.getElementById("marching-wall"))) {
      const slug = (select && select.value) || "";
      themeRsvp(slug);
      if (slug) festive.paintAttendees(slug);
    }
  }

  function pickMarqueePhotos(events) {
    const bySlug = Object.fromEntries((events || []).map((ev) => [ev.slug, ev]));
    const plan = [
      ["holiday-parade-2025", 3],
      ["holiday-parade-2024", 2],
      ["holiday-parade-2023", 2],
      ["holiday-parade-2022", 2],
      ["holiday-parade-2021", 2],
      ["parade-prep-2021", 1],
      ["holiday-parade-2020", 2],
      ["holiday-parade-2019", 2],
      ["holiday-parade-2018", 1],
      ["holiday-parade-2017", 1],
      ["holiday-parade-2016", 1],
      ["pride-2025", 2],
      ["pride-2024", 1],
      ["beach-cleanup-2024", 1],
    ];
    const picks = [];
    plan.forEach(([slug, count]) => {
      const ev = bySlug[slug];
      const imgs = ev && (ev.images || []).filter((img) => img.thumb || img.src);
      if (!imgs || !imgs.length) return;
      const chosen = [];
      if (imgs.length <= count) chosen.push.apply(chosen, imgs);
      else {
        for (let i = 1; i <= count; i += 1) {
          const idx = Math.min(Math.floor((i * imgs.length) / (count + 1)), imgs.length - 1);
          chosen.push(imgs[idx]);
        }
      }
      chosen.forEach((img) => {
        const thumb = img.thumb || img.src;
        if (picks.some((p) => p.thumb === thumb)) return;
        const n = ev.images.indexOf(img) + 1;
        picks.push({
          thumb,
          href: ESA.eventPath(ev) + "#photo-" + n,
          label: ev.name + " photo " + n,
        });
      });
    });
    return picks;
  }

  function isHolidayParade(ev) {
    return ev && ev.type === "Holiday Parade";
  }

  function paradeCardThumb(ev) {
    const hero = ev.heroImage || ev.heroThumb;
    const imgs = ev.images || [];
    const match = imgs.find((img) => img.src === hero || img.thumb === hero);
    if (match) return match.thumb || match.src;
    if (imgs[0]) return imgs[0].thumb || imgs[0].src;
    return hero || "";
  }

  function paradeYearsHtml(events) {
    const parades = (events || []).filter(isHolidayParade).slice().sort((a, b) => (a.sortMs || 0) - (b.sortMs || 0));
    if (!parades.length) return "";
    const cards = parades.map((ev) => {
      const year = ESA.year(ev);
      const thumb = paradeCardThumb(ev);
      const title = ev.shortName || ev.theme || ev.name;
      const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
      let fact = "";
      if (ev.theme && norm(ev.theme) !== norm(title)) fact = ev.theme;
      else if (ev.subhead && norm(ev.subhead) !== norm(title)) fact = ev.subhead;
      const photo = thumb
        ? `<img src="${ESA.escapeHtml(ESA.imageUrl(thumb))}" alt="${ESA.escapeHtml((year ? year + " · " : "") + ev.name)}" width="480" height="360">`
        : `<div class="parade-year-fallback" aria-hidden="true"><span>10th</span></div>`;
      const upcoming = ev.isUpcoming ? `<span class="pill pill-sun">Upcoming</span>` : "";
      return `<a class="parade-year-card${ev.isUpcoming ? " is-next" : ""}" href="${ESA.eventPath(ev)}">
        ${photo}
        <div class="parade-year-copy">
          <p class="parade-year-kicker">${ESA.escapeHtml(year)}${ev.dateUncertain ? " · date unresolved" : ""}</p>
          <h3>${ESA.escapeHtml(title)}</h3>
          ${fact ? `<p>${ESA.escapeHtml(fact)}</p>` : ""}
          ${upcoming}
        </div>
      </a>`;
    }).join("");
    return `<section class="parade-years" id="ten-years">
      <div class="wrap">
        <p class="pk-kicker">The trail so far</p>
        <h2>10 years of parades</h2>
        <p class="parade-years-lede">Every Encinitas Holiday Parade night already on the ESA trail, from the first night on film to this year’s 10th.</p>
        <div class="parade-year-grid">${cards}</div>
      </div>
    </section>`;
  }

  function paradeMarqueeHtml(events) {

    const picks = pickMarqueePhotos(events);
    if (picks.length < 6) return "";
    const reduced = window.ESA_FESTIVE && window.ESA_FESTIVE.prefersReduced();
    function cells(duplicate) {
      return picks.map((img) => {
        const src = ESA.imageUrl(img.thumb);
        const extra = duplicate
          ? ' tabindex="-1" aria-hidden="true"'
          : ` aria-label="${ESA.escapeHtml(img.label)}"`;
        return `<a href="${ESA.escapeHtml(img.href)}"${extra}><img src="${ESA.escapeHtml(src)}" alt="" loading="lazy" width="240" height="180" decoding="async"></a>`;
      }).join("");
    }
    const track = reduced ? cells(false) : (cells(false) + cells(true));
    const duration = Math.max(48, picks.length * 3.2);
    const cls = reduced ? "parade-marquee is-static" : "parade-marquee";
    const dur = reduced ? "" : ` style="--marquee-duration:${duration}s"`;
    return `<section class="${cls}" aria-label="Scenes from parades past"${dur}>
      <p class="eyebrow">From parades past</p>
      <div class="parade-marquee-frame">
        <div class="parade-marquee-track">${track}</div>
      </div>
    </section>`;
  }

  function filmstripHtml(ev) {
    const items = ev.images || [];
    if (items.length < 2) return "";
    const picks = items.slice(0, 8);
    const href = ESA.eventPath(ev);
    function cells(duplicate) {
      return picks.map((img, i) => {
        const src = ESA.imageUrl(img.thumb || img.src);
        const label = `Photo ${i + 1} of ${ev.name}`;
        const extra = duplicate ? ' tabindex="-1" aria-hidden="true"' : ` aria-label="${ESA.escapeHtml(label)}"`;
        return `<a href="${href}#photo-${i + 1}"${extra}><img src="${ESA.escapeHtml(src)}" alt="" loading="lazy" width="64" height="64"></a>`;
      }).join("");
    }
    const staticMode = picks.length < 4;
    const duration = Math.max(28, picks.length * 4);
    const cls = staticMode ? "tl-film static" : "tl-film";
    const track = staticMode ? cells(false) : (cells(false) + cells(true));
    const dur = staticMode ? "" : ` style="--film-duration:${duration}s"`;
    return `<div class="${cls}"${dur}><div class="tl-film-track">${track}</div></div>`;
  }

  function initTimelineFilms(root) {
    const films = root.querySelectorAll(".tl-film:not(.static), .parade-marquee:not(.is-static)");
    if (!films.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      });
    }, { rootMargin: "120px 0px", threshold: 0.05 });
    films.forEach((el) => io.observe(el));
  }

  function initLightbox(items, eventName) {
    let box = document.getElementById("lightbox");
    if (!box) {
      box = document.createElement("div");
      box.id = "lightbox";
      box.className = "lightbox";
      box.hidden = true;
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Photo viewer");
      box.innerHTML = `
        <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
        <button type="button" class="lightbox-prev" aria-label="Previous photo">&#8592;</button>
        <figure class="lightbox-frame">
          <img alt="">
          <figcaption></figcaption>
        </figure>
        <button type="button" class="lightbox-next" aria-label="Next photo">&#8594;</button>
        <div class="lightbox-count" aria-live="polite"></div>`;
      document.body.appendChild(box);
    }
    const imgEl = box.querySelector("img");
    const capEl = box.querySelector("figcaption");
    const countEl = box.querySelector(".lightbox-count");
    let index = 0;
    let startX = 0;

    function show(i) {
      index = (i + items.length) % items.length;
      const item = items[index];
      const full = item.src || item.thumb;
      imgEl.src = ESA.imageUrl(full);
      imgEl.alt = item.alt || eventName || "";
      capEl.textContent = item.caption || "";
      capEl.hidden = !item.caption;
      countEl.textContent = `${index + 1} / ${items.length}`;
    }
    function open(i) {
      show(i);
      box.hidden = false;
      document.body.style.overflow = "hidden";
      box.querySelector(".lightbox-close").focus();
    }
    function close() {
      box.hidden = true;
      document.body.style.overflow = "";
      imgEl.removeAttribute("src");
    }

    box.querySelector(".lightbox-close").onclick = close;
    box.querySelector(".lightbox-prev").onclick = () => show(index - 1);
    box.querySelector(".lightbox-next").onclick = () => show(index + 1);
    box.onclick = (e) => { if (e.target === box) close(); };

    function onKey(e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    }
    document.addEventListener("keydown", onKey);

    box.addEventListener("touchstart", (e) => {
      if (e.changedTouches[0]) startX = e.changedTouches[0].clientX;
    }, { passive: true });
    box.addEventListener("touchend", (e) => {
      if (!e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (dx > 50) show(index - 1);
      if (dx < -50) show(index + 1);
    }, { passive: true });

    document.querySelectorAll("#event-gallery .gallery-item").forEach((btn) => {
      btn.addEventListener("click", () => open(Number(btn.getAttribute("data-index")) || 0));
    });

    const hash = location.hash.match(/^#photo-(\d+)$/);
    if (hash) {
      const i = Number(hash[1]) - 1;
      if (i >= 0 && i < items.length) open(i);
    }
  }


  // Staggered pop-in for homepage values and About beliefs.
  document.querySelectorAll("[data-pop-in]").forEach((root) => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { root.classList.add("is-inview"); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        root.classList.add("is-inview");
        io.disconnect();
      }
    }, { threshold: 0.25 });
    io.observe(root);
  });

})();
