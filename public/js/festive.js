/* Parade kit, stoke meter, confetti, music toggle, RSVP counts. */
(function () {
  const LIGHT_COLORS = ["#F2B84B", "#FF2A9D", "#66AFBD", "#D65F43"];
  const BULB_X = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900, 990];
  const BULB_Y = [96, 111, 106, 81, 115, 126, 115, 81, 110, 115, 98];

  function lightsSvg() {
    const bulbs = BULB_X.map((x, i) => {
      const y = BULB_Y[i];
      const c = LIGHT_COLORS[i % LIGHT_COLORS.length];
      return `<g>
        <circle class="pk-bulb-glow" cx="${x}" cy="${y}" r="34" fill="${c}" opacity="0.16"/>
        <ellipse cx="${x}" cy="${y}" rx="11" ry="15" fill="${c}"/>
        <rect x="${x - 5}" y="${y - 22}" width="10" height="9" rx="2" fill="#F7F1E6" opacity="0.7"/>
      </g>`;
    }).join("");
    return `<div class="pk-lights" aria-hidden="true">
      <svg viewBox="0 0 1080 190" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin meet">
        <path d="M-10 34 Q 180 130 360 60 Q 540 150 720 60 Q 900 140 1090 34" fill="none" stroke="#F7F1E673" stroke-width="2.5"/>
        ${bulbs}
      </svg>
    </div>`;
  }

  function bubblesHtml() {
    const bits = [12, 18, 9, 22, 14, 11, 16].map((s, i) =>
      `<span style="left:${8 + i * 13}%;width:${s}px;height:${s}px;animation-delay:${i * 0.7}s;animation-duration:${6 + (i % 3)}s;"></span>`
    ).join("");
    return `<div class="pk-bubbles" aria-hidden="true">${bits}</div>`;
  }

  function camoHtml() {
    const prints = Array.from({ length: 8 }, () =>
      `<img src="/assets/parade/footprint-pixel.png" alt="">`
    ).join("");
    return `<div class="pk-camo" aria-hidden="true"><div class="pk-tracks">${prints}${prints}</div></div>`;
  }

  function paradeArtHtml() {
    return `<aside class="pk-art" aria-hidden="true">
      ${lightsSvg()}
      ${bubblesHtml()}
      <p class="pk-kicker">Parade kit · What to wear &amp; bring</p>
      <p class="pk-headline">Wear camo.</p>
      <p class="pk-lit">Come lit.</p>
      ${camoHtml()}
    </aside>`;
  }

  function paradeKitHtml() {
    return `<section class="parade-kit" id="parade-kit">
      ${lightsSvg()}
      <div class="wrap">
        <p class="pk-kicker">Parade kit · What to wear &amp; bring</p>
        <p class="pk-headline">Wear camo.</p>
        <p class="pk-lit">Come lit.</p>
        ${camoHtml()}
        <div class="pk-cols">
          <div>
            <h3>Light-up everything</h3>
            <ul>
              <li>Santa hats</li>
              <li>Necklaces</li>
              <li>Bracelets</li>
              <li>Shoes</li>
              <li>Anything that glows</li>
            </ul>
          </div>
          <div>
            <h3>Bring</h3>
            <div class="pk-bring-item">
              <div class="pk-cols li" style="display:block;font-family:var(--display);font-weight:600;font-size:clamp(1.3rem,2.4vw,1.85rem);">A bubble gun</div>
              <p>to fill the parade route with bubbles.</p>
            </div>
            <div class="pk-bring-item">
              <div style="font-family:var(--display);font-weight:600;font-size:clamp(1.3rem,2.4vw,1.85rem);">A pack of glow sticks</div>
              <p>to hand out to the crowd.</p>
            </div>
          </div>
        </div>
        <div class="pk-staging">
          <div>
            <p class="pk-kicker">Staging area</p>
            <strong>TBD</strong>
          </div>
          <p>We’ll let you know once we get our number assigned. Watch this space.</p>
        </div>
        <div class="pk-foot">
          <p>Let’s light up Encinitas.</p>
          <p class="pk-kicker">Keep believing · Est. 2016</p>
        </div>
      </div>
    </section>`;
  }

  function prefersReduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCount(el, to, opts) {
    const duration = (opts && opts.duration) || 1400;
    const format = (opts && opts.format) || ((n) => String(Math.round(n)));
    if (prefersReduced() || !el) { if (el) el.textContent = format(to); return Promise.resolve(); }
    const from = 0;
    const start = performance.now();
    return new Promise((resolve) => {
      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        el.textContent = format(from + (to - from) * easeOutCubic(t));
        if (t < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  function initStokeMeter(el, eventCount) {
    if (!el) return;
    const crushed = Number(eventCount) || 0;
    el.innerHTML = `
      <div class="stoke-item">
        <p class="eyebrow">Events crushed</p>
        <p class="stoke-num" data-count-to="${crushed}" data-kind="int">0</p>
      </div>
      <div class="stoke-item is-stoke">
        <p class="eyebrow">Stoke meter</p>
        <p class="stoke-num"><span data-count-to="11" data-kind="int">0</span>/10</p>
        <div class="stoke-bar" aria-hidden="true"><span></span></div>
      </div>
      <div class="stoke-item">
        <p class="eyebrow">Smiles created</p>
        <p class="stoke-num"><span data-count-to="1000000" data-kind="comma">0</span>+</p>
        <p class="stoke-note">counted by Sasquatch, unofficially</p>
      </div>`;
    const run = () => {
      el.querySelectorAll("[data-count-to]").forEach((node) => {
        const to = Number(node.getAttribute("data-count-to"));
        const comma = node.getAttribute("data-kind") === "comma";
        animateCount(node, to, {
          duration: comma ? 1800 : 1200,
          format: comma ? (n) => Math.round(n).toLocaleString("en-US") : (n) => String(Math.round(n)),
        });
      });
      const bar = el.querySelector(".stoke-bar > span");
      const stokeItem = el.querySelector(".stoke-item.is-stoke");
      if (bar) {
        if (prefersReduced()) {
          bar.style.width = "110%";
          if (stokeItem) stokeItem.classList.add("is-maxed");
        } else {
          bar.style.transition = "width 1.3s cubic-bezier(.15,.8,.2,1)";
          requestAnimationFrame(() => { bar.style.width = "110%"; });
          setTimeout(() => { if (stokeItem) stokeItem.classList.add("is-maxed"); }, 1300);
        }
      }
    };
    if (prefersReduced()) { run(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); run(); }
    }, { threshold: 0.35 });
    io.observe(el);
  }

  /* ——— Confetti (canvas, no dependencies) ——— */
  let confettiCanvas, confettiCtx, confettiParts = [], confettiRaf = 0;

  function ensureCanvas() {
    if (confettiCanvas) return;
    confettiCanvas = document.createElement("canvas");
    confettiCanvas.id = "confetti-layer";
    confettiCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(confettiCanvas);
    confettiCtx = confettiCanvas.getContext("2d");
    const resize = () => {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
  }

  function burst(kind) {
    if (prefersReduced()) return;
    ensureCanvas();
    const big = kind === "big";
    const n = big ? 180 : 80;
    const colors = ["#F2B84B", "#FF2A9D", "#66AFBD", "#D65F43", "#F7F1E6", "#0C8798"];
    const w = confettiCanvas.width, h = confettiCanvas.height;
    const cx = w / 2, cy = big ? h * 0.35 : h * 0.2;
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const speed = (big ? 9 : 6) + Math.random() * (big ? 10 : 6);
      confettiParts.push({
        x: cx + (Math.random() - 0.5) * w * 0.4,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (big ? 6 : 4),
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[i % colors.length],
        life: 1,
      });
    }
    if (!confettiRaf) confettiRaf = requestAnimationFrame(tickConfetti);
  }

  function tickConfetti() {
    const ctx = confettiCtx;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    const next = [];
    for (const p of confettiParts) {
      p.vy += 0.18;
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.008;
      if (p.life <= 0 || p.y > confettiCanvas.height + 20) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      next.push(p);
    }
    confettiParts = next;
    if (confettiParts.length) confettiRaf = requestAnimationFrame(tickConfetti);
    else { confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); confettiRaf = 0; }
  }

  /* ——— Music toggle (no autoplay; hide if file missing) ——— */
  const PARADE_AUDIO_SRC = "/audio/parade.mp3";
  let paradeAudio = null;
  const paradeToggleBtns = new Set();

  function ensureParadeAudio() {
    if (paradeAudio) return paradeAudio;
    paradeAudio = new Audio(PARADE_AUDIO_SRC);
    paradeAudio.loop = true;
    paradeAudio.preload = "auto";
    paradeAudio.addEventListener("play", () => setParadeToggleUi(true));
    paradeAudio.addEventListener("pause", () => setParadeToggleUi(false));
    return paradeAudio;
  }

  let jamFileReady = false;

  const JAM_NOTE_SVG = `<svg class="jam-note" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10 4.2v11.1a3.4 3.4 0 1 1-1.7-3V8.1l10-2.2v7.6a3.4 3.4 0 1 1-1.7-3V4.8L10 4.2Z"/></svg>`;
  const JAM_EQ_HTML = `<span class="jam-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>`;

  function setParadeToggleUi(playing) {
    paradeToggleBtns.forEach((btn) => {
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      const label = btn.querySelector(".music-label");
      if (label) label.textContent = playing ? "Mute the Parade Jam" : "Play the Parade Jam";
      const full = playing ? "Mute the Parade Jam" : "Play the Parade Jam";
      btn.setAttribute("aria-label", full);
    });
  }

  function bindJamButton(btn) {
    const audio = ensureParadeAudio();
    btn.addEventListener("click", async () => {
      try {
        if (audio.paused) await playParadeMusic();
        else audio.pause();
      } catch (_) { /* autoplay blocked or missing file */ }
    });
    paradeToggleBtns.add(btn);
    if (jamFileReady) revealJamButton(btn);
  }

  function revealJamButton(btn) {
    btn.hidden = false;
    if (btn.classList.contains("jam-dock")) syncJamDock();
  }

  function markJamReady() {
    if (jamFileReady) return;
    jamFileReady = true;
    paradeToggleBtns.forEach(revealJamButton);
    syncJamDock();
  }

  function initMusicToggle(mount) {
    if (!mount || mount.querySelector(".music-toggle")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "music-toggle jam-hero";
    btn.hidden = true;
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Play the Parade Jam");
    btn.innerHTML = `<span class="jam-badge">${JAM_NOTE_SVG}${JAM_EQ_HTML}</span>
      <span class="jam-copy">
        <span class="jam-kicker">10th Encinitas Holiday Parade</span>
        <span class="music-label">Play the Parade Jam</span>
      </span>`;
    bindJamButton(btn);
    mount.appendChild(btn);
    initJamDock();
    watchJamHero(btn);
    probeParadeAudio();
  }

  function initJamDock() {
    if (document.querySelector(".jam-dock")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "music-toggle jam-dock";
    btn.hidden = true;
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Play the Parade Jam");
    btn.innerHTML = `<span class="jam-badge">${JAM_NOTE_SVG}${JAM_EQ_HTML}</span>
      <span class="music-label">Play the Parade Jam</span>`;
    bindJamButton(btn);
    document.body.appendChild(btn);
    window.addEventListener("scroll", syncJamDock, { passive: true });
    window.addEventListener("resize", syncJamDock);
  }

  function watchJamHero(btn) {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(() => syncJamDock(), { threshold: 0.4 });
    io.observe(btn);
  }

  function syncJamDock() {
    const dock = document.querySelector(".jam-dock");
    if (!dock || !jamFileReady) return;
    const heroes = Array.from(document.querySelectorAll(".jam-hero")).filter((el) => !el.hidden);
    const heroInView = heroes.some((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 96 && r.top < (window.innerHeight - 24);
    });
    dock.classList.toggle("is-visible", !heroInView);
  }

  let jamProbeStarted = false;
  function probeParadeAudio() {
    if (jamProbeStarted) return;
    jamProbeStarted = true;
    const audio = ensureParadeAudio();
    audio.addEventListener("canplaythrough", markJamReady, { once: true });
    audio.addEventListener("canplay", markJamReady, { once: true });
    audio.addEventListener("error", () => {
      jamFileReady = false;
      paradeToggleBtns.forEach((btn) => { btn.hidden = true; });
    });
    fetch(PARADE_AUDIO_SRC, { method: "HEAD" }).then((r) => {
      if (r.ok) markJamReady();
    }).catch(() => {});
  }

  // Call during a user gesture (submit) so a later play() is more likely to be allowed.
  function unlockParadeMusic() {
    const audio = ensureParadeAudio();
    if (!audio.paused) return;
    const wasMuted = audio.muted;
    audio.muted = true;
    const p = audio.play();
    if (p && p.then) {
      p.then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = wasMuted;
        setParadeToggleUi(false);
      }).catch(() => { audio.muted = wasMuted; });
    } else {
      audio.muted = wasMuted;
    }
  }

  async function playParadeMusic() {
    const audio = ensureParadeAudio();
    try {
      audio.muted = false;
      await audio.play();
      setParadeToggleUi(true);
      return true;
    } catch (_) {
      return false;
    }
  }

  const PARADE_2026 = {
    dateLabel: "Saturday, December 5, 2026",
    timeLead: "Parade begins at",
    timeLabel: "5:30 p.m. step-off",
    route: "South Coast Hwy 101 · D St. to J St.",
    city: "Encinitas",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=South+Coast+Highway+101+%26+D+St%2C+Encinitas%2C+CA",
    icsUrl: "/calendar/holiday-parade-2026.ics",
  };

  function whenWhereHtml(opts) {
    const compact = !!(opts && opts.compact);
    const maps = PARADE_2026.mapsUrl;
    const ics = PARADE_2026.icsUrl;
    return `<section class="when-where${compact ? " is-compact" : ""}" aria-label="When and where">
      <p class="ww-kicker">When &amp; Where</p>
      <p class="ww-date">${PARADE_2026.dateLabel}</p>
      <p class="ww-time"><span class="ww-time-lead">${PARADE_2026.timeLead}</span> ${PARADE_2026.timeLabel}</p>
      <p class="ww-route">${PARADE_2026.route}</p>
      <p class="ww-city">${PARADE_2026.city}</p>
      <div class="ww-actions btn-row">
        <a class="btn btn-sun" href="${maps}" target="_blank" rel="noopener noreferrer">Open in Maps</a>
        <a class="btn btn-ghost" href="${ics}" download="holiday-parade-2026.ics">Add to calendar</a>
      </div>
    </section>`;
  }

  function rsvpParadeHeroHtml() {
    return `${lightsSvg()}${bubblesHtml()}
      <div class="wrap">
        <p class="pk-kicker">10th Encinitas Holiday Parade</p>
        ${whenWhereHtml()}
        <p class="pk-headline">Wear camo.</p>
        <p class="pk-lit">Come lit.</p>
        ${camoHtml()}
      </div>`;
  }

  function rsvpSuccessArtHtml() {
    return `${lightsSvg()}${bubblesHtml()}`;
  }

  function rsvpSuccessCamoHtml() {
    return camoHtml();
  }

  function displayNameFromFull(name) {
    const parts = String(name || "").trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
    if (!parts.length) return "";
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
  }

  async function fetchAttendees(slug) {
    const cfg = window.ESA_CONFIG || {};
    if (!cfg.supabaseUrl || !cfg.supabaseKey || !slug) return null;
    try {
      const res = await fetch(`${cfg.supabaseUrl}/rest/v1/rpc/esa_rsvp_attendees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: cfg.supabaseKey,
          Authorization: "Bearer " + cfg.supabaseKey,
        },
        body: JSON.stringify({ event_slug: slug }),
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return Array.isArray(rows) ? rows : [];
    } catch (_) { return null; }
  }

  function renderAttendees(rows) {
    const wall = document.getElementById("marching-wall");
    const list = document.getElementById("marching-list");
    const empty = document.getElementById("marching-empty");
    if (!wall || !list) return;
    wall.hidden = false;
    list.innerHTML = "";
    const people = (rows || []).filter((r) => r && r.display_name);
    if (!people.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    people.forEach((r) => {
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = r.display_name;
      li.appendChild(name);
      const n = Number(r.party_size) || 1;
      if (n > 1) {
        const party = document.createElement("span");
        party.className = "party";
        party.textContent = `party of ${n}`;
        li.appendChild(party);
      }
      list.appendChild(li);
    });
  }

  async function paintAttendees(slug) {
    const wall = document.getElementById("marching-wall");
    if (!wall) return;
    if (!slug) {
      wall.hidden = true;
      return;
    }
    wall.hidden = false;
    const rows = await fetchAttendees(slug);
    if (rows == null) return;
    renderAttendees(rows);
  }

  /* ——— RSVP counts via rpc (no PII) ——— */
  async function fetchRsvpCount(slug) {
    const cfg = window.ESA_CONFIG || {};
    if (!cfg.supabaseUrl || !cfg.supabaseKey || !slug) return null;
    try {
      const res = await fetch(`${cfg.supabaseUrl}/rest/v1/rpc/esa_rsvp_count`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: cfg.supabaseKey,
          Authorization: "Bearer " + cfg.supabaseKey,
        },
        body: JSON.stringify({ event_slug: slug }),
      });
      if (!res.ok) return null;
      const n = await res.json();
      return typeof n === "number" ? n : Number(n);
    } catch (_) { return null; }
  }

  function countLabel(n) {
    const num = Number(n) || 0;
    const word = num === 1 ? "Sasquatch" : "Sasquatches";
    return `${num.toLocaleString("en-US")} ${word} marching`;
  }

  async function paintRsvpCounts(root) {
    const nodes = (root || document).querySelectorAll("[data-rsvp-count]");
    for (const node of nodes) {
      const slug = node.getAttribute("data-rsvp-count");
      const n = await fetchRsvpCount(slug);
      if (n == null || Number.isNaN(n)) continue;
      node.hidden = false;
      node.textContent = countLabel(n);
      node.dataset.countValue = String(n);
    }
  }

  async function bumpRsvpCount(slug, add) {
    const nodes = document.querySelectorAll(`[data-rsvp-count="${CSS.escape(slug)}"]`);
    let next = null;
    nodes.forEach((node) => {
      const cur = Number(node.dataset.countValue || 0);
      const n = cur + (Number(add) || 1);
      node.hidden = false;
      node.textContent = countLabel(n);
      node.dataset.countValue = String(n);
      next = n;
    });
    if (next == null) {
      const n = await fetchRsvpCount(slug);
      return n;
    }
    return next;
  }

  window.ESA_FESTIVE = {
    paradeArtHtml, paradeKitHtml, rsvpParadeHeroHtml, rsvpSuccessArtHtml, rsvpSuccessCamoHtml, whenWhereHtml,
    initStokeMeter, burst, initMusicToggle, unlockParadeMusic, playParadeMusic,
    fetchRsvpCount, paintRsvpCounts, bumpRsvpCount, countLabel, prefersReduced,
    displayNameFromFull, fetchAttendees, renderAttendees, paintAttendees,
  };
})();
