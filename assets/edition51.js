/* Edition 51: one card format across every opportunity tab, tidier Services layout,
   and a fresh render once all page scripts have loaded. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- Opportunities: every tab uses the Upcoming Projects card grid ---------- */
// Avoid the same photograph appearing twice inside one tab.
const pool={
 2:['land.png','research2.jpg','research7.jpg','infrastructure.png','research0.jpg','district.png','research1.jpg','research8.jpg','skyline.jpg','research6.jpg'],
 3:['office.png','logistics.png','research3.jpg','research6.jpg','service1.jpg','research8.jpg','service3.jpg','research1.jpg','district.png'],
 4:['special.jpg','research5.jpg','residences.png','research2.jpg','architecture.jpg','research3.jpg','research7.jpg','infrastructure.png','logistics.png','research4.jpg'],
 5:['bonds.jpg','office.png','research5.jpg','residences.png','logistics.png','research0.jpg','research1.jpg','research3.jpg','skyline.jpg'],
 6:['research3.jpg','research4.jpg','residences.png','research2.jpg','research8.jpg','architecture.jpg','research6.jpg','research7.jpg','district.png','office.png']
};
// Opportunity status is only Open, Upcoming or Closed.
try{deals.forEach(d=>{if(d.status==='Limited')d.status='Open';else if(d.status==='Review')d.status='Open';else if(!['Open','Upcoming','Closed'].includes(d.status))d.status='Open'})}catch{}
statusPill=function(s){return `<span class="status ${s==='Upcoming'?'amber':s==='Open'?'':'neutral'}">${esc(s)}</span>`};
try{Object.entries(pool).forEach(([cat,imgs])=>{deals.filter(d=>d.cat===+cat).forEach((d,i)=>{if(imgs[i])d.image=imgs[i]})})}catch{}

function categoryNav(){const tabs=[0,6,3,4,5];return `<nav class="e30-categories" aria-label="Opportunity categories">${tabs.map(i=>`<button data-cat="${i}" class="${ui.cat===i?'active':''}" aria-pressed="${ui.cat===i}">${icon(categories[i].icon)}<span>${esc(categories[i].short)}</span></button>`).join('')}</nav>`}
function developerCard(p){return `<article class="e30-project"><img src="assets/${esc(p.image)}" alt="" loading="lazy"><div class="e30-project-copy"><span class="e30-number">Developer</span><h3>${esc(p.name)}</h3><p>${esc(p.city)}</p><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Developer website <span aria-hidden="true">↗</span></a></div></article>`}
const shortLabel=l=>String(l||'').replace(/^Indicative target gross IRR$/i,'Target gross IRR').replace(/^Indicative /i,'').replace(/^(\w)/,c=>c.toUpperCase());
function dealCard51(d){const on=saved.has(d.id);return `<article class="e30-project e51-deal" data-record="${esc(d.id)}"><button class="e51-img" data-detail="${esc(d.id)}" aria-label="View ${esc(d.name)}"><img src="assets/${esc(d.image)}" alt="" loading="lazy"><span class="e51-status">${statusPill(d.status)}</span></button><div class="e30-project-copy"><h3>${esc(d.name)}</h3><p>${esc(d.city)} · ${esc(d.structure)}</p><div class="e51-metrics"><span><small>Minimum ticket</small><b>${money(d.ticket)}</b></span><span><small>${esc(shortLabel(d.metricLabel))}</small><b>${esc(d.metricText)}</b></span><span><small>Indicative term</small><b>${esc(d.tenureText)}</b></span></div><div class="e51-foot"><button class="e51-details" data-detail="${esc(d.id)}">View details <span aria-hidden="true">↗</span></button><button class="e51-save ${on?'saved':''}" data-save="${esc(d.id)}" aria-pressed="${on}" aria-label="${on?'Unsave':'Save'} ${esc(d.name)}">${icon('bookmark')}</button></div></div></article>`}
const dir=()=>window.SaarthiEdition30?.developerDirectory||[];
opportunityPage=function(){
 let out=`<section class="e30-op e51-op">${pageHead('Investment Opportunities')}${categoryNav()}`;
 if(ui.cat===0){const q=ui.query.trim().toLowerCase();const list=dir().filter(p=>[p.name,p.city].join(' ').toLowerCase().includes(q));
  return out+`<div class="e30-toolbar"><div class="searchbox">${icon('search')}<input id="deal-search" type="search" value="${esc(ui.query)}" placeholder="Search developer or city" aria-label="Search developer or city"></div></div><div class="e30-project-grid">${list.map(developerCard).join('')||'<p>No matching developers.</p>'}</div><p class="e30-disclaimer">A listed developer does not imply a verified upcoming launch, allocation, partnership or endorsement. Confirm project status on the linked developer website.</p></section>`}
 out+=`<div class="e30-views">${[['available','Available'],['saved','Bookmarked']].map(([id,label])=>`<button data-op-view="${id}" class="${ui.opView===id?'active':''}">${label}</button>`).join('')}</div>`;
 if(ui.opView==='enquiries')ui.opView='available';
 const ds=filteredDeals();
 return out+`<div class="e30-toolbar"><div class="searchbox">${icon('search')}<input id="deal-search" type="search" value="${esc(ui.query)}" placeholder="Search opportunity or city" aria-label="Search opportunities"></div>${ui.query?'<button data-action="reset-filters" class="btn light">Reset filters</button>':''}</div><div class="e30-project-grid">${ds.map(dealCard51).join('')}</div>${ds.length?'':`<div class="empty"><h3>${ui.opView==='saved'?'No bookmarked opportunities':'No matching opportunities'}</h3><p>${ui.opView==='saved'?'Use the bookmark icon on any opportunity.':'Change the search.'}</p></div>`}<p class="e30-disclaimer">Terms and targets are indicative and imagery is representative; not offers or assured returns.</p></section>`;
};

/* ---------- Services: no workspace label; quick start sits under the service directory ---------- */
const priorServices=servicesPage;const closed51=new Set();
document.addEventListener('toggle',e=>{const d=e.target;if(!(d instanceof HTMLDetailsElement)||!d.matches('.e51-svc-single .hx-service-group'))return;const i=+d.dataset.hxServiceGroup;if(d.open)closed51.delete(i);else closed51.add(i)},true);
servicesPage=function(){let html=priorServices();
 html=html.replace(/<section class="e30-service-overview[\s\S]*?<p class="e30-disclaimer">[^<]*<\/p><\/section>/,'');
 html=html.replace(/<aside class="hx-service-requests"[\s\S]*?<\/aside>/,'');
 html=html.replace('<div class="hx-service-layout">','<div class="hx-service-layout e51-svc-single">');
 html=html.replace(/<div class="searchbox">(?:(?!<\/div>)[\s\S])*?id="service-search"[\s\S]*?<\/div>/,'');
 html=html.replace('<p class="hx-service-lead-note">Choose a service and subtype, link a property, then submit your request.</p>','<p class="hx-service-lead-note">Choose a service and subtype, link a property, then submit your request and track progress on a real-time basis.</p>');
 html=html.replace(/<span class="hx-op-eyebrow">\d+ SERVICES ACROSS \d+ AREAS<\/span>/,'');
 html=html.replace(/<details class="hx-service-group" data-hx-service-group="(\d+)" (open)?\s*>/g,(m,i)=>`<details class="hx-service-group" data-hx-service-group="${i}" ${closed51.has(+i)?'':'open'}>`);
 html=html.replace('<span class="hx-op-eyebrow">YOUR WORKSPACE</span>','');
 const m=html.match(/<div class="hx-service-quick"[\s\S]*?<\/button><\/div>/);
 if(m)html=html.replace(m[0],'');
 return html;
};

document.addEventListener('click',e=>{const b=e.target.closest('[data-e51-myservices]');if(!b)return;e.preventDefault();try{window.CIOModel.state.tab='services'}catch{}if(location.hash==='#portfolio'){window.render&&window.render()}else location.hash='portfolio';});
/* ---------- Render once more now every script has replaced its page builder ---------- */
try{if(window.Saarthi&&['opportunities','services','research'].includes(window.Saarthi.ui.page)&&typeof window.render==='function')window.render()}catch{}
})();
