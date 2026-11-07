/* Pembaca flipbook Pustaka Digital — StPageFlip (efek kertas), halaman SVG, RTL lewat cermin,
   balik dua arah dengan efek kertas, ketuk/geser, cubit-zoom, tampilan bersih */
(function(){
var st=document.getElementById('stage'),zm=document.getElementById('book'),bar=document.getElementById('bar');
var N=+zm.dataset.n,rtl=zm.dataset.arah==='rtl',dir=zm.dataset.dir,R=+(zm.dataset.rasio||0.7048),KEY='fb:'+dir;
/* footer: judul · Halaman [n] dari N · ♫ · ◀ ▶ */
var TRI='<svg viewBox="0 0 20 20"><path d="M15 3v14L4 10z"/></svg>',TRK='<svg viewBox="0 0 20 20"><path d="M5 3v14l11-7z"/></svg>';
var ns=document.createElement('span');ns.className='fb-no';ns.innerHTML='Halaman <input id="no" type="text" inputmode="numeric" enterkeyhint="go" aria-label="Nomor halaman" autocomplete="off"> dari '+N;bar.appendChild(ns);
var no=document.getElementById('no');
var bk=document.createElement('button'),bn=document.createElement('button');bk.type=bn.type='button';bk.innerHTML=TRI;bn.innerHTML=TRK;
bk.setAttribute('aria-label',rtl?'Halaman berikutnya':'Halaman sebelumnya');bn.setAttribute('aria-label',rtl?'Halaman sebelumnya':'Halaman berikutnya');
bar.appendChild(bk);bar.appendChild(bn);
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
  var p=ix.filter(function(x){return x<N}).map(function(x){return x+1});if(document.activeElement!==no)no.value=p.length>1?p[0]+'–'+p[1]:p[0];
  bk.disabled=rtl?i>=N-1:i<=0;bn.disabled=rtl?i<=0:i>=N-1;
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
    u=Math.max(.02,Math.min(.985,u));L.u=u;if(L.S)gesekGerak(L.S,u);pf.userMove(titik(d,L.mp?1-u:u,L.y),true)};L.set(.02);return L}
function akhiri(L,jadi){/* jadi=true: halaman berpindah sesuai arah */var u=L.mp?(jadi?0:1):(jadi?1:0);var dari=L.u,t0=performance.now(),dur=Math.max(160,520*Math.abs(u-(L.mp?1-dari:dari)));
  var a0=L.mp?1-dari:dari;if(jadi&&!L.S)suara();if(anim)cancelAnimationFrame(anim);
  (function f(now){var k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3),v=a0+(u-a0)*e;if(L.S)gesekGerak(L.S,L.mp?1-v:v);pf.userMove(titik(L.d,Math.max(.015,Math.min(.985,v)),L.y),true);
    if(k<1)anim=requestAnimationFrame(f);else{anim=null;if(L.S){gesekAkhir(L.S,jadi);L.S=null}pf.userStop(titik(L.d,u>.5?.99:.01,L.y));setTimeout(function(){idx=pf.getCurrentPageIndex();isiDiv(idx);tulis()},900)}})(t0)}
/* suara kertas (rekaman /assets/balik.mp3: gemeresik 0,08–0,33 dtk, tepukan 0,52 dtk)
   ketuk = rekaman utuh; geser = gemeresik mengikuti kecepatan jari, tepukan bila halaman jatuh */
var ac=null,sb=null,sp=null,sa=null;
try{sa=fetch('/assets/balik.mp3?v=2').then(function(r){return r.arrayBuffer()})}catch(e){}
function siapSuara(){try{var C=window.AudioContext||window.webkitAudioContext;if(!C||!sa)return null;if(!ac)ac=new C();if(ac.state==='suspended')ac.resume();
  if(!sp)sp=sa.then(function(x){return new Promise(function(ok,no){ac.decodeAudioData(x.slice(0),ok,no)})}).then(function(b){sb=b});return sp}catch(e){return null}}
function putar(off,dur,vol,rate){var x=ac.createBufferSource(),g=ac.createGain();x.buffer=sb;x.playbackRate.value=rate||(.96+Math.random()*.08);g.gain.value=vol;x.connect(g);g.connect(ac.destination);x.start(ac.currentTime,off,dur)}
function suara(){var q=siapSuara();if(!q)return;if(sb)putar(0,undefined,.15);else q.then(function(){putar(0,undefined,.15)})}
function tahan(p,t){if(p.cancelAndHoldAtTime)p.cancelAndHoldAtTime(t);else{var v=p.value;p.cancelScheduledValues(t);p.setValueAtTime(v,t)}}
function gesekMulai(){try{siapSuara();if(!sb)return null;var x=ac.createBufferSource(),g=ac.createGain();x.buffer=sb;x.loop=true;x.loopStart=.08;x.loopEnd=.33;
  g.gain.value=0;x.connect(g);g.connect(ac.destination);x.start(ac.currentTime,.08+Math.random()*.2);return{x:x,g:g,u:null,t:0}}catch(e){return null}}
function gesekGerak(S,u){var n=performance.now();if(S.u!=null){var dt=Math.max(8,n-S.t),v=Math.abs(u-S.u)/dt*1000,a=Math.min(1,Math.sqrt(v/2.4)),t=ac.currentTime;
  tahan(S.g.gain,t);S.g.gain.setTargetAtTime(a*.15,t,.03);S.g.gain.setTargetAtTime(0,t+.07,.07);
  tahan(S.x.playbackRate,t);S.x.playbackRate.setTargetAtTime(.8+.35*a,t,.05)}S.u=u;S.t=n}
function gesekAkhir(S,jadi){try{var t=ac.currentTime;tahan(S.g.gain,t);S.g.gain.setTargetAtTime(0,t,.04);S.x.stop(t+.3);if(jadi)putar(.52,.5,.12)}catch(e){}}
['pointerdown','touchstart'].forEach(function(k){document.addEventListener(k,function(){siapSuara()},{once:true,passive:true})});
/* musik latar: musik situs (/assets/latar.mp3) yang sama, berlanjut dari halaman web; tombol ♫ di bilah mengendalikannya */
var M=null;try{if(window.top!==window&&window.top.__musik)M=window.top.__musik}catch(e){}
if(!M){ /* flipbook dibuka langsung: putar musik situs di sini */
  var mus=new Audio('/assets/latar.mp3?v=1'),mOn=true,K='situs:musik',P='situs:musik:t';mus.loop=true;mus.preload='auto';mus.volume=.4;
  try{mOn=localStorage.getItem(K)!=='0'}catch(e){}
  try{var t0=parseFloat(sessionStorage.getItem(P));if(t0>0)mus.addEventListener('loadedmetadata',function(){try{mus.currentTime=t0%(mus.duration||1e9)}catch(e){}},{once:true})}catch(e){}
  var mMain=function(){if(!mOn||document.hidden)return;var p=mus.play();if(p&&p.catch)p.catch(function(){})};
  setInterval(function(){try{if(mus.currentTime>0)sessionStorage.setItem(P,mus.currentTime)}catch(e){}},3000);
  M={alih:function(){mOn=!mOn;try{localStorage.setItem(K,mOn?'1':'0')}catch(x){}if(mOn)mMain();else mus.pause();return mOn},nyala:function(){return mOn},main:mMain};
  mMain();['pointerdown','touchend','keydown'].forEach(function(k){document.addEventListener(k,function f(){mMain();document.removeEventListener(k,f,true)},true)});
  document.addEventListener('visibilitychange',function(){if(document.hidden)mus.pause();else mMain()})}
var mb=document.createElement('button');mb.type='button';mb.id='mu';mb.textContent='\u266B';
function mTampil(){var o=M.nyala();mb.classList.toggle('mati',!o);mb.setAttribute('aria-label',o?'Matikan musik':'Nyalakan musik')}mTampil();
bar.insertBefore(mb,bk);
mb.addEventListener('click',function(e){e.stopPropagation();M.alih();mTampil()});
function maju(){if(sibuk||lipat)return;if(idx>=N-1)return;suara();pf.flipNext('bottom')}
function mundur(){if(sibuk||lipat||idx<=0)return;if(spread){suara();pf.flipPrev('bottom');return}
  var L=mulaiLipat(-1);if(!L)return;L.set(.05);akhiri(L,true)}
/* bilah judul */
var tahanBar=false;function bilah(v){if(!v&&tahanBar)return;bar.classList.toggle('sembunyi',!v)}
/* gestur */
var pt=null,pinch=null,ketukAkhir=0;
st.addEventListener('pointerdown',function(e){if(pinch||e.button>0||!pf)return;if(e.target.closest&&e.target.closest('.fb-bar'))return;
  pt={x:e.clientX,y:e.clientY,t:Date.now(),sl:st.scrollLeft,stp:st.scrollTop,id:e.pointerId,m:false,mouse:e.pointerType==='mouse'};
  try{st.setPointerCapture(e.pointerId)}catch(x){}});
st.addEventListener('pointermove',function(e){if(!pt||pt.id!==e.pointerId||pinch)return;var dx=e.clientX-pt.x,dy=e.clientY-pt.y;
  if(!pt.m&&Math.abs(dx)+Math.abs(dy)>8)pt.m=true;if(!pt.m)return;
  if(z>1.001){if(pt.mouse){st.scrollLeft=pt.sl-dx;st.scrollTop=pt.stp-dy}return}
  if(pt.x0===undefined){if(sibuk){pt.m='x';return}var maj=(dx>0)===rtl;lipat=mulaiLipat(maj?1:-1,kb(e.clientX,e.clientY).y);if(!lipat){pt.m='x';return}lipat.S=gesekMulai();pt.maj=maj;pt.x0=pt.x}
  if(!lipat)return;var w=spread?pw:pw*.85,g=(pt.maj===rtl?dx:-dx);lipat.set(g/(w*1.6),kb(e.clientX,e.clientY).y)});
function lepas(e){if(!pt||pt.id!==e.pointerId)return;var p=pt;pt=null;
  if(lipat){var L=lipat;lipat=null;var cepat=Date.now()-p.t<350,ok=L.u>.3||(cepat&&L.u>.05);bilah(false);akhiri(L,ok);return}
  if(p.m||e.type==='pointercancel')return;
  var r=zm.getBoundingClientRect(),dalam=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom,now=Date.now();
  var kiri=e.clientX<r.left+r.width/2,keMaju=(kiri===rtl);
  if(dalam&&spread&&((idx===0&&!keMaju)||(idx>=N-1&&keMaju)))dalam=false;
  if(!dalam){bilah(true);return}
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
/* tombol & nomor halaman di footer */
function keHal(n){if(!pf||sibuk||lipat)return;n=Math.max(1,Math.min(N,n|0));var t=n-1;if(t===idx)return tulis();suara();muat(t);isiDiv(t);pf.turnToPage(t);idx=pf.getCurrentPageIndex();isiDiv(idx);tulis()}
bk.onclick=function(){rtl?maju():mundur()};bn.onclick=function(){rtl?mundur():maju()};
no.addEventListener('focus',function(){no.value='';tahanBar=true});
no.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Enter')no.blur();else if(e.key==='Escape'){no.value='';no.blur()}});
no.addEventListener('blur',function(){tahanBar=false;var v=parseInt(no.value,10);no.value='';if(v)keHal(v);else tulis()});
document.addEventListener('keydown',function(e){if(e.target===no)return;if(e.key==='ArrowLeft')rtl?maju():mundur();else if(e.key==='ArrowRight')rtl?mundur():maju();
  else if(e.key==='+'||e.key==='=')setZ(z*1.4);else if(e.key==='-')setZ(z/1.4);else if(e.key==='Escape')bilah(true)});
document.addEventListener('contextmenu',function(e){e.preventDefault()});
document.addEventListener('dragstart',function(e){e.preventDefault()});
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){var W=st.clientWidth,H=st.clientHeight,sp=W>=800&&W/H>1.15;if(z===1||sp!==spread){z=1;ukur()}},150)});
ukur();
var awal=setTimeout(function(){bilah(false)},3500);bar.addEventListener('pointerdown',function(){clearTimeout(awal)});
})();
