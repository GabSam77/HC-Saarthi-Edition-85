/* Shared progressive enhancements. */
(() => {
  'use strict';
  const app = document.getElementById('app');
  if (!app || !window.Saarthi) return;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualReduce = false;
  try { manualReduce = localStorage.getItem('saarthi-motion') === 'reduce'; } catch {}
  const reduced = () => manualReduce || media.matches;
  window.SaarthiMotion = { reduced };
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18V9l5-3v12M9 18V4l6 3v11M15 18v-7l5 3v4M2 20h20" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const expand = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h11v11M19 5 5 19" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const tabs = {
    overview: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    assets: 'M3 21V7l8-4v18M11 10h10v11M6 9h2M6 13h2M6 17h2M15 13h2M15 17h2',
    cash: 'M3 4v16h18M6 15l4-5 4 3 6-8',
    scenarios: 'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',
    risk: 'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM12 8v5M12 16h.01'
  };
  const purposeImages = { Operating: 'research3.jpg', Income: 'service1.jpg', Strategic: 'research2.jpg', Family: 'research1.jpg' };
  if (window.CIOModel) Object.assign(window.CIOModel.colors, { Operating: '#174f78', Income: '#347aa8', Strategic: '#7797b3', Family: '#b62d3c' });
  let stageTimer = 0;
  let decorationQueued = false;
  let lastView = '';
  const seen = new WeakSet();
  let intersection = null;
  const activeAnimations = new Set();

  function animate(el, i = 0) {
    if (reduced() || !el.animate || !el.isConnected) return;
    const a = el.animate(
      [{ opacity: 0, transform: 'translateY(19px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 390, delay: Math.min(i * 42, 126), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }
    );
    activeAnimations.add(a);
    a.onfinish = a.oncancel = () => activeAnimations.delete(a);
  }
  if ('IntersectionObserver' in window) {
    intersection = new IntersectionObserver(entries => {
      let i = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        intersection.unobserve(entry.target);
        animate(entry.target, i++);
      });
    }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
  }
  function setMotion() {
    document.documentElement.dataset.motion = reduced() ? 'reduced' : 'full';
    const toggle = document.querySelector('.hx-motion-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(reduced()));
      toggle.setAttribute('aria-label', reduced() ? 'Reduced motion enabled. Toggle animation preference' : 'Reduce animation');
      toggle.title = reduced() ? 'Reduced motion' : 'Animation on';
      const label = toggle.querySelector('span');
      if (label) label.textContent = reduced() ? 'Motion reduced' : 'Motion on';
    }
    if (reduced()) {
      activeAnimations.forEach(a => a.cancel());
      document.getAnimations?.().forEach(a => a.cancel());
      stage?.classList.remove('is-running');
      stage?.getAnimations?.({subtree:true}).forEach(a => a.cancel());
    }
    window.dispatchEvent(new Event('saarthi-motion-change'));
  }
  const header = document.querySelector('.header-label');
  if (header) {
    header.innerHTML = '<span class="avatar" aria-label="Family office workspace">FO</span>';
  }
  const stage = document.createElement('div');
  stage.className = 'hx-stage';
  stage.setAttribute('aria-hidden', 'true');
  stage.innerHTML = [0, 1, 2, 3, 4].map(i => '<div class="hx-shutter" style="--i:' + i + '"></div>').join('') + '<div class="hx-stage-title"><small>HDFC CAPITAL · SAARTHI</small><span></span></div>';
  document.body.append(stage);
  function transitionTo(page) {
    return; // Navigation is immediate. Full-screen explorer remains opt-in.
    if (reduced() || document.querySelector('dialog[open]')) return;
    const labels = { portfolio: 'My Portfolio', opportunities: 'Opportunities', services: 'Services' };
    if (!labels[page]) return;
    clearTimeout(stageTimer);
    stage.classList.remove('is-running');
    stage.getAnimations?.({subtree:true}).forEach(a => a.cancel());
    stage.querySelector('.hx-stage-title > span').textContent = labels[page];
    requestAnimationFrame(() => {
      if (!reduced()) stage.classList.add('is-running');
      stageTimer = setTimeout(() => {
        stage.classList.remove('is-running');
        stage.getAnimations?.({subtree:true}).forEach(a => a.cancel());
      }, 910);
    });
  }
  document.addEventListener('click', ev => {
    const toggle = ev.target.closest('.hx-motion-toggle');
    if (toggle) {
      if (media.matches) { window.toast('Reduced motion follows your device setting.'); return; }
      manualReduce = !manualReduce;
      try { localStorage.setItem('saarthi-motion', manualReduce ? 'reduce' : 'full'); } catch {}
      setMotion();
      return;
    }
    const link = ev.target.closest('#navigation a, a.brand');
    if (!link || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button) return;
    const href = link.getAttribute('href');
    if (href?.startsWith('#') && href.slice(1) !== window.Saarthi.ui.page) transitionTo(href.slice(1));
  }, true);
  media.addEventListener?.('change', setMotion);

  function decoratePortfolio() {
    const container = app.querySelector('.cio');
    if (!container) return;
    const actions = container.querySelector('.cio-heading-actions');
    if (false) {
      actions.insertAdjacentHTML('afterbegin', '<button type="button" class="cio-button secondary hx-explore-button" data-immersive="portfolio">' + icon + '<span>Explore portfolio</span>' + expand + '</button>');
    }
    container.querySelectorAll('.cio-tab').forEach(el => {
      const path = tabs[el.dataset.tab];
      if (!path || el.querySelector('.hx-tab-icon')) return;
      el.insertAdjacentHTML('afterbegin', '<svg class="hx-tab-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="' + path + '"/></svg>');
    });
    const strip = container.querySelector('.cio-purpose-strip');
    if (strip && !strip.previousElementSibling?.classList.contains('hx-purpose-heading')) {
      strip.insertAdjacentHTML('beforebegin', '<div class="hx-purpose-heading"><h2>Holdings by purpose</h2><span>Select to view assets</span></div>');
    }
    container.querySelectorAll('.cio-purpose').forEach(el => {
      const src = purposeImages[el.dataset.purpose];
      if (!src || el.querySelector('.hx-purpose-photo')) return;
      el.insertAdjacentHTML('afterbegin', '<span class="hx-purpose-photo"><img src="assets/' + src + '" alt="" loading="lazy" decoding="async"></span>');
    });
  }
  function decorate() {
    decorationQueued = false;
    decoratePortfolio();
    const current = app.dataset.page + ':' + (app.querySelector('[data-cio-view]')?.dataset.cioView || '');
    const changed = current !== lastView;
    lastView = current;
    if (!app.querySelector('.hx-footer')) {
      app.insertAdjacentHTML('beforeend', '<footer class="hx-footer"><span>HC SAARTHI</span><span>© HDFC Capital Advisors Limited</span></footer>');
    }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    const nodes = app.querySelectorAll('[data-hx-reveal], .cio-purpose-strip, .cio-capital-surface');
    let count = 0;
    nodes.forEach(el => {
      if (seen.has(el)) return;
      seen.add(el);
      if (typing || reduced()) return;
      if (intersection) intersection.observe(el);
      else if (changed) animate(el, count++);
    });
  }
  const observer = new MutationObserver(() => {
    if (decorationQueued) return;
    decorationQueued = true;
    requestAnimationFrame(decorate);
  });
  observer.observe(app, { childList: true, subtree: true });
  const previousRender = window.render;
  window.render = function () { previousRender(); decorate(); };
  window.Saarthi.render = window.render;
  window.HybridExperience = { decorate, transitionTo, version: '13.1' };
  setMotion();
  window.render();
})();
