/* Ask Studios: interactions and GSAP animations */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import Lenis from 'lenis';

// the original page loaded these from CDN as globals; keep the same names available
Object.assign(window, { gsap, ScrollTrigger, Draggable, Lenis });

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasGsap = typeof window.gsap !== 'undefined';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = hasGsap && !reduce;
  const finePointer = matchMedia('(pointer: fine)').matches;

  if (hasGsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (window.Draggable) gsap.registerPlugin(Draggable);
  }

  /* ---------------------------------------------------- Lenis smooth scroll */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    // in-page links glide through Lenis instead of jumping
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const target = id === '#top' || id === '#' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: target === 0 ? 0 : -72, duration: 1.4 });
    });
  }
  // stop page scrolling while an overlay is open
  const lockScroll = on => {
    document.body.style.overflow = on ? 'hidden' : '';
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  /* ------------------------------------------------------------------ data */
  const IMG = name => `img/${name}.jpg`;
  const gallery = [
    { t: 'Prewedding', s: 'Dimas & Sarah', img: 'prewed', x: '50MM · F/2 · 1/500' },
    { t: 'Product', s: 'Cafe PC Jersey', img: 'jersey', x: '35MM · F/4 · 1/250' },
    { t: 'Commercial', s: 'Sprint Campaign', img: 'runner', x: '24MM · F/2.8 · 1/60' },
    { t: 'Wet Look', s: 'Swimwear Editorial', img: 'wet', x: '85MM · F/1.8 · 1/320' },
    { t: 'Graduation', s: 'Ifara, Harvard University', img: 'grad2', x: '85MM · F/1.4 · 1/400' },
    { t: 'Event', s: 'Fast Fest 2026', img: 'concert', x: '35MM · F/1.8 · 1/125' },
    { t: 'Film Shoot', s: 'Night City Short', img: 'city', x: '24MM · F/8 · 4"' },
    { t: 'Product Photo', s: 'Santal Absolu', img: 'perfume', x: '100MM · F/11 · 1/160' },
  ];
  const reviews = [
    { n: 'Jessica Han', r: 'Wedding client', tag: 'Wedding', img: 'avatar1', q: 'Ask Studios captured every detail of our wedding perfectly. The photos feel so alive we can relive the day every time we look at them.' },
    { n: 'Marcus Reid', r: 'Brand director', tag: 'Commercial', img: 'avatar2', q: 'Very professional and easy to work with. The photos came out modern, clean and right for our campaign.' },
    { n: 'Aya Tanaka', r: 'Graduate', tag: 'Portrait', img: 'avatar3', q: "I'm impressed with the results. Every shot feels natural yet artistic, and the whole process was smooth and enjoyable." },
    { n: 'Daniel Cole', r: 'Event host, Fast Fest', tag: 'Event', img: 'avatar4', q: 'Great photography service. Clear communication, fast delivery, and results that went past what I expected.' },
    { n: 'Priya Nair', r: 'Founder, Linen & Co', tag: 'Product', img: 'avatar5', q: 'High-quality work with a real style. Their portfolio shows both creativity and professionalism in every frame.' },
    { n: 'Leo Martins', r: 'Groom', tag: 'Wedding', img: 'avatar6', q: 'They were invisible on the day and everywhere at once. Our families still talk about the candid shots.' },
  ];

  /* --------------------------------------------------------------- build */
  const grid = $('#galleryGrid');
  // scattered two-column layout: width, x-offset (both % of column), aspect ratio, parallax speed
  const layout = [
    { w: 78, x: 0, ar: '1 / 1', sp: .5 },
    { w: 80, x: 20, ar: '5 / 4', sp: 1.1 },
    { w: 70, x: 22, ar: '16 / 10', sp: .8 },
    { w: 72, x: 4, ar: '1 / 1', sp: .4 },
    { w: 74, x: 8, ar: '4 / 5', sp: 1 },
    { w: 66, x: 30, ar: '4 / 5', sp: .7 },
    { w: 64, x: 28, ar: '3 / 2', sp: .6 },
    { w: 80, x: 10, ar: '3 / 2', sp: 1.2 },
  ];
  const cols = ['l', 'r'].map(side => {
    const c = document.createElement('div');
    c.className = `scatter-col ${side}`;
    grid.appendChild(c);
    return c;
  });
  gallery.forEach((g, i) => {
    const L = layout[i];
    const b = document.createElement('button');
    b.className = 'g';
    b.dataset.i = i;
    b.dataset.speed = L.sp;
    b.dataset.cursor = 'view';
    b.style.setProperty('--w', L.w + '%');
    b.style.setProperty('--x', L.x + '%');
    b.innerHTML = `
      <div class="ph" style="aspect-ratio:${L.ar}"><img loading="lazy" src="${IMG(g.img)}" alt="${g.t} photograph for ${g.s}"></div>
      <div class="g-cap"><span class="g-n">[${String(i + 1).padStart(2, '0')}]</span><span class="g-t">${g.t}</span><span class="g-s">${g.s}</span></div>`;
    cols[i % 2].appendChild(b);
  });

  const track = $('#track');
  reviews.forEach((r, i) => {
    const s = document.createElement('article');
    s.className = 'slide';
    s.setAttribute('role', 'group');
    s.setAttribute('aria-label', `Story ${i + 1} of ${reviews.length}`);
    s.innerHTML = `
      <div class="slide-top"><span class="qmark" aria-hidden="true">“</span><span class="slide-tag">${r.tag}</span></div>
      <p>${r.q}</p>
      <div class="slide-foot">
        <div class="av"><i></i><i></i><i></i><i></i><div class="ph"><img src="${IMG(r.img)}" alt="" draggable="false"></div></div>
        <div style="flex:1"><b>${r.n}</b><small>${r.r}</small></div>
        <span class="stars" aria-label="5 out of 5 stars">★★★★★</span>
      </div>`;
    track.appendChild(s);
  });

  // broken-image fallback: keep the tinted frame instead of a broken icon
  $$('img').forEach(img => {
    const f = () => img.classList.add('broken');
    img.addEventListener('error', f);
    if (img.complete && !img.naturalWidth) f();
  });

  // split wordmarks into characters, headline into words
  $$('[data-split]').forEach(el => {
    el.innerHTML = `<span class="line">${[...el.textContent].map(c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</span>`;
  });
  $$('[data-words]').forEach(el => {
    el.innerHTML = el.textContent.split(' ').map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
  });

  /* ------------------------------------------------------------ hero intro */
  const heroImg = $('#heroMedia img');
  if (motion) {
    gsap.set(heroImg, { scale: 1.06 });
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from(heroImg, { scale: 1.3, filter: 'blur(1.25rem)', duration: 2.4, ease: 'power3.out' })
      .from('.nav > *', { y: -24, autoAlpha: 0, duration: 1, stagger: .08 }, .4)
      .from('.hero-title .ln > span', { yPercent: 110, duration: 1.4, stagger: .12 }, .5)
      .from('.hero-copy', { y: 24, autoAlpha: 0, duration: 1 }, 1)
      .from('.hero-cta', { y: 24, autoAlpha: 0, scale: .9, duration: 1 }, 1.1);

    // scroll parallax
    const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('#heroMedia', { yPercent: 18, ease: 'none', scrollTrigger: st });
    gsap.to('.hero-inner', { yPercent: -14, autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: '80% top' } });

    // image drifts gently against the pointer
    const hero = $('.hero');
    const ix = gsap.quickTo(heroImg, 'x', { duration: 1.2, ease: 'power3' });
    const iy = gsap.quickTo(heroImg, 'y', { duration: 1.2, ease: 'power3' });
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      ix(((e.clientX - r.left) / r.width - .5) * -28);
      iy(((e.clientY - r.top) / r.height - .5) * -18);
    });
    hero.addEventListener('pointerleave', () => { ix(0); iy(0); });
  }

  /* --------------------------------------------------- rolling text links */
  $$('.roll').forEach(a => {
    const t = a.textContent.trim();
    a.innerHTML = `<span class="roll-in"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
    if (!motion) return;
    const tw = gsap.to(a.firstElementChild, { yPercent: -50, duration: .5, ease: 'power3.inOut', paused: true });
    a.addEventListener('mouseenter', () => tw.play());
    a.addEventListener('mouseleave', () => tw.reverse());
  });

  /* ------------------------------------------------------------------ nav */
  const nav = $('#nav');
  let menuOpen = false;
  const navLinks = $$('.menu a');
  const setActive = id => navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));

  if (window.ScrollTrigger) {
    ['#about', '#services', '#gallery', '#contact'].forEach(id => {
      ScrollTrigger.create({
        trigger: id, start: 'top 45%', end: 'bottom 45%',
        onToggle: self => self.isActive && setActive(id),
      });
    });
    ScrollTrigger.create({
      trigger: '.hero', start: 'bottom-=80 top',
      onEnter: () => nav.classList.add('solid'), onLeaveBack: () => nav.classList.remove('solid'),
    });
    let hidden = false;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => {
        const hide = self.direction === 1 && self.scroll() > innerHeight * .7 && !menuOpen;
        if (hide !== hidden) {
          hidden = hide;
          gsap.to(nav, { yPercent: hide ? -110 : 0, duration: .5, ease: 'power3.out', overwrite: 'auto' });
        }
      },
    });
  } else {
    addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > innerHeight * .8), { passive: true });
  }

  // Book Now hover
  const cta = $('.hero-cta');
  if (motion) {
    const bt = gsap.timeline({ paused: true, defaults: { duration: .45, ease: 'power3.out' } })
      .to(cta, { backgroundColor: '#0b0b0c', color: '#fff' }, 0)
      .to(cta.querySelector('svg'), { rotation: 45 }, 0);
    cta.addEventListener('mouseenter', () => bt.play());
    cta.addEventListener('mouseleave', () => bt.reverse());
  }

  // mobile menu
  const burger = $('#burger'), mnav = $('#mnav');
  let mtl = null;
  if (hasGsap) {
    mtl = gsap.timeline({ paused: true, onReverseComplete: () => { mnav.hidden = true; } })
      .to(mnav, { clipPath: 'inset(0 0 0% 0)', duration: .8, ease: 'expo.inOut' })
      .to('#burger span:nth-child(1)', { y: 3.5, rotation: 45, duration: .4 }, 0)
      .to('#burger span:nth-child(2)', { y: -3.5, rotation: -45, duration: .4 }, 0)
      .from('.mnav a span', { yPercent: 110, duration: .9, stagger: .07, ease: 'expo.out' }, .35)
      .from('.mnav-foot', { autoAlpha: 0, y: 20, duration: .6 }, .6);
  }
  const toggleMenu = open => {
    menuOpen = open;
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    lockScroll(open);
    if (open) { mnav.hidden = false; gsap.set(nav, { yPercent: 0 }); }
    if (mtl) open ? mtl.timeScale(1).play() : mtl.timeScale(1.4).reverse();
    else { mnav.style.clipPath = open ? 'inset(0)' : ''; if (!open) mnav.hidden = true; }
  };
  burger.addEventListener('click', () => toggleMenu(!menuOpen));
  $$('#mnav a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ----------------------------------------------------- scroll reveals */
  if (motion) {
    gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

    gsap.set('.rv', { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch('.rv', {
      start: 'top 90%',
      onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .09, overwrite: true }),
    });

    $$('.frame-title').forEach(t => {
      const c = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
      gsap.timeline({ scrollTrigger: { trigger: t, start: 'top 88%' } })
        .from(t, { y: 24, autoAlpha: 0, duration: 1, ease: 'expo.out' })
        .from(t.querySelectorAll('i'), { x: i => c[i][0] * 34, y: i => c[i][1] * 10, duration: 1.1, ease: 'expo.out' }, .1);
    });

    gsap.from('.about-title .w > span', {
      yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .08,
      scrollTrigger: { trigger: '.about-title', start: 'top 88%' },
    });

    $$('.rv-img').forEach(el => {
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 92%' } })
        .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out' })
        .from(el.querySelector('img'), { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0);
      // on phones the collage is a horizontal marquee, so no vertical drift there
      if (innerWidth > 600) gsap.to(el, { y: +el.dataset.speed, ease: 'none', scrollTrigger: { trigger: '.collage', start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count, suf = el.dataset.suffix || '', o = { v: 0 };
      el.textContent = '0' + suf;
      gsap.to(o, {
        v: end, duration: 1.8, ease: 'power3.out',
        onUpdate: () => { el.textContent = Math.round(o.v) + suf; },
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });

    // footer
    gsap.from('.foot-top > *', { y: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.foot', start: 'top 85%' } });
    gsap.from('.foot-legal', { autoAlpha: 0, duration: 1, scrollTrigger: { trigger: '.foot-legal', start: 'top 95%' } });
    gsap.from('.strip figure', {
      yPercent: 100, duration: 1.4, ease: 'expo.out', stagger: { each: .1, from: 'random' },
      scrollTrigger: { trigger: '.strip', start: 'top 95%' },
    });
  }

  /* ------------------------------------------------------------------ CTA */
  if (motion) {
    gsap.fromTo('.cta-media', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.timeline({ scrollTrigger: { trigger: '.cta', start: 'top 70%' }, defaults: { ease: 'expo.out' } })
      .from('.cta-media img', { scale: 1.35, filter: 'blur(1rem)', duration: 2 })
      .from('.cta-title .w > span', { yPercent: 110, duration: 1.3, stagger: .06 }, .2)
      .from('.cta-copy', { y: 24, autoAlpha: 0, duration: 1 }, .6)
      .from('.cta-btn', { y: 24, autoAlpha: 0, scale: .9, duration: 1 }, .75);
    const btn = $('.cta-btn');
    const bh = gsap.timeline({ paused: true, defaults: { duration: .45, ease: 'power3.out' } })
      .to(btn, { backgroundColor: '#e3261c' }, 0)
      .to(btn.querySelector('svg'), { rotation: 45 }, 0);
    btn.addEventListener('mouseenter', () => bh.play());
    btn.addEventListener('mouseleave', () => bh.reverse());
  }

  /* -------------------------------------------------------------- services */
  const svcs = $$('.svc'), shots = $$('#svcMedia .ph'), cap = $('#svcCap');
  const ON = 'rgba(243, 241, 238, .07)', OFF = 'rgba(243, 241, 238, 0)';
  let svcIdx = 0, z = 2;
  if (hasGsap) {
    svcs.forEach((s, i) => {
      gsap.set(s, { backgroundColor: i ? OFF : ON });
      gsap.set(s.querySelector('.svc-desc'), { height: i ? 0 : 'auto', autoAlpha: i ? 0 : 1 });
    });
  }
  const pick = i => {
    if (i === svcIdx) return;
    const prev = svcIdx;
    svcIdx = i;
    svcs.forEach((s, j) => s.classList.toggle('on', j === i));
    cap.textContent = `[0${i + 1}] ${svcs[i].querySelector('h3').textContent}`;
    if (!hasGsap) { shots.forEach((s, j) => s.classList.toggle('on', j === i)); return; }

    const shot = shots[i];
    gsap.set(shot, { zIndex: ++z });
    gsap.timeline()
      .fromTo(shot, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.out', overwrite: true })
      .fromTo(shot.querySelector('img'), { scale: 1.25 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, 0);

    const ease = 'power3.inOut', duration = .55;
    gsap.to(svcs[prev], { backgroundColor: OFF, duration, ease });
    gsap.to(svcs[i], { backgroundColor: ON, duration, ease });
    gsap.to(svcs[prev].querySelector('.svc-desc'), { height: 0, autoAlpha: 0, duration, ease });
    gsap.to(svcs[i].querySelector('.svc-desc'), { height: 'auto', autoAlpha: 1, duration, ease });
    gsap.fromTo(svcs[i].querySelector('h3'), { x: -12 }, { x: 0, duration: .8, ease: 'expo.out' });
  };
  svcs.forEach((s, i) => {
    s.addEventListener('mouseenter', () => pick(i));
    s.addEventListener('click', () => pick(i));
    s.addEventListener('focus', () => pick(i));
  });

  /* --------------------------------------------------------------- gallery */
  if (motion) {
    $$('.g').forEach(g => {
      const sp = +g.dataset.speed, img = g.querySelector('img'), ph = g.querySelector('.ph');
      // card drifts at its own speed; the photo slides inside its frame
      gsap.fromTo(g, { y: sp * 90 }, { y: -sp * 90, ease: 'none', scrollTrigger: { trigger: g, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.set(img, { scale: 1.18 });
      gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: g, start: 'top bottom', end: 'bottom top', scrub: true } });
      // reveal once
      gsap.timeline({ scrollTrigger: { trigger: g, start: 'top 92%' } })
        .fromTo(ph, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out' })
        .from(g.querySelectorAll('.g-cap > span'), { y: 14, autoAlpha: 0, duration: .8, ease: 'expo.out', stagger: .06 }, .3);
      // hover
      const t = gsap.timeline({ paused: true })
        .to(img, { scale: 1.26, duration: 1.1, ease: 'expo.out' }, 0)
        .to(g.querySelector('.g-t'), { x: 8, duration: .5, ease: 'power3.out' }, 0);
      g.addEventListener('mouseenter', () => t.play());
      g.addEventListener('mouseleave', () => t.reverse());
    });
  }

  // lightbox
  const lb = $('#lb'), stage = $('#lbStage');
  let li = 0;
  const show = (i, dir = 0) => {
    li = (i + gallery.length) % gallery.length;
    const g = gallery[li];
    stage.innerHTML = `<div class="ph"><img src="${IMG(g.img)}" alt="${g.t} photograph for ${g.s}"></div>`;
    $('#lbTitle').textContent = g.t;
    $('#lbMeta').textContent = `${g.s} · ${g.x}`;
    $('#lbCount').textContent = `${String(li + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
    if (motion) gsap.from(stage.firstChild, { xPercent: dir * 10, autoAlpha: 0, scale: dir ? 1 : .9, duration: .8, ease: 'expo.out' });
  };
  const openLb = i => {
    show(i);
    lb.hidden = false;
    lockScroll(true);
    if (motion) gsap.fromTo(lb, { autoAlpha: 0 }, { autoAlpha: 1, duration: .4 });
    $('#lbClose').focus();
  };
  const closeLb = () => {
    const done = () => { lb.hidden = true; lockScroll(false); };
    motion ? gsap.to(lb, { autoAlpha: 0, duration: .35, onComplete: done }) : done();
  };
  grid.addEventListener('click', e => { const b = e.target.closest('.g'); if (b) openLb(+b.dataset.i); });
  $('#openGal').addEventListener('click', () => openLb(0));
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => show(li - 1, -1));
  $('#lbNext').addEventListener('click', () => show(li + 1, 1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target === stage) closeLb(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') show(li + 1, 1);
    if (e.key === 'ArrowLeft') show(li - 1, -1);
  });
  if (motion) {
    const ga = $('#openGal svg');
    $('#openGal').addEventListener('mouseenter', () => gsap.to(ga, { x: 10, duration: .4, ease: 'power3.out' }));
    $('#openGal').addEventListener('mouseleave', () => gsap.to(ga, { x: 0, duration: .4, ease: 'power3.out' }));
  }

  /* ---------------------------------------------------- testimonial slider */
  const slider = $('#slider'), slides = $$('.slide', track);
  const prevBtn = $('#prev'), nextBtn = $('#next'), counter = $('#slideCount');
  const AUTO = 5;
  let idx = 0, maxIdx = 0, drag = null, barTween = null, hovering = false;

  const measure = () => {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const per = Math.max(1, Math.round((slider.clientWidth + gap) / (slides[0].offsetWidth + gap)));
    maxIdx = Math.max(0, slides.length - per);
    idx = Math.min(idx, maxIdx);
  };
  const xFor = i => -slides[i].offsetLeft;
  const setX = (x, dur) => {
    if (hasGsap) gsap.to(track, { x, duration: dur, ease: 'expo.out', overwrite: true });
    else track.style.transform = `translateX(${x}px)`;
  };
  const update = () => {
    counter.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(maxIdx + 1).padStart(2, '0')}`;
    prevBtn.disabled = false; nextBtn.disabled = false;
  };
  // autoplay: advance every AUTO seconds; pauses on hover and while dragging
  const restartBar = () => {
    if (!hasGsap || reduce) return;
    if (barTween) barTween.kill();
    barTween = gsap.delayedCall(AUTO, () => go(idx + 1));
    if (hovering) barTween.pause();
  };
  const go = (i, dur = 1) => {
    idx = i > maxIdx ? 0 : i < 0 ? maxIdx : i;
    setX(xFor(idx), dur);
    update();
    restartBar();
    if (motion) gsap.fromTo(slides[idx].querySelector('.qmark'), { scale: .4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .8, ease: 'back.out(2)' });
  };
  prevBtn.addEventListener('click', () => go(idx - 1));
  nextBtn.addEventListener('click', () => go(idx + 1));
  slider.addEventListener('mouseenter', () => { hovering = true; barTween && barTween.pause(); });
  slider.addEventListener('mouseleave', () => { hovering = false; barTween && barTween.resume(); });
  slider.tabIndex = 0;
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go(idx + 1);
    if (e.key === 'ArrowLeft') go(idx - 1);
  });

  if (window.Draggable) {
    drag = Draggable.create(track, {
      type: 'x',
      bounds: slider,
      edgeResistance: .85,
      allowNativeTouchScrolling: true,
      onPress() { barTween && barTween.pause(); },
      onDragEnd() {
        let best = 0, d = Infinity;
        for (let i = 0; i <= maxIdx; i++) { const dd = Math.abs(this.x - xFor(i)); if (dd < d) { d = dd; best = i; } }
        if (best === idx && Math.abs(this.x - xFor(idx)) > 40) best += this.getDirection('start') === 'left' ? 1 : -1;
        go(Math.max(0, Math.min(maxIdx, best)), .8);
      },
      onRelease() { if (!this.isDragging && barTween && !hovering) barTween.resume(); },
    })[0];
  }

  // slide entrance
  if (motion) {
    gsap.from(slides, {
      x: 80, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: .1,
      scrollTrigger: { trigger: slider, start: 'top 85%', onEnter: () => restartBar() },
    });
  }

  const relayout = () => {
    measure();
    if (drag) drag.applyBounds(slider);
    setX(xFor(idx), 0);
    update();
  };
  measure(); update();
  if (!motion) restartBar();
  addEventListener('resize', relayout);

  if (motion) {
    $$('.strip figure').forEach(f => {
      const t = gsap.timeline({ paused: true, defaults: { duration: .6, ease: 'power3.out' } })
        .to(f, { y: '-1.5rem' }, 0)
        .to(f.querySelector('img'), { scale: 1.08 }, 0);
      f.addEventListener('mouseenter', () => t.play());
      f.addEventListener('mouseleave', () => t.reverse());
    });
  }

  /* ---------------------------------------------------- copy email + toast */
  const toast = $('#toast');
  const flash = msg => {
    toast.textContent = msg;
    if (hasGsap) gsap.timeline().to(toast, { autoAlpha: 1, y: '-1.25rem', duration: .4, ease: 'power3.out' }).to(toast, { autoAlpha: 0, y: 0, duration: .4 }, '+=1.6');
  };
  $('#copyMail').addEventListener('click', () => {
    const t = $('#copyMail').dataset.mail;
    const fallback = () => {
      const r = document.createRange(); r.selectNodeContents($('#copyMail'));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      flash('Selected. Press Ctrl+C to copy');
    };
    try { navigator.clipboard.writeText(t).then(() => flash('Email copied'), fallback); } catch (e) { fallback(); }
  });

  /* ----------------------------------------------------- magnetic buttons */
  if (motion && finePointer) {
    $$('.hero-cta, .cta-btn, .sbtn').forEach(m => {
      const mx = gsap.quickTo(m, 'x', { duration: .5, ease: 'power3' });
      const my = gsap.quickTo(m, 'y', { duration: .5, ease: 'power3' });
      m.addEventListener('pointermove', e => {
        const r = m.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .3);
        my((e.clientY - r.top - r.height / 2) * .3);
      });
      m.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  /* --------------------------------------------------------- custom cursor */
  const cur = $('#cursor'), dot = $('#cursorDot');
  if (motion && finePointer) {
    const cx = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' });
    const cy = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
    const dx = gsap.quickTo(dot, 'x', { duration: .1 });
    const dy = gsap.quickTo(dot, 'y', { duration: .1 });
    gsap.set([cur, dot], { x: innerWidth / 2, y: innerHeight / 2 });
    addEventListener('pointermove', e => { cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY); });
    let big = false;
    document.addEventListener('pointerover', e => {
      const want = !!e.target.closest('[data-cursor="view"]');
      if (want === big) return;
      big = want;
      gsap.to(cur, { width: want ? '5.25rem' : '2.375rem', height: want ? '5.25rem' : '2.375rem', marginLeft: want ? '-2.625rem' : '-1.1875rem', marginTop: want ? '-2.625rem' : '-1.1875rem', backgroundColor: want ? '#fff' : 'rgba(255,255,255,0)', duration: .4, ease: 'power3.out' });
      gsap.to(cur.firstElementChild, { opacity: want ? 1 : 0, duration: .25 });
    });
  } else {
    cur.hidden = true; dot.hidden = true;
  }

  /* ------------------------------------------------------- final refresh */
  if (window.ScrollTrigger) {
    addEventListener('load', () => { ScrollTrigger.refresh(); relayout(); });
  }
})();
