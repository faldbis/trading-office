async function CJ(p){try{const r=await fetch('data/candles_'+p+'.json',{cache:'no-store'});if(r.ok)return await r.json()}catch(e){}try{const r=await fetch('api/candles?pair='+p+'&interval=60m',{cache:'no-store'});if(r.ok&&(r.headers.get('content-type')||'').includes('json'))return await r.json()}catch(e){}return await (await fetch('data/candles_'+p+'.json',{cache:'no-store'})).json()}
// Live chart panel: TradingView Advanced Chart widget; fallback/levels mode = lightweight-charts fed by Binance (BTC) / server Yahoo proxy (rest)
(function(){
const TV={BTC:'BINANCE:BTCUSDT',XAUUSD:'OANDA:XAUUSD',DXY:'TVC:DXY'};const tvs=p=>TV[p]||'FX:'+p;
let pair='GBPJPY',mode='lw',ml=[],tvOK=false,chart,ser,lines=[],bar=null,ws,timer;
const $=s=>document.querySelector(s);
function loadTV(cb){if(window.TradingView)return cb(true);const s=document.createElement('script');s.src='https://s3.tradingview.com/tv.js';s.onload=()=>cb(!!window.TradingView);s.onerror=()=>cb(false);document.head.appendChild(s);setTimeout(()=>cb(!!window.TradingView),8000)}
function drawTV(){$('#tvbox').innerHTML='<div id="tvw" style="height:100%"></div>';
 new TradingView.widget({container_id:'tvw',autosize:true,symbol:tvs(pair),interval:'60',timezone:'Asia/Kuwait',theme:'dark',style:'1',locale:'ar_AE',toolbar_bg:'#12151d',hide_side_toolbar:true,allow_symbol_change:false,save_image:false,backgroundColor:'#12151d'})}
function initLW(){if(chart)return;chart=LightweightCharts.createChart($('#lwbox'),{autoSize:true,layout:{background:{color:'#12151d'},textColor:'#ccc'},grid:{vertLines:{color:'#1e2230'},horzLines:{color:'#1e2230'}},timeScale:{timeVisible:true},localization:{timeFormatter:t=>new Date(t*1000).toLocaleString('ar-KW',{timeZone:'Asia/Kuwait',hour12:false})}});
 ser=chart.addCandlestickSeries({upColor:'#3ddc84',downColor:'#ff5c5c',borderVisible:false,wickUpColor:'#3ddc84',wickDownColor:'#ff5c5c'})}
async function loadLW(){initLW();clearInterval(timer);if(ws){ws.onclose=null;ws.close();ws=null}const p=pair;let d;
 try{if(p=='BTC'){const k=await (await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=500')).json();d=k.map(x=>({time:x[0]/1000,open:+x[1],high:+x[2],low:+x[3],close:+x[4]}));
   ws=new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1h');ws.onmessage=m=>{const k=JSON.parse(m.data).k;bar={time:k.t/1000,open:+k.o,high:+k.h,low:+k.l,close:+k.c};ser.update(bar)}}
  else{d=await CJ(p);timer=setInterval(async()=>{try{const n=await CJ(p);if(pair==p&&n.length){bar={...n[n.length-1]};ser.update(bar)}}catch(e){}},60000)}
  if(pair!=p)return;ser.setData(d);bar={...d[d.length-1]};chart.timeScale().fitContent();chart.timeScale().scrollToRealTime();levels()}catch(e){console.warn('chart data fail',e)}}
async function mlines(p){ml.forEach(l=>ser.removePriceLine(l));ml=[];try{const a=await (await fetch('data/lines_'+p+'.json',{cache:'no-store'})).json();if(pair!=p)return;a.forEach(x=>ml.push(ser.createPriceLine({price:x.price,color:x.side=='buy'?'#3ddc84':'#ff4d4d',lineWidth:1,lineStyle:0,axisLabelVisible:false,title:''})))}catch(e){console.warn('lines fail')}}
function levels(){if(!ser)return;mlines(pair);lines.forEach(l=>ser.removePriceLine(l));lines=[];const s=[...(window.SIGS||[])].reverse().find(x=>x.pair==pair);if(!s)return;
 const L=(v,c,t)=>{if(v!=null&&!isNaN(+v))lines.push(ser.createPriceLine({price:+v,color:c,lineWidth:2,lineStyle:t=='المستوى'?1:0,axisLabelVisible:true,title:t}))};
 L(s.level,'#ff9a3c','المستوى');L(s.entry,'#4da3ff','الدخول');L(s.stop,'#ff5c5c','الوقف');L(s.target,'#3ddc84','الهدف')}
window.chartLevels=levels;
window.onTick=(p,v)=>{if(mode!='lw'||p!=pair||!bar||!ser||(p=='BTC'))return;bar.close=v;bar.high=Math.max(bar.high,v);bar.low=Math.min(bar.low,v);ser.update(bar)};
function show(){$('#chtitle').textContent=pair+(mode=='tv'?' · ساعة · TradingView':' · ساعة · خطوط الزخم');$('#tvbox').style.display=mode=='tv'?'':'none';$('#lwbox').style.display=mode=='lw'?'':'none';
 $('#mTV').classList.toggle('on',mode=='tv');$('#mLW').classList.toggle('on',mode=='lw');mode=='tv'?drawTV():loadLW()}
window.setChartPair=p=>{pair=p;show()};
$('#mTV').onclick=()=>{if(!tvOK)return;mode='tv';show()};$('#mLW').onclick=()=>{mode='lw';show()};
$('#mTV').style.display='none';$('#mLW').textContent='خطوط الزخم';show();
})();
