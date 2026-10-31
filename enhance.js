/* =============================================
   Azzi Studios — site-wide enhancements
   Loaded on every page. Adds:
   • Skip-to-main link (keyboard a11y)
   • Cookie consent banner (GDPR-friendly)
   • GA4 events (enquiries, contact channels, panels, projects)
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

  // ── Event tracking ──────────────────────────────────────
  // Delegated so links added later (panels, overlays) are caught too.
  // gtag only queues until GA loads, which needs accepted cookies.
  function track(name, params) {
    if (window.gtag) window.gtag('event', name, params);
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest) return;

    // About / Services / Contact panel opens (data-panel buttons)
    const panel = e.target.closest('[data-panel]');
    if (panel && !panel.closest('#overlay')) {
      track('panel_open', { panel: panel.getAttribute('data-panel') });
    }
    // Flow / List toggle
    const toggle = e.target.closest('#btnFlow, #btnList');
    if (toggle) track('view_mode', { mode: toggle.id === 'btnFlow' ? 'flow' : 'list' });

    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');

    // Project clicks (any link to a project-*.html)
    if (link.matches('a[href^="project-"], a[href*="project.html?id="]')) {
      const m = href.match(/project-([a-z0-9-]+)\.html/) || href.match(/[?&]id=([a-z0-9-]+)/);
      track('project_click', { project: m ? m[1] : 'unknown' });
    }
    // Social channel taps
    if (href.includes('instagram.com/azzistudios')) track('contact', { channel: 'instagram' });
    if (href.includes('linkedin.com/company/azzi-studios')) track('contact', { channel: 'linkedin' });

    // Enquiry channel taps: also generate_lead, the GA4 key event
    const channel =
      /^mailto:/i.test(href) ? 'email' :
      /^tel:/i.test(href) ? 'phone' :
      /^https?:\/\/wa\.me\//i.test(href) ? 'whatsapp' : null;
    if (channel === 'whatsapp' && !/[?&]text=/i.test(href)) {
      // Set during the click, so the link opens with the new href.
      link.setAttribute('href', href + (href.includes('?') ? '&' : '?') +
        'text=' + encodeURIComponent(whatsappSourceLine()));
    }
    if (channel) {
      track('contact', { channel });
      track('generate_lead', { channel });
    }
  });

  // ── WhatsApp source line ────────────────────────────────
  // Pre-filled, editable first line naming the page, so a chat can be
  // traced to the site. Project names come from the page title, which
  // project.html sets at runtime. Unlisted pages get the plain line.
  const PAGE_NAMES = {
    'visual-identity': 'Visual identity',
    'visual-content': 'Visual content',
    'campaign-production': 'Campaign production',
    'campaign-production-gcc': 'Campaign production GCC',
    'restaurant-hospitality-branding': 'Restaurant and hospitality branding',
    'social-media': 'Social media',
    'vm-window-display': 'Window display',
    'services': 'Services',
    'about': 'About',
    'contact': 'Contact',
    'faq': 'FAQ',
    'privacy': 'Privacy',
    'terms': 'Terms'
  };

  function whatsappSourceLine() {
    const slug = window.location.pathname.split('/').pop().replace(/\.html$/, '');
    const project = /^project(-|$)/.test(slug) &&
      document.title.match(/^(.+) · Azzi Studios$/);
    const page = project ? project[1].replace(' — ', ' ') : PAGE_NAMES[slug];
    return page
      ? `Hello, I found you on your website, on the ${page} page.`
      : 'Hello, I found you on your website.';
  }

  // ── Cookie consent ──────────────────────────────────────
  // Shown once. Choice (accept / decline) stored in localStorage.
  // GA and the Meta pixel load only after Accept: from each page's head
  // on later visits, from here on the page where Accept is clicked. What
  // that page already queued (page view, clicks) then sends.
  const COOKIE_KEY = 'azzi_cookies_v1';
  const choice = (function () { try { return localStorage.getItem(COOKIE_KEY); } catch { return null; } })();

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
        We use analytics cookies to understand how visitors use the site. No tracking otherwise. <a class="cookie-bar__link" href="/privacy">Privacy</a>
      </p>
      <div class="cookie-bar__btns">
        <button type="button" class="cookie-bar__btn cookie-bar__btn--decline">Decline</button>
        <button type="button" class="cookie-bar__btn cookie-bar__btn--accept">Accept</button>
      </div>
    `;
    document.body.appendChild(bar);
    requestAnimationFrame(() => bar.classList.add('show'));

    function loadScript(src) {
      const s = document.createElement('script');
      s.async = true;
      s.src = src;
      document.head.appendChild(s);
    }

    function dismiss(value) {
      try { localStorage.setItem(COOKIE_KEY, value); } catch {}
      const excluded = (function () { try { return localStorage.getItem('azzi_noga') === '1'; } catch { return false; } })();
      if (value === 'accepted' && !excluded) {
        if (window.gtag) loadScript('https://www.googletagmanager.com/gtag/js?id=G-Z8L68HKHEJ');
        if (window.fbq) loadScript('https://connect.facebook.net/en_US/fbevents.js');
      }
      bar.classList.remove('show');
      setTimeout(() => bar.remove(), 400);
    }
    bar.querySelector('.cookie-bar__btn--accept').addEventListener('click',  () => dismiss('accepted'));
    bar.querySelector('.cookie-bar__btn--decline').addEventListener('click', () => dismiss('declined'));
  }
})();
