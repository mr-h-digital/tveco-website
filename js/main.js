// ── Hero animations + anchor transitions ──────────────────────────────────────
(() => {
  const transition = document.getElementById('pageTransition');
  const nav        = document.getElementById('nav');

  const navH = () => (nav ? nav.offsetHeight : 72);

  const triggerHero = () => {
    if (document.body.classList.contains('loaded')) return;
    document.body.classList.add('loaded');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', triggerHero);
  } else {
    triggerHero();
  }

  // ── Anchor transition overlay ──────────────────────────────────────────────
  const showOverlay = () => transition && transition.classList.add('show');
  const hideOverlay = () => transition && transition.classList.remove('show');

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - navH() + 2;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').replace('#', '');
    if (!id || !document.getElementById(id)) return;

    e.preventDefault();
    showOverlay();
    setTimeout(() => {
      history.pushState(null, '', '#' + id);
      scrollToId(id);
      setTimeout(hideOverlay, 200);
    }, 110);
  });

  window.addEventListener('popstate', () => {
    const id = location.hash.replace('#', '');
    if (!id) return;
    showOverlay();
    setTimeout(() => { scrollToId(id); setTimeout(hideOverlay, 200); }, 80);
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && transition) {
    transition.style.transition = 'none';
  }
})();

// ── Hero carousel ─────────────────────────────────────────────────────────────
(() => {
  const slides   = Array.from(document.querySelectorAll('.hero-slide'));
  const dots     = Array.from(document.querySelectorAll('.hero-dot'));
  const DURATION = 7000;
  let current    = 0;
  let timer      = null;
  const isMobile = () => window.innerWidth <= 768;

  // Filter out 4K slide on mobile
  const visibleSlides = () => slides.filter(s =>
    !(s.classList.contains('hero-slide--4k') && isMobile())
  );
  const visibleDots = () => dots.filter(d =>
    !(d.dataset.slide === '2' && isMobile())
  );

  function goTo(index) {
    const vs = visibleSlides();
    const vd = visibleDots();
    const prev = vs[current];
    current = ((index % vs.length) + vs.length) % vs.length;
    const next = vs[current];

    // Pause previous video
    const prevVid = prev.querySelector('.hero-video');
    if (prevVid) prevVid.pause();

    prev.classList.remove('active');
    next.classList.add('active');

    // Play next video, load it first if needed
    const nextVid = next.querySelector('.hero-video');
    if (nextVid) {
      if (nextVid.readyState === 0) nextVid.load();
      nextVid.play().catch(() => {});
    }

    // Sync dots
    vd.forEach(d => d.classList.remove('active'));
    if (vd[current]) vd[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, DURATION);
  }

  // Dot click
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.slide);
      const vs  = visibleSlides();
      const target = vs.findIndex(s => parseInt(s.dataset.index) === idx);
      if (target !== -1) { goTo(target); startTimer(); }
    });
  });

  // Pause on hover
  const hero = document.getElementById('hero');
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', startTimer);

  // Start first slide video if it's a video
  const firstVid = slides[0].querySelector('.hero-video');
  if (firstVid) { firstVid.load(); firstVid.play().catch(() => {}); }

  startTimer();
})();

// ── Nav scroll ────────────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ── Mobile menu ───────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const drawer    = document.getElementById('drawer');
hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  drawer.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

document.addEventListener('click', (e) => {
  if (drawer.classList.contains('open') &&
      !drawer.contains(e.target) &&
      !hamburger.contains(e.target)) {
    closeDrawer();
  }
});
function closeDrawer() {
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  drawer.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));

// ── Counter animation ─────────────────────────────────────────────────────────
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.target);
    let current  = 0;
    const step   = Math.ceil(target / (1800 / 16));
    const timer  = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 16);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));

// ── Active nav link on scroll ─────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const scrollSpy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.3 });
sections.forEach(s => scrollSpy.observe(s));

// ── FAQ accordion ─────────────────────────────────────────────────────────────
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });
  if (!wasOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(q); }
  });
});

// ── Contact form — validation helpers ────────────────────────────────────────
function setFieldState(input, valid) {
  const group = input.closest('.form-group');
  group.classList.toggle('error', !valid);
  group.classList.toggle('valid', valid);
}

function validateField(input) {
  if (input.type === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
  }
  return input.value.trim() !== '';
}

// Clear error state as soon as the user starts correcting a field
document.querySelectorAll('#contact input, #contact select, #contact textarea').forEach(el => {
  el.addEventListener('input', () => {
    if (el.closest('.form-group').classList.contains('error')) {
      if (validateField(el)) setFieldState(el, true);
    }
  });
  el.addEventListener('change', () => {
    if (el.closest('.form-group').classList.contains('error')) {
      if (validateField(el)) setFieldState(el, true);
    }
  });
});

// ── Contact form — WhatsApp submit ────────────────────────────────────────────
function handleEnquiry(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const f   = e.target;

  const required = [
    f.fname, f.lname, f.email, f.phone, f.country
  ];

  let isValid = true;
  required.forEach(input => {
    const ok = validateField(input);
    setFieldState(input, ok);
    if (!ok) isValid = false;
  });

  if (!isValid) {
    const firstError = f.querySelector('.form-group.error input, .form-group.error select');
    if (firstError) firstError.focus();
    return;
  }

  const fname   = f.fname.value.trim();
  const lname   = f.lname.value.trim();
  const email   = f.email.value.trim();
  const phone   = f.phone.value.trim();
  const country = f.country.value.trim();
  const vehicle = (f.vehicle.value || '').trim();
  const message = (f.message.value || '').trim();

  const msg = [
    '🚗 TVECO — NEW EXPORT ENQUIRY',
    '━━━━━━━━━━━━━━━━━━━━',
    `👤 Name: ${fname} ${lname}`,
    `✉️ Email: ${email}`,
    `📱 Phone: ${phone}`,
    `🌍 Destination: ${country}`,
    `🚙 Vehicle Type: ${vehicle || 'Not specified'}`,
    '━━━━━━━━━━━━━━━━━━━━',
    '📝 Details:',
    message || 'No additional details.',
    '━━━━━━━━━━━━━━━━━━━━',
    'Sent via tveco.co.za'
  ].join('\n');

  const url = `https://wa.me/27722663988?text=${encodeURIComponent(msg)}`;
  btn.textContent = 'Opening WhatsApp...';
  btn.disabled = true;
  window.open(url, '_blank', 'noopener,noreferrer') || (window.location.href = url);

  // Reset form state
  f.reset();
  f.querySelectorAll('.form-group').forEach(g => g.classList.remove('valid'));
  btn.textContent = 'Send Enquiry →';
  btn.style.background = '';
  btn.disabled = false;

  // Show thank you screen
  const thanks = document.getElementById('formThanks');
  const form   = document.getElementById('contactForm');
  form.style.opacity = '0';
  form.style.transform = 'translateY(-10px)';
  form.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  setTimeout(() => {
    form.hidden = true;
    form.style.opacity = '';
    form.style.transform = '';
    form.style.transition = '';
    thanks.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => thanks.classList.add('visible'));
    });
  }, 300);
}

// Send Another Enquiry — reset back to form
const sendAnother = document.getElementById('sendAnotherBtn');
if (sendAnother) {
  sendAnother.addEventListener('click', () => {
    const thanks = document.getElementById('formThanks');
    const form   = document.getElementById('contactForm');
    thanks.classList.remove('visible');
    setTimeout(() => {
      thanks.hidden = true;
      form.hidden = false;
    }, 300);
  });
}
