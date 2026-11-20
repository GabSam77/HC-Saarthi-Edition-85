/* Edition 28 — selected opportunity categories and indicative upcoming-project directory. */
(()=>{'use strict';
const projects=[
 ['Mumbai Metropolitan Region','Lodha','https://www.lodhagroup.com/','Mumbai'],
 ['Gurugram','DLF','https://www.dlf.in/','Gurugram'],
 ['Bengaluru','Prestige Group','https://www.prestigeconstructions.com/','Bengaluru'],
 ['Pune','Kolte-Patil Developers','https://www.koltepatil.com/','Pune'],
 ['Hyderabad','Aparna Constructions','https://www.aparnaconstructions.com/','Hyderabad'],
 ['Noida','Godrej Properties','https://www.godrejproperties.com/','Noida'],
 ['Chennai','Casagrand','https://www.casagrand.co.in/','Chennai'],
 ['Bengaluru','Brigade Group','https://www.brigadegroup.com/','Bengaluru'],
 ['Mumbai Metropolitan Region','Runwal','https://www.runwal.com/','Mumbai'],
 ['Pune','Mahindra Lifespaces','https://www.mahindralifespaces.com/','Pune']
];
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
categories[0].name='Upcoming Projects';categories[0].short='Upcoming Projects';categories[2].name='Land Opportunities';categories[2].short='Land Opportunities';
const base=opportunityPage;
function upcoming(){const q=ui.query.trim().toLowerCase(),list=projects.filter(p=>[p[0],p[1]].join(' ').toLowerCase().includes(q)),shown=list.slice(0,ui.visibleDeals);return `<div class="hx-op-page r28-upcoming">${pageHead('Investment Opportunities',`<button class="btn light" data-action="mandate">${icon('plus')}Submit opportunity</button>`)}<div class="r28-op-intro"><div><span class="r28-kicker">PROJECT DISCOVERY</span><h2>Upcoming Projects</h2><p>Browse developers and indicative locations. Visit the developer’s website for current project announcements, availability and pricing.</p></div><span>10 developer references</span></div>${categoryNav()}<div class="r28-upcoming-tools"><div class="searchbox">${icon('search')}<input id="deal-search" type="search" placeholder="Search developer or location" value="${E(ui.query)}" aria-label="Search upcoming projects"></div><span>${list.length} matches</span></div><div class="r28-project-grid" id="opportunity-results">${shown.map((p,i)=>`<article class="r28-project-card"><div class="r28-project-top"><span>${String(i+1).padStart(2,'0')}</span><span>DEVELOPER DIRECTORY</span></div><h3>${E(p[1])}</h3><p><span class="r28-pin">⌖</span> ${E(p[0])}</p><a href="${p[2]}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${E(p[1])} website">Visit developer website <span>↗</span></a></article>`).join('')||'<p>No developers match your search.</p>'}</div>${shown.length<list.length?`<div class="r28-more"><button class="btn light" data-action="show-more-deals">Show more developers</button></div>`:''}<p class="r28-disclaimer">A discovery list, not verified project launches or an offer. Locations indicate areas of interest only. Links open developers’ public websites; no affiliation or inventory is implied.</p></div>`}
function categoryNav(){return `<div class="hx-op-categories r28-category-nav" role="group" aria-label="Opportunity categories">${categories.map((c,i)=>`<button class="${ui.cat===i?'active':''}" data-cat="${i}" aria-pressed="${ui.cat===i}">${icon(c.icon)}${E(c.short)}<span>${i===0?projects.length:deals.filter(d=>d.cat===i).length}</span></button>`).join('')}</div>`}
opportunityPage=function(){if(ui.cat===0)return upcoming();let html=base();html=html.replace(/<button class="[^"]*" data-cat="-1"[^>]*>All<span>\d+<\/span><\/button>/,'');return html;};
const oldReset=resetFilters;resetFilters=function(){oldReset();ui.cat=0;};
window.SaarthiUpcoming28={projects};
})();