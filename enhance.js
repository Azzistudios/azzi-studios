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

  // ── Enquiry form ────────────────────────────────────────
  // Rendered into every [data-enquiry] placeholder. Submits straight
  // to the HubSpot form "Website enquiry (azzistudios.com)" over its
  // public submissions endpoint (EU data centre) — no HubSpot script,
  // no cookie. The form holds first name, last name, email and
  // message, so brand, service and source travel inside the message.
  const HS_SUBMIT = 'https://api-eu1.hsforms.com/submissions/v3/integration/submit/148861106/8d54a353-630d-42a3-9d82-c463a2572162';

  // Where the visit came from — noted once per tab, on the first page.
  const visitSource = (function () {
    try {
      let s = sessionStorage.getItem('azzi_src');
      if (!s) {
        const p = new URLSearchParams(location.search);
        const utm = ['utm_source', 'utm_medium', 'utm_campaign'].map(k => p.get(k)).filter(Boolean).join(' / ');
        let ref = '';
        try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
        if (ref === location.hostname) ref = '';
        s = utm || ref || 'direct';
        sessionStorage.setItem('azzi_src', s);
      }
      return s;
    } catch (e) { return 'unknown'; }
  })();

  document.querySelectorAll('[data-enquiry]').forEach((slot, n) => {
    const id = 'enq' + n;
    slot.innerHTML = `
      <form class="enq" novalidate>
        <label class="enq__f" for="${id}-name"><span>Name</span>
          <input id="${id}-name" name="name" type="text" autocomplete="name" required></label>
        <label class="enq__f" for="${id}-email"><span>Email</span>
          <input id="${id}-email" name="email" type="email" autocomplete="email" required></label>
        <label class="enq__f" for="${id}-brand"><span>Brand</span>
          <input id="${id}-brand" name="brand" type="text" autocomplete="organization"></label>
        <label class="enq__f" for="${id}-service"><span>Service</span>
          <select id="${id}-service" name="service">
            <option value="">Not sure yet</option>
            <option>Campaign Production</option>
            <option>Visual Content</option>
            <option>Visual Identity</option>
            <option>Social Media Management</option>
          </select></label>
        <label class="enq__f" for="${id}-msg"><span>What are you working on?</span>
          <textarea id="${id}-msg" name="message" rows="4" required></textarea></label>
        <label class="enq__hp" aria-hidden="true">Website <input name="website" type="text" tabindex="-1" autocomplete="off"></label>
        <button type="submit" class="enq__send">Send</button>
        <p class="enq__note" role="status" aria-live="polite">We reply within one working day. Your details go to our CRM (HubSpot) so we can answer. <a href="/privacy">Privacy</a></p>
      </form>`;
    const form = slot.querySelector('form');
    const note = form.querySelector('.enq__note');
    const send = form.querySelector('.enq__send');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = k => (form.elements[k].value || '').trim();
      if (v('website')) return;                       // honeypot: bots fill it
      const bad = ['name', 'email', 'message'].find(k =>
        !v(k) || (k === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v(k))));
      form.querySelectorAll('.enq__f').forEach(l => l.classList.remove('is-bad'));
      if (bad) {
        form.elements[bad].closest('.enq__f').classList.add('is-bad');
        form.elements[bad].focus();
        note.textContent = bad === 'email' ? 'That email does not look right.' : 'Name, email and a line about the project, please.';
        return;
      }
      const parts = v('name').split(/\s+/);
      const message = [
        'Brand: ' + (v('brand') || 'not given'),
        'Service: ' + (v('service') || 'not sure yet'),
        'Source: ' + visitSource,
        'Page: ' + location.pathname,
        '',
        v('message'),
      ].join('\n');
      const field = (name, value) => ({ objectTypeId: '0-1', name, value });
      send.disabled = true; send.textContent = 'Sending';
      fetch(HS_SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: [
            field('firstname', parts[0]),
            field('lastname', parts.slice(1).join(' ')),
            field('email', v('email')),
            field('message', message),
          ],
          context: { pageUri: location.href, pageName: document.title },
        }),
      }).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        form.innerHTML = '<p class="enq__done" role="status">Received. We reply within one working day.</p>';
        track('contact', { channel: 'form' });
        track('generate_lead', { channel: 'form' });
        if (window.fbq) window.fbq('track', 'Contact');
      }).catch(() => {
        send.disabled = false; send.textContent = 'Send';
        note.innerHTML = 'It did not send. Write to <a href="mailto:hello@azzistudios.com">hello@azzistudios.com</a> and we will pick it up there.';
      });
    });
  });

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
