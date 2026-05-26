/* =============================================
   Azzi Studios — Service Worker
   • Precaches the HTML shell + small static assets.
   • Network-first for HTML so updates always land.
   • Cache-first for images / fonts / CSS / JS so repeat
     visits paint instantly without hitting the network.
   • Skips ImgBB & Cloudinary (they have their own CDN
     caching, and we don't want to fill SW storage).
   ============================================= */
const VERSION   = 'azzi-v5';
const STATIC    = `${VERSION}-static`;
const RUNTIME   = `${VERSION}-runtime`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/contact.html',
  '/404.html',
  '/style.css',
  '/main.js',
  '/enhance.css',
  '/enhance.js',
  '/brand_assets/logo-monogram.png',
  '/brand_assets/logo-circle-monogram.png',
  '/brand_assets/logo-circle-full.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => null)
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => !n.startsWith(VERSION))
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip cross-origin (ImgBB, Cloudinary, Google Fonts, GA)
  if (url.origin !== self.location.origin) return;

  // HTML — network-first so updates ship immediately
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match('/404.html'))
        )
    );
    return;
  }

  // Everything else — cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (!res.ok || res.type === 'opaque') return res;
        const copy = res.clone();
        caches.open(RUNTIME).then((c) => c.put(req, copy));
        return res;
      });
    })
  );
});
