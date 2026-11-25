/* ==========================================================
   CONFIGURAÇÕES — edite apenas este bloco
   ========================================================== */
const CONFIG = {
  whatsapp: '5521994587625',
  mensagemPadrao: 'Olá! Vim pelo site da Taty Tavares – Estética Avançada e gostaria de agendar uma avaliação.',
  mensagemProcedimento: 'Olá! Vim pelo site da Taty Tavares – Estética Avançada e gostaria de saber mais sobre {proc}.',
  // Analytics (carregam SOMENTE após o consentimento do visitante). Deixe '' para desativar.
  ga4: '',          // ex.: 'G-XXXXXXXXXX'
  metaPixel: '',    // ex.: '123456789012345'
  // Redes sociais: preencha o endereço completo; vazio = não aparece como link.
  social: { instagram: '', facebook: '', tiktok: '' }
};

(function () {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.dataLayer = window.dataLayer || [];

  /* ---------- Parâmetros de campanha (tráfego pago) ---------- */
  const utm = {};
  try {
    const q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'].forEach(k => { if (q.get(k)) utm[k] = q.get(k); });
    if (Object.keys(utm).length) sessionStorage.setItem('utm', JSON.stringify(utm));
    else Object.assign(utm, JSON.parse(sessionStorage.getItem('utm') || '{}'));
  } catch (e) {}

  /* ---------- Eventos de conversão ---------- */
  function track(name, params) {
    window.dataLayer.push(Object.assign({ event: name }, params || {}, utm));
    if (typeof window.gtag === 'function') window.gtag('event', name, Object.assign({}, params));
    if (typeof window.fbq === 'function') window.fbq('trackCustom', name, params || {});
  }

  /* ---------- Links do WhatsApp ---------- */
  function waLink(proc) {
    const msg = proc ? CONFIG.mensagemProcedimento.replace('{proc}', proc) : CONFIG.mensagemPadrao;
    return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg);
  }
  $$('[data-wa]').forEach(a => {
    a.href = waLink(a.dataset.proc);
    a.target = '_blank'; a.rel = 'noopener';
    a.addEventListener('click', () => {
      track('whatsapp_click', { local: a.dataset.ev || 'procedimento', procedimento: a.dataset.proc || '' });
      if (typeof window.fbq === 'function') window.fbq('track', 'Contact');
    });
  });
  $$('[data-ev]:not([data-wa])').forEach(a => a.addEventListener('click', () => track(a.dataset.ev + '_click')));

  /* ---------- Redes sociais editáveis ---------- */
  $$('[data-net]').forEach(li => {
    const url = CONFIG.social[li.dataset.net];
    if (!url) return;
    const name = li.dataset.net.charAt(0).toUpperCase() + li.dataset.net.slice(1);
    li.innerHTML = '';
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = name;
    li.appendChild(a);
  });
  const yr = $('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Estrelas (avaliações reais) ---------- */
  const star = on => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.800l2.800 6 6.500.7-4.800 4.400 1.400 6.500L12 17.200 6.100 20.400l1.400-6.500L2.700 9.500l6.500-.7z" fill="' + (on ? '#1C1D20' : 'none') + '" stroke="#55585E" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  $$('.rev').forEach(r => {
    const n = Math.max(0, Math.min(5, parseInt(r.dataset.stars, 10) || 0));
    const box = $('.stars', r);
    box.innerHTML = [1, 2, 3, 4, 5].map(i => star(i <= n)).join('');
    if (n) box.setAttribute('aria-label', 'Nota ' + n + ' de 5');
  });

  /* ---------- Cabeçalho + menu mobile ---------- */
  const header = $('#header'), burger = $('#burger'), menu = $('#menu');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    document.body.classList.toggle('lock', open); document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.setAttribute('aria-hidden', String(!open));
  }
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.matchMedia('(min-width:960px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Reveal ao rolar ---------- */
  $$('[data-stagger]').forEach(g => $$('[data-reveal]', g).forEach((el, i) => el.style.setProperty('--d', Math.min(i * 0.09, 0.6).toFixed(2) + 's')));
  const els = $$('[data-reveal], .mask');
  if (reduced || !('IntersectionObserver' in window)) els.forEach(e => e.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Acordeão ---------- */
  $$('.acc__q').forEach(btn => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    $$('.acc__q').forEach(b => { b.setAttribute('aria-expanded', 'false'); b.closest('.acc__item').classList.remove('is-open'); });
    if (open) { btn.setAttribute('aria-expanded', 'true'); btn.closest('.acc__item').classList.add('is-open'); }
  }));

  /* ---------- Lightbox ---------- */
  const lb = $('#lb'), stage = $('[data-lb-stage]'), cap = $('[data-lb-cap]');
  let group = [], gi = 0, opener = null;
  function render() {
    const it = group[gi];
    stage.innerHTML = '';
    if (it.dataset.src) {
      const img = new Image(); img.src = it.dataset.src; img.alt = it.dataset.label || ''; stage.appendChild(img);
    } else {
      const d = document.createElement('div'); d.className = 'lb__ph'; d.textContent = 'Espaço para foto real: ' + (it.dataset.label || ''); stage.appendChild(d);
    }
    cap.textContent = it.dataset.label + '  ·  ' + (gi + 1) + '/' + group.length;
  }
  function openLb(el) {
    group = $$('[data-lb="' + el.dataset.lb + '"]'); gi = group.indexOf(el); opener = el;
    render(); lb.hidden = false; document.body.classList.add('lock'); $('[data-lb-close]').focus();
  }
  function closeLb() { lb.hidden = true; document.body.classList.remove('lock'); if (opener) opener.focus(); }
  const step = d => { gi = (gi + d + group.length) % group.length; render(); };
  $$('[data-lb]').forEach(el => el.addEventListener('click', () => openLb(el)));
  $('[data-lb-close]').addEventListener('click', closeLb);
  $('[data-lb-prev]').addEventListener('click', () => step(-1));
  $('[data-lb-next]').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.hidden) { if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); }
    else if (e.key === 'Escape') setMenu(false);
  });
  let tx = null;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); tx = null; });

  /* ---------- Cookies + Analytics (só com consentimento) ---------- */
  const bar = $('#cookie');
  const getConsent = () => { try { return localStorage.getItem('cookie-consent'); } catch (e) { return null; } };
  function loadScript(src) { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  function loadAnalytics() {
    if (window.__analytics) return; window.__analytics = true;
    if (CONFIG.ga4) {
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4);
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date()); window.gtag('config', CONFIG.ga4);
    }
    if (CONFIG.metaPixel) {
      /* Meta Pixel (código padrão) */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', CONFIG.metaPixel); window.fbq('track', 'PageView');
    }
  }
  function setConsent(v) { try { localStorage.setItem('cookie-consent', v); } catch (e) {} bar.hidden = true; if (v === 'yes') loadAnalytics(); }
  const c = getConsent();
  if (c === 'yes') loadAnalytics(); else if (!c) bar.hidden = false;
  $$('[data-cookie]').forEach(b => b.addEventListener('click', () => setConsent(b.dataset.cookie)));
  $$('[data-cookie-open]').forEach(b => b.addEventListener('click', () => { bar.hidden = false; }));
})();
