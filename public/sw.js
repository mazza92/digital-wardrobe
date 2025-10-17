// Service Worker for caching static assets
const CACHE_NAME = 'virtual-dressing-v1'
const STATIC_CACHE = 'static-v1'
const API_CACHE = 'api-v1'

// Files to cache immediately (only essential files)
const STATIC_FILES = [
  '/',
  '/index.html'
]

// Skip caching for these patterns
const SKIP_CACHE_PATTERNS = [
  /chrome-extension:/,
  /moz-extension:/,
  /safari-extension:/,
  /data:/,
  /blob:/,
  /file:/
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
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

// Helper function to check if we should skip caching
function shouldSkipCache(url) {
  return SKIP_CACHE_PATTERNS.some(pattern => pattern.test(url))
}

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-http(s) requests and browser extensions
  if (!url.protocol.startsWith('http') || shouldSkipCache(url.href)) {
    return
  }

  // Skip requests that are not GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle API requests with cache-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              if (response) {
                // Return cached response and update in background
                fetch(request)
                  .then((networkResponse) => {
                    if (networkResponse.ok) {
                      cache.put(request, networkResponse.clone())
                    }
                  })
                  .catch(() => {}) // Ignore network errors
                return response
              }
              
              // No cache, fetch from network
              return fetch(request)
                .then((networkResponse) => {
                  if (networkResponse.ok) {
                    cache.put(request, networkResponse.clone())
                  }
                  return networkResponse
                })
                .catch(() => {
                  // If network fails, return a basic error response
                  return new Response('Network error', { status: 503 })
                })
            })
        })
        .catch(() => {
          // If cache fails, try network directly
          return fetch(request).catch(() => {
            return new Response('Service unavailable', { status: 503 })
          })
        })
    )
    return
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response
        }
        
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone()
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone)
                })
                .catch(() => {}) // Ignore cache errors
            }
            return networkResponse
          })
          .catch(() => {
            // If network fails, return a basic error response
            return new Response('Resource not found', { status: 404 })
          })
      })
      .catch(() => {
        // If cache fails, try network directly
        return fetch(request).catch(() => {
          return new Response('Service unavailable', { status: 503 })
        })
      })
  )
})
