/* Pembaca flipbook Pustaka Digital — halaman gambar, RTL/LTR */
(function(){
var el=document.getElementById('buku'),N=+el.dataset.n,rtl=el.dataset.arah==='rtl',dir=el.dataset.dir;
var wr=el.parentNode,pg=wr.parentNode;function ukur(){var h=pg.clientHeight-28,r=467/662,w=window.innerWidth>=900?h*r*2:h*r;wr.style.width=Math.floor(Math.min(w,1400))+'px'}ukur();window.addEventListener('resize',ukur);
var src=[];for(var i=1;i<=N;i++)src.push(dir+(i<10?'0':'')+i+'.webp');
if(N%2)src.push('/flipbook/kosong.webp');var M=src.length;if(rtl)src.reverse();
var pf=new St.PageFlip(el,{width:467,height:662,size:'stretch',minWidth:300,maxWidth:700,minHeight:340,maxHeight:990,
 showCover:true,usePortrait:true,mobileScrollSupport:false,maxShadowOpacity:.35,flippingTime:700,
 startPage:rtl?M-1:0});
pf.loadFromImages(src);
var no=document.getElementById('no'),cari=document.getElementById('ke');
function tulis(){var i=pf.getCurrentPageIndex(),ix=[i];
 if(pf.getOrientation()==='landscape'&&i>0)ix=i%2?[i,i+1]:[i-1,i];
 var p=ix.filter(function(x){return x<M}).map(function(x){return rtl?M-x:x+1}).filter(function(x){return x<=N}).sort(function(x,y){return x-y});
 no.textContent=(p.length>1?p[0]+'–'+p[p.length-1]:p[0])+' / '+N}
pf.on('flip',tulis);pf.on('init',tulis);pf.on('changeOrientation',tulis);
function maju(){rtl?pf.flipPrev():pf.flipNext()}function mundur(){rtl?pf.flipNext():pf.flipPrev()}
document.getElementById('kiri').onclick=function(){rtl?maju():mundur()};
document.getElementById('kanan').onclick=function(){rtl?mundur():maju()};
document.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')document.getElementById('kiri').click();if(e.key==='ArrowRight')document.getElementById('kanan').click()});
if(cari)cari.onchange=function(){var n=Math.max(1,Math.min(N,+cari.value||1));pf.turnToPage(rtl?M-n:n-1);cari.value='';tulis()};
document.addEventListener('contextmenu',function(e){e.preventDefault()});
document.addEventListener('dragstart',function(e){e.preventDefault()});
})();
