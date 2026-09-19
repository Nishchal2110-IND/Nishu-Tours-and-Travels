/* ============================================================
   NISHU TOURS & TRAVELS — MAIN SCRIPT
   ============================================================ */

'use strict';

// ============================================================
// UTILS
// ============================================================

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const lerp  = (a, b, t)   => a + (b - a) * t;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================
// 1. SCROLL PROGRESS BAR
// ============================================================

const scrollBar = $('#scrollBar');

function updateScrollBar() {
  if (!scrollBar) return;
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  scrollBar.style.width = clamp(pct * 100, 0, 100) + '%';
}

// ============================================================
// 2. NAVBAR
// ============================================================

const navbar = $('#navbar');

function handleNavbar() {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}

// Active link highlight
const navLinkEls = $$('.nl');
const sections   = $$('section[id]');

function updateActiveLink() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 130) current = sec.id;
  });
  navLinkEls.forEach(l => {
    l.classList.toggle('active', l.dataset.sec === current);
  });
}

// ============================================================
// 3. MOBILE MENU
// ============================================================

const burger  = $('#burger');
const mobMenu = $('#mobMenu');
const mobClose= $('#mobClose');

function openMob() {
  mobMenu.classList.add('open');
  mobMenu.setAttribute('aria-hidden','false');
  burger.classList.add('open');
  burger.setAttribute('aria-expanded','true');
  document.body.style.overflow = 'hidden';
}

function closeMob() {
  mobMenu.classList.remove('open');
  mobMenu.setAttribute('aria-hidden','true');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded','false');
  document.body.style.overflow = '';
}

if (burger)  burger.addEventListener('click', openMob);
if (mobClose) mobClose.addEventListener('click', closeMob);
$$('.mob-link').forEach(l => l.addEventListener('click', closeMob));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMob(); closeLightbox(); } });

// ============================================================
// 4. CUSTOM CURSOR
// ============================================================

const cglow = $('#cursorGlow');
const cdot  = $('#cursorDot');
let mx = 0, my = 0, fx = 0, fy = 0;

if (!reduced && window.innerWidth > 768 && cglow) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cdot.style.left = mx + 'px';
    cdot.style.top  = my + 'px';
  });

  (function animCursor() {
    fx = lerp(fx, mx, 0.1);
    fy = lerp(fy, my, 0.1);
    cglow.style.left = fx + 'px';
    cglow.style.top  = fy + 'px';
    requestAnimationFrame(animCursor);
  })();

  $$('a, button, .tilt-card, .dest-card, .gal-item, .pkg-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('ca'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('ca'));
  });
}

// ============================================================
// 5. REVEAL ON SCROLL (Intersection Observer)
// ============================================================

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = parseInt(el.dataset.d || '0');
    setTimeout(() => el.classList.add('on'), delay);
    revealObs.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

$$('.ri').forEach(el => revealObs.observe(el));

// ============================================================
// 6. ANIMATED COUNTERS
// ============================================================

const statEls = $$('.hstat-num');
let counted = false;

function runCounters() {
  if (counted) return;
  counted = true;
  statEls.forEach(el => {
    const target  = parseFloat(el.dataset.target);
    const suffix  = el.dataset.suffix || '';
    const isFloat = target % 1 !== 0;
    const dur     = 2000;
    const step    = 16;
    const steps   = dur / step;
    const inc     = target / steps;
    let cur = 0;

    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) { cur = target; clearInterval(t); }
      el.textContent = (isFloat ? cur.toFixed(1) : Math.floor(cur).toLocaleString()) + suffix;
    }, step);
  });
}

// Observe hero stats
const heroStatsEl = $('#heroStats');
if (heroStatsEl) {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { runCounters(); }
  }, { threshold: 0.4 }).observe(heroStatsEl);
}

// ============================================================
// 7. 3D TILT ON CARDS
// ============================================================

$$('.tilt-card').forEach(card => {
  if (reduced) return;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const rx = clamp(-(e.clientY - cy) / (r.height / 2) * 9, -9, 9);
    const ry = clamp( (e.clientX - cx) / (r.width  / 2) * 9, -9, 9);
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
  });
});

// ============================================================
// 8. SPOTLIGHT (Why section)
// ============================================================

$$('.spotlight-zone').forEach(zone => {
  zone.addEventListener('mousemove', e => {
    const r = zone.getBoundingClientRect();
    zone.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    zone.style.setProperty('--my', (e.clientY - r.top)  + 'px');
  });
});

// ============================================================
// 9. HERO PARALLAX
// ============================================================

const heroLayers = $$('.hbg');

function heroParallax() {
  if (reduced) return;
  const sy = window.scrollY;
  heroLayers.forEach((l, i) => {
    l.style.transform = `translateY(${sy * (i + 1) * 0.1}px)`;
  });
}

// ============================================================
// 10. FLOATING PETALS
// ============================================================

const petalWrap = $('#petalWrap');
const PETALS = ['🌸','🍃','✈️','🌿','⭐','🌺','🦋'];

if (petalWrap && !reduced) {
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.textContent = PETALS[i % PETALS.length];
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${Math.random() * 14 + 12}px;
      animation-duration: ${Math.random() * 12 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    petalWrap.appendChild(p);
  }
}

// ============================================================
// 11. PARTICLES CANVAS
// ============================================================

const canvas = $('#particlesCanvas');

if (canvas && !reduced) {
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const COLS = ['rgba(212,175,55,', 'rgba(240,204,85,', 'rgba(56,189,248,', 'rgba(255,255,255,'];
  const pts  = [];

  for (let i = 0; i < 50; i++) {
    pts.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.6 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      c: COLS[Math.floor(Math.random() * COLS.length)],
      a: Math.random() * 0.45 + 0.1,
      ph: Math.random() * Math.PI * 2,
      ps: Math.random() * 0.018 + 0.006,
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lines
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(212,175,55,${(1 - d / 110) * 0.07})`;
          ctx.lineWidth = .5;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    // Dots
    pts.forEach(p => {
      p.ph += p.ps;
      const a = p.a * (.65 + .35 * Math.sin(p.ph));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c + a + ')';
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });

    requestAnimationFrame(drawParticles);
  }

  drawParticles();
} else if (canvas) {
  canvas.style.display = 'none';
}

// ============================================================
// 12. MAGNETIC BUTTONS
// ============================================================

$$('.mag-btn').forEach(btn => {
  if (reduced || window.innerWidth <= 768) return;

  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    btn.style.transform = `translate(${(e.clientX - cx) * .3}px, ${(e.clientY - cy) * .3}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0,0)';
    btn.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
    setTimeout(() => btn.style.transition = '', 400);
  });
});

// ============================================================
// 13. GALLERY LIGHTBOX
// ============================================================

const galItems = $$('.gal-item');
const lightbox = $('#lightbox');
const lbImg    = $('#lbImg');
const lbCap    = $('#lbCap');
const lbBg     = $('#lbBg');
const lbClose  = $('#lbClose');
const lbPrev   = $('#lbPrev');
const lbNext   = $('#lbNext');

let lbImgs = [];
let lbIdx  = 0;

galItems.forEach((item, i) => {
  const img = item.querySelector('img');
  if (!img) return;
  lbImgs.push({ src: img.src, alt: img.alt });
  item.addEventListener('click', () => openLightbox(i));
});

function openLightbox(i) {
  if (!lightbox) return;
  lbIdx = i;
  setLbImg(i);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

function setLbImg(i) {
  const d = lbImgs[i];
  if (!d) return;
  lbImg.src = d.src;
  lbImg.alt = d.alt;
  lbCap.textContent = 'Stock image from Unsplash — portfolio demonstration only.';
}

if (lbClose) lbClose.addEventListener('click', closeLightbox);
if (lbBg)    lbBg.addEventListener('click',    closeLightbox);
if (lbPrev)  lbPrev.addEventListener('click',  e => { e.stopPropagation(); lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length; setLbImg(lbIdx); });
if (lbNext)  lbNext.addEventListener('click',  e => { e.stopPropagation(); lbIdx = (lbIdx + 1) % lbImgs.length;                  setLbImg(lbIdx); });

document.addEventListener('keydown', e => {
  if (!lightbox?.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  { lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length; setLbImg(lbIdx); }
  if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbImgs.length;                  setLbImg(lbIdx); }
});

// ============================================================
// 14. TESTIMONIAL SLIDER
// ============================================================

const track  = $('#testiTrack');
const dotsWrap = $('#tcDots');
const prevBtn  = $('#tPrev');
const nextBtn  = $('#tNext');

let tCurrent = 0;
let tPerView = window.innerWidth <= 640 ? 1 : window.innerWidth <= 900 ? 2 : 3;
const tCards = $$('.testi-card');
const tTotal = tCards.length;
const tMax   = Math.max(0, tTotal - tPerView);

// Build dots
if (dotsWrap) {
  for (let i = 0; i <= tMax; i++) {
    const d = document.createElement('div');
    d.className = 'tc-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTesti(i));
    dotsWrap.appendChild(d);
  }
}

function goTesti(i) {
  tCurrent = clamp(i, 0, tMax);
  if (!track) return;
  const cardW = tCards[0]?.offsetWidth || 0;
  const gap   = 32;
  track.style.transform = `translateX(-${tCurrent * (cardW + gap)}px)`;
  $$('.tc-dot').forEach((d, idx) => d.classList.toggle('active', idx === tCurrent));
}

if (prevBtn) prevBtn.addEventListener('click', () => goTesti(tCurrent - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goTesti(tCurrent + 1));

// Auto-advance
let tAutoInterval = setInterval(() => goTesti((tCurrent + 1) > tMax ? 0 : tCurrent + 1), 5000);
track?.addEventListener('mouseenter', () => clearInterval(tAutoInterval));
track?.addEventListener('mouseleave', () => {
  tAutoInterval = setInterval(() => goTesti((tCurrent + 1) > tMax ? 0 : tCurrent + 1), 5000);
});

// ============================================================
// 15. CONTACT FORM
// ============================================================

// ============================================================
// 15. CONTACT FORM — WHATSAPP INTEGRATION
// ============================================================

// ✅ PUT YOUR WHATSAPP NUMBER HERE (country code + number, no + or spaces)
// Example: India +91 98765 43210 → 919876543210
const WA_NUMBER = '918861947700'; // <-- Replace with your real number

const form         = $('#contactForm');
const formSuccess  = $('#formSuccess');
const submitBtn    = $('#submitBtn');
const submitText   = $('#submitText');
const submitArrow  = $('#submitArrow');
const errorBanner  = $('#formErrorBanner');

// Individual fields
const fieldName       = $('#fieldName');
const fieldContact    = $('#fieldContact');
const fieldDest       = $('#fieldDest');
const fieldDate       = $('#fieldDate');
const fieldTravellers = $('#fieldTravellers');
const fieldMessage    = $('#fieldMessage');

// Error spans
const errName    = $('#errName');
const errContact = $('#errContact');

// ── Helpers ────────────────────────────────────────────────

function showFieldError(input, errEl) {
  input.classList.add('invalid');
  errEl.classList.add('show');
}

function clearFieldError(input, errEl) {
  input.classList.remove('invalid');
  errEl.classList.remove('show');
}

function clearAllErrors() {
  [fieldName, fieldContact].forEach(f => f?.classList.remove('invalid'));
  [errName, errContact].forEach(e => e?.classList.remove('show'));
  errorBanner?.classList.remove('show');
}

// Live clear errors as user types
fieldName?.addEventListener('input', () => {
  if (fieldName.value.trim()) clearFieldError(fieldName, errName);
});

fieldContact?.addEventListener('input', () => {
  if (fieldContact.value.trim()) clearFieldError(fieldContact, errContact);
});

// ── Build WhatsApp message ─────────────────────────────────

function buildWAMessage(data) {
  const lines = [
    '🌍 *New Travel Enquiry — Nishu Tours & Travels*',
    '━━━━━━━━━━━━━━━━━━━━━━',
    `👤 *Name:* ${data.name}`,
    `📞 *Contact:* ${data.contact}`,
  ];

  if (data.destination) {
    lines.push(`📍 *Destination:* ${data.destination}`);
  }

  if (data.date) {
    // Format date nicely
    const d = new Date(data.date);
    const formatted = d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    lines.push(`📅 *Travel Date:* ${formatted}`);
  }

  if (data.travellers) {
    lines.push(`👥 *Travellers:* ${data.travellers}`);
  }

  if (data.message) {
    lines.push(`💬 *Additional Info:* ${data.message}`);
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('_Sent via nishutravel.com enquiry form_');

  return lines.join('\n');
}

// ── Form submit handler ────────────────────────────────────

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    clearAllErrors();

    // Collect values
    const name       = fieldName?.value.trim()       || '';
    const contact    = fieldContact?.value.trim()    || '';
    const dest       = fieldDest?.value.trim()       || '';
    const date       = fieldDate?.value              || '';
    const travellers = fieldTravellers?.value        || '';
    const message    = fieldMessage?.value.trim()    || '';

    // ── Validate required fields ──
    let hasError = false;

    if (!name) {
      showFieldError(fieldName, errName);
      hasError = true;
    }

    if (!contact) {
      showFieldError(fieldContact, errContact);
      hasError = true;
    }

    if (hasError) {
      errorBanner?.classList.add('show');
      // Scroll to form top
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // ── Loading state ──
    submitBtn?.classList.add('loading');
    if (submitText) submitText.textContent = 'Opening WhatsApp';

    // ── Build & encode message ──
    const msgData = { name, contact, destination: dest, date, travellers, message };
    const rawMsg  = buildWAMessage(msgData);
    const encoded = encodeURIComponent(rawMsg);
    const waURL   = `https://wa.me/${WA_NUMBER}?text=${encoded}`;

    // ── Short delay for UX, then open WhatsApp ──
    setTimeout(() => {
      // Show success state on the page
      if (formSuccess) {
        formSuccess.innerHTML = `
          <div class="success-icon">🎉</div>
          <h3>Opening WhatsApp!</h3>
          <p>Your enquiry is ready to send.<br/>
          If WhatsApp didn't open, <a href="${waURL}" target="_blank" style="color:var(--gold);text-decoration:underline;">click here</a>.</p>
          <div class="wa-redirect-note">
            <span class="wa-icon">💬</span>
            <span>WhatsApp will open with your message pre-filled — just press <strong style="color:var(--gold);">Send</strong>!</span>
          </div>
        `;
        formSuccess.classList.add('visible');
      }

      // Reset button
      submitBtn?.classList.remove('loading');
      if (submitText) submitText.textContent = 'Send Enquiry';
      if (submitArrow) submitArrow.textContent = '✈';

      // Open WhatsApp in new tab
      window.open(waURL, '_blank');

      // Optional: reset form after 4 seconds
      setTimeout(() => {
        form.reset();
        if (formSuccess) formSuccess.classList.remove('visible');
        clearAllErrors();
      }, 4000);

    }, 900);
  });
}

// ============================================================
// 16. BACK TO TOP
// ============================================================

const backTop = $('#backTop');

function updateBackTop() {
  if (!backTop) return;
  backTop.classList.toggle('show', window.scrollY > 400);
}

backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ============================================================
// 17. SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================

$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ============================================================
// 18. SCROLL HANDLER (throttled via rAF)
// ============================================================

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateScrollBar();
    handleNavbar();
    updateActiveLink();
    updateBackTop();
    heroParallax();
    ticking = false;
  });
}, { passive: true });

// ============================================================
// 19. HERO ENQUIRY — search button animation
// ============================================================

const enqBtn = $('.enq-btn');
if (enqBtn) {
  enqBtn.addEventListener('click', () => {
    const input = $('.enq-input');
    if (!input?.value) {
      input?.focus();
      return;
    }
    // Animate button
    enqBtn.textContent = 'Searching ✈️';
    setTimeout(() => enqBtn.textContent = 'Search Trips', 2000);
  });
}

// ============================================================
// 20. INIT
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
  handleNavbar();
  updateScrollBar();
  updateBackTop();

  // Stagger hero reveal
  if (!reduced) {
    $$('#heroContent .ri').forEach((el, i) => {
      setTimeout(() => el.classList.add('on'), 300 + i * 180);
    });
    setTimeout(() => {
      $('#heroStats')?.classList.add('on');
    }, 300 + 5 * 180);
  } else {
    $$('.ri').forEach(el => el.classList.add('on'));
  }
});

window.addEventListener('resize', () => {
  tPerView = window.innerWidth <= 640 ? 1 : window.innerWidth <= 900 ? 2 : 3;
  goTesti(0);
  if (window.innerWidth <= 768) {
    $$('.mag-btn').forEach(b => b.style.transform = '');
  }
});

/* ============================================================
   Done — Nishu Tours & Travels
   ============================================================ */
   // ============================================================
// PRICING SECTION — row stagger animation on scroll
// ============================================================

const rateRows = $$('.rate-row');

// Set initial state for each row
rateRows.forEach((row, i) => {
  row.style.opacity = '0';
  row.style.transform = 'translateX(-16px)';
  row.style.transition =
    `opacity .5s var(--ease-out) ${i * 80}ms,
     transform .5s var(--ease-out) ${i * 80}ms`;
});

// Observe each rate-table and animate its rows when visible
const rateTables = $$('.rate-table');

const rateObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const rows = entry.target.querySelectorAll('.rate-row');
    rows.forEach(row => {
      row.style.opacity   = '1';
      row.style.transform = 'translateX(0)';
    });
    rateObs.unobserve(entry.target);
  });
}, { threshold: 0.2 });

rateTables.forEach(t => rateObs.observe(t));

// ============================================================
// PRICING — hover sound-like micro-pulse on price
// ============================================================

$$('.rate-row').forEach(row => {
  row.addEventListener('mouseenter', () => {
    const price = row.querySelector('.rate-price');
    if (!price || reduced) return;
    price.animate([
      { transform: 'scale(1)'    },
      { transform: 'scale(1.08)' },
      { transform: 'scale(1)'    }
    ], { duration: 280, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  });
});