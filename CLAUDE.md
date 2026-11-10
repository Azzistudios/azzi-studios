# CLAUDE.md — azzistudios.com

The live site of Azzi Studios. Static HTML, CSS and JavaScript, no build step.
Business rules and the visual identity live in `~/My Drive/CLAUDE.md`; this file
covers only how the site is put together. Rewritten 10 Nov 2026: the earlier
version was a generic template (Tailwind, serif pairing, placeholder images) that
contradicted the identity. None of it applies.

## The rules that bite

- **Space Mono only.** No second typeface, no Tailwind, no placeholder images.
  Ink #111 on white. Shapes are geometry. No rounded pills.
- **Azzi has no studio of its own.** Never write "our studio", "in-studio" or
  "under one roof".
- **Window display, visual merchandising and events are Atelier Sans Titre's.**
  They stay off this site. Four services only: Campaign Production, Visual
  Content, Visual Identity, Social Media Management.
- **Testimonials are Google reviews only**, quoted verbatim (a marked cut is
  fine), with the reviewer's name.
- **A client number is published only with that client's consent.**
- **Pushing to `main` publishes.** Vercel deploys it within a minute or two, and
  a GitHub Action pings IndexNow for changed pages. Ask Marc before every push.

## Pages

- `index.html` — loader, then the 3D mosaic (`#room`), then the work page
  (`#landing`, `#gallery`). The About, Services and Contact panels are overlays
  on this page (`index.html?panel=contact`).
- `project-<id>.html` — one static page per project. `project.html` is the bare
  template: noindex, kept for old `?id=` links.
- `services.html` and the four service pages, `campaign-production-gcc.html`,
  `restaurant-hospitality-branding.html`, `about.html`, `contact.html`,
  `faq.html`, `privacy.html`, `terms.html`.
- `vm-window-display.html` — noindex pointer to Atelier Sans Titre.
- `enhance.js` and `enhance.css` load on every page: skip link, cookie consent,
  analytics events, the enquiry form. Bump their `?v=` on every page when either
  changes (they are cached for 30 days).

## Adding or removing a project

A project lives in several places. Miss one and a link breaks.

1. `project-<id>.html` — copy a recent one. Change the title, descriptions,
   canonical, Open Graph tags, JSON-LD, the hidden H1, `window.__PROJECT_ID__`
   and the three case-study paragraphs.
2. The `PROJECTS` object inside every `project*.html` (each page carries its own
   copy; newer entries exist only in newer pages).
3. `index.html`: a tile in `#gallery` and a row in `.gal-list-mode`, entries in
   `IMGS` (the mosaic and work-page pool) and the folder in `PROJECT_PAGE`.
   The tile's cover decides which folder of `IMGS` the work page draws from.
4. `about.html`: the same tile and list row.
5. `sitemap.xml`, `llms.txt`, and for a removal a redirect in `vercel.json`.

## Images

| Folder | What | Used by |
|---|---|---|
| `images/<Project>/` | originals, 2000px | hero slides, loop videos |
| `thumbs/`, `thumbs-lg/`, `thumbs-xl/` | JPG at 440, 880, 1600px | work page, list preview |
| `mz/s`, `mz/m`, `mz/l` | WebP at 300, 440, 880px | the mosaic only |
| `images-hd/` | WebP, about 1400px | project pages |
| `brand_assets/og/` | 1200x630 share images | Open Graph, sitemap |

A picture in `IMGS` needs a file in every `thumbs*` and `mz/*` folder at the same
relative path. Convert to sRGB and embed the profile. Turn images upright from
their orientation tag before resizing. Finished, edited images only.

## The mosaic

- Hover swaps a cell's picture. A click on a picture opens its project
  (`PROJECT_PAGE`); a click on white, the VIEW WORK button, a scroll, a swipe up
  or Enter opens the work page.
- `#room-persp` and `#room-scene` carry `pointer-events:none` on purpose: they
  sit at z=0 and otherwise swallow the pointer for every cell behind them.
- Phones (600px and under) use the `mz/s` size, load on-screen cells first and
  skip cells out of reach.
- The work page's pictures are parked on `data-src` while the room is in front
  and hydrate on entry or 3.5 s after the reveal. This took the phone largest
  paint from 11.0 s to 4.2 s (PageSpeed, 10 Nov 2026). Do not preload them.

## The enquiry form

`enhance.js` renders it into any `<div data-enquiry>` and posts to the HubSpot
form "Website enquiry (azzistudios.com)" (portal 148861106, EU data centre). The
form holds first name, last name, email and message, so brand, service, visit
source and page travel inside the message. It creates a contact, not a deal.
`vercel.json` allows `api-eu1.hsforms.com` in the Content-Security-Policy.

## Previewing

`python3 serve.py` serves the folder at `http://localhost:3000`. Never open a
`file://` URL: paths are root-relative. A hidden or background browser tab
throttles animation frames, so the loader and the mosaic reveal can look stuck
there; check the DOM, or bring the tab to the front.

## Local-only files

`images/` holds large originals that are deliberately not committed (see
`.gitignore`). Leave them where they are.
