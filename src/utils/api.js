// API utility functions for the Digital Wardrobe frontend
// With caching for better performance

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://digital-wardrobe-admin.vercel.app/api'

// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes - increased for better performance
const STALE_WHILE_REVALIDATE = 60 * 60 * 1000 // 1 hour - serve stale while revalidating
const cache = new Map()

// In-flight request deduplication
const pendingRequests = new Map()

const getCachedData = (key) => {
  const cached = cache.get(key)
  if (!cached) return { data: null, isStale: false }
  
  const age = Date.now() - cached.timestamp
  if (age < CACHE_DURATION) {
    return { data: cached.data, isStale: false }
  }
  if (age < STALE_WHILE_REVALIDATE) {
    return { data: cached.data, isStale: true }
  }
  return { data: null, isStale: false }
}

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() })
}

export const fetchOutfits = async (forceRefresh = false) => {
  const cacheKey = 'outfits'
  
  // Return cached data if available and not forcing refresh
  if (!forceRefresh) {
    const { data: cachedData, isStale } = getCachedData(cacheKey)
    if (cachedData && !isStale) {
      return cachedData
    }
    // Return stale data immediately, revalidate in background
    if (cachedData && isStale) {
      // Revalidate in background (don't await)
      fetchOutfitsFromNetwork(cacheKey).catch(() => {})
      return cachedData
    }
  }
  
  return fetchOutfitsFromNetwork(cacheKey)
}

// Separate network fetch with request deduplication
const fetchOutfitsFromNetwork = async (cacheKey) => {
  // Deduplicate in-flight requests
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)
  }
  
  const fetchPromise = (async () => {
    try {
      const url = `${API_BASE_URL}/outfits/export`
    
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        }
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

export const fetchProfile = async (forceRefresh = false) => {
  const cacheKey = 'profile'
  
  // Return cached data if available and not forcing refresh
  if (!forceRefresh) {
    const { data: cachedData, isStale } = getCachedData(cacheKey)
    if (cachedData && !isStale) {
      return cachedData
    }
    // Return stale data immediately, revalidate in background
    if (cachedData && isStale) {
      fetchProfileFromNetwork(cacheKey).catch(() => {})
      return cachedData
    }
  }
  
  return fetchProfileFromNetwork(cacheKey)
}

// Separate network fetch with request deduplication
const fetchProfileFromNetwork = async (cacheKey) => {
  // Deduplicate in-flight requests
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)
  }
  
  const fetchPromise = (async () => {
    try {
      const url = `${API_BASE_URL}/profile`
    
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        }
    })
    
    if (response.ok) {
      const data = await response.json()
        setCachedData(cacheKey, data)
      return data
    } else {
      throw new Error(`Profile API not available: ${response.status}`)
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

// Clear cache (useful for forced refresh)
export const clearCache = () => {
  cache.clear()
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
