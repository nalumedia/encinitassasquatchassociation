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
  function initMusicToggle(mount) {
    if (!mount) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "music-toggle";
    btn.hidden = true;
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `<span class="music-eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="music-label">Play parade jam</span>`;
    const audio = new Audio("/audio/parade.mp3");
    audio.loop = true;
    audio.preload = "auto";
    let ready = false;
    const show = () => { if (!ready) { ready = true; btn.hidden = false; } };
    audio.addEventListener("canplaythrough", show);
    audio.addEventListener("canplay", show);
    audio.addEventListener("error", () => { btn.hidden = true; });
    // Probe without relying only on canplay (some browsers are quiet on 404 until play).
    fetch("/audio/parade.mp3", { method: "HEAD" }).then((r) => {
      if (r.ok) show();
    }).catch(() => {});
    btn.addEventListener("click", async () => {
      try {
        if (audio.paused) {
          await audio.play();
          btn.setAttribute("aria-pressed", "true");
          btn.querySelector(".music-label").textContent = "Mute parade jam";
        } else {
          audio.pause();
          btn.setAttribute("aria-pressed", "false");
          btn.querySelector(".music-label").textContent = "Play parade jam";
        }
      } catch (_) { /* autoplay blocked or missing file */ }
    });
    mount.appendChild(btn);
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
    paradeArtHtml, paradeKitHtml, initStokeMeter, burst, initMusicToggle,
    fetchRsvpCount, paintRsvpCounts, bumpRsvpCount, countLabel, prefersReduced,
  };
})();
