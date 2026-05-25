# Azzi Studios — Website

Creative studio portfolio site. Single-page work mosaic with full
project detail pages, dynamic info panels, About / Services / Contact
overlays, and a scroll-aware navigation.

## Local development

```bash
python3 serve.py        # serves the root at http://localhost:3000
```

## Pages

- **`index.html`** — 3D mosaic loader → work gallery (flow + list views)
- **`project.html?id=<slug>`** — single project page (pictures + videos, info panel)
- **`about.html`**, **`services.html`**, **`contact.html`** — also reachable as drop-down overlays from the work and project pages

## Image hosting

- **Project pages** load all stills from ImgBB (URLs hard-coded in `project.html`'s `PROJECTS` block).
- **Index / 3D mosaic** uses local files in `images/` plus thumbnails in `thumbs/`.
- **Project videos** are served from Cloudinary (already embedded in `PROJECTS`).

## Tech

- Vanilla HTML / CSS / JavaScript — no build step
- Cloudinary embeds for project videos
- Single Python `serve.py` for local dev
