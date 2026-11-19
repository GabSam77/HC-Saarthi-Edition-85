/* Physical-property decision workspace. */
(()=>{
'use strict';
const today=new Date().toISOString().slice(0,10);
const past=days=>new Date(Date.now()-days*86400000).toISOString().slice(0,10);
const future=days=>new Date(Date.now()+days*86400000).toISOString().slice(0,10);
const purposes=['Operating','Income','Strategic','Family'];
const colors={Operating:'#315c87',Income:'#278d91',Strategic:'#8f9fb7',Family:'#bd8b56'};
const defaults={share:100,debt:0,rent:0,cost:0,interest:0,principal:0,principalMonth:6,capex:0,capexMonth:6,floating:100,occupancy:100,lease:24,exit:12,stage:'Completed',docs:'Reviewed / clear',restriction:'None',approver:'Investment committee',tenant:'',valueDate:today,basis:'Management estimate',decision:'Hold',debtMaturity:36};
const seed=[
 {id:'A01',name:'Manesar Manufacturing Campus',city:'Manesar',type:'Factory',purpose:'Operating',entity:'Operating Company',value:165,debt:42,cost:1.65,interest:3.78,principal:4,principalMonth:9,capex:6,capexMonth:4,restriction:'Business-critical',approver:'Operating-company board',exit:24,valueDate:past(130),decision:'Retain for operations'},
 {id:'A02',name:'NCR Corporate Headquarters',city:'Delhi NCR',type:'Office',purpose:'Operating',entity:'Operating Company',value:110,debt:20,cost:1.25,interest:1.7,principal:1,principalMonth:12,capex:1.5,capexMonth:2,floating:50,restriction:'Business-critical',approver:'Operating-company board',valueDate:past(180),decision:'Retain for operations'},
 {id:'A03',name:'Gurugram Office Floors',city:'Gurugram',type:'Office',purpose:'Income',entity:'Family Investments',value:82,debt:18,rent:6.6,cost:1.1,interest:1.53,principal:1.5,principalMonth:12,capex:.8,capexMonth:3,occupancy:92,lease:9,exit:9,tenant:'Tenant group A',valueDate:past(100),decision:'Renew lease'},
 {id:'A04',name:'Bhiwandi Logistics Park',city:'Bhiwandi',type:'Logistics',purpose:'Income',entity:'Family Investments',value:65,debt:12,rent:5.2,cost:.55,interest:1.08,principal:12,principalMonth:7,capex:.3,capexMonth:5,lease:42,exit:12,tenant:'Tenant group B',debtMaturity:7,valueDate:past(95),decision:'Review refinancing'},
 {id:'A05',name:'Pune High-Street Retail',city:'Pune',type:'Retail',purpose:'Income',entity:'Family Investments',value:34,share:50,debt:2,rent:.78,cost:.12,interest:.18,principal:.2,principalMonth:6,capex:.1,capexMonth:6,lease:18,occupancy:100,exit:18,tenant:'Tenant group C',restriction:'Co-owner consent',valueDate:past(220),decision:'Hold'},
 {id:'A06',name:'Noida Land Reserve',city:'Noida',type:'Land',purpose:'Strategic',entity:'Family Trust',value:72,cost:.24,capex:2.5,capexMonth:10,stage:'Land',docs:'Review pending',restriction:'Trust consent',exit:30,valueDate:past(470),approver:'Trustees',decision:'Review best use'},
 {id:'A07',name:'Alibaug Family Home',city:'Alibaug',type:'Residential',purpose:'Family',entity:'Family Trust',value:50,cost:.5,restriction:'Family-use asset',exit:18,approver:'Family council',valueDate:past(400),decision:'Retain for family use'},
 {id:'A08',name:'Bengaluru Residential JV',city:'Bengaluru',type:'Residential',purpose:'Strategic',entity:'Development SPV',value:90,share:40,debt:10,cost:.15,interest:1.2,capex:8,capexMonth:8,stage:'Under construction',docs:'Review pending',restriction:'Partner consent',exit:24,valueDate:past(110),approver:'JV board',decision:'Review funding'}
].map(a=>({...defaults,...a}));
const initialActions=()=>[
 {id:'D01',asset:'A04',title:'Agree the loan-maturity funding plan',owner:'CFO',due:future(14),status:'Open',note:'Confirm repayment versus refinancing before the month-7 maturity.'},
 {id:'D02',asset:'A03',title:'Set the lease-renewal position',owner:'Property lead',due:future(30),status:'Open',note:'Review tenant intent and permitted leasing terms.'},
 {id:'D03',asset:'A06',title:'Update valuation and documentation',owner:'Property lead',due:future(21),status:'Open',note:'Current estimate is older than 12 months; title review remains pending.'},
 {id:'D04',asset:'A08',title:'Confirm the JV capital-call schedule',owner:'Investment team',due:future(10),status:'Open',note:'Check remaining funding against the development agreement.'},
 {id:'D05',asset:'A01',title:'Pay the half-yearly property tax',owner:'Finance',due:future(13),status:'Open',note:'Half-yearly property tax instalment for the campus.'}
];
const state={name:'Family office portfolio',asOf:today,sample:true,assets:structuredClone(seed),actions:initialActions(),reserve:55,scenario:{value:20,rent:15,rate:2,capex:10},tab:'overview',group:'purpose',focusGroup:null,filters:{query:'',purpose:'',entity:'',city:'',sort:'value'},month:0,taskView:'open'};
const known=n=>typeof n==='number'&&Number.isFinite(n);
const sum=(rows,fn)=>rows.reduce((n,a)=>n+fn(a),0);
const amount=a=>a.value*(a.share/100);
const total=(rows,key)=>rows.every(a=>known(a[key]))?sum(rows,a=>a[key]):null;
const plus=(...args)=>args.every(known)?args.reduce((a,b)=>a+b,0):null;
const currency=(n,d=2)=>known(n)?(n<0?'−₹':'₹')+Math.abs(n).toLocaleString('en-IN',{maximumFractionDigits:d})+' cr':'Not entered';
const pct=n=>known(n)?n.toFixed(1)+'%':'—';
const months=()=>Array.from({length:12},(_,i)=>new Date(Number(state.asOf.slice(0,4)),Number(state.asOf.slice(5,7))+i,1).toLocaleDateString('en-IN',{month:'short',year:'2-digit'}));
function aggregate(rows=state.assets){
 const value=sum(rows,amount),debt=total(rows,'debt'),rent=total(rows,'rent'),cost=total(rows,'cost'),interest=total(rows,'interest'),principal=total(rows,'principal'),capex=total(rows,'capex');
 const income=rows.filter(a=>a.purpose==='Income'),incomeValue=sum(income,amount),incomeRent=total(income,'rent'),incomeCost=total(income,'cost');
 const noi=plus(rent,known(cost)?-cost:null),cash=plus(noi,known(interest)?-interest:null,known(principal)?-principal:null,known(capex)?-capex:null);
 return{value,debt,equity:known(debt)?value-debt:null,rent,cost,interest,principal,capex,noi,cash,incomeValue,incomeRent,incomeCost,netYield:incomeValue&&known(incomeRent)&&known(incomeCost)?(incomeRent-incomeCost)/incomeValue*100:null,ltv:value&&known(debt)?debt/value*100:null,dscr:known(noi)&&known(interest)&&known(principal)&&interest+principal>0?noi/(interest+principal):null,count:rows.length,unknown:rows.filter(a=>['debt','rent','cost','interest','principal','capex'].some(k=>!known(a[k]))).length};
}
function groups(key='purpose',rows=state.assets){
 const map=new Map();rows.forEach(a=>{const name=String(a[key]||'Unspecified');if(!map.has(name))map.set(name,{name,value:0,count:0,assets:[]});const g=map.get(name);g.value+=amount(a);g.count++;g.assets.push(a.id)});
 const palette=['#315c87','#278d91','#8f9fb7','#bd8b56','#537c9f','#6ba3a8','#52627f','#8b6d65'];
 return [...map.values()].sort((a,b)=>b.value-a.value).map((a,i)=>({...a,color:key==='purpose'?colors[a.name]:palette[i%palette.length]}));
}
function filtered(){const f=state.filters;return state.assets.filter(a=>(!f.purpose||a.purpose===f.purpose)&&(!f.entity||a.entity===f.entity)&&(!f.city||a.city===f.city)&&(!f.risk||!window.RiskStudio||window.RiskStudio.match(a,f.risk))&&(!f.query||[a.name,a.city,a.entity,a.type,a.purpose,a.id].join(' ').toLowerCase().includes(f.query.toLowerCase()))).sort((a,b)=>f.sort==='risk'&&window.RiskStudio?window.RiskStudio.score(b).score-window.RiskStudio.score(a).score:f.sort==='name'?a.name.localeCompare(b.name):f.sort==='debt'?(b.debt??-1)-(a.debt??-1):amount(b)-amount(a));}
function scenario(s=state.scenario){const b=aggregate(),value=b.value*(1-s.value/100),rent=known(b.rent)?b.rent*(1-s.rent/100):null,extra=s.rate===0?0:state.assets.every(a=>known(a.debt))?sum(state.assets,a=>a.debt*a.floating/100*s.rate/100):null,interest=plus(b.interest,extra),capex=known(b.capex)?b.capex*(1+s.capex/100):null,cash=plus(rent,known(b.cost)?-b.cost:null,known(interest)?-interest:null,known(b.principal)?-b.principal:null,known(capex)?-capex:null);return{...b,value,rent,interest,capex,cash,equity:known(b.debt)?value-b.debt:null,ltv:value&&known(b.debt)?b.debt/value*100:null,extra,endCash:plus(state.reserve,cash),equityLoss:known(b.equity)&&b.equity>0?(b.equity-(value-b.debt))/b.equity*100:null};}
function cashPlan(s={value:0,rent:0,rate:0,capex:0}){
 const r=scenario(s),labels=months();let balance=state.reserve;
 return labels.map((label,i)=>{const rent=known(r.rent)?r.rent/12:null,cost=known(r.cost)?r.cost/12:null,interest=known(r.interest)?r.interest/12:null;const principal=state.assets.every(a=>known(a.principal))?sum(state.assets,a=>a.principalMonth===i+1?a.principal:0):null,capex=state.assets.every(a=>known(a.capex))?sum(state.assets,a=>a.capexMonth===i+1?a.capex*(1+s.capex/100):0):null;const net=plus(rent,known(cost)?-cost:null,known(interest)?-interest:null,known(principal)?-principal:null,known(capex)?-capex:null);balance=plus(balance,net);return{label,rent,cost,interest,principal,capex,net,balance,index:i};});
}
function alerts(){const out=[];state.assets.forEach(a=>{
 const add=(kind,title,detail)=>out.push({asset:a.id,kind,title,detail,value:amount(a)});
 if(a.docs!=='Reviewed / clear')add(a.docs==='Unresolved issue'?'high':'watch','Documentation',a.docs);
 const age=(new Date(state.asOf)-new Date(a.valueDate))/86400000;
 if(age>365)add('watch','Valuation age',Math.floor(age/30)+' months since estimate');
 if(a.purpose==='Income'&&a.lease<12)add('watch','Lease expiry',a.lease+' months remaining');
 if(a.debt>0&&a.debtMaturity<=12)add('high','Debt maturity',a.debtMaturity+' months · '+currency(a.debt));
 if(a.debt>amount(a))add('high','Negative net value','Debt exceeds the attributable property value');
 if(['debt','rent','cost','interest','principal','capex'].some(k=>!known(a[k])))add('high','Missing financial inputs','Complete inputs before relying on totals');
 if(a.debtMaturity<=12&&a.debt>0&&known(a.principal)&&a.principal<a.debt)add('high','Funding gap in debt schedule','Entered 12-month principal is below debt maturing within 12 months');
 });return out.sort((a,b)=>(a.kind==='high'?0:1)-(b.kind==='high'?0:1)||b.value-a.value);}
function saleCapacity(horizon=12,haircut=10){const assets=state.assets.filter(a=>['Income','Strategic'].includes(a.purpose)&&a.restriction==='None'&&a.docs==='Reviewed / clear'&&a.stage==='Completed'&&a.exit<=horizon&&known(a.debt));return{assets,proceeds:sum(assets,a=>Math.max(0,amount(a)*(1-haircut/100)*.98-a.debt))};}
function validateAsset(a){
 for(const k of ['name','city','entity','type','purpose','approver','valueDate'])if(!String(a[k]||'').trim())return 'Complete '+k+'.';
 if(!purposes.includes(a.purpose)||!['Completed','Under construction','Stalled','Land'].includes(a.stage)||!['Reviewed / clear','Review pending','Unresolved issue'].includes(a.docs)||!['None','Business-critical','Family-use asset','Co-owner consent','Trust consent','Partner consent','Other restriction'].includes(a.restriction))return 'Choose valid purpose, status and restriction options.';
 if(!known(a.value)||a.value<=0||!known(a.share)||a.share<=0||a.share>100)return 'Enter a positive property value and ownership share between 0 and 100%.';
 for(const k of ['debt','rent','cost','interest','principal','capex'])if(a[k]!==null&&(!known(a[k])||a[k]<0))return 'Enter non-negative financial amounts; leave unknown amounts blank.';
 for(const [k,max] of [['floating',100],['occupancy',100],['lease',1200],['exit',1200],['debtMaturity',1200]])if(!known(a[k])||a[k]<0||a[k]>max)return 'Invalid '+k+'.';
 for(const k of ['principalMonth','capexMonth'])if(!Number.isInteger(a[k])||a[k]<1||a[k]>12)return 'Choose a scheduled payment month.';
 if(known(a.principal)&&known(a.debt)&&a.principal>a.debt)return 'Scheduled principal cannot exceed outstanding debt.';
 if(known(a.rent)&&a.purpose!=='Income'&&a.rent!==0)return 'Record rent only for an Income asset; split mixed-use interests into distinct, non-overlapping records.';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(a.valueDate)||Number.isNaN(Date.parse(a.valueDate))||a.valueDate>state.asOf)return 'Use a valid valuation date, on or before the portfolio date.';
 return '';
}
function replace(data){
 if(!data||data.format!=='saarthi-portfolio-v2'||!Array.isArray(data.assets)||data.assets.length>200||!Array.isArray(data.actions)||data.actions.length>1000)return 'Choose a Saarthi portfolio backup (up to 200 assets).';
 if(!known(data.reserve)||data.reserve<0||!/^\d{4}-\d{2}-\d{2}$/.test(data.asOf)||Number.isNaN(Date.parse(data.asOf)))return 'Invalid reserve or portfolio date.';
 const old=state.asOf;state.asOf=data.asOf;let error='';const ids=new Set();for(const a of data.assets){error=validateAsset(a);if(error)break;if(!/^[A-Za-z0-9_-]{1,50}$/.test(a.id)||ids.has(a.id)){error='Asset IDs must be unique.';break;}ids.add(a.id)}state.asOf=old;
 if(error)return error;
 const taskIds=new Set();for(const t of data.actions){if(!ids.has(t.asset)||!['Open','Reviewed'].includes(t.status)||typeof t.title!=='string'||typeof t.owner!=='string'||typeof t.note!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(t.due)||Number.isNaN(Date.parse(t.due))||typeof t.id!=='string'||taskIds.has(t.id))return 'Invalid decision record.';taskIds.add(t.id);}
 const savedScenario=data.scenario||{value:20,rent:15,rate:2,capex:10};for(const[k,max]of [['value',50],['rent',50],['rate',5],['capex',50]])if(!known(savedScenario[k])||savedScenario[k]<0||savedScenario[k]>max)return 'Invalid scenario assumptions.';
 Object.assign(state,{name:String(data.name||'Working portfolio').slice(0,120),asOf:data.asOf,assets:structuredClone(data.assets),actions:structuredClone(data.actions),reserve:data.reserve,scenario:structuredClone(savedScenario),sample:false,focusGroup:null,filters:{query:'',purpose:'',entity:'',city:'',sort:'value'}});return '';
}
function backup(){return{format:'saarthi-portfolio-v2',name:state.name,asOf:state.asOf,reserve:state.reserve,scenario:state.scenario,assets:state.assets,actions:state.actions};}
function fresh(){return{...defaults,id:'A'+Date.now().toString(36),name:'',city:'',type:'Office',purpose:'Income',entity:'',value:0,share:100,debt:null,rent:null,cost:null,interest:null,principal:null,capex:null,approver:''};}
function riskAssets(){return state.assets.map(a=>({name:a.name,city:a.city,type:a.type,value:amount(a),debt:a.debt,rent:a.rent,use:a.purpose==='Income'?'Rental':a.stage==='Completed'?'Self-use':'Development / land',occupancy:a.occupancy,lease:a.lease,exit:a.exit,stage:a.stage,docs:a.docs}));}
function changed(){state.sample=false;if(window.HCPortfolio){window.HCPortfolio.get().report=null;window.HCPortfolio.get().dirty=true;}}
window.CIOModel={state,purposes,colors,seed,known,currency,pct,amount,total,plus,aggregate,groups,filtered,scenario,cashPlan,alerts,saleCapacity,validateAsset,replace,backup,fresh,riskAssets,changed,months,reset(){Object.assign(state,{assets:structuredClone(seed),actions:initialActions(),reserve:55,sample:true,name:'Family office portfolio',asOf:today,focusGroup:null,filters:{query:'',purpose:'',entity:'',city:'',sort:'value'}});if(window.HCPortfolio)window.HCPortfolio.get().report=null;}};
})();
