import * as THREE from 'three';
const PAIRS=['BTC','DXY','XAUUSD','GBPUSD','GBPJPY','EURUSD','GBPAUD','USDCAD','USDJPY','AUDUSD','EURAUD'];
const price={},prev={};
const AG=[
{id:'gold',name:'محلل الذهب والدولار',pairs:['XAUUSD','DXY'],c:0xf5b301,p:[-6,0,-4]},
{id:'gbp',name:'محلل الباوند',pairs:['GBPUSD','GBPJPY','GBPAUD'],c:0x4f8cff,p:[-2,0,-4]},
{id:'eur',name:'محلل اليورو والين',pairs:['EURUSD','EURAUD','USDJPY'],c:0x9b5cff,p:[2,0,-4]},
{id:'com',name:'محلل السلع والكوموديتي',pairs:['USDCAD','AUDUSD'],c:0x2ecc71,p:[6,0,-4]},
{id:'btc',name:'محلل البيتكوين',pairs:['BTC'],c:0xff7a1a,p:[-4,0,2]},
{id:'risk',name:'مدير المخاطر',pairs:[],c:0xe74c3c,p:[1,0,3],info:'مخاطرة 1% من الرصيد بكل صفقة'},
{id:'exec',name:'المنفّذ',pairs:[],c:0x1abc9c,p:[6,0,3],info:'ينفذ على MT5 ديمو 114086449'}];
const $=s=>document.querySelector(s);
const kt=d=>new Date(d).toLocaleString('ar-KW',{timeZone:'Asia/Kuwait',hour12:false});
setInterval(()=>$('#clock')&&($('#clock').textContent='الكويت '+new Date().toLocaleTimeString('ar-KW',{timeZone:'Asia/Kuwait',hour12:false})),1000);
function say(a,t){const m=document.createElement('div');m.className='msg';m.style.setProperty('--c','#'+a.c.toString(16).padStart(6,'0'));m.innerHTML=`<b>${a.name}</b> ${t}<small>${kt(Date.now())}</small>`;$('#msgs').prepend(m);bubble(a,t)}
// --- scene
const host=$('#scene'),R=new THREE.WebGLRenderer({antialias:true});R.shadowMap.enabled=true;host.appendChild(R.domElement);
const S=new THREE.Scene();S.background=new THREE.Color(0x1a1d26);
const cam=new THREE.OrthographicCamera(-1,1,1,-1,0.1,100);cam.position.set(14,14,14);cam.lookAt(0,0,0);
S.add(new THREE.HemisphereLight(0xffffff,0x444455,1.1));const dl=new THREE.DirectionalLight(0xffffff,1.2);dl.position.set(8,15,5);dl.castShadow=true;S.add(dl);
const M=c=>new THREE.MeshStandardMaterial({color:c,flatShading:true});
const box=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;S.add(m);return m};
box(20,0.2,14,0xe9e9ec,0,-0.1,0);box(20,3,0.2,0xd4d4d8,0,1.5,-7);box(0.2,3,14,0xdcdce0,-10,1.5,0);
for(const a of AG){const [x,,z]=a.p;box(1.8,0.1,1,0xffffff,x,0.8,z-0.9);box(0.1,0.8,0.1,0xbbbbbb,x-0.8,0.4,z-0.9);box(0.1,0.8,0.1,0xbbbbbb,x+0.8,0.4,z-0.9);
 box(0.6,0.4,0.05,0x222222,x,1.1,z-1.2);box(1.9,1.2,0.08,0xcfcfd4,x,0.6,z-1.5);box(0.6,0.08,0.6,0x9a9aa2,x,0.45,z);box(0.6,0.6,0.08,0x9a9aa2,x,0.75,z+0.3);a.seat=new THREE.Vector3(x,0,z)}
const ray=new THREE.Raycaster(),tags=[];
// props: whiteboard + coffee area
box(3,1.6,0.08,0xffffff,0,1.7,-6.85);box(3.2,0.08,0.15,0x888888,0,0.88,-6.8);
box(1.2,0.9,0.7,0x6b4f3a,-9,0.45,-0.5);box(0.3,0.4,0.3,0x222222,-9,1.1,-0.5);box(0.12,0.15,0.12,0xffffff,-8.7,0.98,-0.3);
const plant=(x,z)=>{box(0.4,0.4,0.4,0x8d6e63,x,0.2,z);const m=new THREE.Mesh(new THREE.SphereGeometry(0.45,8,6),M(0x2e7d32));m.position.set(x,0.85,z);S.add(m)};plant(-9.2,-6.2);plant(9.2,-6.2);plant(-9.2,6);
const SPOTS={board:new THREE.Vector3(0,0,-6),coffee:new THREE.Vector3(-8,0,-0.5)};
for(const a of AG){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.28,0.5,4,8),M(a.c));body.position.y=0.65;const h=new THREE.Mesh(new THREE.SphereGeometry(0.22,12,10),M(a.c));h.position.y=1.3;
 const eye=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.05,0.05),M(0x111111));eye.position.set(0,0.03,0.2);h.add(eye);
 const arm=s=>{const m=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.42,0.1),M(a.c));m.geometry.translate(0,-0.2,0);m.position.set(0.34*s,1,0);g.add(m);return m};
 g.add(body,h);a.body=body;a.head=h;a.arms=[arm(1),arm(-1)];a.ph=Math.random()*6;
 g.position.copy(a.seat);g.position.y=0.15;g.rotation.y=Math.PI;g.userData.a=a;S.add(g);a.g=g;
 const t=document.createElement('div');t.className='tag';t.textContent=a.name;t.style.background='#'+a.c.toString(16).padStart(6,'0');host.appendChild(t);a.tag=t;a.q=[];a.busy=false}
function bubble(a,t){if(a.bb)a.bb.remove();const d=document.createElement('div');d.className='bub';d.textContent=t;host.appendChild(d);a.bb=d;setTimeout(()=>{d.remove();if(a.bb===d)a.bb=null},6000)}
// simple aisle pathing: row1 (z<-1) & props use aisle z=-2.5, row2 uses z=4.5, side corridor x=9
const aisle=p=>p.z<0?-2.5:4.5,V=(x,z)=>new THREE.Vector3(x,0,z);
function route(p,q){const ap=aisle(p),aq=aisle(q);return ap==aq?[V(p.x,ap),V(q.x,aq),q.clone()]:[V(p.x,ap),V(9,ap),V(9,aq),V(q.x,aq),q.clone()]}
async function walk(a,to){a.walking=true;for(const w of route(a.g.position,to))await new Promise(r=>a.q.push({to:w,r}));a.walking=false}
const near=(a,o)=>a.seat.clone().add(V(o.seat.x>a.seat.x?-0.8:0.8,0.6))
const ag=id=>AG.find(a=>a.id==id);
function resize(){const w=host.clientWidth,h=host.clientHeight,k=w/h,s=k<1?8/k*0.75:8;R.setSize(w,h);Object.assign(cam,{left:-s*k,right:s*k,top:s,bottom:-s});cam.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
const v=new THREE.Vector3();let T=0,last=performance.now();
R.setAnimationLoop(()=>{const now=performance.now(),dt=Math.min(0.05,(now-last)/1000);last=now;T+=dt;
 for(const a of AG){const g=a.g,j=a.q[0],t=T+a.ph;
  if(j){const d=j.to.clone().sub(g.position);d.y=0;const L=d.length();if(L<0.05){a.q.shift();j.r()}else{d.setLength(Math.min(L,2.2*dt));g.position.add(d);
    const ry=Math.atan2(d.x,d.z);g.rotation.y+=Math.atan2(Math.sin(ry-g.rotation.y),Math.cos(ry-g.rotation.y))*Math.min(1,dt*10);
    g.position.y=0.15+Math.abs(Math.sin(t*10))*0.07;a.arms[0].rotation.x=Math.sin(t*10)*0.6;a.arms[1].rotation.x=-Math.sin(t*10)*0.6;a.head.rotation.y=0}}
  else{g.position.y=0.15;const s=1+Math.sin(t*2)*0.03;a.body.scale.set(1,s,1);
   const atDesk=g.position.distanceTo(V(a.seat.x,a.seat.z).setY(0.15))<0.1;
   if(atDesk){g.rotation.y+=(Math.PI-g.rotation.y)*Math.min(1,dt*5);const ty=Math.sin(t*18)*0.25;a.arms[0].rotation.x=-1.1+ty;a.arms[1].rotation.x=-1.1-ty}
   else{a.arms[0].rotation.x=a.arms[1].rotation.x=Math.sin(t*1.5)*0.08}
   a.head.rotation.y=Math.sin(t*0.6)*0.5*Math.max(0,Math.sin(t*0.23));a.head.position.y=1.3+Math.sin(t*2)*0.015}
  v.copy(g.position).setY(2);v.project(cam);const x=(v.x+1)/2*host.clientWidth,y=(1-v.y)/2*host.clientHeight;a.tag.style.left=x+'px';a.tag.style.top=y+'px';if(a.bb){a.bb.style.left=x+'px';a.bb.style.top=(y-22)+'px'}}
 R.render(S,cam)});
R.domElement.onclick=e=>{const r=R.domElement.getBoundingClientRect();ray.setFromCamera({x:(e.clientX-r.left)/r.width*2-1,y:-(e.clientY-r.top)/r.height*2+1},cam);const h=ray.intersectObjects(AG.map(a=>a.g),true)[0];if(!h)return;const a=h.object.parent.userData.a;
 $('#agentInfo').innerHTML=`<b style="color:#ff9a3c">${a.name}</b><br>${a.info||'الأزواج: '+a.pairs.join('، ')}<br>${a.pairs.map(p=>`${p}: ${fmt(price[p])} — ${sigs.find(s=>s.pair==p)?'لديه إشارة':'مراقبة'}`).join('<br>')}<br>الحالة: ${a.walking?'يتحرك':'متواجد'}`};
// --- prices
const fmt=n=>n==null?'—':(+n).toFixed(n>1000?2:n>50?3:5);
function setP(k,val){if(val==null||isNaN(val))return;prev[k]=price[k];price[k]=val}
async function j(u){const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw r.status;return r.json()}
const SRC={};
async function live(){try{const d=await j('api/prices');const ps=d.prices||{};for(const k in ps){if(k=='BTC'&&SRC.BTC&&SRC.BTC.startsWith('binance ws'))continue;window.onTick&&window.onTick(k,+ps[k].price);setP(k,+ps[k].price);SRC[k]=ps[k].src+' '+kt(ps[k].ts*1000)}
 if(Object.keys(ps).length<PAIRS.length)await fx();else drawTicker()}catch(e){console.warn('proxy fail',e);await fx()}}
async function fx(){try{const d=(await j('https://open.er-api.com/v6/latest/USD')).rates;const u=c=>1/d[c];const F=(k,v)=>{if(!SRC[k]||SRC[k].startsWith('er-api')){setP(k,v);SRC[k]='er-api (يومي)'}};
 F('EURUSD',u('EUR'));F('GBPUSD',u('GBP'));F('AUDUSD',u('AUD'));F('USDCAD',d.CAD);F('USDJPY',d.JPY);F('GBPJPY',d.JPY/d.GBP);F('GBPAUD',d.AUD/d.GBP);F('EURAUD',d.AUD/d.EUR);
 F('DXY',50.14348112*Math.pow(u('EUR'),-0.576)*Math.pow(d.JPY,0.136)*Math.pow(u('GBP'),-0.119)*Math.pow(d.CAD,0.091)*Math.pow(d.SEK,0.042)*Math.pow(d.CHF,0.036))}catch(e){console.warn('fx fail',e)}
 if(!SRC.XAUUSD||SRC.XAUUSD.startsWith('er'))try{setP('XAUUSD',(await j('https://api.gold-api.com/price/XAU')).price)}catch(e){console.warn('gold fail',e)}drawTicker()}
async function btc(){try{setP('BTC',+(await j('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')).price);drawTicker()}catch(e){console.warn('btc fail')}}
// BTC tick-by-tick via Binance WS (throttled to 4 paints/s), reconnect with backoff
let wsDelay=1000;function btcWS(){try{const ws=new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');let last=0;
 ws.onopen=()=>{wsDelay=1000};ws.onmessage=m=>{const p=+JSON.parse(m.data).p;window.onTick&&window.onTick('BTC',p);if(Date.now()-last<250)return;last=Date.now();setP('BTC',p);SRC.BTC='binance ws '+kt(Date.now());drawTicker()};
 ws.onclose=()=>{setTimeout(btcWS,wsDelay);wsDelay=Math.min(wsDelay*2,60000)}}catch(e){}}btcWS();
const shown={};
function drawTicker(){const tk=$('#tk');if(!tk.children.length){tk.innerHTML=PAIRS.map(p=>`<span class="ti" data-p="${p}"><b>${p}</b> <span class="v">—</span></span>`).join('');
  tk.querySelectorAll('.ti').forEach(e=>e.onclick=()=>{$('#sel').value=e.dataset.p;drawSide();window.setChartPair&&window.setChartPair(e.dataset.p)})}
 for(const e of tk.children){const p=e.dataset.p,v=e.querySelector('.v'),t=fmt(price[p]);e.classList.toggle('sel',p==$('#sel').value);
  if(shown[p]!==t){const o=shown[p];shown[p]=t;v.textContent=t;if(o&&o!=='—'){const up=price[p]>=(prev[p]??price[p]);v.className='v '+(up?'up':'dn');v.classList.remove('fl-up','fl-dn');void v.offsetWidth;v.classList.add(up?'fl-up':'fl-dn')}}}
 tk.title=PAIRS.map(p=>p+': '+(SRC[p]||'')).join('\n');drawSide()}
// server polls upstream every 3-5s; browser polls every 1s, backs off on errors
let pDelay=1000;(async function pl(){try{await live();pDelay=1000}catch(e){pDelay=Math.min(pDelay*2,30000)}setTimeout(pl,pDelay)})();
// --- signals
let sigs=[],trades=[];const seen=new Set();
$('#sel').innerHTML=PAIRS.map(p=>`<option>${p}</option>`).join('');$('#sel').onchange=()=>{drawSide();window.setChartPair&&window.setChartPair($('#sel').value)};
function drawSide(){const p=$('#sel').value,s=[...sigs].reverse().find(x=>x.pair==p);
 $('#sig').innerHTML=`<table><tr><td>السعر الحالي</td><td>${fmt(price[p])}<br><small style="color:#888">${SRC[p]||''}</small></td></tr>`+(s?`<tr><td>الاتجاه</td><td class="${s.direction=='buy'?'up':'dn'}">${s.direction=='buy'?'شراء':'بيع'}</td></tr><tr><td>الدخول</td><td>${s.entry}</td></tr><tr><td>الوقف</td><td>${s.stop}</td></tr><tr><td>الهدف</td><td>${s.target}</td></tr><tr><td>المستوى</td><td>${s.level??'—'}</td></tr><tr><td>الحالة</td><td>${RS[s.status]||s.status}${reasonOf(s)?" — "+reasonOf(s):""}${s.ticket?' #'+s.ticket:''}</td></tr><tr><td colspan=2>${s.note||''}${s.example?' <b style="color:#ff9a3c">[مثال]</b>':''}</td></tr>`:'<tr><td colspan=2>لا توجد إشارة</td></tr>')+'</table>'}
function lot(s){const risk=1000,dist=Math.abs(s.entry-s.stop);let per;// value per 1 lot per 1 unit price move in USD
 const p=s.pair;if(p=='BTC')per=1;else if(p=='XAUUSD')per=100;else if(p.endsWith('USD'))per=100000;else if(p.startsWith('USD'))per=100000/(price[p]||s.entry);else per=100000*((price[p.slice(3)+'USD'])||1/(price['USD'+p.slice(3)]||1));
 return Math.max(0.01,Math.floor(risk/(dist*per)*100)/100)}
const ARCH=new Set(['expired','invalid']);
const RS={failed:'فشل',expired:'منتهية',invalid:'غير صالحة',new:'جديدة',placed:'منفذة'};
function reasonOf(s){if(s.reason)return s.reason;if(s.status=='failed')return/خروج/.test(s.note||'')?'MT5 كان مسجّل خروج':'فشل التنفيذ';if(s.status=='expired')return 'انتهت الإشارة';if(s.status=='invalid')return 'رقم الهدف غير منطقي';return ''}
const isArch=s=>ARCH.has(s.status)||(s.status=='failed'&&Date.now()-new Date(s.time)>3*3600e3);
async function announce(s){const a=AG.find(x=>x.pairs.includes(s.pair))||ag('btc'),rk=ag('risk'),ex=ag('exec'),dir=s.direction=='buy'?'شراء':'بيع';
 while(a.busy)await new Promise(r=>setTimeout(r,500));a.busy=true;
 try{say(a,`إشارة ${dir} بعد ثبوت ساعة على ${s.pair}${s.example?' (مثال)':''}`);await walk(a,near(rk,a));
 say(rk,`مخاطرة 1% = 1,000$ من 100,000 → اللوت ${lot(s)} (وقف ${s.stop})`);await walk(a,near(ex,a));
 say(ex,s.status=='placed'?`تم التنفيذ على MT5 ديمو 114086449 #${s.ticket||''}`:s.status=='failed'?'فشل التنفيذ ⚠️ '+reasonOf(s):'بانتظار التنفيذ على MT5 ديمو 114086449');await walk(a,a.seat)}finally{a.busy=false}}
const key=s=>[s.pair,s.time,s.status].join('|');
let archOpen=false;window.toggleArch=()=>{archOpen=!archOpen;draw()};
const card=(s,extra='')=>`<div class="card" onclick="document.querySelector('#sel').value='${s.pair}';document.querySelector('#sel').onchange()">${s.pair} ${s.direction=='buy'?'شراء':'بيع'} @ ${s.entry}${s.example?' [مثال]':''}${extra}</div>`;
function draw(){const live=sigs.filter(s=>!isArch(s)),arch=sigs.filter(isArch);
 const cols={'مراقبة':[],'إشارة':[],'بانتظار التنفيذ':[],'منفذة':[]};const sp=new Set(live.map(s=>s.pair));
 PAIRS.filter(p=>!sp.has(p)).forEach(p=>cols['مراقبة'].push(`<div class="card">${p}</div>`));
 for(const s of live){if(s.status=='new'){cols['إشارة'].push(card(s));cols['بانتظار التنفيذ'].push(card(s,` · لوت ${lot(s)}`))}
  else if(s.status=='failed')cols['بانتظار التنفيذ'].push(card(s,`<br><span class="dn">⚠️ فشل: ${reasonOf(s)}</span>`));else cols['منفذة'].push(card(s,s.ticket?' #'+s.ticket:''))}
 for(const t of trades)cols['منفذة'].push(`<div class="card">${t.pair} #${t.ticket||''} لوت ${t.lots??''} ربح/خسارة ${t.pnl??'—'}</div>`);
 $('#board').innerHTML=Object.entries(cols).map(([k,v])=>`<div class="col"><h4>${k} (${v.length})</h4>${v.join('')||'<small style="color:#666">لا شيء</small>'}</div>`).join('')
  +`<div class="col arch"><h4 onclick="toggleArch()" style="cursor:pointer">${archOpen?'▾':'◂'} مؤرشفة (${arch.length})</h4>${archOpen?arch.map(s=>card(s,`<br><small style="color:#aaa">${RS[s.status]||s.status}: ${reasonOf(s)}</small>`)).join(''):'<small style="color:#777">إشارات منتهية أو غير صالحة — اضغط للعرض</small>'}</div>`;drawSide()}
let first=true;
async function poll(){try{sigs=await j('data/signals.json');window.SIGS=sigs;window.chartLevels&&window.chartLevels()}catch(e){console.warn('signals fail')}try{trades=await j('data/trades.json')}catch(e){}
 for(const s of sigs)if(!seen.has(key(s))){seen.add(key(s));if(isArch(s))continue;if(s.status!='placed'||!seen.has('a'+s.pair+s.time)){seen.add('a'+s.pair+s.time);announce(s)}}
 first=false;draw()}
poll();setInterval(poll,30000);
// --- ambient life
const P0={};setInterval(()=>{for(const p of PAIRS)if(P0[p]==null&&price[p]!=null)P0[p]=price[p]},2000);
const rnd=a=>a[Math.floor(Math.random()*a.length)],pct=(a,b)=>((a-b)/b*100);
function comment(a){const p=rnd(a.pairs),x=price[p];if(x==null)return `بانتظار سعر ${p} المباشر…`;
 const s=[...sigs].reverse().find(q=>q.pair==p),m=P0[p]?pct(x,P0[p]):0,out=[];
 out.push(`${p} الآن ${fmt(x)} (${m>=0?'+':''}${m.toFixed(2)}% منذ فتح الصفحة)`);
 if(s&&s.level){const d=pct(x,s.level);out.push(Math.abs(d)<0.15?`السعر يقترب من منطقة الزخم ${s.level} على ${p}`:`${p} ${d>0?'فوق':'تحت'} منطقة الزخم ${s.level} بـ ${Math.abs(d).toFixed(2)}%`)}
 if(s&&s.entry&&!isArch(s)){const d=pct(x,s.entry);out.push(`${p} يبعد ${Math.abs(d).toFixed(2)}% عن سعر الدخول ${s.entry}`)}
 if(!s)out.push(`لا توجد إشارة على ${p}، أراقب فقط حتى الفحص القادم`);return rnd(out)}
function staffLine(a){const open=sigs.filter(s=>s.status=='placed').length+trades.length,pend=sigs.filter(s=>s.status=='new').length;
 if(a.id=='risk')return rnd([`الصفقات المفتوحة ${open} → المخاطرة الحالية ${open}% من الحساب`,'الحد: 1% لكل صفقة على 100,000$','أي إشارة هدفها بعكس الاتجاه ترفض تلقائياً']);
 return rnd([`MT5 ديمو 114086449 — آخر حالة: داخل الحساب`,`صفقات بانتظار التنفيذ: ${pend}`,'أنتظر الإشارات الجديدة من الفحص القادم كل ساعة'])}
const CHAT=['قهوة؟ ☕','شفت حركة الذهب؟','الفحص الجاي قريب','خلنا نراجع المستويات','تمام 👍'];
async function wander(){const free=AG.filter(a=>!a.busy&&!a.walking);if(!free.length)return;const a=rnd(free);a.busy=true;
 try{const r=Math.random();
  if(r<0.35){await walk(a,SPOTS.coffee.clone().add(V(Math.random()*0.6,Math.random()*0.8)));bubble(a,'☕ استراحة قهوة');await new Promise(r=>setTimeout(r,4000))}
  else if(r<0.6){await walk(a,SPOTS.board.clone().add(V(Math.random()*1.6-0.8,0)));a.g.rotation.y=Math.PI;say(a,a.pairs.length?comment(a):staffLine(a));await new Promise(r=>setTimeout(r,5000))}
  else{const o=rnd(AG.filter(x=>x!==a));await walk(a,near(o,a));bubble(a,rnd(CHAT));await new Promise(r=>setTimeout(r,2500));if(!o.walking)bubble(o,a.pairs.length?comment(a):rnd(CHAT));await new Promise(r=>setTimeout(r,3000))}
  await walk(a,a.seat)}finally{a.busy=false}}
(function loop(){setTimeout(()=>{wander();loop()},10000+Math.random()*20000)})();setTimeout(wander,3000);
(function talk(){setTimeout(()=>{const a=rnd(AG);if(!a.walking)say(a,a.pairs.length?comment(a):staffLine(a));talk()},18000+Math.random()*12000)})();
