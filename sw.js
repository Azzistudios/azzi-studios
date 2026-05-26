/* =============================================
   Azzi Studios — Service Worker KILL SWITCH
   • Previous versions (azzi-v3..v6) cached assets cache-first,
     which meant returning visitors kept getting stale CSS/JS
     after deploys. This replacement self-unregisters on install
     and tells every open tab to reload — busting every browser
     out of the old cache forever.
   • enhance.js no longer registers a SW, so once this runs the
     site is back to a plain HTTP-cached site.
   ============================================= */

self.addEventListener('install', (event) => {
  // Activate immediately, don't wait for current SW to finish.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1) Delete every cache this origin owns.
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
    // 2) Unregister ourselves so no future fetches hit this worker.
    await self.registration.unregister();
    // 3) Reload every controlled tab so the user immediately gets
    //    fresh CSS/JS instead of whatever was painted from cache.
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => { try { c.navigate(c.url); } catch (e) { /* noop */ } });
  })());
});

// Fall through to the network for any in-flight request — never serve
// from cache (which is being torn down) and never cache anything new.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
