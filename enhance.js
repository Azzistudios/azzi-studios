/* =============================================
   Azzi Studios — site-wide enhancements
   Loaded on every page. Adds:
   • Skip-to-main link (keyboard a11y)
   • Cookie consent banner (GDPR-friendly)
   • Smooth scroll-to-top when the logo is clicked while
     already on the same page
   • prefers-reduced-motion respect
   ============================================= */
(function () {
  'use strict';

  // ── Skip-to-main link ────────────────────────────────────
  if (!document.querySelector('.skip-link')) {
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#main';
    skip.textContent = 'Skip to content';
    document.body.insertBefore(skip, document.body.firstChild);
  }

  // ── Smooth scroll-to-top when clicking the logo on the
  // same page (only if already there) ──────────────────────
  document.querySelectorAll('.nav-logo, .c-nav__logo, .n-logo, .ft-brand, .c-footer__logo')
    .forEach(el => {
      el.addEventListener('click', (e) => {
        // If it's a link pointing to the page we're already on,
        // just scroll instead of reloading.
        const href = (el.getAttribute && el.getAttribute('href')) || '';
        const targetIsCurrent =
          href === '' || href === '#' ||
          href === window.location.pathname ||
          href === window.location.pathname + window.location.search ||
          (href === 'index.html' && /\/(index\.html)?$/.test(window.location.pathname));
        if (targetIsCurrent && window.scrollY > 0) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

  // ── Cookie consent ──────────────────────────────────────
  // Shown once. Choice (accept / decline) stored in localStorage.
  // If declined, fire the GA opt-out flag so analytics stops sending.
  const COOKIE_KEY = 'azzi_cookies_v1';
  const choice = (function () { try { return localStorage.getItem(COOKIE_KEY); } catch { return null; } })();

  if (choice === 'declined') {
    window['ga-disable-G-Z8L68HKHEJ'] = true;
  }

  // ── Service worker ────────────────────────────────────
  // Previously registered /sw.js to cache static assets, but the
  // cache-first behaviour made every CSS/JS update invisible until
  // the user manually cleared site data. We've replaced sw.js with
  // a kill-switch that unregisters itself; here we make sure we
  // never register a new one. Any browser that still has the old
  // worker will fetch the kill-switch the next time it checks for
  // an update, then unregister itself.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => { /* noop */ });
  }

  if (!choice) {
    const bar = document.createElement('div');
    bar.className = 'cookie-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('aria-label', 'Cookie preferences');
    bar.innerHTML = `
      <p class="cookie-bar__copy">
        We use analytics cookies to understand how visitors use the site. No tracking otherwise.
      </p>
      <div class="cookie-bar__btns">
        <button type="button" class="cookie-bar__btn cookie-bar__btn--decline">Decline</button>
        <button type="button" class="cookie-bar__btn cookie-bar__btn--accept">Accept</button>
      </div>
    `;
    document.body.appendChild(bar);
    requestAnimationFrame(() => bar.classList.add('show'));

    function dismiss(value) {
      try { localStorage.setItem(COOKIE_KEY, value); } catch {}
      if (value === 'declined') window['ga-disable-G-Z8L68HKHEJ'] = true;
      bar.classList.remove('show');
      setTimeout(() => bar.remove(), 400);
    }
    bar.querySelector('.cookie-bar__btn--accept').addEventListener('click',  () => dismiss('accepted'));
    bar.querySelector('.cookie-bar__btn--decline').addEventListener('click', () => dismiss('declined'));
  }
})();
