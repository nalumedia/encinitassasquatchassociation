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
          <p><a href="https://www.instagram.com/encinitassasquatchassociation/">Instagram</a><br>
          <a href="https://www.facebook.com/encinitassasquatchassociation/">Facebook</a><br>
          <a href="mailto:info@encinitassasquatchassociation.com">info@encinitassasquatchassociation.com</a><br>
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
        document.getElementById("event-page")) {
      ESA.loadEvents().then(hydrate).catch((err) => {
        console.error(err);
        const mounts = ["upcoming-spotlight", "timeline-teaser", "timeline", "upcoming-list", "event-page"];
        mounts.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.innerHTML = `<p class="note">We couldn’t load events.json. Make sure you opened the site via <code>node server.js</code> at http://localhost:3000, not as a file.</p>`;
        });
      });
    }
  }

  function eventSlugFromPath() {
    const m = location.pathname.match(/\/events?\/([a-z0-9-]+)\/?$/);
    if (m) return m[1];
    return new URLSearchParams(location.search).get("slug");
  }

  function hydrate(data) {
    const { events } = data;
    const next = ESA.upcoming(events)[0];
    const spotlight = document.getElementById("upcoming-spotlight");
    if (spotlight) {
      if (!next) {
        spotlight.innerHTML = `<div class="spotlight-copy"><p class="eyebrow">Upcoming</p><h2>The woods are quiet — for now.</h2><p>No dated upcoming events are in events.json. Add one and refresh.</p><a class="btn btn-sun" href="/events">Read the history</a></div>`;
      } else {
        const img = (next.heroImage || next.heroThumb)
          ? `<img src="${ESA.escapeHtml(ESA.imageUrl(next.heroImage || next.heroThumb))}" alt="${ESA.escapeHtml(next.name)}" style="${ESA.focusStyle(next)}">`
          : `<div class="card-fallback"><span>${ESA.escapeHtml(ESA.fallbackLabel(next))}</span></div>`;
        spotlight.innerHTML = `
          <div class="spotlight-copy">
            <p class="eyebrow">Next up · ${ESA.escapeHtml(next.type)}</p>
            <h2>${ESA.escapeHtml(next.name)}</h2>
            <p class="meta" style="color:var(--sun);">${ESA.escapeHtml(ESA.formatDate(next))}${next.location ? " · " + ESA.escapeHtml(next.location) : ""}</p>
            <p>${ESA.escapeHtml(next.summary)}</p>
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
        upcomingList.innerHTML = `<p>No upcoming events are currently dated in events.json. The event history is still on the <a href="/events">Event History</a> page.</p>`;
      } else {
        upcomingList.innerHTML = list.map((ev) => `
          <article class="spotlight-card" style="margin-bottom:24px;">
            <div class="spotlight-copy">
              <p class="eyebrow">${ESA.escapeHtml(ev.type)}</p>
              <h2>${ESA.escapeHtml(ev.name)}</h2>
              <p class="meta" style="color:var(--sun);">${ESA.escapeHtml(ESA.formatDate(ev))}${ev.location ? " · " + ESA.escapeHtml(ev.location) : ""}</p>
              <p>${ESA.escapeHtml(ev.summary)}</p>
              <div class="btn-row">
                <a class="btn btn-sun" href="${ESA.eventPath(ev)}">Event page</a>
                <a class="btn btn-ghost" href="${ESA.rsvpPath(ev)}" style="border-color:var(--paper);color:var(--paper) !important;">RSVP / volunteer</a>
              </div>
            </div>
            ${(ev.heroImage || ev.heroThumb) ? `<img src="${ESA.escapeHtml(ESA.imageUrl(ev.heroImage || ev.heroThumb))}" alt="${ESA.escapeHtml(ev.name)}" loading="lazy" style="${ESA.focusStyle(ev)}">` : `<div class="card-fallback"><span>${ESA.escapeHtml(ESA.fallbackLabel(ev))}</span></div>`}
          </article>`).join("");
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
        ${gallery ? `<section class="section" style="padding-top:0;"><div class="wrap"><h2>From the field</h2><p class="meta">${galleryItems.length} photo${galleryItems.length === 1 ? "" : "s"} · click any image to enlarge</p><div class="gallery" id="event-gallery">${gallery}</div></div></section>` : (ev.album ? `<section class="section" style="padding-top:0;"><div class="wrap"><p class="note">Photos for this event have not been added yet.</p></div></section>` : "")}
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
    const films = root.querySelectorAll(".tl-film:not(.static)");
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

})();
