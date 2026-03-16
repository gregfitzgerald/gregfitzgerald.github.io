const CACHE_NAME = 'tara-test-v23';
const PRECACHE_URLS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './js/time.js',
  './js/state.js',
  './js/blocks.js',
  './js/cascade.js',
  './js/render.js',
  './js/tasks.js',
  './js/modals.js',
  './js/sync.js',
  './js/drag.js',
  './manifest.json',
];

// Install: precache static assets, then immediately take over
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches and claim all clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for app files (always fresh when online),
// cache-first for fonts (stable, saves bandwidth)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip caching for Firebase API calls
  if (url.hostname.includes('firebaseio.com')) {
    return;
  }

  // Cache-first for Google Fonts (they never change)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Network-first for same-origin app files:
  // Try network, update cache, fall back to cache when offline
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }
});
