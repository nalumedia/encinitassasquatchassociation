# Encinitas Sasquatch Association — local site

A working, offline-friendly website for the Encinitas Sasquatch Association. It matches the layouts and brand in the Paper file **ESA → Website Redesign — Wireframes**, uses real ESA copy and images from the current site, and runs on a Mac (or any computer with Node.js) with one command.

The production site is a static Vercel deployment. Forms post to Supabase (`esa_join_submissions` and `esa_rsvp_submissions` in the Gantis project). `node server.js` still works for local preview; form submissions go to Supabase, not the local `data/` folder.

## Run it

You need [Node.js](https://nodejs.org/) (the built-in version on a modern Mac is fine; no `npm install` is required).

```bash
cd esa-site
node server.js
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

That’s it. There are no packages to install. The server uses only Node’s built-in `http` module.

To use a different port:

```bash
PORT=4000 node server.js
```

## Pages

- `/` — Home (hero, next upcoming event, timeline teaser, Duck Foot, join CTA)
- `/events` — Interactive event history timeline, with type filters
- `/events/holiday-parade-2026` — An individual event page (one for each of the 15 events, all generated from `events.json`)
- `/upcoming` — Upcoming events, computed from dates
- `/join` — Native membership form (same fields as the old Typeform)
- `/rsvp` and `/rsvp/holiday-parade-2026` — Event RSVP / volunteer form
- `/shop` — ESA Beach Cleanup Hat, $18, Stripe Payment Link
- `/about` — Mission, beliefs, founders, Duck Foot, FAQ
- `/grow` — Lima bean growing guide (a hidden-ish easter-egg page, also linked from About and the footer)

## Edit events

All events live in one file at the project root:

```
events.json
```

Each event has a `slug`, `name`, `type`, `date` (`YYYY-MM-DD`), optional `time` / `endTime` (`HH:MM`, 24-hour), `location`, `theme`, `summary`, `body`, `highlights`, `heroImage`, `images`, `partners`, `notes`, and `sources`.

**Upcoming vs. past** is computed automatically from the date (and time, if present) in `America/Los_Angeles`. You do not set a status field. When December 5, 2026, 5:30 PM Pacific has passed, the 10th Holiday Parade will move itself from Upcoming into history. Refresh the page.

After you edit `events.json`, save the file and refresh the browser. No rebuild step.

Image paths are relative to the site root, for example:

```json
"heroImage": "assets/images/web/parade-2024-poster.jpg"
```

Put new photos in `public/assets/images/web/` and point the event at them.

## Forms and submissions

There is no Typeform. Both forms post to the local server and are saved on disk:

| Form | URL | Files |
|------|-----|-------|
| Join / membership | `POST /api/join` | `data/submissions/join.csv` and `data/submissions/join.json` |
| RSVP / volunteer | `POST /api/rsvp` | `data/submissions/rsvp.csv` and `data/submissions/rsvp.json` |

The Join form captures the same data as the public Typeform (`AvdNvE4f`), in the same order: name, email, phone, something awesome, birthday, volunteer yes/no, volunteer skills (only if yes), donate yes/no, optional $40 donation. **Name and email are required** (they were not marked required on Typeform, but a welcome letter needs both). Volunteer skills and the donation block follow the same yes/no branching as the original form.

### $40 donation

The Typeform collected $40 in-form through Stripe, with a note that charges would appear from Nalu Media. A standalone Stripe Payment Link for that donation was **not** published on the current website or in the public Typeform definition, so the donate step is clearly marked as a **placeholder**.

To turn it into a real button, paste a Stripe Payment Link into `config.json`:

```json
"stripe": {
  "donationPaymentLink": "https://buy.stripe.com/your-link-here"
}
```

The **hat** already uses the real Payment Link from the current site: `https://buy.stripe.com/eVaeYf2LRf7532E7sw` ($18). This local site never handles card numbers itself.

## Optional Airtable sync (off by default)

Submissions are stored locally only. There is a documented hook in `server.js` named `maybeSyncToAirtable()`. To use it later:

1. Create Airtable tables for applications and RSVPs (or reuse existing ones).
2. Put the base id and table names in `config.json` under `airtableSync`.
3. Set `"enabled": true`.
4. Start the server with `AIRTABLE_API_KEY` in your environment — **never** put the key in `config.json` or any other file in this folder.

The HTTP call itself is still a stub so we don’t accidentally send data anywhere. Local CSV/JSON saving always happens first.

## Brand and fonts

Colors and type follow the Paper brand system: paper, sea, and sun, with American Typewriter for headlines and Libre Franklin for body copy, plus the shaka badge.

- **American Typewriter** ships with macOS, so headlines should look right on a Mac.
- **Libre Franklin**, **Courier Prime**, and **Special Elite** (a fallback if American Typewriter isn’t installed) are bundled in `public/assets/fonts/` so the site works offline.

## Easter eggs

- A faint “track in the sand” in the footer, or three quick clicks on the logo, reveals a Bigfoot sighting.
- `/grow` is the lima bean field guide from the current site.

## Project layout

```
esa-site/
  server.js              # the only process you start
  events.json            # the 15-event timeline
  config.json            # Stripe links, contact, Airtable hook (no secrets)
  README.md
  data/submissions/      # join.csv, rsvp.csv, join.json, rsvp.json
  public/
    index.html, events.html, event.html, upcoming.html,
    join.html, rsvp.html, shop.html, about.html, grow.html, 404.html
    css/styles.css
    js/events.js, main.js, forms.js
    assets/              # logo, fonts, images
```

## Notes on the content

- Dates for the 15 events follow the email review, not the stale “upcoming 2024 parade” still on the live site.
- The 2021 Holiday Parade is listed as Saturday, December 4, 2021, 5:30 PM, with a note that Airtable Stories listed December 5 and email review did not settle it.
- Airtable thumbnail URLs in the November 2026 dump had expired (HTTP 410), so event photos come from images saved off the current Softr site, plus the shaka badge exported from Paper. Events without a year-specific photo use typographic cards or clearly captioned gallery shots whose exact year was not labeled on the source image.

## Deploy (Vercel)

The GitHub repo is [nalumedia/encinitassasquatchassociation](https://github.com/nalumedia/encinitassasquatchassociation).

In the Vercel project:

- Framework preset: **Other**
- Build command: `node scripts/build-static.js`
- Output directory: `dist`
- No install command is required (zero npm dependencies)

The build copies `public/` into `dist/`, adds `events.json` and `config.json`, and writes a static page at `events/<slug>/index.html` (and `rsvp/<slug>/`) for every event so `/events/holiday-parade-2025` works without a server. `vercel.json` sets `cleanUrls`, fallback rewrites, long cache for images, and `no-cache` for HTML and JSON.

The publishable Supabase key lives in `public/js/config.js`. It can only insert into the ESA form tables (RLS). Never put a service or secret key there.

The $40 donation checkout is still a placeholder until a Stripe Payment Link is added in `config.json` as `stripe.donationPaymentLink`.
