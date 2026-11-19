/* Edition 85: remove Land Opportunities from the live catalogue without shifting legacy category indices. */
(()=>{'use strict';
 const removed=new Set(deals.filter(d=>d.cat===2).map(d=>d.id));
 for(let i=deals.length-1;i>=0;i--){if(deals[i].cat===2)deals.splice(i,1)}
 if (getPage() === 'opportunities') selectCoInvestments();

 // Clicking the current navigation link does not trigger a hash change.
 document.addEventListener('click', event => {
   if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
   if (location.hash !== '#opportunities' || !event.target.closest('a[href="#opportunities"]')) return;
   selectCoInvestments();
   window.render();
 });
 try{for(const id of removed){saved.delete(id);ui.compare.delete(id)}}catch{}
 const original=opportunityPage;
 opportunityPage=function(){if(ui.cat===2)selectCoInvestments();return original()};
 if(ui.page==='opportunities'&&typeof window.render==='function')window.render();
})();
