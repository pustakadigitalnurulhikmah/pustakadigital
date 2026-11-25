/* Pustaka Digital — gerak (revisi 78): Lenis (gulir halus), GSAP + ScrollTrigger (parallax & muncul), Motion (pegas hover/tekan, sampul 3D) */
(function(){
var d=document,H=d.documentElement,W=window;
var R=W.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
var HALUS=W.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
if(R||/^\/baca\//.test(location.pathname))return;
var G=W.gsap,ST=W.ScrollTrigger,M=W.Motion;

/* 1. Lenis — gulir halus (roda tetikus/touchpad); sentuhan HP tetap bawaan */
var lenis=null;
if(W.Lenis){try{
  lenis=new Lenis({lerp:.11,wheelMultiplier:1,smoothWheel:true,syncTouch:false,allowNestedScroll:true,
    prevent:function(n){return !!(n.closest&&n.closest('.bingkai-situs,.pa-modal,[data-lenis-prevent]'))}});
  W.__lenis=lenis;
  if(G){G.ticker.add(function(t){lenis.raf(t*1000)});G.ticker.lagSmoothing(0)}
  else{(function f(t){lenis.raf(t);requestAnimationFrame(f)})(performance.now())}
  /* halaman di belakang bingkai: hentikan */
  new MutationObserver(function(){H.classList.contains('berbingkai')?lenis.stop():lenis.start()}).observe(H,{attributes:true,attributeFilter:['class']});
  /* ganti mode baca / tinggi halaman berubah */
  W.addEventListener('load',function(){lenis.resize()});
}catch(e){lenis=null}}

/* 2. GSAP + ScrollTrigger */
if(G&&ST){
  G.registerPlugin(ST);
  if(lenis)lenis.on('scroll',ST.update);
  H.classList.add('gs');
  var mm=G.matchMedia();
  /* hero beranda: gambar bergerak pelan (parallax), tulisan memudar ke atas */
  var hero=d.getElementById('beranda');
  if(hero){
    var sl=hero.querySelector('.h-sl'),hin=hero.querySelector('.hero-in');
    if(sl)G.to(sl,{yPercent:18,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
    if(hin)G.to(hin,{y:-70,opacity:.15,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
  }
  /* latar ayat & donasi: parallax lembut */
  ['.h-ayat-in','.h-don'].forEach(function(q){d.querySelectorAll(q).forEach(function(el){
    G.fromTo(el,{backgroundPositionY:'35%'},{backgroundPositionY:'70%',ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}})})});
  /* foto & kolase: sedikit membesar → normal saat masuk layar */
  d.querySelectorAll('.h-foto,.h-kolase img').forEach(function(el){
    G.fromTo(el,{scale:1.12},{scale:1,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'center center',scrub:true}})});
  /* judul bagian: garis emas tumbuh */
  d.querySelectorAll('.h-sec .h-head').forEach(function(el){
    ST.create({trigger:el,start:'top 85%',once:true,onEnter:function(){el.classList.add('gs-in')}})});
  /* halaman kitab: latar bergerak pelan */
  var kh=d.querySelector('.k-hero');
  if(kh)mm.add('(min-width:761px)',function(){G.fromTo(kh,{backgroundPositionY:'35%'},{backgroundPositionY:'60%',ease:'none',scrollTrigger:{trigger:kh,start:'top top',end:'bottom top',scrub:true}})});
  /* tinggi halaman berubah (kartu dari feed, mode baca) → hitung ulang */
  var tm=0;new ResizeObserver(function(){clearTimeout(tm);tm=setTimeout(function(){ST.refresh()},200)}).observe(d.body);
}

/* 3. Motion — pegas saat disentuh/ditekan, sampul 3D mengikuti kursor */
if(M&&M.animate){
  H.classList.add('mo');
  var A=M.animate,PEG={type:'spring',stiffness:380,damping:24},LEM={type:'spring',stiffness:220,damping:20};
  var TEKAN='.hb,.kh-baca,.kh-bagi,.chip,.btn-toc,.kb-kembali,.kb-mode button,.k-pager a,.pa-btn,.mus-situs,.k-cov.cov-klik';
  d.addEventListener('pointerdown',function(e){var el=e.target.closest&&e.target.closest(TEKAN);if(!el)return;
    A(el,{scale:.95},PEG);
    var lepas=function(){A(el,{scale:1},{type:'spring',stiffness:500,damping:15});removeEventListener('pointerup',lepas);removeEventListener('pointercancel',lepas)};
    addEventListener('pointerup',lepas);addEventListener('pointercancel',lepas)},{passive:true});
  if(HALUS){
    /* kartu kitab: terangkat + sampul miring mengikuti kursor */
    var aktif=null;
    d.addEventListener('pointerover',function(e){var c=e.target.closest&&e.target.closest('.card');if(!c||c===aktif)return;
      if(aktif)turun(aktif);aktif=c;A(c,{y:-8},LEM);var cv=c.querySelector('.cover');if(cv)cv.style.transformPerspective='800px'});
    d.addEventListener('pointermove',function(e){if(!aktif)return;var cv=aktif.querySelector('.cover');if(!cv)return;
      var r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      A(cv,{rotateY:x*14,rotateX:-y*12},{type:'spring',stiffness:160,damping:18})},{passive:true});
    d.addEventListener('pointerout',function(e){if(!aktif)return;var to=e.relatedTarget;if(to&&aktif.contains(to))return;turun(aktif);aktif=null});
    function turun(c){A(c,{y:0},LEM);var cv=c.querySelector('.cover');if(cv)A(cv,{rotateY:0,rotateX:0},LEM)}
    /* sampul di halaman kitab */
    var kc=d.querySelector('.kh-cov .k-cov');
    if(kc){var box=kc.parentNode;
      box.addEventListener('pointermove',function(e){var r=kc.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        if(Math.abs(x)>.7||Math.abs(y)>.7)return;A(kc,{rotateY:x*16,rotateX:-y*12,y:-6},{type:'spring',stiffness:150,damping:16})});
      box.addEventListener('pointerleave',function(){A(kc,{rotateY:0,rotateX:0,y:0},LEM)})}
    /* tombol emas: sedikit tertarik ke kursor (magnetik) */
    d.querySelectorAll('.hb-1,.kh-bacaan .kh-baca').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();A(b,{x:(e.clientX-r.left-r.width/2)*.18,y:(e.clientY-r.top-r.height/2)*.3},{type:'spring',stiffness:300,damping:18})});
      b.addEventListener('pointerleave',function(){A(b,{x:0,y:0},LEM)})});
    /* kotak keunggulan & ulama: terangkat */
    d.addEventListener('pointerover',function(e){var el=e.target.closest&&e.target.closest('.h-fitur>li,.h-ulama .u,.b-bidang>a');if(!el||el.__mo)return;el.__mo=1;A(el,{y:-6},LEM);
      el.addEventListener('pointerleave',function f(){el.__mo=0;A(el,{y:0},LEM);el.removeEventListener('pointerleave',f)})});
  }
}
})();
