/* Pustaka Digital Nurul Hikmah – service worker */
const V='pd-1', HAL='pd-hal-1', ASET='pd-aset-1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(['/offline','/assets/ikon-192.png'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>![V,HAL,ASET].includes(n)).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||r.headers.has('range')||u.pathname.startsWith('/flipbook/')||u.pathname.endsWith('.mp3'))return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(HAL).then(x=>x.put(r,c))}return res})
      .catch(()=>caches.match(r).then(m=>m||caches.match('/offline'))));
    return;
  }
  if(u.pathname.startsWith('/assets/')){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(ASET).then(x=>x.put(r,c))}return res})));
  }
});
