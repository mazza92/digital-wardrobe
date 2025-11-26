// Service Worker for Digital Wardrobe
// Implements cache-first strategy for static assets and network-first for API calls

const CACHE_VERSION = 'v4.2.0'
const STATIC_CACHE = `static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`
const IMAGE_CACHE = `images-${CACHE_VERSION}`

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html'
]

// Cache duration for different types (in seconds)
const CACHE_DURATIONS = {
  api: 5 * 60, // 5 minutes for API
  images: 24 * 60 * 60, // 24 hours for images
  static: 7 * 24 * 60 * 60 // 7 days for static assets
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => !key.includes(CACHE_VERSION))
          .map(key => caches.delete(key))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return

  // Strategy based on request type
  if (isApiRequest(url)) {
    // Network-first for API calls
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
  } else if (isImageRequest(url, request)) {
    // Cache-first for images
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
  } else if (isStaticAsset(url)) {
    // Cache-first for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  }
})

// Helper functions
function isApiRequest(url) {
  return url.pathname.includes('/api/') || 
         url.hostname.includes('supabase.co')
}

function isImageRequest(url, request) {
  const acceptHeader = request.headers.get('Accept') || ''
  return acceptHeader.includes('image') ||
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)
}

function isStaticAsset(url) {
  // Only cache fonts, not JS/CSS (they have hash-based names for cache busting)
  return /\.(woff2?|ttf|eot)$/i.test(url.pathname)
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Return offline fallback if available
    return caches.match('/offline.html')
  }
}

// Network-first strategy with cache fallback
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) return cached
    throw error
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  })

  return cached || fetchPromise
}

