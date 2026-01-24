// Troy Trees Service Worker - Offline Support
const CACHE_NAME = 'troy-trees-v1';

// Files to cache for offline use
const STATIC_ASSETS = [
  '/troy-trees/',
  '/troy-trees/index.html',
  '/troy-trees/manifest.json',
  '/style.css'
];

// All tree images to cache
const IMAGE_FOLDERS = [
  'Acer_saccharum', 'Acer_rubrum', 'Acer_platanoides', 'Acer_saccharinum',
  'Quercus_rubra', 'Quercus_alba', 'Quercus_palustris',
  'Pinus_strobus', 'Picea_abies', 'Picea_pungens', 'Picea_glauca',
  'Fagus_grandifolia', 'Betula_papyrifera', 'Betula_nigra',
  'Juglans_nigra', 'Carya_ovata', 'Prunus_serotina',
  'Tsuga_canadensis', 'Ulmus_americana', 'Fraxinus_americana',
  'Populus_deltoides', 'Liriodendron_tulipifera', 'Cornus_florida',
  'Gleditsia_triacanthos', 'Robinia_pseudoacacia', 'Sassafras_albidum',
  'Platanus_occidentalis', 'Ginkgo_biloba'
];

const IMAGE_TYPES = ['leaf.jpg', 'bark.jpg', 'tree.jpg', 'fruit.jpg'];

// Generate all image URLs
const IMAGE_ASSETS = IMAGE_FOLDERS.flatMap(folder =>
  IMAGE_TYPES.map(type => `/troy-trees/images/${folder}/${type}`)
);

const ALL_ASSETS = [...STATIC_ASSETS, ...IMAGE_ASSETS];

// Install - cache all assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching assets...');
        // Cache static assets first (critical)
        return cache.addAll(STATIC_ASSETS)
          .then(() => {
            // Cache images in background (non-blocking)
            IMAGE_ASSETS.forEach(url => {
              cache.add(url).catch(err => console.log('[SW] Failed to cache:', url));
            });
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests (fonts, etc)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone and cache the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));

            return response;
          })
          .catch(() => {
            // Network failed - return offline fallback for HTML
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/troy-trees/index.html');
            }
          });
      })
  );
});

// Handle messages from the app
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
