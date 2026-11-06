/* Pustaka Digital Nurul Hikmah — skrip tema (rombak 2026-11) */
(function(){
var CFG={
  mutiara:{'Ilmu Nahwu':'Ilmu nahwu adalah ilmu alat; dengannya segala ilmu pengetahuan yang berbahasa Arab dapat dipahami.'},
  prefixPenulis:'Penulis:',
  khusus:['Pilihan','Populer']
};
function $(s,c){return (c||document).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function parseLabels(arr){var p='',k='';arr.forEach(function(l){l=String(l).trim();if(l.indexOf(CFG.prefixPenulis)===0){if(!p)p=l.slice(CFG.prefixPenulis.length).trim()}else if(CFG.khusus.indexOf(l)<0&&!k)k=l});return{penulis:p,kategori:k}}
function labelUrl(l){return '/search/label/'+encodeURIComponent(l)}
var STORE={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
function cardHTML(p){
  var cov=p.img?'<img src="'+esc(p.img)+'" alt="'+esc(p.t)+'" loading="lazy">':'<span class="fake">'+esc(p.t)+'</span>';
  return '<a class="card" href="'+esc(p.url)+'"><span class="cover">'+cov+'</span><h3>'+esc(p.t)+'</h3>'+(p.penulis?'<p class="by">'+esc(p.penulis)+'</p>':'')+(p.kategori?'<span class="tag">'+esc(p.kategori)+'</span>':'')+'</a>';
}
function kosong(t){return '<div class="kosong">'+t+'</div>'}
function skel(n){return new Array(n+1).join('<i class="skel"></i>')}

/* ===== Data kitab (feed.js) ===== */
var cache=null,antre=[];
function semua(cb){
  if(cache)return cb(cache);antre.push(cb);if(antre.length>1)return;
  var fn='kbFeed',s=document.createElement('script');
  window[fn]=function(d){
    cache=((d.feed&&d.feed.entry)||[]).map(function(e){
      var url='';(e.link||[]).forEach(function(l){if(l.rel==='alternate')url=l.href});
      var labels=(e.category||[]).map(function(c){return c.term}),L=parseLabels(labels);
      var img=e.media$thumbnail?e.media$thumbnail.url:'';
      img=img.replace(/\/s72(-c)?\//,'/w300-h400-c/').replace(/=s72(-c)?$/,'=w300-h400-c');
      return{t:e.title.$t,url:url,labels:labels,img:img,penulis:L.penulis,kategori:L.kategori};
    });selesai();
  };
  s.onerror=function(){cache=[];selesai()};
  s.src='/feed.js?v='+Math.floor(Date.now()/6e5)+'&alt=json-in-script&max-results=500&callback='+fn;document.body.appendChild(s);
  function selesai(){antre.forEach(function(f){f(cache)});antre=[]}
}

/* ===== Kepala ===== */
var top=$('.top');
if(top&&document.body.classList.contains('over')){var g=function(){top.classList.toggle('gulir',window.pageYOffset>Math.min(260,window.innerHeight*.35))};g();window.addEventListener('scroll',g,{passive:true})}
var y=$('#thn');if(y)y.textContent=new Date().getFullYear();
var nav=$('#nav'),bm=$('#btnMenu');
var nd=null;if(bm&&nav){nd=document.createElement('div');nd.className='nav-drop';nd.id='navDrop';nd.innerHTML=nav.innerHTML;bm.parentNode.appendChild(nd);bm.onclick=function(e){e.stopPropagation();nd.classList.toggle('open')};document.addEventListener('click',function(e){if(!nd.contains(e.target))nd.classList.remove('open')})}
var P=location.pathname.replace(/\.html$/,''),act='';
if(P==='/'||P==='/index')act='home';else if(P.indexOf('/p/daftar-kitab')===0||P.indexOf('/search')===0||/^\/\d{4}\//.test(P))act='daftar';else if(P.indexOf('/p/penulis')===0)act='penulis';else if(P.indexOf('/p/tentang')===0)act='tentang';else if(P.indexOf('/p/donasi')===0)act='donasi';else if(P.indexOf('/p/kontak')===0)act='kontak';
$$('#nav a,#navDrop a').forEach(function(a){if(a.getAttribute('data-nav')===act)a.classList.add('on')});

/* ===== Katalog di beranda ===== */
var bk=$('#beranda-kitab');
if(bk){bk.innerHTML='<div class="grid">'+skel(6)+'</div>';
  semua(function(all){$('.grid',bk).innerHTML=all.length?all.slice(0,12).map(cardHTML).join(''):kosong('Koleksi sedang disiapkan.')})}

/* ===== Koleksi kitab ===== */
var dk=$('#daftar-kitab');
if(dk){
  dk.innerHTML='<div class="tools"><label class="cari"><svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input type="search" aria-label="Saring koleksi" placeholder="Saring judul atau pengarang"></label><div class="chips"></div></div><div class="grid">'+skel(4)+'</div>';
  semua(function(all){
    var kat=[];all.forEach(function(p){if(p.kategori&&kat.indexOf(p.kategori)<0)kat.push(p.kategori)});
    var pilih='',inp=$('input',dk),g=$('.grid',dk),ch=$('.chips',dk);
    if(kat.length>1)ch.innerHTML=['Semua'].concat(kat).map(function(k,i){return '<button class="chip'+(i?'':' on')+'" data-k="'+(i?esc(k):'')+'" type="button">'+esc(k)+'</button>'}).join('');else ch.remove();
    var q0=new URLSearchParams(location.search).get('q');if(q0)inp.value=q0;
    function tampil(){var q=inp.value.toLowerCase().trim();
      var r=all.filter(function(p){return(!pilih||p.kategori===pilih)&&(!q||(p.t+' '+p.penulis+' '+p.kategori).toLowerCase().indexOf(q)>=0)});
      g.innerHTML=r.length?r.map(cardHTML).join(''):kosong(all.length?'Tidak ada kitab yang sesuai dengan pencarian Anda.':'Koleksi sedang disiapkan.')}
    ch.onclick=function(e){var b=e.target.closest('.chip');if(!b)return;$$('.chip',ch).forEach(function(x){x.classList.remove('on')});b.classList.add('on');pilih=b.getAttribute('data-k');tampil()};
    inp.oninput=tampil;tampil();
  });
}

/* ===== Hasil pencarian & label ===== */
var hc=$('#hasil-cari');
if(hc){
  var m=location.pathname.match(/\/search\/label\/([^?#]+)/),lab=m?decodeURIComponent(m[1]).replace(/\.html$/,''):'',q=(new URLSearchParams(location.search).get('q')||'').trim();
  var h1=$('.pg-head h1'),sm=$('.pg-head small'),ps=$('.pg-head p');
  if(lab){var pen=lab.indexOf(CFG.prefixPenulis)===0;sm.textContent=pen?'Karya Pengarang':'Kategori';h1.textContent=pen?lab.slice(CFG.prefixPenulis.length).trim():lab;ps.textContent=pen?'Kitab-kitab karya pengarang ini yang tersedia di Pustaka Digital.':'Kitab dalam kategori ini.';document.title=h1.textContent+' – Pustaka Digital Nurul Hikmah'}
  else if(q){sm.textContent='Hasil Pencarian';h1.textContent='“'+q+'”';ps.textContent='';document.title='Cari: '+q+' – Pustaka Digital Nurul Hikmah'}
  hc.innerHTML='<div class="grid">'+skel(4)+'</div>';
  semua(function(all){
    var ql=q.toLowerCase();
    var r=all.filter(function(p){return lab?p.labels.indexOf(lab)>=0:!ql||(p.t+' '+p.penulis+' '+p.kategori+' '+p.labels.join(' ')).toLowerCase().indexOf(ql)>=0});
    if(q&&!lab)ps.textContent=r.length?r.length+' kitab ditemukan.':'';
    $('.grid',hc).innerHTML=r.length?r.map(cardHTML).join(''):kosong('Kitab yang Anda cari belum tersedia. <a href="/p/daftar-kitab" style="color:var(--g6);font-weight:600">Lihat seluruh koleksi</a>.');
  });
}

/* ===== Penulis ===== */
var dp=$('#daftar-penulis');
if(dp){
  dp.innerHTML='<div class="plist"><i class="skel" style="aspect-ratio:auto;height:64px"></i></div>';
  semua(function(all){
    var c={};all.forEach(function(p){if(p.penulis)c[p.penulis]=(c[p.penulis]||0)+1});
    var n=Object.keys(c).sort(function(a,b){return a.localeCompare(b,'id')});
    $('.plist',dp).innerHTML=n.length?n.map(function(x){return '<a class="pitem" href="'+labelUrl(CFG.prefixPenulis+' '+x)+'"><b>'+esc(x)+'</b><span>'+c[x]+' kitab</span></a>'}).join(''):kosong('Data pengarang sedang disiapkan.');
  });
}

/* ===== Halaman kitab ===== */
var art=$('#kitab');
if(!art)return;
var body=$('.post-body',art),HASH0=location.hash||'';
var KD=$('.k-data',art),kd=function(n){return KD?(KD.getAttribute('data-'+n)||'').trim():''};if(KD)KD.style.display='none';
var labs=$$('.k-tags a',art).map(function(a){return a.textContent.trim()}),L=parseLabels(labs);
$$('.k-tags a',art).forEach(function(a){var t=a.textContent.trim();if(CFG.khusus.indexOf(t)>=0)a.remove();else if(t.indexOf(CFG.prefixPenulis)===0)a.textContent=t.slice(CFG.prefixPenulis.length).trim()});
/* sampul pertama di isi tidak diulang */
var f=body.firstElementChild;while(f&&!f.textContent.trim()&&!f.querySelector('img')&&f.tagName!=='IMG')f=f.nextElementSibling;
if(f&&(f.tagName==='IMG'||(!f.textContent.trim()&&f.querySelector('img'))))f.style.display='none';
/* kenali paragraf Arab */
var AR=/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
$$('p,h2,h3,h4,li,blockquote,div,td',body).forEach(function(el){
  if(el.closest('.bab'))return;
  if(el.classList.contains('ar')){el.setAttribute('dir','rtl');el.setAttribute('lang','ar');return}
  if(el.classList.contains('tr')||el.classList.contains('judul-id'))return;
  if(el.querySelector('p,div,h2,h3,h4,li,blockquote,table,ul,ol'))return;
  var t=el.textContent.replace(/[\s\d٠-٩.,:;()«»"'\-–—!?،؛؟*]/g,'');if(!t)return;
  if((t.match(AR)||[]).length/t.length>0.5){el.classList.add('ar');el.setAttribute('dir','rtl');el.setAttribute('lang','ar')}
  else el.classList.add('tr-auto');
});
var judul=$('h1',art).textContent.trim();
/* kepala baca */
var kh=document.createElement('div');kh.className='k-bacahead';
kh.innerHTML='<div class="wrap"><button type="button" class="kb-kembali">&#8249; Kembali</button><b>'+esc(judul)+'</b></div>';
var hero=$('.k-hero',art);art.insertBefore(kh,hero.nextSibling);
var rtl=$('.rtools',art);
/* satu bab per tampilan */
var h2s=Array.prototype.filter.call(body.children,function(e){return (e.tagName==='H2'||(e.tagName==='H3'&&e.classList.contains('bab')))&&e.textContent.trim()});
var bag=[],idx=-1,KEY='kb-pos:'+location.pathname,go=null;
if(h2s.length>=2){
  var cur=null;
  var baru=function(j){var s=document.createElement('section');s.className='bagian';s.setAttribute('data-judul',j);bag.push(s);return s};
  Array.prototype.slice.call(body.childNodes).forEach(function(n){
    if(n.nodeType===1&&h2s.indexOf(n)>=0){cur=baru(n.getAttribute('data-toc')||n.textContent.trim().replace(/\s+/g,' '));if(n.getAttribute('data-jenis')==='id')cur.classList.add('bag-id');if(n.tagName==='H3')cur.setAttribute('data-sub','1')}
    else if(!cur){if((n.nodeType===1&&n.style.display!=='none')||(n.nodeType===3&&n.textContent.trim())){cur=baru('Pendahuluan');cur.classList.add('bag-id')}else return}
    cur.appendChild(n);
  });
  body.innerHTML='';bag.forEach(function(s,i){s.id='bagian-'+(i+1);body.appendChild(s)});
  var lay=document.createElement('div');lay.className='k-layout';
  var side=document.createElement('aside');side.className='bab-toc';side.setAttribute('aria-label','Daftar isi');
  side.innerHTML='<div class="bt-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10.3 5.2 7.9 4.6 4 4.6v13.2c3.9 0 6.3.6 8 1.9 1.7-1.3 4.1-1.9 8-1.9V4.6c-3.9 0-6.3.6-8 1.9z"/><path d="M12 6.5v13.2"/></svg>Daftar Isi<button type="button" class="bt-x" aria-label="Tutup daftar isi">&#215;</button></div><ol>'+bag.map(function(s,i){
    var o='<li><a href="#bagian-'+(i+1)+'" data-i="'+i+'" data-main="1"><i class="ti"></i><span>'+esc(s.getAttribute('data-judul'))+'</span></a></li>';
    $$('h3',s).forEach(function(h,k){if(h.classList.contains('fasal'))return;var j=(h.getAttribute('data-toc')||h.textContent).trim().replace(/\s+/g,' ');if(!j)return;if(!h.id)h.id='sub-'+(i+1)+'-'+(k+1);
      o+='<li><a href="#'+h.id+'" data-i="'+i+'" data-h="'+h.id+'"><i class="ti"></i><span>'+esc(j)+'</span></a></li>'});
    return o}).join('')+'</ol>';
  var kol=document.createElement('div');kol.className='k-kol';
  var bawah=document.createElement('nav');bawah.className='bab-nav';
  bawah.innerHTML='<a class="pv" role="button" tabindex="0">Sebelumnya</a><span class="posisi"></span><a class="nx" role="button" tabindex="0">Berikutnya</a>';
  art.insertBefore(lay,body);lay.appendChild(side);lay.appendChild(kol);kol.appendChild(rtl);kol.appendChild(body);kol.appendChild(bawah);art.classList.add('ada-toc');
  var tocA=$$('a[data-main]',side),ol=$('ol',side);
  var tocBuka=function(b){document.documentElement.classList.toggle('toc-buka',b)};
  var tirai=document.createElement('div');tirai.className='toc-tirai';document.body.appendChild(tirai);
  $('.bt-x',side).onclick=tirai.onclick=function(){tocBuka(false)};
  document.addEventListener('keydown',function(e){if(e.key==='Escape')tocBuka(false)});
  var tb=document.createElement('button');tb.type='button';tb.className='btn-toc';
  tb.innerHTML='<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>Daftar Isi';rtl.insertBefore(tb,rtl.firstChild);
  tb.onclick=function(){tocBuka(true);var on=$('a.on',side);if(on)ol.scrollTop=on.offsetTop-ol.clientHeight/3};
  $$('a',side).forEach(function(a){a.onclick=function(e){e.preventDefault();tocBuka(false);var h=a.getAttribute('data-h');go(parseInt(a.getAttribute('data-i'),10),!h);
    if(h){var el=document.getElementById(h);if(el)requestAnimationFrame(function(){window.scrollTo({top:el.getBoundingClientRect().top+window.pageYOffset-140,behavior:'smooth'})})}}});
  go=function(i,push){
    i=Math.max(0,Math.min(bag.length-1,i));var ganti=i!==idx;idx=i;
    bag.forEach(function(s,k){s.classList.toggle('aktif',k===i)});
    $('.posisi',bawah).textContent=(i+1)+' / '+bag.length;
    $('.pv',bawah).classList.toggle('hide',i===0);$('.nx',bawah).classList.toggle('hide',i===bag.length-1);
    tocA.forEach(function(a,k){a.classList.toggle('on',k===i)});
    if(ol.clientHeight&&tocA[i]){var ot=tocA[i].offsetTop;if(ot<ol.scrollTop||ot>ol.scrollTop+ol.clientHeight-40)ol.scrollTop=ot-ol.clientHeight/3}
    if(push||art.classList.contains('buka')){var h='#bagian-'+(i+1);try{if(push)history.pushState(null,'',h);else history.replaceState(null,'',h)}catch(e){}STORE.set(KEY,i)}
    if(push&&ganti)window.scrollTo({top:0,behavior:'smooth'});
  };
  var dariHash=function(){var m=location.hash.match(/^#bagian-(\d+)$/);if(m)return parseInt(m[1],10)-1;
    if(location.hash.length>1){var t=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(t){var s=t.closest('.bagian');if(s)return bag.indexOf(s)}}return -1};
  $('.pv',bawah).onclick=function(){go(idx-1,true)};$('.nx',bawah).onclick=function(){go(idx+1,true)};
  $$('a',bawah).forEach(function(a){a.onkeydown=function(e){if(e.key==='Enter')a.click()}});
  window.addEventListener('popstate',function(){var i=dariHash();art.classList.toggle('buka',i>=0);if(i<0)lb();go(i<0?0:i,false)});
  $$('.k-ringkas a[href^="#"]').forEach(function(a){a.onclick=function(e){e.preventDefault();try{history.pushState(null,'',a.getAttribute('href'))}catch(x){}var i=dariHash();if(i<0)return;art.classList.add('buka');go(i,false);window.scrollTo({top:0,behavior:'instant'})}});
  document.addEventListener('keydown',function(e){if(!art.classList.contains('buka')||/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||''))return;
    if(e.key==='ArrowRight')go(idx+1,true);else if(e.key==='ArrowLeft')go(idx-1,true)});
  var mulai=dariHash();if(mulai>=0)art.classList.add('buka');go(mulai>=0?mulai:0,false);
}else{
  art.insertBefore(rtl,body);
  if(HASH0.length>1)art.classList.add('buka');
}
/* informasi kitab */
var IC={user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',bab:'<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".6"/><circle cx="4" cy="12" r=".6"/><circle cx="4" cy="18" r=".6"/></svg>',globe:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9s1.3-6.4 3.8-9z"/></svg>',tag:'<svg viewBox="0 0 24 24"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/></svg>'};
var nb=bag.length?bag.filter(function(s){return !s.classList.contains('bag-id')&&!s.hasAttribute('data-sub')}).length:0;
var ar=kd('ar'),pen=L.penulis,trj=kd('penerjemah'),desk=kd('desk'),bhs=kd('bahasa')||'Arab – Indonesia',fmt=kd('format')||'Teks berharakat & terjemah',jb=kd('isi')||(nb?nb+' bab':'');
var ka=$('.k-ar',hero);if(ar)ka.textContent=ar;else ka.remove();
$('.k-pen',hero).innerHTML=pen?IC.user+'<span>'+esc(pen)+'</span>':'';
$('.kh-meta',hero).innerHTML=[[IC.bab,'Isi',jb],[IC.globe,'Bahasa',bhs],[IC.tag,'Kategori',L.kategori]].filter(function(m){return m[2]}).map(function(m){return '<div>'+m[0]+'<span><small>'+m[1]+'</small><b>'+esc(m[2])+'</b></span></div>'}).join('');
var dsk=$('.kh-desk',hero);if(desk)dsk.textContent=desk;else dsk.remove();
$('.kh-info dl',hero).innerHTML=[['Judul',judul],['Judul Arab',ar,1],['Pengarang',pen],['Penerjemah',trj],['Kategori',L.kategori],['Isi',jb],['Bahasa',bhs],['Format',fmt]].filter(function(r){return r[1]}).map(function(r){return '<dt>'+r[0]+'</dt><dd'+(r[2]?' class="ar" dir="rtl" lang="ar"':'')+'>'+esc(r[1])+'</dd>'}).join('');
var mi=kd('mutiara')||CFG.mutiara[L.kategori]||'',ms=kd('mutiara-sumber');
$('.kh-info blockquote',hero).innerHTML=mi?'&#8220;'+esc(mi)+'&#8221;'+(ms?'<cite>'+esc(ms)+'</cite>':''):'';
var baca=$('.kh-baca',hero),sv=0;
function lb(){var s=parseInt(STORE.get(KEY),10)||0;sv=(bag.length&&s>0&&s<bag.length)?s:0;
  if(sv){$('b',baca).textContent='Lanjutkan Membaca';$('small',baca).textContent=bag[sv].getAttribute('data-judul')}
  else{$('b',baca).textContent='Mulai Membaca';$('small',baca).textContent=bag.length?'Dari halaman pertama':'Buka isi kitab'}}
lb();
var keAtas=function(){window.scrollTo({top:0,behavior:'instant'})};
baca.onclick=function(){art.classList.add('buka');if(go)go(sv,true);else{try{history.pushState(null,'','#isi')}catch(e){}}keAtas()};
$('.kb-kembali',kh).onclick=function(){art.classList.remove('buka');try{history.pushState(null,'',location.pathname+location.search)}catch(e){}lb();keAtas()};
$('.kh-bagi',hero).onclick=function(){var u=location.href.split('#')[0],s=$('span',this);
  if(navigator.share)navigator.share({title:judul,url:u}).catch(function(){});
  else if(navigator.clipboard)navigator.clipboard.writeText(u).then(function(){s.textContent='Tautan disalin';setTimeout(function(){s.textContent='Bagikan'},1800)});
  else prompt('Salin tautan:',u)};
/* mode baca */ if(body&&rtl&&body.querySelector('p.cat')){var cb=document.createElement('button');cb.type='button';cb.className='btn-cat';cb.setAttribute('data-mode','mode-cat');cb.textContent='Catatan';rtl.appendChild(cb);$$('section.bagian',body).forEach(function(s){if(!s.querySelector('p.cat')){var k=document.createElement('p');k.className='kosong-cat';k.textContent='Tidak ada catatan pada bagian ini.';s.appendChild(k)}})}
var kbh=$('.k-bacahead .wrap',art);if(kbh){var grp=document.createElement('div');grp.className='kb-mode';$$('[data-mode]',rtl).forEach(function(b){var c=b.cloneNode(true);c.removeAttribute('id');grp.appendChild(c)});kbh.appendChild(grp)}
var kbk=$('.kb-kembali',art),tbb=$('.btn-toc',rtl);if(kbk){kbk.innerHTML='<span class="kb-s">&#8249;</span><span class="kb-t">Kembali</span>';kbk.setAttribute('aria-label','Kembali');kbk.title='Kembali';if(tbb)kbk.parentNode.insertBefore(tbb,kbk.nextSibling)}
var modes=$$('[data-mode]',art); function setMode(m){art.classList.toggle('mode-ar',m==='mode-ar');art.classList.toggle('mode-cat',m==='mode-cat');modes.forEach(function(b){b.classList.toggle('on',b.getAttribute('data-mode')===m)});STORE.set('kb-mode',m)}
modes.forEach(function(b){b.onclick=function(){setMode(b.getAttribute('data-mode'))}});
var m0=STORE.get('kb-mode');setMode(m0==='mode-ar'||(m0==='mode-cat'&&$('.btn-cat',rtl))?m0:'');
})();

/* mode baca: sembunyikan header & footer situs */
(function(){var a=document.getElementById('kitab');if(!a)return;var f=function(){document.documentElement.classList.toggle('baca',a.classList.contains('buka'))};f();new MutationObserver(f).observe(a,{attributes:true,attributeFilter:['class']})})();

/* musik latar situs (/assets/latar-situs.mp3), tanpa jeda antar-halaman:
   halaman pertama menjadi "cangkang" yang memegang musik; perpindahan halaman berikutnya dimuat di bingkai (iframe) penuh layar,
   sehingga musik tidak terputus. Alamat & judul tab disinkronkan. Di flipbook (/baca/) musik situs berhenti, musik flipbook yang main. */
(function(){
var top0=null;try{if(window.top!==window&&window.top.__musSitus)top0=window.top}catch(e){}
if(top0){ /* di dalam bingkai: tautan ke situs lain dibuka di jendela utama */
  document.addEventListener('click',function(e){var l=e.target.closest&&e.target.closest('a[href]');if(!l||l.target)return;try{if(new URL(l.href,location.href).origin!==location.origin)l.target='_top'}catch(x){}},true);
  return}
if(window.__musSitus)return;window.__musSitus=1;
var K='situs:musik',P='situs:musik:t',on=true,baca=false;try{on=localStorage.getItem(K)!=='0'}catch(e){}
var a=new Audio('/assets/latar-situs.mp3?v=1');a.loop=true;a.preload='auto';a.volume=0;var VOL=.4,fd=null;
try{var t0=parseFloat(sessionStorage.getItem(P));if(t0>0)a.addEventListener('loadedmetadata',function(){try{a.currentTime=t0%(a.duration||1e9)}catch(e){}},{once:true})}catch(e){}
function fade(to,ms,done){clearInterval(fd);var s=a.volume,n=Math.max(1,Math.round(ms/40)),i=0;fd=setInterval(function(){i++;a.volume=Math.min(1,Math.max(0,s+(to-s)*i/n));if(i>=n){clearInterval(fd);done&&done()}},40)}
var b=document.createElement('button');b.type='button';b.className='mus-situs';b.textContent='♫';
function tampil(){b.classList.toggle('mati',!on);b.setAttribute('aria-label',on?'Matikan musik':'Nyalakan musik');b.title=b.getAttribute('aria-label')}tampil();
document.body.appendChild(b);
function main(){if(!on||baca||document.hidden)return Promise.resolve(false);var p=a.play();return(p&&p.then?p:Promise.resolve()).then(function(){fade(VOL,1200);return true},function(){return false})}
function henti(ms){fade(0,ms||400,function(){a.pause()})}
function simpan(){try{if(a.currentTime>0)sessionStorage.setItem(P,a.currentTime)}catch(e){}}
b.addEventListener('click',function(e){e.stopPropagation();on=!on;try{localStorage.setItem(K,on?'1':'0')}catch(x){}tampil();if(on)main();else henti()});
var ev=['pointerdown','touchend','keydown','click'],siap=false;
function g(){if(siap)return;main().then(function(ok){if(ok){siap=true;ev.forEach(function(k){document.removeEventListener(k,g,true);try{fr&&fr.contentDocument.removeEventListener(k,g,true)}catch(x){}})}})}
main().then(function(ok){if(ok)siap=true;else ev.forEach(function(k){document.addEventListener(k,g,true)})});
document.addEventListener('visibilitychange',function(){if(document.hidden){simpan();henti()}else main()});
window.addEventListener('pagehide',simpan);setInterval(simpan,3000);
/* bingkai */
var fr=null,akhir='';
function setBaca(v){if(v===baca)return;baca=v;b.style.display=v?'none':'';if(v)henti(250);else main()}
function sinkron(){if(!fr)return;try{var w=fr.contentWindow,h=w.location.href;if(!h||h==='about:blank')return;
  if(h!==akhir){akhir=h;history.replaceState(null,'',h)}if(document.title!==fr.contentDocument.title)document.title=fr.contentDocument.title;
  setBaca(w.location.pathname.indexOf('/baca/')===0)}catch(e){}}
function kait(){try{var d=fr.contentDocument;if(!siap)ev.forEach(function(k){d.addEventListener(k,g,true)})}catch(e){}}
function buka(url){
  if(fr){fr.contentWindow.location.href=url;return}
  fr=document.createElement('iframe');fr.className='bingkai-situs';fr.title='Pustaka Digital';fr.setAttribute('allow','autoplay; fullscreen');
  var tahap=0;
  fr.addEventListener('load',function(){
    if(tahap===0){tahap=1;fr.contentWindow.location.href=url;return} /* salinan halaman ini dulu, agar tombol Kembali bisa ke sini */
    if(tahap===1){tahap=2;document.documentElement.classList.add('berbingkai');try{fr.contentWindow.focus()}catch(e){}}
    kait();sinkron()});
  fr.src=location.href;document.body.appendChild(fr);setInterval(sinkron,700)}
function layak(u){if(u.origin!==location.origin)return false;if(u.pathname===location.pathname&&u.search===location.search&&u.hash)return false;
  return !/\.[a-z0-9]{2,5}$/i.test(u.pathname)||/\.html$/i.test(u.pathname)}
document.addEventListener('click',function(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  var l=e.target.closest&&e.target.closest('a[href]');if(!l||(l.target&&l.target!=='_self')||l.hasAttribute('download'))return;
  var u;try{u=new URL(l.href,location.href)}catch(x){return}if(!layak(u))return;e.preventDefault();buka(u.href)});
document.addEventListener('submit',function(e){var f=e.target;if(e.defaultPrevented||(f.method||'get').toLowerCase()!=='get'||(f.target&&f.target!=='_self'))return;
  var u;try{u=new URL(f.action||location.href,location.href)}catch(x){return}if(!layak(u))return;
  e.preventDefault();u.search=new URLSearchParams(new FormData(f)).toString();buka(u.href)});
})();
