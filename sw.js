const CACHE_NAME = 'melder-cache-v14';

const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/login.html',
  '/manifest.json',
  '/auth-guard.js',
  '/webauthn-json.js' // Local file
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim();
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