/* =============================================
   Azzi Studios — Shared JS
   ============================================= */

// ── NAV SCROLL BEHAVIOUR ──────────────────────
// (Removed: the old scroll handler painted the nav with a light gray
//  background + backdrop-filter when scrolled past 80px. The backdrop-
//  filter turned the nav into a containing block, which re-anchored the
//  fixed-position nav-center and visibly shifted the title down by 16px.
//  Scroll-aware fade below handles the nav's appearance now.)

// ── MOBILE HAMBURGER ──────────────────────────
(function () {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('menu-open');
    const [s0, s1] = btn.querySelectorAll('span');
    s0.style.transform = open ? 'rotate(45deg) translate(3.5px, 3.5px)'  : '';
    s1.style.transform = open ? 'rotate(-45deg) translate(3.5px, -3.5px)' : '';
  });

  nav.querySelectorAll('.c-nav__links a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('menu-open');
      btn.querySelectorAll('span').forEach(s => s.style.transform = '');
    });
  });
})();

// ── SCROLL REVEAL ────────────────────────────
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => io.observe(el));

  // Trigger any already-visible elements immediately
  setTimeout(() => {
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add('in-view');
    });
  }, 100);
})();

// ── WORK PAGE FILTER ──────────────────────────
(function () {
  const filters = document.querySelectorAll('.filter-btn');
  const cards   = document.querySelectorAll('.project-card');
  if (!filters.length || !cards.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active state
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show / hide cards
      cards.forEach(card => {
        const cat = card.dataset.cat || '';
        const show = filter === 'all' || cat === filter;
        card.classList.toggle('filtered-out', !show);
      });
    });
  });
})();

// ── CLIENT ACCORDION ─────────────────────────
(function () {
  document.querySelectorAll('.client-row__header').forEach(header => {
    header.addEventListener('click', () => {
      const row = header.closest('.client-row');
      const isOpen = row.classList.contains('open');
      document.querySelectorAll('.client-row.open').forEach(r => r.classList.remove('open'));
      if (!isOpen) row.classList.add('open');
    });
  });
})();

// ── SCROLL-AWARE HEADER FADE ──────────────────
// Nav is visible at the top of the page. After scrolling, it
// fades 700ms after the last scroll. Moving the cursor into the
// top ~110px of the viewport (the header band) brings it back
// instantly and pins it while the cursor stays there.
(function () {
  const nav = document.querySelector('.nav, .c-nav');
  if (!nav) return;

  let idleTimer;
  const IDLE_MS       = 700;
  const TOP_THRESHOLD = 4;     // px counted as "at the top"
  const HOVER_ZONE    = 110;   // px from top that counts as hovering the header

  function atTop() {
    return (window.scrollY || window.pageYOffset || 0) <= TOP_THRESHOLD;
  }
  function show() {
    nav.classList.remove('nav--idle');
    clearTimeout(idleTimer);
    if (!atTop()) {
      idleTimer = setTimeout(() => nav.classList.add('nav--idle'), IDLE_MS);
    }
  }
  function showSticky() {
    // Used while the cursor is inside the header zone — no auto-hide.
    nav.classList.remove('nav--idle');
    clearTimeout(idleTimer);
  }

  ['scroll', 'wheel', 'touchmove']
    .forEach(ev => window.addEventListener(ev, show, { passive: true }));

  // Cursor-in-header trigger — instant reveal, no fade while in the zone.
  window.addEventListener('mousemove', e => {
    if (e.clientY <= HOVER_ZONE) showSticky();
    else if (nav.classList.contains('nav--idle')) {
      // Mouse left the zone with nav already hidden — do nothing
    } else if (!atTop()) {
      // Mouse left the zone, nav is visible → re-arm idle timer
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => nav.classList.add('nav--idle'), IDLE_MS);
    }
  }, { passive: true });

  // Start visible at the top.
  nav.classList.remove('nav--idle');
})();

// ── DRAG-SCROLL PROJECT STRIP ─────────────────
(function () {
  const strip = document.getElementById('strip');
  if (!strip) return;

  let isDown = false, startX, scrollLeft;

  strip.addEventListener('mousedown', e => {
    isDown = true;
    strip.style.cursor = 'grabbing';
    startX = e.pageX - strip.offsetLeft;
    scrollLeft = strip.scrollLeft;
  });

  strip.addEventListener('mouseleave', () => { isDown = false; strip.style.cursor = 'grab'; });
  strip.addEventListener('mouseup',    () => { isDown = false; strip.style.cursor = 'grab'; });

  strip.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - strip.offsetLeft;
    strip.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
})();
