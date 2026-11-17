(function () {
  function showErrors(box, errors) {
    box.hidden = false;
    box.innerHTML = errors.map((e) => `<div>${escapeHtml(e)}</div>`).join("");
  }
  function escapeHtml(str) {
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  function val(form, name) {
    const el = form.elements[name];
    if (!el) return "";
    if (el instanceof RadioNodeList) {
      const checked = Array.from(el).find((n) => n.checked);
      return checked ? checked.value : "";
    }
    return el.value;
  }
  function checkedValues(form, name) {
    return Array.from(form.querySelectorAll(`[name="${name}"]:checked`)).map((el) => el.value);
  }
  function yesNo(v) {
    return v === "yes" || v === "true";
  }
  function cfg() {
    return window.ESA_CONFIG || {};
  }
  async function postSubmission(table, row) {
    const { supabaseUrl, supabaseKey } = cfg();
    if (!supabaseUrl || !supabaseKey || !table) {
      throw new Error("Missing ESA_CONFIG (js/config.js).");
    }
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: "Bearer " + supabaseKey,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      let detail = "";
      try { detail = await res.text(); } catch (_) {}
      const err = new Error("Could not save your submission.");
      err.status = res.status;
      err.detail = detail;
      throw err;
    }
  }

  // JOIN
  const join = document.getElementById("join-form");
  if (join) {
    const volunteerFields = document.getElementById("volunteer-fields");
    const donateFields = document.getElementById("donate-fields");
    const otherField = document.getElementById("volunteer-other-wrap");
    const thanks = document.getElementById("join-thanks");
    const errBox = document.getElementById("join-errors");

    function syncJoinLogic() {
      const volunteer = val(join, "volunteer") === "yes";
      const donate = val(join, "donate") === "yes";
      if (volunteerFields) volunteerFields.hidden = !volunteer;
      if (donateFields) donateFields.hidden = !donate;
      const otherOn = checkedValues(join, "volunteerSkills").includes("Other");
      if (otherField) otherField.hidden = !otherOn;
    }
    join.addEventListener("change", syncJoinLogic);
    syncJoinLogic();

    fetch("/config.json", { cache: "no-store" }).then((r) => r.json()).then((c) => {
      const link = (((c.stripe || {}).donationPaymentLink) || "").trim();
      const btn = document.getElementById("donate-link");
      const ph = document.getElementById("donate-placeholder");
      if (link && btn) {
        btn.href = link;
        btn.hidden = false;
        if (ph) ph.hidden = true;
      }
    }).catch(() => {});

    join.addEventListener("submit", async (e) => {
      e.preventDefault();
      errBox.hidden = true;
      // Honeypot: if filled, pretend success and do not post.
      if (val(join, "company").trim()) {
        join.hidden = true;
        thanks.hidden = false;
        thanks.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const name = val(join, "name").trim();
      const email = val(join, "email").trim();
      const errors = [];
      if (!name) errors.push("We need a name — even a legend uses one.");
      if (!email) errors.push("An email is required so we can send your welcome letter.");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("That email doesn’t look quite right.");
      if (errors.length) { showErrors(errBox, errors); errBox.scrollIntoView({ behavior: "smooth" }); return; }

      const volunteerYes = yesNo(val(join, "volunteer"));
      const donateYes = yesNo(val(join, "donate"));
      const birthday = val(join, "birthday").trim();
      const payload = {
        name,
        email,
        phone: val(join, "phone").trim() || null,
        awesome_fact: val(join, "awesome").trim() || null,
        birthday: birthday || null,
        volunteer: volunteerYes,
        volunteer_areas: volunteerYes ? checkedValues(join, "volunteerSkills") : [],
        volunteer_other: volunteerYes ? (val(join, "volunteerSkillsOther").trim() || null) : null,
        donate: donateYes,
        user_agent: (navigator.userAgent || "").slice(0, 500) || null,
        source: "esa-site",
      };
      try {
        await postSubmission(cfg().joinTable, payload);
        join.hidden = true;
        thanks.hidden = false;
        document.getElementById("thanks-message").textContent =
          "Thank you. Your application will be reviewed and you will get a welcome letter from the ESA crew soon.";
        const donateNext = document.getElementById("thanks-donate");
        if (donateYes && donateNext) donateNext.hidden = false;
        thanks.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        showErrors(errBox, ["The trail went quiet. Please try again in a moment."]);
      }
    });
  }

  // RSVP
  const rsvp = document.getElementById("rsvp-form");
  if (rsvp) {
    const roles = document.getElementById("volunteer-roles");
    const otherWrap = document.getElementById("rsvp-other-wrap");
    const thanks = document.getElementById("rsvp-thanks");
    const errBox = document.getElementById("rsvp-errors");

    function syncRsvp() {
      const att = val(rsvp, "attendance");
      const show = att === "volunteer" || att === "both";
      if (roles) roles.hidden = !show;
      const otherOn = checkedValues(rsvp, "volunteerRoles").includes("Other");
      if (otherWrap) otherWrap.hidden = !otherOn;
    }
    rsvp.addEventListener("change", syncRsvp);
    syncRsvp();

    rsvp.addEventListener("submit", async (e) => {
      e.preventDefault();
      errBox.hidden = true;
      if (val(rsvp, "company").trim()) {
        rsvp.hidden = true;
        thanks.hidden = false;
        thanks.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const name = val(rsvp, "name").trim();
      const email = val(rsvp, "email").trim();
      const errors = [];
      if (!name) errors.push("Name is required.");
      if (!email) errors.push("Email is required.");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("That email doesn’t look quite right.");
      if (errors.length) { showErrors(errBox, errors); return; }

      const attendance = val(rsvp, "attendance") || "attending";
      const wantsVolunteer = attendance === "volunteer" || attendance === "both";
      const partyRaw = val(rsvp, "partySize").trim();
      const partySize = partyRaw ? Number(partyRaw) : 1;
      const payload = {
        event_slug: val(rsvp, "eventSlug") || "general",
        event_name: val(rsvp, "eventName") || null,
        name,
        email,
        phone: val(rsvp, "phone").trim() || null,
        attendance,
        volunteer_roles: wantsVolunteer ? checkedValues(rsvp, "volunteerRoles") : [],
        volunteer_roles_other: wantsVolunteer ? (val(rsvp, "volunteerRolesOther").trim() || null) : null,
        party_size: Number.isFinite(partySize) ? partySize : 1,
        notes: val(rsvp, "notes").trim() || null,
        user_agent: (navigator.userAgent || "").slice(0, 500) || null,
        source: "esa-site",
      };
      try {
        await postSubmission(cfg().rsvpTable, payload);
        rsvp.hidden = true;
        thanks.hidden = false;
        document.getElementById("rsvp-thanks-message").textContent =
          `Got it, ${name}. We'll see you in the wild — or in the group chat.`;
        thanks.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        showErrors(errBox, ["The trail went quiet. Please try again in a moment."]);
      }
    });
  }
})();
