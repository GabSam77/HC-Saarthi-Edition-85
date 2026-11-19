/* HC Saarthi · editorial opportunity and service workspaces.
 * Classic script: loaded after functional.js and before the shared Hybrid shell.
 * Keeps the original records, filters, request workflows and delegated actions.
 */
(function () {
  'use strict';

  const hxServiceOpen = new Set([0]);
  let hxDossierOrigin = null;
  const hxArrow = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
  const hxChevron = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const hxTerm = d => d.cat === 3 ? 'Lease remaining' : d.cat === 1 ? 'Target delivery' : 'Indicative tenure';
  const hxSize = d => [1, 2, 3, 4].includes(d.cat) ? 'Asset / allocation' : 'Issue / project size';
  const hxServiceIcons = ['services', 'residential', 'file', 'chart'];
  const hxServiceShort = ['Tenants, facilities & upkeep', 'Design, works & delivery', 'Documents, title & succession', 'Pricing, acquisition & disposal'];

  function hxMetric(label, value, accent) {
    return '<div' + (accent ? ' class="hx-deal-metric-accent"' : '') + '><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
  }

  function hxSave(d, textLabel) {
    const active = saved.has(d.id);
    return '<button class="' + (textLabel ? 'btn light hx-deal-save-label' : 'icon-button hx-deal-save') + (active ? ' saved' : '') + '" data-save="' + d.id + '" aria-pressed="' + active + '" aria-label="' + (active ? 'Unsave' : 'Save') + ' ' + d.id + '">' + icon('bookmark') + (textLabel ? '<span data-hx-save-label>' + (active ? 'Saved' : 'Save opportunity') + '</span>' : '') + '</button>';
  }

  function hxFeature(d) {
    const place = d.name.split(' · ')[0];
    return '<section class="hx-op-feature" aria-label="Featured opportunity" data-hx-reveal>' +
      '<figure class="hx-op-photo"><img src="assets/' + esc(d.image) + '" alt="Architecture" width="1400" height="788" fetchpriority="high"><figcaption><span>' + icon(categories[d.cat].icon) + 'Representative image</span><span>' + esc(d.id) + '</span></figcaption></figure>' +
      '<div class="hx-op-feature-copy"><div class="hx-op-eyebrow">IN FOCUS <span> / </span>' + esc(categories[d.cat].short) + '</div><h2>' + esc(place) + '</h2><p>' + esc(d.structure) + '</p>' +
      '<div class="hx-op-feature-metrics">' + hxMetric('Minimum ticket', money(d.ticket)) + hxMetric(d.metricLabel, d.metricText, true) + '</div>' +
      '<div class="hx-op-feature-bottom"><button class="btn" data-detail="' + d.id + '">View details ' + hxArrow + '</button><span>' + esc(d.city) + ' <i>·</i> ' + esc(d.tenureText) + '</span></div></div></section>';
  }

  dealCard = function (d) {
    return '<article class="hx-deal-entry" data-record="' + d.id + '" aria-labelledby="deal-title-' + d.id + '">' +
      '<button class="hx-deal-photo" data-detail="' + d.id + '" aria-label="View ' + esc(d.name) + '"><img src="assets/' + esc(d.image) + '" alt="" width="280" height="270" loading="lazy"></button>' +
      '<div class="hx-deal-intro"><div class="hx-deal-meta"><span>' + esc(categories[d.cat].short) + '</span><span>' + esc(d.id) + '</span></div><h2 id="deal-title-' + d.id + '"><button data-detail="' + d.id + '">' + esc(d.name) + '</button></h2><p>' + esc(d.structure) + '</p></div>' +
      '<div class="hx-deal-metrics">' + hxMetric('Minimum ticket', money(d.ticket)) + hxMetric(d.metricLabel, d.metricText, true) + hxMetric(hxTerm(d), d.tenureText) + hxMetric(hxSize(d), d.size) + '</div>' +
      '<div class="hx-deal-footer"><div class="hx-deal-location">' + statusPill(d.status) + '<span>' + icon('map') + esc(d.city) + '</span></div><div class="hx-deal-actions"><label class="compare-check"><input type="checkbox" data-compare="' + d.id + '" aria-label="Compare ' + d.id + '" ' + (ui.compare.has(d.id) ? 'checked' : '') + '>Compare</label>' + hxSave(d, false) + '<button class="hx-deal-detail-button" data-detail="' + d.id + '">View details ' + hxArrow + '</button></div></div></article>';
  };

  opportunityPage = function () {
    const ds = filteredDeals();
    const shown = ds.slice(0, ui.visibleDeals);
    const myRequests = requests.filter(r => r.kind !== 'service' && r.status !== 'Cancelled');
    const filterCount = [ui.city, ui.ticket, ui.status].filter(Boolean).length;
    // The visual entry point always agrees with the current filtered register.
    const featured = ds[0];
    let html = '<div class="hx-op-page">' + pageHead('Opportunities', '<button class="btn light" data-action="mandate">' + icon('plus') + '<span>Submit opportunity</span></button>');
    html += '<div class="hx-op-summary"><span><strong>' + deals.filter(d=>d.cat!==0).length + '</strong> investment opportunities</span><span><strong>' + categories.length + '</strong> categories</span><span><strong>' + new Set(deals.map(d => d.city)).size + '</strong> cities</span><span class="hx-op-summary-note">10 developer references · 8 investment opportunities</span></div>';
    html += '<div class="hx-op-viewbar" role="group" aria-label="Opportunity views">' + [['available', 'Available', deals.length], ['saved', 'Saved', saved.size], ['enquiries', 'My enquiries', myRequests.length]].map(([v, label, n]) => '<button data-op-view="' + v + '" class="' + (ui.opView === v ? 'active' : '') + '" aria-pressed="' + (ui.opView === v) + '">' + label + '<span>' + n + '</span></button>').join('') + '</div>';

    if (ui.opView === 'enquiries') {
      return html + '<section class="hx-op-enquiries" data-hx-reveal><div class="hx-op-section-heading"><h2>Enquiry & mandate drafts</h2><span>Saved drafts</span></div>' + requestList('opportunity') + '</section></div>';
    }

    html += '<div class="hx-op-categories" role="group" aria-label="Opportunity categories"><button class="' + (ui.cat === -1 ? 'active' : '') + '" data-cat="-1" aria-pressed="' + (ui.cat === -1) + '">All<span>' + deals.length + '</span></button>' + categories.map((c, i) => '<button class="' + (ui.cat === i ? 'active' : '') + '" data-cat="' + i + '" aria-pressed="' + (ui.cat === i) + '" aria-label="' + esc(c.name) + '">' + icon(c.icon) + esc(c.short) + '<span>' + deals.filter(d => d.cat === i).length + '</span></button>').join('') + '</div>';
    if (ui.opView === 'available' && featured) html += hxFeature(featured);
    html += '<section class="hx-op-controls" aria-label="Filter and sort opportunities"><div class="hx-op-toolbar"><div class="searchbox">' + icon('search') + '<input id="deal-search" type="search" aria-label="Search opportunities" placeholder="City, opportunity or ID" value="' + esc(ui.query) + '"></div><div class="hx-op-desktop-filters"><select id="city-filter" aria-label="Filter location">' + options(cityNames, ui.city, 'All locations') + '</select><select id="ticket-filter" aria-label="Maximum minimum ticket">' + options([[1, 'Up to ₹1 cr'], [5, 'Up to ₹5 cr'], [10, 'Up to ₹10 cr'], [25, 'Up to ₹25 cr']], ui.ticket, 'Any ticket size') + '</select><select id="status-filter" aria-label="Filter status">' + options(['Open', 'Limited', 'Review', 'Upcoming'], ui.status, 'All statuses') + '</select></div><button class="btn light hx-op-filter-button" data-action="filters" aria-label="Open filters">' + icon('filter') + '<span>Filters' + (filterCount ? ' (' + filterCount + ')' : '') + '</span></button><button class="icon-button" data-action="export-deals" aria-label="Export all filtered opportunities as CSV">' + icon('download') + '</button></div>' + filterChips();
    html += '<div class="hx-op-result-bar"><span id="opportunity-count" role="status">' + (ds.length ? 'Showing <strong>' + shown.length + '</strong> of <strong>' + ds.length + '</strong>' : '0 opportunities') + '</span><div class="hx-op-result-controls"><select id="deal-sort" aria-label="Sort opportunities">' + options([['default', 'Default order'], ['ticket-asc', 'Ticket: low to high'], ['ticket-desc', 'Ticket: high to low'], ['name', 'Name: A to Z']], ui.sort) + '</select><div class="hx-op-layout" role="group" aria-label="Opportunity layout"><button data-layout="cards" aria-pressed="' + (ui.layout === 'cards') + '" class="' + (ui.layout === 'cards' ? 'active' : '') + '" aria-label="Image list view">' + icon('file') + '</button><button data-layout="table" aria-pressed="' + (ui.layout === 'table') + '" class="' + (ui.layout === 'table' ? 'active' : '') + '" aria-label="Compact table view">' + icon('filter') + '</button></div></div></div></section>';

    if (ui.cat === 5) html += '<div class="notice">Coupons are annual and are not yield to maturity.</div>';
    if (ds.length) {
      html += ui.layout === 'cards' ? '<div class="hx-op-results" id="opportunity-results" data-hx-reveal>' + shown.map(dealCard).join('') + '</div>' : '<div class="opportunity-table-wrap hx-op-table" id="opportunity-results"><table class="op-table"><thead><tr><th>Opportunity</th><th>Location</th><th>Min. ticket</th><th>Key metric</th><th>Term</th><th>Status</th><th>Compare / save</th></tr></thead><tbody>' + shown.map(dealRow).join('') + '</tbody></table></div>';
      html += '<div class="hx-op-pagination"><span>' + shown.length + ' of ' + ds.length + ' opportunities</span><div>' + (shown.length < ds.length ? '<button class="btn light" data-action="show-more-deals" aria-controls="opportunity-results">Show ' + Math.min(3, ds.length - shown.length) + ' more ' + hxArrow + '</button>' : '') + (shown.length > 3 ? '<button class="text-button" data-action="show-fewer-deals" aria-controls="opportunity-results">Show fewer</button>' : '') + '</div></div>';
    } else {
      html += '<div class="empty hx-op-empty">' + icon('search') + '<h3>' + (ui.opView === 'saved' && !saved.size ? 'No saved opportunities' : 'No matching opportunities') + '</h3><p>' + (ui.opView === 'saved' && !saved.size ? 'Use the bookmark beside any opportunity.' : 'Try a different location, ticket size or search.') + '</p><button class="btn light" data-action="reset-filters">Reset filters</button></div>';
    }
    return html + '<p class="hx-op-footnote">Images are representative. Target IRR, rental yield, coupons and property prices use different bases. Returns are not assured.</p></div>';
  };

  servicesPage = function () {
    const query = ui.serviceQuery.trim().toLowerCase();
    const totalServices = serviceGroups.reduce((sum, group) => sum + group[1].length, 0);
    const active = requests.filter(r => r.kind === 'service' && r.status !== 'Cancelled').length;
    const matchingCount = serviceGroups.reduce((sum, [title, items]) => sum + items.filter(n => (n + ' ' + title).toLowerCase().includes(query)).length, 0);
    let html = '<div class="hx-service-page">' + pageHead('Services', '<button class="btn" data-action="new-service">' + icon('plus') + 'Submit Request</button>');
    html += '<section class="hx-service-lead" data-hx-reveal><figure><img src="assets/service1.jpg" alt="Commercial interior" width="1400" height="788"><figcaption>Representative image</figcaption></figure><div class="hx-service-lead-copy"><span class="hx-op-eyebrow">' + totalServices + ' SERVICES ACROSS ' + serviceGroups.length + ' AREAS</span><h2>Property services, organised.</h2><p class="hx-service-lead-note">Choose a service and subtype, link a property, then submit your request.</p></div></section>';
    html += '<div class="hx-service-quick" aria-label="Frequently requested services"><span class="hx-service-quick-label">QUICK START</span>' + [['Valuation','chart'],['Title review','file'],['Rental services','residential'],['Facility management','services']].map(([name, symbol]) => '<button type="button" data-service="' + esc(name) + '">' + icon(symbol) + '<span>' + esc(name) + '</span>' + hxArrow + '</button>').join('') + '</div>';
    html += '<div class="hx-service-layout"><section class="hx-service-directory" data-hx-reveal><div class="hx-op-section-heading"><h2>Service directory</h2><span>' + (query ? matchingCount + ' matching' : serviceGroups.length + ' areas') + '</span></div><div class="searchbox">' + icon('search') + '<input id="service-search" type="search" placeholder="Find a service" value="' + esc(ui.serviceQuery) + '" aria-label="Search services"></div><div class="hx-service-groups">';
    let matchingGroups = 0;
    serviceGroups.forEach(([title, items], i) => {
      const matches = items.filter(n => (n + ' ' + title).toLowerCase().includes(query));
      if (!matches.length) return;
      matchingGroups++;
      html += '<details class="hx-service-group" data-hx-service-group="' + i + '" ' + (query || hxServiceOpen.has(i) ? 'open' : '') + '><summary><span class="hx-service-number">0' + (i + 1) + '</span><span class="hx-service-group-icon">' + icon(hxServiceIcons[i]) + '</span><span class="hx-service-group-title"><strong>' + esc(title) + '</strong><small>' + esc(hxServiceShort[i]) + '</small></span><span class="hx-service-group-count">' + matches.length + '</span>' + hxChevron + '</summary><div class="hx-service-items">' + matches.map(n => '<button data-service="' + esc(n) + '"><span>' + esc(n) + '</span>' + hxArrow + '</button>').join('') + '</div></details>';
    });
    if (!matchingGroups) html += '<div class="empty"><h3>No matching services</h3><p>Try another service or category.</p></div>';
    html += '</div></section><aside class="hx-service-requests" data-hx-reveal><div class="hx-service-requests-head"><span class="hx-op-eyebrow">YOUR WORKSPACE</span><div><h2>My requests</h2><span class="hx-service-request-total">' + active + '</span></div><p>Track your requests and their progress.</p><button class="hx-service-export" data-action="export-services">' + icon('download') + 'Export requests</button></div><div class="hx-service-request-body"><div class="hx-op-viewbar" role="group" aria-label="Request status">' + [['active', 'Active'], ['cancelled', 'Cancelled']].map(([id, label]) => '<button class="' + (ui.requestFilter === id ? 'active' : '') + '" data-request-filter="' + id + '" aria-pressed="' + (ui.requestFilter === id) + '">' + label + '</button>').join('') + '</div>' + requestList('service') + '</div></aside></div></div>';
    return html;
  };

  // A standard native dialog supplies Escape, focus containment and inertness.
  // Returning to a form removes the dossier treatment immediately.
  const hxOriginalOpenDialog = openDialog;
  openDialog = function (title, html, eyebrow) {
    document.getElementById('modal').classList.remove('hx-deal-dialog');
    return hxOriginalOpenDialog(title, html, eyebrow);
  };

  detail = function (id) {
    const d = deals.find(record => record.id === id);
    if (!d) return;
    hxDossierOrigin = { element: document.activeElement, id: id };
    const content = '<div class="hx-deal-dossier"><figure class="hx-deal-dossier-image"><img src="assets/' + esc(d.image) + '" alt="Architecture" width="1400" height="900"><figcaption><span>' + icon(categories[d.cat].icon) + esc(categories[d.cat].name) + '</span><span>Representative image</span></figcaption></figure><section class="hx-deal-dossier-copy"><div class="hx-deal-dossier-meta"><span>' + esc(d.city) + ' <i>·</i> ' + esc(d.area) + '</span>' + statusPill(d.status) + '</div><h2>' + esc(d.name) + '</h2><p class="hx-deal-dossier-structure">' + esc(d.structure) + '</p><div class="hx-deal-dossier-metrics">' + hxMetric('Minimum ticket', money(d.ticket)) + hxMetric(d.metricLabel, d.metricText, true) + hxMetric(hxTerm(d), d.tenureText) + hxMetric(hxSize(d), d.size) + '</div><dl class="hx-deal-dossier-terms"><div><dt>' + esc(d.detailLabel) + '</dt><dd>' + esc(d.detailValue) + '</dd></div><div><dt>Security / ownership</dt><dd>' + esc(d.security) + '</dd></div></dl><p class="hx-deal-dossier-note">' + esc(d.note) + '</p><div class="hx-deal-dossier-actions"><button class="btn" data-enquiry="' + id + '">Create enquiry ' + hxArrow + '</button><button class="btn light" data-brief="' + id + '">' + icon('download') + 'Download brief</button>' + hxSave(d, true) + '</div><p class="hx-deal-dossier-disclaimer">Returns are not assured. Investments are subject to eligibility and definitive documentation.</p></section></div>';
    openDialog(d.name, content, id + ' / OPPORTUNITY DETAILS');
    document.getElementById('modal').classList.add('hx-deal-dialog');
  };

  function refreshDossierSave() {
    document.querySelectorAll('#modal.hx-deal-dialog [data-save]').forEach(button => {
      const active = saved.has(button.dataset.save);
      button.classList.toggle('saved', active);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', (active ? 'Unsave' : 'Save') + ' ' + button.dataset.save);
      const label = button.querySelector('[data-hx-save-label]');
      if (label) label.textContent = active ? 'Saved' : 'Save opportunity';
    });
  }

  document.addEventListener('toggle', function (event) {
    const node = event.target;
    if (!node.matches || !node.matches('details[data-hx-service-group]') || ui.serviceQuery.trim()) return;
    const group = Number(node.dataset.hxServiceGroup);
    if (node.open) hxServiceOpen.add(group); else hxServiceOpen.delete(group);
  }, true);

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-save]')) refreshDossierSave();
  });

  document.getElementById('modal').addEventListener('close', function () {
    if (!hxDossierOrigin) return;
    const origin = hxDossierOrigin;
    hxDossierOrigin = null;
    const focusTarget = origin.element && origin.element.isConnected ? origin.element : document.querySelector('#app [data-detail="' + origin.id + '"]') || document.getElementById('app');
    if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus({ preventScroll: true });
  });

  window.HybridPages = { version: '13', refreshDossierSave: refreshDossierSave };
})();
