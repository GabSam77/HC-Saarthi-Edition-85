/* Edition 42: header notifications for property reminders and alerts. */
(()=>{'use strict';
const header=document.querySelector('.site-header');
if(!header||header.querySelector('.n42'))return;
const READ_KEY='hc-saarthi-alerts-read';
const day=864e5,today=new Date();today.setHours(12,0,0,0);
const addDays=n=>new Date(today.getTime()+n*day);
const addMonths=n=>{const d=new Date(today);d.setMonth(d.getMonth()+n);return d};
const fmt=d=>d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
const kindOf=t=>/tax/i.test(t)?'Property tax':/lease/i.test(t)?'Lease renewal':/loan|refinanc/i.test(t)?'Loan maturity':/valuation/i.test(t)?'Valuation update':/capital-call|capital call/i.test(t)?'Capital call':'Decision';
function buildItems(){const M=window.CIOModel;if(!M)return[];const S=M.state;return S.actions.filter(t=>t.status==='Open').slice().sort((a,b)=>a.due.localeCompare(b.due)).map(t=>{const asset=S.assets.find(x=>x.id===t.asset),due=new Date(t.due+'T12:00:00'),days=Math.round((due-today)/day),kind=kindOf(t.title);return {id:t.id+':'+t.due,kind,tone:days<=14?'due':days<=30?'watch':'info',asset:asset?asset.name:'Portfolio',text:t.title+'.',when:'Due '+fmt(due)+' · '+t.owner,meta:days<0?Math.abs(days)+' days overdue':days===0?'Due today':'In '+days+' days',tab:'overview'}})}
let items=buildItems();
let read=new Set();
try{read=new Set(JSON.parse(localStorage.getItem(READ_KEY)||'[]'))}catch{}
const save=()=>{try{localStorage.setItem(READ_KEY,JSON.stringify([...read]))}catch{}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bell='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>';
const icons={
 'Property tax':'<path d="M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21Z"/><path d="M10 8h4M10 12h4"/>',
 'Lease renewal':'<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>',
 'Loan maturity':'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
 'Valuation update':'<path d="M4 20h16"/><path d="M7 16V10M12 16V6M17 16v-4"/>',
 'Capital call':'<path d="M12 3v18"/><path d="M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6"/>',
 'Decision':'<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'
};
const wrap=document.createElement('div');
wrap.className='n42';
wrap.innerHTML=`<button type="button" class="n42-bell" aria-haspopup="true" aria-expanded="false" aria-controls="n42-panel">${bell}<span class="n42-count" aria-hidden="true"></span><span class="n42-sr"></span></button><div class="n42-panel" id="n42-panel" role="region" aria-label="Alerts and reminders" hidden></div>`;
const label=header.querySelector('.header-label');
label?header.insertBefore(wrap,label):header.appendChild(wrap);
const btn=wrap.querySelector('.n42-bell'),panel=wrap.querySelector('.n42-panel');
function unread(){return items.filter(i=>!read.has(i.id)).length}
function paint(){
 items=buildItems();
 const n=unread();
 const c=wrap.querySelector('.n42-count');c.textContent=n||'';c.hidden=!n;
 wrap.querySelector('.n42-sr').textContent=n?`Alerts and reminders, ${n} unread`:'Alerts and reminders';
 panel.innerHTML=`<div class="n42-head"><div><strong>Alerts &amp; reminders</strong><span>${n?n+' unread':'All caught up'}</span></div>${n?'<button type="button" class="n42-mark" data-n42-all>Mark all as read</button>':''}</div><ul class="n42-list">${items.map(i=>`<li><button type="button" class="n42-item ${read.has(i.id)?'':'n42-unread'} n42-${i.tone}" data-n42="${i.id}"><span class="n42-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[i.kind]}</svg></span><span class="n42-copy"><span class="n42-top"><b>${esc(i.kind)}</b><em>${esc(i.meta)}</em></span><span class="n42-asset">${esc(i.asset)}</span><span class="n42-text">${esc(i.text)}</span><span class="n42-when">${esc(i.when)}</span></span></button></li>`).join('')}</ul><div class="n42-foot"><button type="button" data-n42-portfolio>View all in My Portfolio</button></div>`;
}
function open(){paint();panel.hidden=false;btn.setAttribute('aria-expanded','true');wrap.classList.add('n42-open')}
function close(){if(panel.hidden)return;panel.hidden=true;btn.setAttribute('aria-expanded','false');wrap.classList.remove('n42-open')}
function go(tab){
 close();
 try{const S=window.CIOModel&&window.CIOModel.state;if(S&&tab)S.tab=tab}catch{}
 if(location.hash!=='#portfolio')location.hash='#portfolio';
 else if(typeof window.render==='function')window.render();
 setTimeout(()=>window.scrollTo({top:0}),40);
}
btn.addEventListener('click',e=>{e.stopPropagation();panel.hidden?open():close()});
panel.addEventListener('click',e=>{
 e.stopPropagation();
 if(e.target.closest('[data-n42-all]')){items.forEach(i=>read.add(i.id));save();paint();return}
 if(e.target.closest('[data-n42-portfolio]')){go('overview');return}
 const it=e.target.closest('[data-n42]');
 if(it){const item=items.find(i=>i.id===it.dataset.n42);read.add(item.id);save();paint();go(item.tab)}
});
document.addEventListener('click',close);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){close();btn.focus()}});
const onPortfolio=()=>location.hash.slice(1).split('?')[0]==='portfolio';
const place=()=>{wrap.hidden=!onPortfolio();if(wrap.hidden)close();else paint()};
window.addEventListener('hashchange',()=>{close();place()});
place();
paint();
})();

/* Edition 42: Research & Intelligence offering. */
(()=>{'use strict';
if(typeof window.Saarthi!=='object')return;
const KEY='hc-saarthi-research42';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic={
 infra:'<path d="M3 20h18"/><path d="M5 20V10l7-5 7 5v10"/><path d="M9 20v-5h6v5"/>',
 market:'<path d="M4 19h16"/><path d="M6 15l4-4 3 3 5-6"/><path d="M15 8h3v3"/>',
 dev:'<rect x="4" y="3" width="10" height="18" rx="1"/><path d="M14 9h6v12h-6"/><path d="M7 7h4M7 11h4M7 15h4"/>',
 macro:'<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.2 3.5 5 3.5 8s-1 5.8-3.5 8c-2.5-2.2-3.5-5-3.5-8s1-5.8 3.5-8Z"/>',
 theme:'<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.5-.8Z"/>',
 policy:'<path d="M12 3v18M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0Z"/><path d="M19 7l-3 7a3 3 0 0 0 6 0Z"/><path d="M8 21h8"/>',
 custom:'<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/><path d="M11 8v6M8 11h6"/>',
 play:'<path d="M8 5v14l11-7Z" fill="currentColor" stroke="none"/>',
 doc:'<path d="M7 3h7l5 5v13H7Z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
 bell:'<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
 check:'<path d="m5 12 5 5L20 6"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>'
};
const svg=(k,c='')=>`<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic[k]}</svg>`;
const streams=[
 {id:'infra',n:'01',icon:'infra',title:'Infrastructure Research',cadence:'Video · Report · Tracking',sub:true,items:['Infrastructure video series by micro-market, with drone footage and visualisations of upcoming infrastructure','Upcoming infrastructure reports and presentations','Construction progress tracking and milestone updates for subscribed infrastructure projects']},
 {id:'market',n:'02',icon:'market',title:'Micro-Market Data & Trends',cadence:'Quarterly',items:['Quarterly residential micro-market updates covering launches, sales, inventory, absorption and unsold stock','Emerging growth corridors and investment hotspots driven by infrastructure development','Price trends, demand-supply dynamics and market outlook']},
 {id:'dev',n:'03',icon:'dev',title:'Developer & Project Intelligence',cadence:'Alerts',sub:true,items:['News, announcements and alerts for subscribed developers and projects','Developer track record, delivery performance and financial updates','Project launch, sales and construction progress monitoring']},
 {id:'macro',n:'04',icon:'macro',title:'Macro Research',cadence:'Monthly / Quarterly',items:['Real estate as an asset class: returns versus equity, gold, debt and other investment avenues','Global and domestic capital flows into Indian real estate','ESG, sustainability and green building trends','Sector outlook and key market developments']},
 {id:'theme',n:'05',icon:'theme',title:'Thematic Research',cadence:'Special reports',items:['Senior living, student housing, worker housing and co-living','Warehousing, data centres, life sciences and other emerging sectors','Special reports on evolving real estate themes']},
 {id:'policy',n:'06',icon:'policy',title:'Policy, Regulatory & Tax Updates',cadence:'As announced',sub:true,items:['Policy, RERA, registration, FSI/TDR and planning regulation updates for subscribed micro-markets','Budget, RBI policy and interest-rate impact notes','Key legal and regulatory developments affecting real estate investors and homebuyers']}
];
const custom={id:'custom',n:'07',icon:'custom',title:'Custom Research Requests',cadence:'On request',items:['Bespoke research and data requests tailored to investor requirements','Location, project, developer or sector-specific deep dives']};
const EMBED=false;
const featured=[
 {id:'mmr-report',type:'Report',icon:'doc',img:'research4.jpg',title:'MMR: Key Emerging Zones',text:'',stream:'Infrastructure Research',pdf:'assets/MMR_Infra_update_Nov2026.pdf'},
 {id:'thane-video',type:'Video',icon:'play',img:'research5.jpg',title:'Thane: Infrastructure fueling growth',text:'',stream:'Infrastructure Research',youtube:'rKnnGtJ7tDY'},
 {id:'ncr-video',type:'Video',icon:'play',img:'ncr-infra-poster.jpg',title:'NCR: Infrastructure fueling growth',text:'',stream:'Infrastructure Research',video:'assets/ncr-infra-2025.mp4'},
 {id:'mmr-video',type:'Video',icon:'play',img:'mmr-infra-poster.jpg',title:'MMR: Infrastructure fueling growth',text:'',stream:'Infrastructure Research',video:'assets/mmr-infra-2025.mp4'},
 {id:'mmr-overview',type:'Report',icon:'doc',img:'mmr-overview-cover.jpg',title:'MMR: Real Estate Overview',text:'',stream:'Micro-Market Data & Trends',pdf:'assets/MMR_Real_Estate_Overview_Jul2025.pdf'},
 {id:'mmr-insights',type:'Report',icon:'doc',img:'mmr-insights-cover.jpg',title:'MMR: Infrastructure Insights',text:'',stream:'Infrastructure Research',pdf:'assets/MMR_Infrastructure_Insights_Sep2025.pdf'},
 {id:'navi-mumbai',type:'Report',icon:'doc',img:'navi-mumbai-cover.jpg',plain:true,title:'Navi Mumbai: Impact of Infrastructure',text:'',stream:'Infrastructure Research',pdf:'assets/Navi_Mumbai_Infrastructure_Update_Oct2025.pdf'},
 {id:'karjat-alibaug',type:'Report',icon:'doc',img:'karjat-alibaug-cover.jpg',title:'Karjat and Alibaug: Micromarket Overview',text:'',stream:'Micro-Market Data & Trends',pdf:'assets/Karjat_Alibaug_Micromarket_Overview.pdf'}
];
const defaults={q:'',notify:[],cover:{'Micro-markets':['Thane West','Navi Mumbai','Whitefield, Bengaluru','Dwarka Expressway, Gurugram'],'Infrastructure projects':['Mumbai Metro Line 4','Thane–Borivali twin tunnel','Virar–Alibaug multimodal corridor'],'Developers':['Godrej Properties','Prestige Group','DLF']}};
let st;try{st=Object.assign(structuredClone(defaults),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{st=structuredClone(defaults)}
st.q='';
const save=()=>{try{const {q,...rest}=st;localStorage.setItem(KEY,JSON.stringify(rest))}catch{}};
const match=s=>!st.q||[s.title,s.cadence,...s.items].join(' ').toLowerCase().includes(st.q.toLowerCase());
function card(s){return `<article class="r42-card" id="r42-${s.id}"><div class="r42-card-top"><span class="r42-ico">${svg(s.icon)}</span><b class="r42-n" aria-hidden="true">${s.n}</b></div><h3>${esc(s.title)}</h3><div class="r42-tags"><span>${esc(s.cadence)}</span>${s.sub?'<span class="r42-sub">For your coverage</span>':''}</div><ul>${s.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></article>`}
function feat(f){const yt=f.youtube?`https://www.youtube.com/watch?v=${f.youtube}`:'';const isVideo=!!(f.video||f.youtube);
 const inner=`<span class="r56-media"><img src="assets/${f.img}" alt="" loading="lazy">${isVideo?`<span class="r56-play" aria-hidden="true">${svg('play')}</span>`:''}</span><span class="r56-body"><span class="r56-title">${esc(f.title)}</span><span class="r56-cta">${svg(isVideo?'play':'doc')}${isVideo?'Watch video':'Read report ↗'}</span></span>`;
 const cls=`r56-card${f.plain?' r56-plain':''}`;
 if(f.video||(f.youtube&&EMBED))return `<button type="button" class="${cls}" data-r42-play="${f.id}" aria-label="Watch ${esc(f.title)}">${inner}</button>`;
 if(f.youtube)return `<a class="${cls}" href="${yt}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${esc(f.title)} on YouTube">${inner}</a>`;
 if(f.pdf)return `<a class="${cls}" href="${f.pdf}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(f.title)} report">${inner}</a>`;
 return `<div class="${cls}">${inner}</div>`}
document.getElementById('modal')?.addEventListener('close',()=>{const v=document.querySelector('#modal .r42-video');if(v){v.querySelector('video')?.pause();v.innerHTML=''}});
function playVideo(f){if(f.video){openDialog(f.title,`<div class="r42-video"><video src="${f.video}" poster="assets/${f.img}" controls autoplay playsinline preload="metadata"></video></div>`,'');return}openDialog(f.title,`<div class="r42-video"><iframe src="https://www.youtube-nocookie.com/embed/${f.youtube}?autoplay=1&rel=0" title="${esc(f.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><p class="r42-video-link"><a href="https://www.youtube.com/watch?v=${f.youtube}" target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a></p>`,'')}
function coverage(){return `<section class="r42-cover" aria-labelledby="r42-cover-h"><div class="r42-cover-head"><div><span class="r42-eyebrow">MY COVERAGE</span><h2 id="r42-cover-h">What you follow</h2><p>Infrastructure tracking, developer alerts and policy updates are delivered for the markets, projects and developers you follow.</p></div></div><div class="r42-cover-grid">${Object.entries(st.cover).map(([g,list])=>`<div class="r42-cover-col"><h3>${esc(g)} <span>${list.length}</span></h3><div class="r42-chips">${list.map((x,i)=>`<span class="r42-chip">${esc(x)}<button type="button" data-r42-rm="${esc(g)}" data-i="${i}" aria-label="Stop following ${esc(x)}">${svg('x')}</button></span>`).join('')||'<em>Nothing followed yet.</em>'}</div><form class="r42-add" data-r42-add="${esc(g)}"><label class="r42-sr" for="r42-add-${g.length}">Add to ${esc(g)}</label><input id="r42-add-${g.length}" name="v" maxlength="80" placeholder="Add ${esc(g.toLowerCase().replace(/s$/,''))}" autocomplete="off"><button type="submit">Follow</button></form></div>`).join('')}</div></section>`}
function page(){
 const list=streams.filter(match),showCustom=match(custom);
 return `<div class="r42"><header class="r42-head"><div><h1>Research &amp; Intelligence</h1><p>Seven research streams covering infrastructure, micro-markets, developers, the macro picture, emerging themes and policy, with custom research on request.</p></div></header>
 ${st.q?'':`${(()=>{const vids=featured.filter(x=>x.video||x.youtube),reps=featured.filter(x=>!(x.video||x.youtube));return `<section class="r56-latest" aria-label="Latest research"><div class="r56-headrow"><h2>Latest research</h2></div><div class="r59-split"><div class="r59-col r59-videos"><h3 class="r59-sub">${svg('play')}Videos</h3><div class="r59-pair">${vids.map(feat).join('')}</div></div><div class="r59-col r59-reports"><h3 class="r59-sub">${svg('doc')}Reports</h3><div class="r59-pair">${reps.map(feat).join('')}</div></div></div></section>`})()}`}
 <section aria-labelledby="r42-streams-h"><div class="r42-sec-head"><h2 id="r42-streams-h">What we cover</h2><span>7 streams</span></div>${list.length?`<div class="r42-grid">${list.map(card).join('')}</div>`:''}
 ${showCustom?`<article class="r42-custom" id="r42-custom"><div class="r42-custom-copy"><div class="r42-card-top"><span class="r42-ico">${svg('custom')}</span><b class="r42-n" aria-hidden="true">07</b></div><h3>${custom.title}</h3><ul>${custom.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div><button type="button" class="r42-cta" data-r42-request>Request custom research</button></article>`:''}
 ${!list.length&&!showCustom?'<p class="r42-empty">No research stream matches that search.</p>':''}</section>
 ${st.q?'':coverage()}</div>`;
}
try{researchPage=page}catch{}
const rerender=()=>{if(window.Saarthi.ui.page==='research')window.Saarthi.render()};
document.addEventListener('input',e=>{if(e.target.id!=='r42-q')return;st.q=e.target.value;rerender()});
document.addEventListener('click',e=>{
 const pl=e.target.closest('[data-r42-play]');if(pl){const f=featured.find(x=>x.id===pl.dataset.r42Play);if(f)playVideo(f);return}
 const n=e.target.closest('[data-r42-notify]');
 if(n){const id=n.dataset.r42Notify;st.notify=st.notify.includes(id)?st.notify.filter(x=>x!==id):[...st.notify,id];save();rerender();return}
 const rm=e.target.closest('[data-r42-rm]');
 if(rm){st.cover[rm.dataset.r42Rm].splice(Number(rm.dataset.i),1);save();rerender();return}
 if(e.target.closest('[data-r42-request]')){requestForm();return}
});
document.addEventListener('submit',e=>{
 const add=e.target.closest('[data-r42-add]');
 if(add){e.preventDefault();e.stopImmediatePropagation();const v=add.elements.v.value.trim();const g=add.dataset.r42Add;if(v&&!st.cover[g].some(x=>x.toLowerCase()===v.toLowerCase())){st.cover[g].push(v);save();rerender();setTimeout(()=>document.querySelector(`[data-r42-add="${g}"] input`)?.focus(),0)}return}
 if(e.target.id==='r42-form'){e.preventDefault();e.stopImmediatePropagation();const f=e.target;if(!f.reportValidity())return;const v=Object.fromEntries(new FormData(f));
  const r={kind:'service',subject:'Custom research',subtype:v.scope,asset:v.topic,city:v.city||'',notes:v.notes||'',id:'RR-'+Date.now().toString(36).toUpperCase(),created:new Date().toISOString(),status:'In progress'};
  const reqs=window.Saarthi.getRequests();reqs.push(r);try{localStorage.setItem('hc-functional-requests',JSON.stringify(reqs))}catch{}
  openDialog('Research request submitted',`<p class="r42-done">Your request for <b>${esc(v.scope)}</b> research on <b>${esc(v.topic)}</b> is now listed under My Portfolio → Assets → My Services, reference ${esc(r.id)}.</p><div class="dialog-actions"><button class="btn" data-action="close">Done</button></div>`,'CUSTOM RESEARCH');rerender()}
},true);
function requestForm(){
 openDialog('Request custom research',`<form id="r42-form" class="r42-form"><label>Type of research<select name="scope" required><option value="">Choose one</option><option>Location</option><option>Project</option><option>Developer</option><option>Sector</option><option>Data request</option></select></label><label>Location, project, developer or sector<input name="topic" required maxlength="120" placeholder="e.g. Thane West, or senior living"></label><label>City <span class="r42-opt">Optional</span><input name="city" maxlength="80"></label><label>What do you need to know?<textarea name="notes" required maxlength="2000" rows="4" placeholder="The decision this supports, questions to answer and any timeline"></textarea></label><div class="dialog-actions"><button class="btn" type="submit">Submit request</button><button class="btn light" type="button" data-action="close">Cancel</button></div></form>`,'CUSTOM RESEARCH');
}
rerender();
})();
try{if(window.Saarthi&&window.Saarthi.ui.page==='portfolio'&&typeof window.render==='function')window.render()}catch{}
