// API utility functions for the Digital Wardrobe frontend
// With multi-level caching for better performance

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.emmanuellek.com/api'

// Cache configuration - Balance between performance and freshness
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes - reduced for faster updates
const STALE_WHILE_REVALIDATE = 15 * 60 * 1000 // 15 minutes - serve stale while revalidating
// Profile cache shorter so back-office changes appear sooner when refetch runs
const PROFILE_CACHE_DURATION = 1 * 60 * 1000 // 1 minute
const cache = new Map()

// In-flight request deduplication
const pendingRequests = new Map()

// Persistent storage helpers (sessionStorage for faster subsequent page loads)
const STORAGE_PREFIX = 'dw_cache_'
// Bump to drop stale sessionStorage after changing TTL or cache behaviour
const STORAGE_VERSION = 'v4'

const getStorageKey = (key) => `${STORAGE_PREFIX}${STORAGE_VERSION}_${key}`

const getFromStorage = (key) => {
  try {
    const stored = sessionStorage.getItem(getStorageKey(key))
    if (stored) {
      const parsed = JSON.parse(stored)
      // Keep short so admin edits (profile, outfits) show up without long-lived stale tabs
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        return parsed
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null
}

const setToStorage = (key, data) => {
  try {
    sessionStorage.setItem(getStorageKey(key), JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

// Initialize memory cache from storage on module load
const initCacheFromStorage = () => {
  for (const key of ['outfits', 'profile']) {
    const stored = getFromStorage(key)
    if (stored) {
      cache.set(key, stored)
    }
  }
}
initCacheFromStorage()

const getCachedData = (key, options = {}) => {
  const cached = cache.get(key)
  if (!cached) return { data: null, isStale: false }
  const ttl = options.profileTtl ? PROFILE_CACHE_DURATION : CACHE_DURATION
  const staleTtl = options.profileTtl ? PROFILE_CACHE_DURATION * 2 : STALE_WHILE_REVALIDATE
  const age = Date.now() - cached.timestamp
  if (age < ttl) {
    return { data: cached.data, isStale: false }
  }
  if (age < staleTtl) {
    return { data: cached.data, isStale: true }
  }
  return { data: null, isStale: false }
}

const setCachedData = (key, data) => {
  const entry = { data, timestamp: Date.now() }
  cache.set(key, entry)
  // Persist critical data to storage for faster subsequent page loads
  if (key === 'outfits' || key === 'profile') {
    setToStorage(key, data)
  }
}

// Generic fetch function with caching
const fetchWithCache = async (url, cacheKey, options = {}) => {
  if (!options.forceRefresh) {
    const { data: cachedData, isStale } = getCachedData(cacheKey, { profileTtl: cacheKey === 'profile' })
    if (cachedData && !isStale) {
      return cachedData
    }
    if (cachedData && isStale) {
      fetchFromNetwork(url, cacheKey, options).catch(() => {})
      return cachedData
    }
  }
  return fetchFromNetwork(url, cacheKey, options)
}

// Separate network fetch with request deduplication
const fetchFromNetwork = async (url, cacheKey, options = {}) => {
  // Deduplicate in-flight requests
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)
  }
  
  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        cache: options.forceRefresh ? 'no-store' : 'default',
        headers: {
          'Accept': 'application/json',
          ...options.headers
        },
        ...options.fetchOptions
      })
      
      if (response.ok) {
        const data = await response.json()
        setCachedData(cacheKey, data)
        return data
      } else {
        throw new Error(`API not available: ${response.status}`)
      }
    } catch (error) {
      // Return cached data even if expired on error
      const cached = cache.get(cacheKey)
      if (cached) {
        return cached.data
      }
      throw error
    } finally {
      pendingRequests.delete(cacheKey)
    }
  })()
  
  pendingRequests.set(cacheKey, fetchPromise)
  return fetchPromise
}

export const fetchOutfits = async (forceRefresh = false) => {
  // Use prefetched data from index.html if available (faster initial load)
  if (!forceRefresh && window.__PREFETCHED_OUTFITS__) {
    const prefetched = window.__PREFETCHED_OUTFITS__
    window.__PREFETCHED_OUTFITS__ = null // Clear after first use
    const data = await prefetched
    if (data) {
      setCachedData('outfits', data)
      // Seed profile cache from export so we don't need a second /profile round-trip
      if (data.influencer) {
        const profileFromExport = {
          ...data.influencer,
          socialMedia: data.socialMedia || data.influencer.socialMedia || {}
        }
        setCachedData('profile', profileFromExport)
      }
      return data
    }
  }
  const url = `${API_BASE_URL}/outfits/export`
  const data = await fetchWithCache(url, 'outfits', { forceRefresh })
  if (data?.influencer) {
    setCachedData('profile', {
      ...data.influencer,
      socialMedia: data.socialMedia || data.influencer.socialMedia || {}
    })
  }
  return data
}

export const fetchProfile = async (forceRefresh = false) => {
  // Use prefetched data from index.html if available (faster initial load)
  if (!forceRefresh && window.__PREFETCHED_PROFILE__) {
    const prefetched = window.__PREFETCHED_PROFILE__
    window.__PREFETCHED_PROFILE__ = null // Clear after first use
    const data = await prefetched
    if (data) {
      setCachedData('profile', data)
      return data
    }
  }
  const url = `${API_BASE_URL}/profile`
  return fetchWithCache(url, 'profile', { forceRefresh })
}

// New cached fetch functions for shop products and editorial
export const fetchShopProducts = async (forceRefresh = false) => {
  const url = `${API_BASE_URL}/shop/products/public`
  return fetchWithCache(url, 'shop-products', { forceRefresh })
}

export const fetchEditorialPosts = async (forceRefresh = false) => {
  const url = `${API_BASE_URL}/editorial/public`
  return fetchWithCache(url, 'editorial-posts', { forceRefresh })
}

// Clear cache (useful for forced refresh)
export const clearCache = () => {
  cache.clear()
}

// Clear specific cache entry
export const clearCacheEntry = (key) => {
  cache.delete(key)
}

import i18n from '../i18n/config'

export const getRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  const t = i18n.getFixedT(i18n.language || 'fr')
  
  if (diffInSeconds < 60) return t('time.justNow')
  
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return t('time.minutesAgo', { count: minutes })
  }
  
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return t('time.hoursAgo', { count: hours })
  }
  
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return t('time.daysAgo', { count: days })
  }
  
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return t('time.weeksAgo', { count: weeks })
  }
  
  const locale = i18n.language === 'en' ? 'en-US' : 'fr-FR'
  const formattedDate = date.toLocaleDateString(locale)
  return t('time.publishedOn', { date: formattedDate })
}
