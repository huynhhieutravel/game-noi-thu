// Foxy Pair - Offline Service Worker (Cache-First Offline Engine)
const CACHE_NAME = 'foxy-pair-offline-v1';

// On install, activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// On activate, clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler: Stale-While-Revalidate / Cache-First with fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Ignore non-http requests (e.g. chrome-extension://)
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next time if online
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
          })
          .catch(() => {
            // Offline: silent ignore, already returned cachedResponse
          });

        return cachedResponse;
      }

      // If not in cache, fetch from network and cache it
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return networkResponse;
        })
        .catch(() => {
          // If network failed and request is a navigation (HTML page), return cached root or index
          if (request.mode === 'navigate') {
            return caches.match('./') || caches.match('./index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable Offline' });
        });
    })
  );
});
