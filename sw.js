// BBQ Checklist Service Worker
const CACHE_NAME = 'bbq-checklist-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json'
];

// Install event - cache the app shell
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for future features (like saving cook logs)
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Future: sync cook data, export schedules, etc.
  }
});

// Push notifications for future features (timing alerts)
self.addEventListener('push', function(event) {
  const title = 'BBQ Checklist';
  const options = {
    body: event.data ? event.data.text() : 'Time to check your brisket!',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
}); 