/* =========================================================
   Cherrie Lou Cuenca — Portfolio v2 interactions
   ========================================================= */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Menu ---------- */
  const menuBtn = $('#menuBtn'), menu = $('#menu');
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('.menu-links a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Scroll-driven hero ---------- */
  const track = $('.hero-track');
  const card = $('#heroCard');
  const photo = $('.hero-photo', card);
  const quote = $('#heroQuote');
  const bar = $('.hero-card-bar', card);
  const left = $('[data-hero="left"]');
  const right = $('[data-hero="right"]');
  const mark = $('#wordmark');
  const desktop = matchMedia('(min-width: 901px)');

  function clearHero() {
    [card, photo, quote, bar, left, right, mark].forEach((el) => el && el.removeAttribute('style'));
  }

  function hero() {
    if (!desktop.matches) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const total = track.offsetHeight - vh;
    const p = clamp(-track.getBoundingClientRect().top / total, 0, 1);

    // Phase 1 (0 → 0.7): card grows to full screen
    const g = ease(clamp(p / 0.7, 0, 1));
    const w0 = Math.min(vw * 0.26, 360), h0 = Math.min(vh * 0.64, 480);
    const top0 = vh * 0.08;
    const w = lerp(w0, vw, g), h = lerp(h0, vh, g);
    card.style.width = w + 'px';
    card.style.height = h + 'px';
    card.style.top = lerp(top0, 0, g) + 'px';
    card.style.borderRadius = lerp(24, 0, g) + 'px';
    photo.style.height = lerp(90, 72, g) + '%';
    bar.style.opacity = String(1 - clamp(g * 3, 0, 1));

    // Side copy slides out, wordmark sinks
    const out = clamp(p / 0.3, 0, 1);
    left.style.transform = `translateX(${-out * 120}px)`;
    left.style.opacity = String(1 - out);
    right.style.transform = `translateX(${out * 120}px)`;
    right.style.opacity = String(1 - out);
    mark.style.transform = `translateX(-50%) translateY(${ease(out) * 60}%)`;
    mark.style.opacity = String(1 - out);

    // Phase 2 (0.55 → 0.9): headline quote appears behind the photo
    const q = clamp((p - 0.55) / 0.35, 0, 1);
    quote.style.opacity = String(q);
    quote.style.transform = `translateX(-50%) translateY(${(1 - q) * 40}px)`;
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { hero(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  desktop.addEventListener('change', () => { clearHero(); hero(); });
  hero();

  /* ---------- Infinite carousel: duplicate rows for a seamless loop ---------- */
  $$('.marquee-row').forEach((row) => {
    row.innerHTML += row.innerHTML;
    [...row.children].slice(row.children.length / 2).forEach((el) => el.setAttribute('aria-hidden', 'true'));
  });

  /* ---------- Reveal + counters + skill bars ---------- */
  function countUp(el) {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now(), dur = 1400;
    const step = (now) => {
      const t = clamp((now - start) / dur, 0, 1);
      el.textContent = Math.round(target * ease(t)) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- Projects: info overlay, filters, lightbox ---------- */
  const projects = $$('.proj');
  projects.forEach((p) => {
    p.tabIndex = 0;
    p.setAttribute('role', 'button');
    p.setAttribute('aria-label', `Open ${p.dataset.title}`);
    const info = document.createElement('div');
    info.className = 'proj-info';
    info.innerHTML = `<span class="chip-sm"></span><h3></h3>`;
    info.querySelector('.chip-sm').textContent = p.dataset.tag;
    info.querySelector('h3').textContent = p.dataset.title;
    p.appendChild(info);
  });

  // Video cards: silent preview on hover
  $$('.proj.has-video').forEach((p) => {
    const v = $('video', p);
    p.addEventListener('mouseenter', () => { if (!reduceMotion) v.play().catch(() => {}); });
    p.addEventListener('mouseleave', () => { v.pause(); });
  });

  $$('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.filter').forEach((b) => b.classList.toggle('on', b === btn));
      const f = btn.dataset.filter;
      projects.forEach((p) => p.classList.toggle('hide', f !== 'all' && p.dataset.cat !== f));
    });
  });

  const lb = $('#lightbox');
  let lastFocus = null;
  function openLb(p) {
    lastFocus = p;
    const img = $('#lbImg'), vid = $('#lbVideo');
    if (p.dataset.video) {
      img.hidden = true;
      vid.hidden = false;
      vid.poster = p.dataset.img;
      vid.src = p.dataset.video;
      vid.play().catch(() => {});
    } else {
      stopLbVideo();
      img.hidden = false;
      img.src = p.dataset.img;
      img.alt = p.dataset.title;
    }
    $('#lbTag').textContent = p.dataset.tag;
    $('#lbTitle').textContent = p.dataset.title;
    $('#lbDesc').textContent = p.dataset.desc;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function stopLbVideo() {
    const vid = $('#lbVideo');
    vid.pause();
    vid.removeAttribute('src');
    vid.load();
    vid.hidden = true;
  }
  function closeLb() {
    stopLbVideo();
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  projects.forEach((p) => {
    p.addEventListener('click', () => openLb(p));
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(p); } });
  });
  $('#lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (lb.classList.contains('open')) closeLb();
    if (menu.classList.contains('open')) setMenu(false);
  });

  /* ---------- Contact form → opens email app ---------- */
  const form = $('#contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();
    const err = $('#formError');
    if (!name || !msg || !/^\S+@\S+\.\S+$/.test(email)) {
      err.textContent = 'Please fill in your name, a valid email, and a message.';
      return;
    }
    err.textContent = '';
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
    window.location.href = `mailto:cuencacherrielou@gmail.com?subject=${subject}&body=${body}`;
  });
})();
