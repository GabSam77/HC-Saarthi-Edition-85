/* Saarthi · portfolio explorer. Uses the live CIOModel; no copied portfolio data. */
(() => {
  'use strict';
  const M = window.CIOModel;
  if (!M) return;

  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const known = M.known;
  const money = value => known(value) ? M.currency(value, 2) : 'Not entered';
  const percent = value => known(value) ? value.toLocaleString('en-IN', { maximumFractionDigits: 1 }) + '%' : '—';
  const reducedMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => Boolean(window.SaarthiMotion?.reduced?.() || reducedMedia.matches);
  const colors = {Operating: '#174f78', Income: '#347aa8', Strategic: '#799ab7', Family: '#bb3343'};
  const palette = ['#174f78', '#347aa8', '#799ab7', '#bb3343', '#638ab1', '#245f8b', '#9cb6c9', '#476f9a'];
  const maxBars = 8;
  const viewLabels = {asset: 'Assets', purpose: 'Purpose', city: 'Cities'};
  let dialog, returnFocus, restoreFocus = true, savedOverflow = '', items = [];
  let view = 'asset', page = 0, selected = null, animations = [], compactStage = false;

  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
  const closeIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  const chevron = direction => `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${direction === 'left' ? 'm14 6-6 6 6 6' : 'm10 6 6 6-6 6'}"/></svg>`;

  function rows() {
    if (view === 'asset') return M.state.assets.slice().sort((a, b) => M.amount(b) - M.amount(a)).map((asset, i) => ({key: asset.id, name: asset.name, value: M.amount(asset), color: colors[asset.purpose] || palette[i % palette.length], assets: [asset], purpose: asset.purpose}));
    return M.groups(view).map((group, i) => ({key: group.name, name: group.name, value: group.value, color: view === 'purpose' ? colors[group.name] || palette[i % palette.length] : palette[i % palette.length], assets: M.state.assets.filter(asset => group.assets.includes(asset.id))}));
  }

  function create() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.id = 'saarthi-immersive';
    dialog.className = 'im-dialog';
    dialog.setAttribute('aria-labelledby', 'im-title');
    dialog.setAttribute('aria-describedby', 'im-basis');
    document.body.appendChild(dialog);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', cleanup);
    dialog.addEventListener('click', event => {
      const control = event.target.closest('[data-im-action]');
      if (!control) return;
      const action = control.dataset.imAction;
      if (action === 'close') close();
      if (action === 'view') {
        view = control.dataset.imView;
        page = 0;
        selected = null;
        render(false);
        dialog.querySelector(`[data-im-view="${view}"]`)?.focus({preventScroll: true});
      }
      if (action === 'select') select(control.dataset.imKey);
      if (action === 'previous' || action === 'next') {
        page += action === 'next' ? 1 : -1;
        selected = null;
        render(false);
        dialog.querySelector('.im-select-row')?.focus({preventScroll: true});
      }
      if (action === 'asset') openAsset(control.dataset.imId);
      if (action === 'add') {
        close(false);
        navigatePortfolio();
        document.querySelector('.cio-heading-actions [data-cio="add"]')?.click();
      }
    });
    dialog.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('g[data-im-action="select"]')) {
        event.preventDefault();
        select(event.target.dataset.imKey);
      }
    });
  }

  function open(mode = 'portfolio') {
    if (mode !== 'portfolio') return;
    create();
    if (dialog.open) return;
    returnFocus = document.activeElement;
    restoreFocus = true;
    view = 'asset';
    page = 0;
    selected = null;
    savedOverflow = document.documentElement.style.overflow;
    render(true);
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector('.im-close').focus({preventScroll: true});
  }

  function stopMotion() {
    animations.forEach(animation => animation.cancel());
    animations = [];
  }

  function close(restore = true) {
    if (!dialog?.open) return;
    restoreFocus = restore;
    stopMotion();
    dialog.close();
    document.documentElement.style.overflow = savedOverflow;
  }

  function cleanup() {
    stopMotion();
    document.documentElement.style.overflow = savedOverflow;
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
  }

  function navigatePortfolio() {
    if (window.location.hash !== '#portfolio') window.history.pushState(null, '', '#portfolio');
    window.render?.();
  }

  function openAsset(id) {
    if (!M.state.assets.some(asset => asset.id === id)) return;
    close(false);
    navigatePortfolio();
    window.CIOPortfolio?.assetDetail(id);
  }

  function niceScale(max) {
    if (!(max > 0)) return {step: 1, top: 4};
    const rough = max / 4;
    const exponent = 10 ** Math.floor(Math.log10(rough));
    const factor = rough / exponent;
    const step = (factor <= 1 ? 1 : factor <= 2 ? 2 : factor <= 2.5 ? 2.5 : factor <= 5 ? 5 : 10) * exponent;
    return {step, top: Math.ceil(max / step) * step};
  }

  function tint(hex, amount) {
    const rgb = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
    return '#' + rgb.map(n => Math.round(amount > 0 ? n + (255 - n) * amount : n * (1 + amount)).toString(16).padStart(2, '0')).join('');
  }

  function skyline(visible) {
    const width = compactStage ? 600 : 980, height = compactStage ? 420 : 482;
    const left = compactStage ? 60 : 85, right = width - (compactStage ? 30 : 58);
    const ground = compactStage ? 318 : 370, chartHeight = compactStage ? 215 : 255;
    const axisX = compactStage ? 35 : 48, gridStart = ground - 40;
    // The same vertical scale is used for every page within a grouping.
    const scale = niceScale(Math.max(0, ...items.map(item => known(item.value) ? item.value : 0)));
    const count = visible.length;
    const spacing = Math.min(121, (right - left) / Math.max(count, 1));
    const barWidth = Math.min(61, spacing * .5), depthX = compactStage ? 11 : 21, depthY = compactStage ? 9 : 15;
    const start = left + ((right - left) - spacing * count) / 2 + spacing * .17;
    let ticks = '';
    for (let value = 0; value <= scale.top + scale.step / 100; value += scale.step) {
      const y = ground - value / scale.top * chartHeight;
      const label = value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
      ticks += `<g class="im-axis-row"><path d="M${axisX + 17} ${y}H${width - 18}"/><text x="${axisX}" y="${y + 4}" text-anchor="end">${label}</text></g>`;
    }
    let grid = '';
    for (let x = -310; x < width + 250; x += 78) grid += `<path d="M${x} ${height - 17}l185-132"/>`;
    for (let y = gridStart + 10; y < height; y += 24) grid += `<path d="M0 ${y}H${width}"/>`;
    const bars = visible.map((item, index) => {
      const x = start + index * spacing, barHeight = Math.max(0, item.value) / scale.top * chartHeight;
      const top = ground - barHeight, cx = x + barWidth / 2 + depthX / 2;
      const active = item.key === selected;
      const ordinal = String(page * maxBars + index + 1).padStart(2, '0');
      const id = 'im-pillar-' + index;
      const numberLabel = item.value.toLocaleString('en-IN', { maximumFractionDigits: item.value < 10 ? 1 : 0 });
      let facade = '';
      for (let floor = ground - 15; floor > top + 8; floor -= 17) facade += `<path d="M${x + 4} ${floor}H${x + barWidth - 4}"/>`;
      for (let column = x + 13; column < x + barWidth - 4; column += 13) facade += `<path d="M${column} ${ground - 5}V${top + 7}"/>`;
      return `<g class="im-bar${active ? ' is-selected' : ''}" data-im-action="select" data-im-key="${escape(item.key)}" role="button" tabindex="0" aria-pressed="${active}" aria-label="${escape(item.name)}: attributable value ${escape(money(item.value))}" style="--im-bar-color:${item.color}">
        <title>${escape(item.name)} · ${escape(money(item.value))}</title>
        <path class="im-foundation" d="M${x - 9} ${ground + 7}l${depthX + 9} -${depthY + 8}h${barWidth + 17}l-${depthX + 9} ${depthY + 8}Z"/>
        <path class="im-bar-shadow" d="M${x} ${ground}h${barWidth}l68 43h-${barWidth}Z"/>
        <g class="im-rise" style="--im-index:${index}">
          <defs><linearGradient id="${id}" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="${item.color}" stop-opacity=".9"/><stop offset="1" stop-color="${tint(item.color, -.62)}" stop-opacity=".72"/></linearGradient></defs>
          <path class="im-front" d="M${x} ${top}h${barWidth}V${ground}h-${barWidth}Z" fill="url(#${id})"/>
          <path class="im-side" d="M${x + barWidth} ${top}l${depthX} -${depthY}v${barHeight}l-${depthX} ${depthY}Z" fill="${tint(item.color, -.55)}"/>
          <path class="im-roof" d="M${x} ${top}l${depthX} -${depthY}h${barWidth}l-${depthX} ${depthY}Z" fill="${tint(item.color, .15)}"/>
          <g class="im-facade">${facade}</g>
          <path class="im-edge" d="M${x} ${ground}V${top}h${barWidth}l${depthX} -${depthY}"/>
        </g>
        <text class="im-bar-value" x="${cx}" y="${top - depthY - 19}" text-anchor="middle">${numberLabel}</text>
        <path class="im-label-line" d="M${cx} ${ground + 10}v19"/>
        <text class="im-bar-number" x="${cx}" y="${ground + 50}" text-anchor="middle">${ordinal}</text>
        <circle class="im-selection-dot" cx="${cx}" cy="${ground + 69}" r="3"/>
      </g>`;
    }).join('');

    return `<svg class="im-skyline" viewBox="0 0 ${width} ${height}" style="aspect-ratio:${width}/${height}" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Attributable property value in crore rupees. Every pillar uses the same vertical value scale. Select a pillar or its named control below.">
      <defs><linearGradient id="im-ground-fade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#699aaf" stop-opacity=".08"/><stop offset="1" stop-color="#699aaf" stop-opacity="0"/></linearGradient><clipPath id="im-ground-clip"><rect x="0" y="${gridStart}" width="${width}" height="${height - gridStart}"/></clipPath></defs>
      <path d="M0 ${gridStart + 3}H${width}V${height}H0Z" fill="url(#im-ground-fade)"/>
      <g class="im-ground-grid" clip-path="url(#im-ground-clip)">${grid}</g>
      <text class="im-unit" x="${axisX}" y="${ground - chartHeight - 33}" text-anchor="end">₹ cr</text>
      <g class="im-axis">${ticks}</g>
      ${bars}
    </svg>`;
  }

  function detail(item) {
    if (!item) return `<div class="im-empty-detail"><span class="im-detail-eyebrow">MY PORTFOLIO</span><h2>Your assets will appear here.</h2><p>Add a property to explore its value, debt and cash requirements.</p><button class="im-primary" data-im-action="add">Add asset ${arrow}</button></div>`;
    const report = M.aggregate(item.assets), total = M.aggregate().value;
    const share = total > 0 ? report.value / total * 100 : null;
    const asset = view === 'asset' ? item.assets[0] : null;
    const index = items.findIndex(row => row.key === item.key) + 1;
    const metrics = asset
      ? [['Attributable debt', money(asset.debt)], ['Net annual cash', money(report.cash)], ['Owned interest', percent(asset.share)], ['Portfolio share', percent(share)]]
      : [['Attributable debt', money(report.debt)], ['Net annual cash', money(report.cash)], ['Assets', String(item.assets.length)], ['Portfolio share', percent(share)]];
    const facts = asset
      ? [['Owned through', asset.entity || 'Not entered'], ['Current decision', asset.decision || 'Not entered'], ['Required authority', asset.approver || 'Not entered'], ['Disposal restriction', asset.restriction || 'Not entered']]
      : [];
    return `<div class="im-detail-content" style="--im-selected-color:${item.color}">
      <div class="im-detail-head"><span class="im-detail-eyebrow">${view === 'asset' ? 'ASSET' : view === 'purpose' ? 'PURPOSE' : 'CITY'} / ${String(index).padStart(2, '0')}</span><i class="im-detail-dot" aria-hidden="true"></i></div>
      <h2>${escape(item.name)}</h2>
      <p class="im-detail-subtitle">${asset ? escape(asset.city) + ' <span>·</span> ' + escape(asset.type) + ' <span>·</span> ' + escape(asset.purpose) : item.assets.length + (item.assets.length === 1 ? ' property interest' : ' property interests')}</p>
      <div class="im-detail-capital"><strong>${money(report.value)}</strong><span>Attributable value</span></div>
      <div class="im-detail-metrics">${metrics.map(([label, value]) => `<div><span>${label}</span><strong class="${label === 'Net annual cash' && report.cash < 0 ? 'im-cash-negative' : ''}">${escape(value)}</strong></div>`).join('')}</div>
      ${asset ? `<dl class="im-facts">${facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl><button class="im-primary" data-im-action="asset" data-im-id="${escape(asset.id)}">Open asset ${arrow}</button>` : `<div class="im-group-assets"><span class="im-detail-eyebrow">ASSET DETAILS</span>${item.assets.slice().sort((a, b) => M.amount(b) - M.amount(a)).map(a => `<button data-im-action="asset" data-im-id="${escape(a.id)}"><span>${escape(a.name)}<small>${escape(a.city)} · ${escape(a.purpose)}</small></span><b>${money(M.amount(a))}</b>${arrow}</button>`).join('')}</div>`}
      ${report.unknown ? `<p class="im-incomplete">${report.unknown} ${report.unknown === 1 ? 'asset has' : 'assets have'} missing financial inputs. Unknown amounts are not treated as zero.</p>` : ''}
    </div>`;
  }

  function select(key) {
    const item = items.find(row => row.key === key);
    if (!item) return;
    selected = key;
    dialog.querySelectorAll('[data-im-action="select"]').forEach(control => {
      const active = control.dataset.imKey === selected;
      control.classList.toggle('is-selected', active);
      control.setAttribute('aria-pressed', String(active));
    });
    const panel = dialog.querySelector('.im-detail');
    panel.innerHTML = detail(item);
    dialog.querySelector('.im-selection-status').textContent = `${item.name}. Attributable value ${money(item.value)}.`;
    if (!reduced() && typeof panel.animate === 'function') animations.push(panel.animate([{opacity: .25, transform: 'translateY(7px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 220, easing: 'ease-out'}));
    if (window.matchMedia('(max-width:760px)').matches) panel.scrollIntoView({behavior: reduced() ? 'auto' : 'smooth', block: 'start'});
  }

  function render(opening) {
    stopMotion();
    compactStage = window.matchMedia('(max-width:470px)').matches;
    items = rows();
    page = Math.max(0, Math.min(page, Math.max(0, Math.ceil(items.length / maxBars) - 1)));
    const visible = items.slice(page * maxBars, (page + 1) * maxBars);
    if (!visible.some(row => row.key === selected)) selected = visible[0]?.key ?? null;
    const total = M.aggregate();
    const group = items.find(row => row.key === selected);
    const sample = M.state.sample ? 'Portfolio data' : 'Portfolio data';
    const date = M.state.asOf ? new Date(M.state.asOf + 'T12:00:00').toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : '';
    dialog.innerHTML = `<div class="im-shell">
      <header class="im-header"><div class="im-brand-lockup"><span class="im-wordmark im-logo-lockup"><img src="assets/hdfc-capital-original.png" alt="HDFC Capital"><span>SAARTHI</span></span><span class="im-header-divider"></span><h1 id="im-title">Portfolio explorer</h1></div><button class="im-close" data-im-action="close" aria-label="Close portfolio explorer">${closeIcon}<span>Close</span></button></header>
      <div class="im-context im-entrance"><div class="im-portfolio-total"><span class="im-eyebrow">ATTRIBUTABLE PROPERTY VALUE</span><strong>${money(total.value)}</strong><p>${escape(M.state.name)} <span>·</span> ${escape(date)}</p></div><div class="im-context-metrics"><div><span>Property interests</span><strong>${total.count}</strong></div><div><span>Attributable debt</span><strong>${money(total.debt)}</strong></div><div><span>Net annual cash</span><strong class="${total.cash < 0 ? 'im-cash-negative' : ''}">${money(total.cash)}</strong></div></div></div>
      <div class="im-body">
        <section class="im-visual" aria-label="Capital landscape">
          <div class="im-chart-tools im-entrance"><div class="im-segments" role="group" aria-label="Group portfolio">${Object.entries(viewLabels).map(([key, label]) => `<button data-im-action="view" data-im-view="${key}" aria-pressed="${view === key}" class="${view === key ? 'is-selected' : ''}">${label}</button>`).join('')}</div><span class="im-scale-note"><i></i>Height = attributable value</span></div>
          <div class="im-stage">${visible.length ? skyline(visible) : '<div class="im-empty-stage"><svg viewBox="0 0 160 100" aria-hidden="true"><path d="m20 72 58-33 62 35-60 32ZM48 57V28l31-18 31 18v30M79 10v76M48 28l31 18 31-18"/></svg><h2>No assets to display</h2><p>Add an asset to build your capital landscape.</p></div>'}</div>
          <div class="im-selection-heading"><span>${view === 'asset' ? 'SELECT AN ASSET' : view === 'purpose' ? 'SELECT A PURPOSE' : 'SELECT A CITY'}</span><span>${items.length ? `${page * maxBars + 1}–${Math.min((page + 1) * maxBars, items.length)} of ${items.length}` : '0 assets'} · by value</span></div>
          <div class="im-selection-list" role="group" aria-label="${view === 'asset' ? 'Assets' : view === 'purpose' ? 'Purpose groups' : 'City groups'} in this chart">${visible.map((item, index) => `<button class="im-select-row${item.key === selected ? ' is-selected' : ''}" data-im-action="select" data-im-key="${escape(item.key)}" aria-pressed="${item.key === selected}" style="--im-bar-color:${item.color}"><span class="im-select-number">${String(page * maxBars + index + 1).padStart(2, '0')}</span><span class="im-select-name">${escape(item.name)}<small>${view === 'asset' ? escape(item.assets[0].city) : `${item.assets.length} ${item.assets.length === 1 ? 'asset' : 'assets'}`}</small></span><span class="im-select-value">${money(item.value)}</span></button>`).join('')}</div>
          ${items.length > maxBars ? `<div class="im-pagination"><button data-im-action="previous" ${page === 0 ? 'disabled' : ''}>${chevron('left')}Previous</button><span>Page ${page + 1} / ${Math.ceil(items.length / maxBars)}</span><button data-im-action="next" ${(page + 1) * maxBars >= items.length ? 'disabled' : ''}>Next${chevron('right')}</button></div>` : ''}
        </section>
        <aside class="im-detail im-entrance" aria-label="Selected property or group">${detail(group)}</aside>
      </div>
      <footer class="im-footer"><span class="im-data-state"><i></i>${sample}</span><p id="im-basis">Value = whole-property value × owned share. Debt and cash inputs are already attributable. Net cash includes principal and committed spend; excludes tax.</p></footer>
      <div class="im-selection-status" role="status" aria-live="polite"></div>
    </div>`;
    animate(opening);
  }

  function animate(opening) {
    if (reduced() || typeof Element.prototype.animate !== 'function') return;
    dialog.querySelectorAll('.im-rise').forEach((node, i) => animations.push(node.animate([{transform: 'scaleY(.015)', opacity: .15}, {transform: 'scaleY(1)', opacity: 1}], {duration: opening ? 640 : 430, delay: Math.min(i * 25, 175), easing: 'cubic-bezier(.18,.75,.24,1)'})));
    dialog.querySelectorAll('.im-bar-value').forEach((node, i) => animations.push(node.animate([{opacity: 0, transform: 'translateY(8px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 300, delay: Math.min(i * 25, 175) + 280, easing: 'ease-out', fill: 'backwards'})));
    if (opening) dialog.querySelectorAll('.im-entrance').forEach((node, i) => animations.push(node.animate([{opacity: .2, transform: 'translateY(12px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 410, delay: i * 45, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards'})));
  }

  reducedMedia.addEventListener?.('change', () => { if (reduced()) stopMotion(); });
  window.addEventListener('saarthi-motion-change', () => { if (reduced()) stopMotion(); });
  window.addEventListener('resize', () => {
    if (dialog?.open && compactStage !== window.matchMedia('(max-width:470px)').matches) render(false);
  });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-immersive="portfolio"]');
    if (!trigger) return;
    event.preventDefault();
    open('portfolio');
  });
  window.SaarthiImmersive = {open, close};
})();
