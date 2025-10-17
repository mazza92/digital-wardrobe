// Minimal service worker - only for basic caching
// This is a fallback if the main service worker causes issues

const CACHE_NAME = 'virtual-dressing-minimal'

// Only cache the main page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(['/'])
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Very minimal fetch handling - only cache the main page
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Only handle GET requests
  if (request.method !== 'GET') {
    return
  }

  // Only cache the main page
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response
          }
          return fetch(request)
        })
    )
  }
})
