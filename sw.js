const CACHE_NAME = 'hab-v3'; // Increased version
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/admin.html',
  '/manifest.json',
  '/auth-guard.js',
  '/webauthn-json.js',
  '/sw.js'
];

// 1. Install: Cache the UI layout
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 2. Activate: Clean up old versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

// 3. Fetch: Network First, then Cache
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If network works, save a copy of the data to the cache
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If network fails (OFFLINE), look for it in the cache
        return caches.match(event.request);
      })
  );
});