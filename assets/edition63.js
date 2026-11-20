/* Edition 63: account menu on the avatar, sign out, and a sign-in screen for private pages. */
(()=>{'use strict';
const OUT_KEY='hc-saarthi-signed-out',ACCESS_KEY='saarthi-preview-access',PRIVATE=['portfolio','research','opportunities','financing','services'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=(k,store=localStorage)=>{try{return store.getItem(k)}catch{return null}};
const set=(k,v,store=localStorage)=>{try{v===null?store.removeItem(k):store.setItem(k,v)}catch{}};
const email=()=>get('hc-saarthi-user')||get(ACCESS_KEY,sessionStorage)||'';
const signedIn=()=>get(OUT_KEY)!=='1' && Boolean(email());
const page=()=>(location.hash||'#home').slice(1).split(/[/?]/)[0]||'home';

/* ---------- Account menu ---------- */
const label=document.querySelector('.header-label');
if(label){
 label.innerHTML=`<button type="button" class="acct63-signin" hidden>Sign in</button><div class="acct63"><button type="button" class="acct63-btn avatar" aria-haspopup="menu" aria-expanded="false" aria-controls="acct63-menu" aria-label="Account menu">FO</button><div class="acct63-menu" id="acct63-menu" role="menu" hidden></div></div>`;
}
const btn=document.querySelector('.acct63-btn'),menu=document.getElementById('acct63-menu');
function paintMenu(){if(!menu)return;const on=signedIn(),em=email();
 menu.innerHTML=on?`<div class="acct63-head"><span class="acct63-mark">FO</span><span><b>Family office</b><small>${em?esc(em):'Private workspace'}</small></span></div>
  <button role="menuitem" data-acct="profile">${ico('user')}View profile</button>
  <button role="menuitem" data-acct="settings">${ico('gear')}Portfolio settings</button>
  <button role="menuitem" data-acct="requests">${ico('list')}My Services</button>
  <button role="menuitem" data-acct="documents">${ico('doc')}My Documents</button>
  <div class="acct63-sep"></div>
  <button role="menuitem" data-acct="logout" class="acct63-out">${ico('out')}Log out</button>`
 :`<div class="acct63-head"><span class="acct63-mark">FO</span><span><b>Signed out</b><small>Sign in to open your workspace</small></span></div><button role="menuitem" data-acct="login">${ico('in')}Sign in</button>`;}
function ico(n){const p={user:'<circle cx="10" cy="7" r="3.2"/><path d="M3.8 16.5c1-3 3.4-4.5 6.2-4.5s5.2 1.5 6.2 4.5"/>',gear:'<circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/>',list:'<path d="M7 5.5h9M7 10h9M7 14.5h9M3.5 5.5h.01M3.5 10h.01M3.5 14.5h.01"/>',doc:'<path d="M5.5 2.5h6l3.5 3.5v11.5h-9.5z"/><path d="M11.5 2.5V6H15"/>',out:'<path d="M8 3.5H4.5v13H8M12.5 6.5 16 10l-3.5 3.5M16 10H7.5"/>',in:'<path d="M12 3.5h3.5v13H12M7.5 6.5 11 10l-3.5 3.5M11 10H2.5"/>'}[n];return `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`}
function openMenu(){if(!menu)return;paintMenu();menu.hidden=false;btn.setAttribute('aria-expanded','true');menu.querySelector('[role=menuitem]')?.focus()}
function closeMenu(){if(!menu||menu.hidden)return;menu.hidden=true;btn.setAttribute('aria-expanded','false')}
btn?.addEventListener('click',e=>{e.stopPropagation();menu.hidden?openMenu():closeMenu()});
document.addEventListener('click',e=>{if(!e.target.closest('.acct63'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();}
 if(!menu||menu.hidden)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){const items=[...menu.querySelectorAll('[role=menuitem]')],i=items.indexOf(document.activeElement);e.preventDefault();items[(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus()}});

function go(hash,after){if(location.hash==='#'+hash){after&&after();return}location.hash=hash;if(after)setTimeout(after,450)}
function openTab(tab){try{window.CIOModel.state.tab=tab}catch{}if(page()==='portfolio'){window.render&&window.render()}else go('portfolio')}
menu?.addEventListener('click',e=>{const b=e.target.closest('[data-acct]');if(!b)return;const k=b.dataset.acct;closeMenu();
 if(k==='logout'){set(OUT_KEY,'1');set('hc-saarthi-user',null);set(ACCESS_KEY,null,sessionStorage);document.querySelector('dialog[open]')?.close?.();location.hash='home';applyGate();window.scrollTo({top:0});return}
 if(k==='login'){showGate(true);return}
 if(k==='profile'){profile();return}
 if(k==='settings'){go('portfolio',()=>{const t=document.createElement('button');t.dataset.cio='settings';t.hidden=true;document.body.append(t);t.click();t.remove()});return}
 if(k==='requests'){openTab('services');return}
 if(k==='documents'){openTab('documents');return}
});
function profile(){const em=email(),S=window.CIOModel?.state,n=S?.assets?.length||0;const html=`<div class="acct63-profile"><div class="acct63-profile-top"><span class="acct63-mark lg">FO</span><div><h3>Family office</h3><p>${em?esc(em):'Private workspace'}</p></div></div><dl><div><dt>Workspace</dt><dd>Family office portfolio</dd></div><div><dt>Properties</dt><dd>${n}</dd></div><div><dt>Portfolio as on</dt><dd>${S?.asOf?new Date(S.asOf+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'}</dd></div><div><dt>Session</dt><dd>Signed in on this browser</dd></div></dl><p class="acct63-note">To change contact details or who can access this workspace, contact your HDFC Capital relationship team.</p></div>`;
 if(typeof window.openDialog==='function')window.openDialog('Profile',html,'');else alert('Family office'+(em?' · '+em:''));}

/* ---------- Sign-in screen for private pages ---------- */
const gate=document.createElement('section');gate.className='gate63';gate.id='gate63';gate.hidden=true;gate.setAttribute('aria-label','Sign in');
gate.innerHTML=`<div class="gate63-card"><div class="gate63-brand"><span>SAARTHI</span><small>Private workspace</small></div><h1>Sign in to continue</h1><p>Explore the Saarthi demonstration workspace.</p><form id="gate63-form" novalidate><label>Username<input type="text" name="email" autocomplete="username" placeholder="Enter any username"></label><label>Password<input type="password" name="code" autocomplete="off" placeholder="Enter any password"></label><p class="gate63-error" role="alert"></p><button type="submit">Sign in</button></form><p class="acct63-note">Preview access only. Any username and password will work. Please do not use real credentials.</p><a class="gate63-back" href="#home">← Back to home</a></div>`;
document.getElementById('app')?.before(gate);
let signInRequested = false;
const signInButton = label?.querySelector('.acct63-signin');
const account = label?.querySelector('.acct63');
gate.querySelector('form').addEventListener('submit', event => {
 event.preventDefault();
 const form = event.currentTarget;
 const username = form.elements.namedItem('email').value.trim() || 'Guest';
 set(OUT_KEY, null);
 set('hc-saarthi-user', username);
 set(ACCESS_KEY, username, sessionStorage);
 form.reset();
 signInRequested = false;
 applyGate();
 window.render?.();
 if (page() === 'home') btn?.focus();
 window.scrollTo({top: 0});
});
function showGate(focus) {
 signInRequested = true;
 closeMenu();
 applyGate();
 if (focus) gate.querySelector('input')?.focus();
}
function applyGate() {
 const home = page() === 'home';
 const authenticated = signedIn();
 // The public demo allows first-time visitors to explore without signing in.
 const locked = !authenticated && (signInRequested || (get(OUT_KEY) === '1' && PRIVATE.includes(page())));
 gate.hidden = !locked;
 document.documentElement.classList.toggle('hc-locked', locked);
 document.documentElement.classList.toggle('hc-signed-out', !authenticated);
 if (signInButton) signInButton.hidden = !home || authenticated || locked;
 if (account) account.hidden = home && !authenticated;
 if (locked || !authenticated) closeMenu();
}
signInButton?.addEventListener('click', () => showGate(true));
gate.querySelector('.gate63-back').addEventListener('click', event => {
 if (page() !== 'home') return;
 event.preventDefault();
 signInRequested = false;
 applyGate();
 signInButton?.focus();
});
window.addEventListener('hashchange', () => {
 signInRequested = false;
 closeMenu();
 applyGate();
});
window.addEventListener('storage', event => {
 if (event.key === OUT_KEY || event.key === 'hc-saarthi-user' || event.key === null) applyGate();
});
applyGate();
window.SaarthiAuth63={signedIn,applyGate};
document.addEventListener('click',e=>{const b=e.target.closest('[data-e75-service]');if(!b)return;e.preventDefault();e.stopPropagation();if(typeof window.serviceForm!=='function'&&typeof serviceForm!=='function')return;(window.serviceForm||serviceForm)(b.dataset.e75Service);setTimeout(()=>{const f=document.getElementById('service-form');if(!f)return;if(f.asset)f.asset.value=b.dataset.asset||'';if(f.city&&b.dataset.city)f.city.value=b.dataset.city;f.subtype&&!f.subtype.disabled?f.subtype.focus():f.asset?.focus()},40)},true);
document.addEventListener('click',e=>{const tr=e.target.closest('.cio69-table tbody tr');if(!tr||e.target.closest('button,a'))return;tr.querySelector('.cio69-item')?.click()});
})();
