/// <reference lib="webworker" />

// Give TypeScript a proper ServiceWorker context
const swSelf = self as unknown as ServiceWorkerGlobalScope;

// Cache version
const CACHE_NAME = 'offline-cache-v1';
// Assets to cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  // add other static assets here
];

// ======================= INSTALL EVENT =======================
swSelf.addEventListener('install', (event) => {
  const e = event as ExtendableEvent;
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );

  // Activate the new service worker immediately
  swSelf.skipWaiting();
  console.log('Service Worker installed and caching assets');
});

// ======================= ACTIVATE EVENT =======================
swSelf.addEventListener('activate', (event) => {
  const e = event as ExtendableEvent;

  e.waitUntil(
    (async () => {
      // Take control of all clients immediately
      await swSelf.clients.claim();

      // Optionally delete old caches if you version your cache
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })()
  );

  console.log('Service Worker activated');
});

// ======================= FETCH EVENT =======================
swSelf.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    (async () => {
      // Try cache first
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      try {
        // Fetch from network
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        // Offline fallback
        if (event.request.destination === 'document') {
          const cache = await caches.open(CACHE_NAME);
          const fallback = await cache.match('/index.html');
          if (fallback) return fallback;
        }
        // For other assets, fail gracefully
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })()
  );
});

// ======================= MESSAGE EVENT (Optional) =======================
// Allows triggering skipWaiting via postMessage from client
swSelf.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    swSelf.skipWaiting();
    console.log('Service Worker skipWaiting triggered via message');
  }
});
