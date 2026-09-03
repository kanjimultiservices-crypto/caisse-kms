/* Service worker minimal : permet l'installation de l'app (PWA)
   et garde une copie de la page pour qu'elle s'ouvre même sans réseau.
   NB : sans réseau, la synchronisation cloud ne fonctionnera pas —
   seul l'affichage de l'app reste possible. */
const CACHE = 'caisse-kms-v1';
const FICHIERS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './favicon.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(noms=>Promise.all(noms.filter(n=>n!==CACHE).map(n=>caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  // on ne touche jamais aux appels vers Supabase : ils doivent toujours passer par le réseau
  if(e.request.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(e.request).then(r=>{
      const copie=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copie));
      return r;
    }).catch(()=>caches.match(e.request))
  );
});
