const CACHE_NAME = 'melder-cache-v15';

const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/login.html',
  '/manifest.json',
  '/auth-guard.js',
  '/webauthn-json.js' 
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force active immediately
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
});

self.addEventListener('activate', (event) => {
  // Claim clients so the very first load is intercepted
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res.status === 200) {
          const cln = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, cln));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});