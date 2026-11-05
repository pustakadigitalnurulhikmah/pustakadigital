/* Pembaca flipbook Pustaka Digital — StPageFlip (efek kertas), halaman SVG, RTL lewat cermin,
   balik dua arah dengan efek kertas, ketuk/geser, cubit-zoom, tampilan bersih */
(function(){
var st=document.getElementById('stage'),zm=document.getElementById('book'),bar=document.getElementById('bar'),no=document.getElementById('no');
var N=+zm.dataset.n,rtl=zm.dataset.arah==='rtl',dir=zm.dataset.dir,R=+(zm.dataset.rasio||0.7048),KEY='fb:'+dir;
var cm=document.createElement('div');cm.className='fb-cermin'+(rtl?' rtl':'');zm.appendChild(cm);
var tl=document.createElement('div');tl.className='fb-tulang';tl.innerHTML='<i class="tk"></i><i class="tn"></i>';cm.appendChild(tl);
function url(p){return dir+(p<10?'0':'')+p+'.svg'}
var cache={};function gbr(i){if(i<0||i>=N)return null;var g=cache[i];if(!g){g=new Image();g.alt='';g.draggable=false;g.src=url(i+1);cache[i]=g;if(g.decode)g.decode().catch(function(){})}return g}
function muat(i){for(var j=i-3;j<=i+4;j++)gbr(j)}
function simpan(){try{var v=parseInt(localStorage.getItem(KEY),10);if(v>=1&&v<=N)return v-1}catch(e){}return 0}
var pf=null,blk=null,divs=[],spread=false,pw=0,ph=0,z=1,idx=simpan(),anim=null,sibuk=false;
function buat(){if(pf){idx=pf.getCurrentPageIndex();try{pf.destroy()}catch(e){}}
  blk=document.createElement('div');blk.className='fb-blok';cm.appendChild(blk);
  var w=Math.round(pw*z),h=Math.round(ph*z);blk.style.width=(spread?2*w:w)+'px';blk.style.height=h+'px';
  zm.style.width=blk.style.width;zm.style.height=blk.style.height;
  divs=[];for(var i=0;i<N;i++){var d=document.createElement('div');d.className='fb-hal';d.setAttribute('data-density','soft');blk.appendChild(d);divs.push(d)}
  muat(idx);isiDiv(idx);
  pf=new St.PageFlip(blk,{width:w,height:h,size:'fixed',showCover:true,usePortrait:true,useMouseEvents:false,
    maxShadowOpacity:.4,flippingTime:800,drawShadow:true,startPage:idx,autoSize:false});
  pf.loadFromHTML(divs);
  pf.on('flip',function(e){idx=e.data;muat(idx);isiDiv(idx);tulis()});
  pf.on('changeState',function(e){sibuk=e.data!=='read';cm.classList.toggle('gerak',sibuk)});
  tulis();st.classList.toggle('zoom',z>1.001)}
function isiDiv(i){for(var j=i-3;j<=i+4;j++){var d=divs[j];if(d&&!d.firstChild){var g=gbr(j);if(g)d.appendChild(g)}}}
function punggung(){var a=-1,b=-1;if(spread){if(idx===0)b=0;else{a=idx%2?idx:idx-1;b=a+1<N?a+1:-1}}else b=idx;
  cm.classList.toggle('ada-kiri',spread&&a>=0);cm.classList.toggle('ada-kanan',b>=0);cm.classList.toggle('dua',spread)}
function tulis(){punggung();var i=idx,ix=[i];if(spread&&i>0)ix=i%2?[i,i+1]:[i-1,i];
  var p=ix.filter(function(x){return x<N}).map(function(x){return x+1});no.textContent=(p.length>1?p[0]+'–'+p[1]:p[0])+' / '+N;
  try{localStorage.setItem(KEY,i+1)}catch(e){}}
function ukur(){var W=st.clientWidth,H=st.clientHeight,pad=W<600?6:22;spread=W>=800&&W/H>1.15;
  var cols=spread?2:1;ph=Math.floor(Math.min(H-2*pad,(W-2*pad)/(cols*R)));pw=Math.floor(ph*R);buat()}
/* koordinat layar -> koordinat blok (memperhitungkan cermin RTL) */
function kb(cx,cy){var r=blk.getBoundingClientRect();return {x:rtl?r.right-cx:cx-r.left,y:cy-r.top}}
function rect(){return pf.getRender().getRect()}
/* titik lipat: u=0 datar, u=1 terbalik penuh; d=0 maju, d=1 mundur (sisi kiri buku) */
function titik(d,u,y){var r=rect(),h=r.pageWidth,x=h-2*h*u;return {x:d===0?x+r.left+h:r.left+h-x,y:y}}
function bawah(){var r=rect();return r.top+r.height-2}
var lipat=null; /* {d,mundurP,y} */
function mulaiLipat(arah,y){var r=rect(),mundurP=arah<0&&!spread;if(arah>0&&idx>=N-1)return null;if(arah<0&&idx<=0)return null;
  var d=arah>0?0:(spread?1:0);
  if(mundurP){var t=pf.getCurrentPageIndex()-1;pf.turnToPage(t);idx=t;isiDiv(t)}
  var y0=y==null?bawah():y,bw=y0>=r.top+r.height/2,ky=bw?r.top+r.height-1:r.top+1,dk=Math.abs(y0-ky)<r.height*.2;
  var L={d:d,mp:mundurP,y0:y0,ky:ky,dk:dk,y:dk?y0:ky};
  var a=titik(d,0,y0);a.x+=d===0?-1:1;pf.startUserTouch(a);var b=titik(d,.02,L.y);pf.userMove(b,true);
  L.set=function(u,fy){if(fy!=null){var t=L.dk?fy:L.ky+(fy-L.y0);L.y=Math.max(r.top-r.height*.15,Math.min(r.top+r.height*1.15,t))}
    u=Math.max(.02,Math.min(.985,u));L.u=u;pf.userMove(titik(d,L.mp?1-u:u,L.y),true)};L.set(.02);return L}
function akhiri(L,jadi){/* jadi=true: halaman berpindah sesuai arah */var u=L.mp?(jadi?0:1):(jadi?1:0);var dari=L.u,t0=performance.now(),dur=Math.max(160,520*Math.abs(u-(L.mp?1-dari:dari)));
  var a0=L.mp?1-dari:dari;if(jadi)suara();if(anim)cancelAnimationFrame(anim);
  (function f(now){var k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3),v=a0+(u-a0)*e;pf.userMove(titik(L.d,Math.max(.015,Math.min(.985,v)),L.y),true);
    if(k<1)anim=requestAnimationFrame(f);else{anim=null;pf.userStop(titik(L.d,u>.5?.99:.01,L.y));setTimeout(function(){idx=pf.getCurrentPageIndex();isiDiv(idx);tulis()},900)}})(t0)}
/* suara kertas saat membalik: desir + gemeresik + tepukan halaman (disintesis) */
var ac=null,nb=null,kb=null;
function suara(){try{var C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!ac)ac=new C();if(ac.state==='suspended')ac.resume();
  var sr=ac.sampleRate,i,d;
  if(!nb){nb=ac.createBuffer(1,sr,sr);d=nb.getChannelData(0);for(i=0;i<sr;i++)d[i]=Math.random()*2-1;
    kb=ac.createBuffer(1,Math.floor(sr*.25),sr);d=kb.getChannelData(0);for(i=0;i<d.length;i++){var k=1-i/d.length;d[i]=Math.random()<.004*k?(Math.random()*2-1)*k:0}}
  var t=ac.currentTime,r=.92+Math.random()*.16,o=ac.createGain();o.gain.value=.9;o.connect(ac.destination);
  function src(buf,t0,dur){var x=ac.createBufferSource();x.buffer=buf;x.playbackRate.value=r;x.start(t0,Math.random()*.3,dur);return x}
  /* desir udara */
  var s1=src(nb,t,.6),f1=ac.createBiquadFilter(),g1=ac.createGain();f1.type='bandpass';f1.Q.value=1.1;
  f1.frequency.setValueAtTime(650,t);f1.frequency.exponentialRampToValueAtTime(2300,t+.17);f1.frequency.exponentialRampToValueAtTime(800,t+.48);
  g1.gain.setValueAtTime(.0001,t);g1.gain.exponentialRampToValueAtTime(.42,t+.13);g1.gain.exponentialRampToValueAtTime(.0001,t+.52);
  s1.connect(f1);f1.connect(g1);g1.connect(o);
  /* gemeresik kertas di awal */
  var s2=src(kb,t,.25),f2=ac.createBiquadFilter(),g2=ac.createGain();f2.type='highpass';f2.frequency.value=2200;g2.gain.value=.7;
  s2.connect(f2);f2.connect(g2);g2.connect(o);
  /* tepukan halaman jatuh */
  var t3=t+.4,s3=src(nb,t3,.15),f3=ac.createBiquadFilter(),g3=ac.createGain();f3.type='lowpass';f3.frequency.value=380;
  g3.gain.setValueAtTime(.0001,t3);g3.gain.exponentialRampToValueAtTime(.6,t3+.01);g3.gain.exponentialRampToValueAtTime(.0001,t3+.12);
  s3.connect(f3);f3.connect(g3);g3.connect(o)}catch(e){}}
function maju(){if(sibuk||lipat)return;if(idx>=N-1)return;suara();pf.flipNext('bottom')}
function mundur(){if(sibuk||lipat||idx<=0)return;if(spread){suara();pf.flipPrev('bottom');return}
  var L=mulaiLipat(-1);if(!L)return;L.set(.05);akhiri(L,true)}
/* bilah judul */
function bilah(v){bar.classList.toggle('sembunyi',!v)}
/* gestur */
var pt=null,pinch=null,ketukAkhir=0;
st.addEventListener('pointerdown',function(e){if(pinch||e.button>0||!pf)return;if(e.target.closest&&e.target.closest('.fb-bar'))return;
  pt={x:e.clientX,y:e.clientY,t:Date.now(),sl:st.scrollLeft,stp:st.scrollTop,id:e.pointerId,m:false,mouse:e.pointerType==='mouse'};
  try{st.setPointerCapture(e.pointerId)}catch(x){}});
st.addEventListener('pointermove',function(e){if(!pt||pt.id!==e.pointerId||pinch)return;var dx=e.clientX-pt.x,dy=e.clientY-pt.y;
  if(!pt.m&&Math.abs(dx)+Math.abs(dy)>8)pt.m=true;if(!pt.m)return;
  if(z>1.001){if(pt.mouse){st.scrollLeft=pt.sl-dx;st.scrollTop=pt.stp-dy}return}
  if(pt.x0===undefined){if(sibuk){pt.m='x';return}var maj=(dx>0)===rtl;lipat=mulaiLipat(maj?1:-1,kb(e.clientX,e.clientY).y);if(!lipat){pt.m='x';return}pt.maj=maj;pt.x0=pt.x}
  if(!lipat)return;var w=spread?pw:pw*.85,g=(pt.maj===rtl?dx:-dx);lipat.set(g/(w*1.6),kb(e.clientX,e.clientY).y)});
function lepas(e){if(!pt||pt.id!==e.pointerId)return;var p=pt;pt=null;
  if(lipat){var L=lipat;lipat=null;var cepat=Date.now()-p.t<350,ok=L.u>.3||(cepat&&L.u>.05);bilah(false);akhiri(L,ok);return}
  if(p.m||e.type==='pointercancel')return;
  var r=zm.getBoundingClientRect(),dalam=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom,now=Date.now();
  var kiri=e.clientX<r.left+r.width/2,keMaju=(kiri===rtl);
  if(dalam&&spread&&((idx===0&&!keMaju)||(idx>=N-1&&keMaju)))dalam=false;
  if(!dalam){bilah(bar.classList.contains('sembunyi'));return}
  bilah(false);
  if(z>1.001){if(now-ketukAkhir<320)setZ(1);ketukAkhir=now;return}
  if(keMaju)maju();else mundur()}
st.addEventListener('pointerup',lepas);st.addEventListener('pointercancel',lepas);
st.addEventListener('dblclick',function(){if(z>1.001)setZ(1)});
/* zoom */
function setZ(nz,cx,cy){nz=Math.max(1,Math.min(4,nz));if(Math.abs(nz-z)<.01)return;var r0=zm.getBoundingClientRect();
  if(cx==null){var s=st.getBoundingClientRect();cx=s.left+s.width/2;cy=s.top+s.height/2}
  var fx=(cx-r0.left)/r0.width,fy=(cy-r0.top)/r0.height;z=nz;buat();
  var r1=zm.getBoundingClientRect();st.scrollLeft+=r1.left+fx*r1.width-cx;st.scrollTop+=r1.top+fy*r1.height-cy}
function jarak(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)}
st.addEventListener('touchstart',function(e){if(e.touches.length===2){if(lipat){var L=lipat;lipat=null;akhiri(L,false)}pt=null;
  var a=e.touches[0],b=e.touches[1];pinch={d0:jarak(e.touches),cx:(a.clientX+b.clientX)/2,cy:(a.clientY+b.clientY)/2,r:zm.getBoundingClientRect(),s:1};
  zm.style.transformOrigin=(pinch.cx-pinch.r.left)+'px '+(pinch.cy-pinch.r.top)+'px';e.preventDefault()}},{passive:false});
st.addEventListener('touchmove',function(e){if(!pinch||e.touches.length<2)return;e.preventDefault();
  var nz=Math.max(1,Math.min(4,z*jarak(e.touches)/pinch.d0));pinch.s=nz/z;zm.style.transform='scale('+pinch.s+')'},{passive:false});
st.addEventListener('touchend',function(e){if(!pinch||e.touches.length>=2)return;var p=pinch;pinch=null;zm.style.transform='';zm.style.transformOrigin='';
  var fx=(p.cx-p.r.left)/p.r.width,fy=(p.cy-p.r.top)/p.r.height,nz=Math.max(1,Math.min(4,z*p.s));if(Math.abs(nz-z)<.01)return;z=nz;buat();
  var r1=zm.getBoundingClientRect();st.scrollLeft+=r1.left+fx*r1.width-p.cx;st.scrollTop+=r1.top+fy*r1.height-p.cy});
st.addEventListener('wheel',function(e){if(e.ctrlKey){e.preventDefault();setZ(z*(e.deltaY<0?1.2:1/1.2),e.clientX,e.clientY)}},{passive:false});
document.getElementById('zi').onclick=function(){setZ(z*1.4)};
document.getElementById('zo').onclick=function(){setZ(z/1.4)};
document.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')rtl?maju():mundur();else if(e.key==='ArrowRight')rtl?mundur():maju();
  else if(e.key==='+'||e.key==='=')setZ(z*1.4);else if(e.key==='-')setZ(z/1.4);else if(e.key==='Escape')bilah(true)});
document.addEventListener('contextmenu',function(e){e.preventDefault()});
document.addEventListener('dragstart',function(e){e.preventDefault()});
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){var W=st.clientWidth,H=st.clientHeight,sp=W>=800&&W/H>1.15;if(z===1||sp!==spread){z=1;ukur()}},150)});
ukur();
})();
