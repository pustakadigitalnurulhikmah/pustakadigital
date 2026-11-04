/* Pembaca flipbook Pustaka Digital — halaman SVG, RTL/LTR, balik halaman 2 arah, ketuk/geser, zoom */
(function(){
var st=document.getElementById('stage'),bk=document.getElementById('book'),bar=document.getElementById('bar'),no=document.getElementById('no');
var N=+bk.dataset.n,rtl=bk.dataset.arah==='rtl',dir=bk.dataset.dir,R=+(bk.dataset.rasio||0.7048),KEY='fb:'+dir;
var F=rtl?'L':'R',B=rtl?'R':'L';
function url(p){return dir+(p<10?'0':'')+p+'.svg'}
function el(t,c,p){var e=document.createElement(t);if(c)e.className=c;if(p)p.appendChild(e);return e}
var cache={};function gbr(p){var i=cache[p];if(!i){i=new Image();i.draggable=false;i.alt='';i.src=url(p);cache[p]=i;if(i.decode)i.decode().catch(function(){})}return i}
function pre(p){if(p>=1&&p<=N)gbr(p)}
function pasang(c,p){var o=c.querySelector('img');if(p>0){var i=gbr(p);if(o!==i){if(o)c.replaceChild(i,o);else c.insertBefore(i,c.firstChild)}}else if(o)c.removeChild(o)}
/* slot */
var slot={L:el('div','fb-hal kiri',bk),R:el('div','fb-hal kanan',bk),C:el('div','fb-hal penuh',bk)};
el('div','fb-lipat',bk);
var leaf=el('div','fb-daun',bk),fr=el('div','muka depan',leaf),bc=el('div','muka belakang',leaf);
[fr,bc].forEach(function(f){el('i','bayang',f)});
function isi(s,p){if(p){pasang(s,p);s.style.visibility='visible'}else{s.style.visibility='hidden'}}
function isiMuka(f,p){f.style.background=p?'#fff':'transparent';f.lastChild.style.display=p?'':'none';pasang(f,p)}
/* tata letak */
var spread=false,S=[],cur=0,z=1,pw=0,ph=0,anim=null;
function sisi(p){return p%2?F:B}
function build(){S=[];if(!spread){for(var p=1;p<=N;p++)S.push([p])}else{S.push([1]);for(p=2;p<=N;p+=2)S.push(p<N?[p,p+1]:[p])}}
function idxOf(p){for(var i=0;i<S.length;i++)if(S[i].indexOf(p)>=0)return i;return 0}
function pada(s,side){var a=S[s]||[];for(var i=0;i<a.length;i++)if(sisi(a[i])===side)return a[i];return 0}
function ukur(keep){var W=st.clientWidth,H=st.clientHeight,sp=W>=800&&W/H>1.15,pad=W<600?8:24;
  var p=S.length?S[cur][0]:simpan();if(sp!==spread||!S.length){spread=sp;build();cur=idxOf(p)}
  var cols=spread?2:1;ph=Math.floor(Math.min(H-2*pad,(W-2*pad)/(cols*R)));pw=Math.floor(ph*R);
  bk.classList.toggle('dua',spread);setZ(z,null,null,true);tampil()}
function setZ(nz,cx,cy,diam){nz=Math.max(1,Math.min(5,nz));var r0=bk.getBoundingClientRect(),fx=.5,fy=.5;
  if(cx!=null&&r0.width){fx=(cx-r0.left)/r0.width;fy=(cy-r0.top)/r0.height}
  z=nz;var w=(spread?2:1)*pw*z,h=ph*z;bk.style.width=w+'px';bk.style.height=h+'px';bk.style.setProperty('--pw',pw*z+'px');
  st.classList.toggle('zoom',z>1.001);
  if(!diam&&cx!=null){var r1=bk.getBoundingClientRect();st.scrollLeft+=r1.left+fx*r1.width-cx;st.scrollTop+=r1.top+fy*r1.height-cy}}
function tampil(){leaf.style.display='none';
  if(spread){isi(slot.C,0);isi(slot.L,pada(cur,'L'));isi(slot.R,pada(cur,'R'))}else{isi(slot.L,0);isi(slot.R,0);isi(slot.C,S[cur][0])}
  var a=S[cur],gs=0;if(spread&&a.length===1)gs=(sisi(a[0])==='L'?1:-1)*pw*z/2;bk.style.translate=gs+'px 0';
  a=S[cur];no.textContent=(a.length>1?a[0]+'–'+a[1]:a[0])+' / '+N;
  try{localStorage.setItem(KEY,a[0])}catch(e){}
  for(var j=-2;j<=3;j++){var b=S[cur+j];if(b)b.forEach(pre)}}
function simpan(){try{var v=parseInt(localStorage.getItem(KEY),10);if(v>=1&&v<=N)return v}catch(e){}return 1}
/* balik halaman */
function siap(d){var t=cur+d;if(t<0||t>=S.length)return null;var o={t:t};leaf.style.display='block';
  if(spread){var X=d>0?F:B,Y=X==='L'?'R':'L';
    isi(slot[X],pada(t,X));isi(slot[Y],pada(cur,Y));isiMuka(fr,pada(cur,X));isiMuka(bc,pada(t,Y));
    leaf.className='fb-daun '+(X==='L'?'kiri':'kanan');o.a0=0;o.a1=X==='L'?180:-180}
  else{var g=rtl?180:-180;leaf.className='fb-daun penuh '+(rtl?'poros-kanan':'poros-kiri');isiMuka(bc,-1);
    if(d>0){isi(slot.C,S[t][0]);isiMuka(fr,S[cur][0]);o.a0=0;o.a1=g}else{isi(slot.C,S[cur][0]);isiMuka(fr,S[t][0]);o.a0=g;o.a1=0}}
  o.set=function(u){var a=o.a0+(o.a1-o.a0)*u;leaf.style.transform='rotateY('+a+'deg)';var s=Math.abs(Math.sin(a*Math.PI/180));
    fr.lastChild.style.opacity=s*.45;bc.lastChild.style.opacity=s*.3};o.set(0);return o}
function jalan(o,u0,u1,done){var t0=performance.now(),dur=Math.max(180,560*Math.abs(u1-u0));if(anim)cancelAnimationFrame(anim);
  (function f(now){var k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3);o.set(u0+(u1-u0)*e);
    if(k<1)anim=requestAnimationFrame(f);else{anim=null;done()}})(t0)}
var sibuk=false;
function balik(d){if(sibuk)return;var o=siap(d);if(!o)return;sibuk=true;jalan(o,0,1,function(){cur=o.t;sibuk=false;tampil()})}
function maju(){balik(1)}function mundur(){balik(-1)}
/* bilah judul */
function bilah(v){bar.classList.toggle('sembunyi',!v)}
/* gestur */
var pt=null,drag=null,pinch=null,ketukAkhir=0;
st.addEventListener('pointerdown',function(e){if(pinch||e.button>0)return;if(e.target.closest&&e.target.closest('.fb-bar'))return;
  pt={x:e.clientX,y:e.clientY,t:Date.now(),sl:st.scrollLeft,stp:st.scrollTop,id:e.pointerId,m:false,mouse:e.pointerType==='mouse'};
  try{st.setPointerCapture(e.pointerId)}catch(x){}});
st.addEventListener('pointermove',function(e){if(!pt||pt.id!==e.pointerId||pinch)return;var dx=e.clientX-pt.x,dy=e.clientY-pt.y;
  if(!pt.m&&Math.abs(dx)+Math.abs(dy)>8)pt.m=true;if(!pt.m)return;
  if(z>1.001){if(pt.mouse){st.scrollLeft=pt.sl-dx;st.scrollTop=pt.stp-dy}return}
  if(sibuk)return;
  if(!drag){var d=(dx>0)===rtl?1:-1,o=siap(d);if(!o){pt.m='x';return}drag={o:o,d:d}}
  var w=spread?pw:pw*.9,u=Math.max(0,Math.min(1,(drag.d>0===rtl?dx:-dx)/(w*1.2)));drag.u=u;drag.o.set(u)});
function lepas(e){if(!pt||pt.id!==e.pointerId)return;var p=pt;pt=null;
  if(drag){var g=drag;drag=null;var cepat=Date.now()-p.t<350;var ok=g.u>.33||(cepat&&g.u>.06);sibuk=true;
    jalan(g.o,g.u,ok?1:0,function(){if(ok)cur=g.o.t;sibuk=false;tampil()});bilah(false);return}
  if(p.m||e.type==='pointercancel')return;
  var r=bk.getBoundingClientRect(),dalam=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom,now=Date.now();
  var hf=e.clientX<r.left+r.width/2?'L':'R';if(dalam&&spread&&!pada(cur,hf))dalam=false;
  if(!dalam){bilah(bar.classList.contains('sembunyi'));return}
  bilah(false);
  if(z>1.001){if(now-ketukAkhir<320){setZ(1,e.clientX,e.clientY)}ketukAkhir=now;return}
  if(hf===F)maju();else mundur()}
st.addEventListener('pointerup',lepas);st.addEventListener('pointercancel',lepas);
st.addEventListener('dblclick',function(e){if(z>1.001)setZ(1,e.clientX,e.clientY)});
/* cubit (pinch) */
function jarak(t){var a=t[0],b=t[1];return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}
st.addEventListener('touchstart',function(e){if(e.touches.length===2){if(drag){drag.o.set(0);drag=null;tampil()}pt=null;
  var a=e.touches[0],b=e.touches[1];pinch={d0:jarak(e.touches),z0:z,cx:(a.clientX+b.clientX)/2,cy:(a.clientY+b.clientY)/2,r:bk.getBoundingClientRect(),s:1};
  bk.style.transformOrigin=(pinch.cx-pinch.r.left)+'px '+(pinch.cy-pinch.r.top)+'px';e.preventDefault()}},{passive:false});
st.addEventListener('touchmove',function(e){if(!pinch||e.touches.length<2)return;e.preventDefault();
  var nz=Math.max(1,Math.min(5,pinch.z0*jarak(e.touches)/pinch.d0));pinch.s=nz/pinch.z0;bk.style.transform='scale('+pinch.s+')'},{passive:false});
st.addEventListener('touchend',function(e){if(!pinch||e.touches.length>=2)return;var p=pinch;pinch=null;bk.style.transform='';bk.style.transformOrigin='';
  var fx=(p.cx-p.r.left)/p.r.width,fy=(p.cy-p.r.top)/p.r.height;z=p.z0;setZ(p.z0*p.s,null,null,true);
  var r1=bk.getBoundingClientRect();st.scrollLeft+=r1.left+fx*r1.width-p.cx;st.scrollTop+=r1.top+fy*r1.height-p.cy});
/* PC: roda + Ctrl, tombol, keyboard */
st.addEventListener('wheel',function(e){if(e.ctrlKey){e.preventDefault();setZ(z*(e.deltaY<0?1.15:1/1.15),e.clientX,e.clientY)}},{passive:false});
function tengah(){var r=st.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}
document.getElementById('zi').onclick=function(){var c=tengah();setZ(z*1.4,c[0],c[1])};
document.getElementById('zo').onclick=function(){var c=tengah();setZ(z/1.4,c[0],c[1])};
document.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')rtl?maju():mundur();else if(e.key==='ArrowRight')rtl?mundur():maju();
  else if(e.key==='+'||e.key==='='){var c=tengah();setZ(z*1.4,c[0],c[1])}else if(e.key==='-'){c=tengah();setZ(z/1.4,c[0],c[1])}else if(e.key==='Escape')bilah(true)});
document.addEventListener('contextmenu',function(e){e.preventDefault()});
document.addEventListener('dragstart',function(e){e.preventDefault()});
window.addEventListener('resize',function(){ukur()});
ukur();
})();
