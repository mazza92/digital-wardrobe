// Custom hook for managing outfits data
// Optimized with caching and SWR-like behavior

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchOutfits, fetchProfile } from '../utils/api'

// Try to get initial data from sessionStorage for instant first paint
const getInitialFromStorage = () => {
  try {
    const profileStr = sessionStorage.getItem('dw_cache_v3_profile')
    const outfitsStr = sessionStorage.getItem('dw_cache_v3_outfits')
    if (profileStr && outfitsStr) {
      const profile = JSON.parse(profileStr)
      const outfits = JSON.parse(outfitsStr)
      // Check if data is fresh (within 5 minutes - reduced for faster updates)
      const isFresh = Date.now() - profile.timestamp < 5 * 60 * 1000
      if (isFresh && profile.data && outfits.data) {
        return {
          outfits: outfits.data.outfits || [],
          influencer: profile.data
        }
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null
}

// Module-level cache for instant subsequent renders (initialized from storage)
let cachedData = getInitialFromStorage()

export const useOutfits = () => {
  // Initialize with cached data for instant render
  const [outfits, setOutfits] = useState(cachedData?.outfits || [])
  const [influencer, setInfluencer] = useState(cachedData?.influencer || null)
  const [isLoading, setIsLoading] = useState(!cachedData)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)

  const loadData = useCallback(async (forceRefresh = false, silent = false) => {
    try {
      // Keep cached UI visible while we revalidate in background.
      if (!silent && (!cachedData || forceRefresh)) {
        setIsLoading(true)
      }
      setError(null)
      
      // Fetch data in parallel
      const [outfitsData, profileData] = await Promise.all([
        fetchOutfits(forceRefresh),
        fetchProfile(forceRefresh)
      ])
      
      if (isMounted.current) {
        const newOutfits = outfitsData.outfits || []
        setOutfits(newOutfits)
        setInfluencer(profileData)
        
        // Update cache
        cachedData = {
          outfits: newOutfits,
          influencer: profileData
        }
      }
      
    } catch (err) {
      if (isMounted.current) {
        setError(err.message)
        console.error('Failed to load data:', err)
      }
    } finally {
      if (isMounted.current && !silent) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMounted.current = true

    // Refetch when user returns to the tab (e.g. after editing profile in back office)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData(true, true)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    let idleId = null
    let refreshTimer = null
    if (cachedData) {
      // 1) Instant cached paint
      loadData(false, true)
      // 2) Force refresh in background so newly published outfits appear quickly
      if ('requestIdleCallback' in window) {
        idleId = requestIdleCallback(() => loadData(true, true), { timeout: 1500 })
      } else {
        refreshTimer = setTimeout(() => loadData(true, true), 150)
      }
    } else {
      loadData()
    }

    return () => {
      isMounted.current = false
      if (idleId !== null) cancelIdleCallback(idleId)
      if (refreshTimer !== null) clearTimeout(refreshTimer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [loadData])

  return {
    outfits,
    influencer,
    isLoading,
    error,
    refetch: () => loadData(true)
  }
}

// Pre-fetch data utility - can be called on hover/anticipation
export const prefetchOutfits = () => {
  if (!cachedData) {
    Promise.all([fetchOutfits(), fetchProfile()]).catch(() => {})
  }
}
