/* HC Saarthi — landing experience. */
(()=>{
'use strict';
const ROOT=document.getElementById('saarthi-public-root');
const ACCESS_KEY='saarthi-preview-access';
const featureGroups=[
 {name:'Intelligence & portfolio',rows:[['Research & market intelligence',1,1,1],['Property records & portfolio view',1,1,1],['Watchlists & alerts',1,1,1],['Portfolio analysis & tools',0,1,1],['Bespoke portfolio intelligence',0,0,1]]},
 {name:'Investment Opportunities',rows:[['Standard opportunity access',1,1,1],['Curated opportunities',0,1,1],['Priority opportunity access',0,0,1]]},
 {name:'Advisory',rows:[['Standard property assessment',1,1,1],['Specialist advice',0,1,1],['Bespoke real estate strategy',0,0,1],['Land / development assessment',0,0,1],['Negotiation support',0,0,1]]},
 {name:'Services & execution',rows:[['Access to trusted specialists',1,1,1],['Coordinated specialist support',0,1,1],['End-to-end execution support',0,0,1]]},
 {name:'Relationship',rows:[['Digital / platform support',1,1,1],['Human relationship coverage',0,1,1],['Dedicated relationship lead',0,0,1],['On-demand / concierge support',0,0,1]]}
];
const tiers=[
 {name:'Saarthi',tag:'DIGITAL',desc:'Digital access to research, property records, standard opportunities and specialist discovery.',benefits:['Research & market intelligence','Property records and watchlists','Standard opportunities','Digital support']},
 {name:'Saarthi Plus',tag:'DIGITAL + ASSISTED',desc:'Portfolio analysis, curated opportunities and specialist guidance when you need it.',benefits:['Everything in Saarthi','Portfolio analysis tools','Curated opportunities','Specialist advice and coordination']},
 {name:'Saarthi Plus+',tag:'BESPOKE',desc:'Bespoke intelligence, priority access and dedicated support for complex portfolios.',benefits:['Everything in Saarthi Plus','Bespoke strategy and land assessment','Priority opportunities','Dedicated lead and execution support']}
];
const capitalSlides=[
 {tag:'01 / REAL ESTATE NETWORK',heading:'Close to the market. Across India.',image:'hdfc-capital-development.webp',alt:'Indian residential development',eyebrow:'DEVELOPER RELATIONSHIPS',items:[
  ['Established relationships','The HDFC ecosystem has built long-standing relationships with developers across India.'],
  ['A view of actual performance','Project-level investing provides experience of how developers manage construction, sales and collections.'],
  ['Why this matters','Saarthi can draw on this experience to bring more informed perspectives to clients’ real estate decisions.']
 ]},
 {tag:'02 / INSTITUTIONAL EXPERIENCE',heading:'Real estate investing experience across market cycles.',image:'office.png',alt:'Institutional architecture',eyebrow:'HDFC CAPITAL & THE HDFC BANK GROUP',items:[
  ['Specialist real estate platform','HDFC Capital is part of the HDFC Bank Group and focuses on real estate investment management.'],
  ['Experience through changing markets','The investment team’s history spans the global financial crisis, sector reforms and subsequent market cycles.'],
  ['A foundation for Saarthi','The aim is to bring that real estate knowledge together with portfolio tools, opportunities and specialist services.']
 ]}
];
let capitalSlideIndex=0;
let groupIndex=0,selectedTier=-1;
// Manual-only comparison: no timers, observers or auto-advance.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function setGroup(index){
 groupIndex=(index+featureGroups.length)%featureGroups.length;
 const region=ROOT.querySelector('#lp-matrix-region');if(!region)return;
 region.innerHTML=matrix();
 region.classList.remove('lp-slide-enter');
 if(!reducedMotion.matches){void region.offsetWidth;region.classList.add('lp-slide-enter')}
 ROOT.querySelectorAll('[data-group]').forEach(b=>{
  const active=Number(b.dataset.group)===groupIndex;
  b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;
 });
 const counter=ROOT.querySelector('#lp-slide-count');
 if(counter)counter.textContent=String(groupIndex+1).padStart(2,'0')+' / '+String(featureGroups.length).padStart(2,'0');
 const next=ROOT.querySelector('#lp-slide-next');
 if(next)next.textContent='NEXT  '+featureGroups[(groupIndex+1)%featureGroups.length].name;
 ROOT.querySelector(`[data-group="${groupIndex}"]`)?.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'nearest',inline:'center'});
}

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const check=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 6"/></svg>`;
const cross=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
const arr=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7"/></svg>`;
function hasAccess(){try{return !!sessionStorage.getItem(ACCESS_KEY)}catch{return false}}
function onHome(){return location.hash==='#home'||location.hash===''}
function tierCards(){return tiers.map((t,i)=>`<div class="tier-card ${i===2?'tier-dark':''}"><span class="tier-top"><span class="tier-index">0${i+1} / 03</span><span class="tier-tag">${t.tag}</span></span><span class="tier-card-body"><strong>${t.name}</strong><span class="tier-description">${t.desc}</span></span><span class="tier-benefits">${t.benefits.map(b=>b.startsWith('Everything in')?`<span class="tier-base">${check}<b>${b}</b></span><small class="tier-plus">ADD-ONS</small>`:`<span>${check}${b}</span>`).join('')}</span></div>`).join('')}
function matrix(){const g=featureGroups[groupIndex];return `<div class="matrix-heading"><div><span class="lp-eyebrow">SERVICE COMPARISON</span><h3>${g.name}</h3></div><span>Included in each tier</span></div><div class="matrix-scroll" role="region" aria-label="Feature availability across Saarthi tiers" tabindex="0"><table class="lp-matrix"><thead><tr><th scope="col">Capability</th>${tiers.map((t,i)=>`<th scope="col" class="${selectedTier===i?'matrix-active':''}">${t.name}</th>`).join('')}</tr></thead><tbody>${g.rows.map(r=>`<tr><th scope="row">${r[0]}</th>${r.slice(1).map((v,i)=>`<td class="${selectedTier===i?'matrix-active':''}"><span class="matrix-state ${v?'included':'excluded'}" aria-label="${v?'Included':'Not included'}">${v?check:cross}</span></td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
function capitalSlide(){
 const c=capitalSlides[capitalSlideIndex];
 return `<div class="lp-proof-image"><img src="assets/${c.image}" loading="lazy" alt="${c.alt}"><span>INDIA'S REAL ESTATE LANDSCAPE</span></div>
 <div class="lp-proof-insights"><span class="lp-proof-overline">${c.eyebrow}</span><h3>${c.heading}</h3><div class="lp-proof-steps">${c.items.map((item,i)=>`<div><span>0${i+1}</span><div><strong>${item[0]}</strong><p>${item[1]}</p></div></div>`).join('')}</div></div>`;
}
function capitalCarousel(){return `<div class="lp-capital-carousel" role="region" aria-roledescription="carousel" aria-label="HDFC Capital capabilities" tabindex="0">
 <div class="lp-proof-feature" id="lp-capital-slide" aria-live="polite" aria-atomic="true">${capitalSlide()}</div>
 <button type="button" class="lp-capital-arrow lp-capital-prev" data-capital-prev aria-label="Previous HDFC Capital capability"><span aria-hidden="true">&#8592;</span></button>
 <button type="button" class="lp-capital-arrow lp-capital-next" data-capital-next aria-label="Next HDFC Capital capability"><span aria-hidden="true">&#8594;</span></button>
 <div class="lp-capital-controls"><span class="lp-capital-counter" id="lp-capital-counter">01 <span>/</span> 02</span><div class="lp-capital-dots" aria-label="Select HDFC Capital capability">${capitalSlides.map((c,i)=>`<button type="button" data-capital-slide="${i}" class="${i===capitalSlideIndex?'active':''}" aria-label="Slide ${i+1}: ${c.eyebrow.toLowerCase()}" aria-current="${i===capitalSlideIndex?'true':'false'}"></button>`).join('')}</div><span class="lp-capital-caption" id="lp-capital-caption">${capitalSlides[capitalSlideIndex].tag}</span></div>
 </div>`}
function setCapitalSlide(index){
 capitalSlideIndex=(index+capitalSlides.length)%capitalSlides.length;
 const frame=ROOT.querySelector('#lp-capital-slide');if(!frame)return;
 frame.innerHTML=capitalSlide();
 frame.classList.remove('lp-capital-enter');
 if(!reducedMotion.matches){void frame.offsetWidth;frame.classList.add('lp-capital-enter')}
 const counter=ROOT.querySelector('#lp-capital-counter');if(counter)counter.innerHTML=String(capitalSlideIndex+1).padStart(2,'0')+' <span>/</span> '+String(capitalSlides.length).padStart(2,'0');
 const caption=ROOT.querySelector('#lp-capital-caption');if(caption)caption.textContent=capitalSlides[capitalSlideIndex].tag;
 ROOT.querySelectorAll('[data-capital-slide]').forEach(b=>{const active=Number(b.dataset.capitalSlide)===capitalSlideIndex;b.classList.toggle('active',active);b.setAttribute('aria-current',String(active))});
}
function publicHTML(){return `<div class="lp-site lp37-site"><main id="lp-main">
<section class="lp-hero lp37-hero lp42-hero"><div class="lp-hero-copy"><h1>Your trusted guide to <span>real estate wealth.</span></h1><p>Understand your real estate portfolio, make more informed decisions, discover relevant opportunities and coordinate the services your properties need.</p></div><div class="lp-hero-visual"><img src="assets/saarthi-hero-india.webp" alt="Indian city architecture"></div></section>
<section class="lp37-about lp42-about" id="about"><figure class="lp37-about-image"><img src="assets/hdfc-capital-development.webp" alt="Residential real estate development"></figure><div class="lp37-about-copy"><span class="lp-eyebrow">ABOUT HDFC CAPITAL</span><h2>Institutional capital. A commitment to housing.</h2><p>HDFC Capital, a subsidiary of HDFC Bank Limited, is the real estate private equity arm of the HDFC Group. HDFC Capital is focused on financing the development of affordable and mid-income homes in a sustainable manner and is the investment manager to multiple SEBI-registered and IFSCA-registered Category II Alternative Investment Funds. Its funds together represent a platform of US$ 5 billion.</p><p>It also seeks to promote innovation and the adoption of new technologies in the real estate sector by investing in and partnering with technology companies.</p><a class="lp37-link" href="https://hdfccapital.com/" target="_blank" rel="noopener noreferrer" aria-label="Know More about HDFC Capital (opens in a new tab)">Know More <span aria-hidden="true">↗</span></a></div></section>
<section class="lp37-why lp42-why" id="why"><div class="lp37-section-intro"><span class="lp-eyebrow">ABOUT SAARTHI</span><h2>One connected view of your real estate world.</h2><p>Real estate ownership is rarely a single transaction. Saarthi brings together the information, opportunities and execution support needed across the life of an asset.</p></div>
<div class="lp42-grid">
<a class="lp42-card" href="#research"><div class="lp42-viz" aria-hidden="true"><div class="lp42-mini"><b class="lp45-t">Latest research</b><div class="lp45-list"><span><i class="lp45-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5v14l11-7Z" fill="currentColor" stroke="none"/></svg></i>Infrastructure video</span><span><i class="lp45-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7Z"/><path d="M14 3v5h5"/></svg></i>Market report</span><span><i class="lp45-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0Z"/><path d="M19 7l-3 7a3 3 0 0 0 6 0Z"/></svg></i>Policy update</span></div></div></div><div class="lp42-body"><div class="lp42-label"><span class="lp-eyebrow">RESEARCH &amp; INTELLIGENCE</span><b aria-hidden="true">01</b></div><h3>See the market beyond the headline.</h3><p>Explore cities and micro-markets through location-led research, infrastructure trends and the forces shaping demand.</p><span class="lp42-go">Explore Research &amp; Intelligence <i aria-hidden="true">↗</i></span></div></a>
<a class="lp42-card" href="#opportunities"><div class="lp42-viz" aria-hidden="true"><div class="lp42-mini"><b class="lp45-t">Curated opportunities</b><div class="lp45-tiles"><span><i class="lp45-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V9l8-5 8 5v12"/><path d="M9 21v-6h6v6"/></svg></i>Projects</span><span><i class="lp45-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18l6-9 4 6 3-4 5 7Z"/></svg></i>Land</span><span><i class="lp45-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="4"/><circle cx="15" cy="15" r="4"/></svg></i>Co-invest</span></div></div></div><div class="lp42-body"><div class="lp42-label"><span class="lp-eyebrow">INVESTMENT OPPORTUNITIES</span><b aria-hidden="true">02</b></div><h3>Discover opportunities with greater context.</h3><p>Discover projects, land, income assets and co-investments through a curated, clearly organised view.</p><span class="lp42-go">Explore Investment Opportunities <i aria-hidden="true">↗</i></span></div></a>
<a class="lp42-card" href="#financing"><div class="lp42-viz finance-home-photo" aria-hidden="true"></div><div class="lp42-body"><div class="lp42-label"><span class="lp-eyebrow">FINANCING</span><b aria-hidden="true">03</b></div><h3>Find financing for your property.</h3><p>Explore home loans, borrowing against property and financing against future rent.</p><span class="lp42-go">Explore Financing</span></div></a>
<a class="lp42-card" href="#portfolio"><div class="lp42-viz" aria-hidden="true"><div class="lp42-mini"><b class="lp45-t">Asset mix</b><div class="lp42-bar"><i></i><i></i><i></i><i></i></div><div class="lp42-legend"><span>Residential</span><span>Commercial</span><span>Land</span></div></div></div><div class="lp42-body"><div class="lp42-label"><span class="lp-eyebrow">MY PORTFOLIO</span><b aria-hidden="true">04</b></div><h3>Know what you own. Understand what it means.</h3><p>See your properties, returns, risks and records together, and which assets need attention.</p><span class="lp42-go">Explore My Portfolio <i aria-hidden="true">↗</i></span></div></a>
<a class="lp42-card" href="#services"><div class="lp42-viz" aria-hidden="true"><div class="lp42-mini"><b class="lp45-t">Title documentation</b><div class="lp42-track"><span></span></div><div class="lp42-steps"><span>Request</span><span>Review</span><span>Completion</span></div></div></div><div class="lp42-body"><div class="lp42-label"><span class="lp-eyebrow">SERVICES</span><b aria-hidden="true">05</b></div><h3>From a decision to the work that follows.</h3><p>From title checks to valuations and property management, request specialist support and follow its progress.</p><span class="lp42-go">Explore Services <i aria-hidden="true">↗</i></span></div></a>
</div></section>
<section class="lp-membership lp37-membership" id="membership"><div class="lp-section-head lp-tier-head"><div><span class="lp-eyebrow">MEMBERSHIP BENEFITS</span><h2>Support shaped around your needs.</h2></div><p>Explore how Saarthi membership levels differ in intelligence, opportunity access and specialist support.</p></div><div class="lp-tier-grid lp42-tiers">${tierCards()}</div><p class="lp42-detail-row"><button type="button" class="lp42-detail-link" data-open-compare>Explore the benefits in detail <span aria-hidden="true">↗</span></button></p></section>
</main><div class="lp42-modal" id="lp42-compare" hidden><div class="lp42-modal-backdrop" data-close-compare></div><div class="lp42-modal-dialog" role="dialog" aria-modal="true" aria-label="Explore the benefits"><button type="button" class="lp42-modal-close" data-close-compare aria-label="Close">×</button><div class="lp-comparison" id="lp-comparison"><div class="lp-compare-top"><div><span class="lp-eyebrow">COMPARISON</span><h2>Explore the benefits.</h2></div><span class="lp-compare-hint">Select a topic to compare.</span></div><div class="lp-group-tabs" role="tablist" aria-label="Compare benefit categories">${featureGroups.map((g,i)=>`<button type="button" role="tab" aria-selected="${i===groupIndex}" tabindex="${i===groupIndex?'0':'-1'}" class="${i===groupIndex?'active':''}" data-group="${i}">${g.name}</button>`).join('')}</div><div class="lp-compare-stage" id="lp-compare-stage"><div id="lp-matrix-region" aria-live="off">${matrix()}</div></div></div></div></div><section class="sh34-disclosures" aria-label="Important legal and platform disclosures">
  <div class="sh42-static"><h2>Disclosures &amp; important notices</h2><p class="sh34-lead">Saarthi is a private real estate platform of HDFC Capital Advisors Limited (HCAL). Content is provided for information only. It is not an offer, invitation, recommendation or commitment to undertake any investment or provide any service.</p>
    <div class="sh42-grid">
      <div><h3>Access &amp; eligibility</h3><p>Features, tiers, eligibility, pricing and service scope are subject to applicable terms and approvals. Using this website does not create a client, advisory or contractual relationship.</p></div>
      <div><h3>Investments &amp; risk</h3><p>Listings, terms, yields, IRRs and valuations are indicative and subject to availability and definitive documentation. Real estate investments carry risk, including loss of capital and illiquidity.</p></div>
      <div><h3>No professional advice</h3><p>Research, analytics and risk indicators are general information, not investment, legal, tax, accounting or valuation advice. Seek independent professional advice before acting.</p></div>
      <div><h3>Third parties &amp; services</h3><p>Developer names and third-party references are for discovery only and do not imply endorsement or partnership. Services are provided under separate engagement terms.</p></div>
      <div><h3>Data &amp; documents</h3><p>Portfolio values, records and documents reflect information supplied by or for the client and are not independently verified unless stated.</p></div>
      <div><h3>Accuracy &amp; group entities</h3><p>Information may change without notice. References to the HDFC Bank Group do not imply a guarantee by HDFC Bank or any group entity.</p></div>
    </div>
    <p class="sh34-legal-note">Any investment or service offering is governed solely by its definitive documentation, disclosures, eligibility criteria and regulatory requirements.</p></div>
</section>
<footer class="lp-footer"><span>HDFC CAPITAL <span class="lp-footer-divider">/</span> SAARTHI</span><span>Private real estate platform</span><span>© ${new Date().getFullYear()} · Saarthi</span></footer></div>`}
function sync(){const home=onHome();if(!home)document.body.classList.remove('lp-modal-open');document.documentElement.classList.toggle('saarthi-public',home);if(home){if(!ROOT.innerHTML)ROOT.innerHTML=publicHTML()}else{ROOT.innerHTML=''}const signout=document.getElementById('saarthi-signout');if(signout)signout.hidden=true;}
function openLogin(){if(true){location.hash='#portfolio';sync();return;}const modal=ROOT.querySelector('#lp-login-overlay');if(!modal)return;modal.hidden=false;document.body.classList.add('lp-modal-open');modal.querySelector('input').focus();}
function closeLogin(){const modal=ROOT.querySelector('#lp-login-overlay');if(modal)modal.hidden=true;document.body.classList.remove('lp-modal-open')}
function openMembership(){const modal=ROOT.querySelector('#lp-membership-overlay');if(!modal)return;modal.hidden=false;const form=modal.querySelector('#lp-membership-form');form.hidden=false;modal.querySelector('#lp-membership-confirm').hidden=true;form.elements.tier.value=tiers[selectedTier].name;document.body.classList.add('lp-modal-open');form.elements.name.focus()}
function openCompare(){const m=ROOT.querySelector('#lp42-compare');if(!m)return;m.hidden=false;document.body.classList.add('lp-modal-open');m.querySelector('.lp42-modal-close').focus()}
function closeCompare(){const m=ROOT.querySelector('#lp42-compare');if(m&&!m.hidden){m.hidden=true;document.body.classList.remove('lp-modal-open')}}
function closeMembership(){const modal=ROOT.querySelector('#lp-membership-overlay');if(modal)modal.hidden=true;document.body.classList.remove('lp-modal-open')}

ROOT.addEventListener('click',e=>{const anchor=e.target.closest('.lp-nav a[href^="#"],.lp-secondary[href^="#"]');if(anchor){const target=ROOT.querySelector(anchor.getAttribute('href'));if(target){e.preventDefault();target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return}}if(e.target.closest('[data-open-compare]')){openCompare();return}if(e.target.closest('[data-close-compare]')){closeCompare();return}const membership=e.target.closest('[data-open-membership]');if(membership){openMembership();return}if(e.target.closest('[data-close-membership]')){closeMembership();return}const login=e.target.closest('[data-open-login]');if(login){openLogin();return}if(e.target.closest('[data-close-login]')){closeLogin();return}const tier=e.target.closest('[data-tier]');if(tier){
 selectedTier=Number(tier.dataset.tier);
 if(ROOT.querySelector('.lp-tier-grid'))ROOT.querySelector('.lp-tier-grid').innerHTML=tierCards();
 setGroup(0);
 openCompare();
 return;
}
if(e.target.closest('[data-capital-prev]')){setCapitalSlide(capitalSlideIndex-1);return}
if(e.target.closest('[data-capital-next]')){setCapitalSlide(capitalSlideIndex+1);return}
const capitalDot=e.target.closest('[data-capital-slide]');if(capitalDot){setCapitalSlide(Number(capitalDot.dataset.capitalSlide));return}
if(e.target.closest('[data-slide-prev]')){setGroup(groupIndex-1);return}
if(e.target.closest('[data-slide-next]')){setGroup(groupIndex+1);return}

const group=e.target.closest('[data-group]');if(group){setGroup(Number(group.dataset.group));return}});
ROOT.addEventListener('submit',e=>{if(e.target.id!=='lp-membership-form')return;e.preventDefault();const f=e.target;const record={name:f.elements.name.value.trim(),email:f.elements.email.value.trim(),tier:f.elements.tier.value,notes:f.elements.notes.value.trim(),created:new Date().toISOString(),preview:true};if(!record.name||!f.elements.email.checkValidity())return;try{const prior=JSON.parse(localStorage.getItem('hc-saarthi-membership-preview')||'[]');prior.push(record);localStorage.setItem('hc-saarthi-membership-preview',JSON.stringify(prior.slice(-20)))}catch{}f.hidden=true;ROOT.querySelector('#lp-membership-confirm').hidden=false;});
ROOT.addEventListener('submit',e=>{if(e.target.id!=='lp-login-form')return;e.preventDefault();const f=e.target;const email=f.elements.email.value.trim()||'Guest';const error=ROOT.querySelector('#lp-login-error');try{sessionStorage.setItem(ACCESS_KEY,email)}catch{error.textContent='This browser cannot maintain a session.';return}closeLogin();location.hash='#portfolio';sync();if(typeof window.render==='function')window.render();});
window.addEventListener('hashchange',sync);
document.addEventListener('click',e=>{if(e.target.id==='saarthi-signout'){try{sessionStorage.removeItem(ACCESS_KEY)}catch{}location.hash='#home';ROOT.innerHTML='';sync();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeLogin();closeMembership();closeCompare();}if(e.target.closest?.('.lp-capital-carousel')&&['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();setCapitalSlide(capitalSlideIndex+(e.key==='ArrowRight'?1:-1));return}const tab=e.target.closest?.('[data-group]');if(tab&&['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?featureGroups.length-1:groupIndex+(e.key==='ArrowRight'?1:-1);setGroup(next);ROOT.querySelector(`[data-group="${groupIndex}"]`)?.focus()}});
let capitalTouchStart=null;
ROOT.addEventListener('touchstart',e=>{if(e.target.closest('.lp-capital-carousel'))capitalTouchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
ROOT.addEventListener('touchend',e=>{if(!capitalTouchStart)return;const end=e.changedTouches[0];const dx=end.clientX-capitalTouchStart.x,dy=end.clientY-capitalTouchStart.y;capitalTouchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.3)setCapitalSlide(capitalSlideIndex+(dx<0?1:-1));},{passive:true});
sync();
})();
