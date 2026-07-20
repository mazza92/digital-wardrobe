// Custom hook for managing outfits data
// Single shared store — multiple components share one network load

import { useState, useEffect, useCallback } from 'react'
import { fetchOutfits } from '../utils/api'

const STORAGE_KEY_OUTFITS = 'dw_cache_v4_outfits'
const STORAGE_KEY_PROFILE = 'dw_cache_v4_profile'
const VISIBILITY_REFRESH_MIN_MS = 60 * 1000

const getInitialFromStorage = () => {
  try {
    const profileStr = sessionStorage.getItem(STORAGE_KEY_PROFILE)
    const outfitsStr = sessionStorage.getItem(STORAGE_KEY_OUTFITS)
    if (profileStr && outfitsStr) {
      const profile = JSON.parse(profileStr)
      const outfits = JSON.parse(outfitsStr)
      const isFresh = Date.now() - profile.timestamp < 5 * 60 * 1000
      if (isFresh && profile.data && outfits.data) {
        return {
          outfits: outfits.data.outfits || [],
          influencer: mergeInfluencer(outfits.data, profile.data)
        }
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null
}

/** Build influencer object from export payload (includes socialMedia + CMS fields). */
function mergeInfluencer(outfitsPayload, profileFallback = null) {
  if (outfitsPayload?.influencer) {
    return {
      ...outfitsPayload.influencer,
      socialMedia:
        outfitsPayload.socialMedia ||
        outfitsPayload.influencer.socialMedia ||
        {}
    }
  }
  return profileFallback
}

// Module-level shared state
let cachedData = getInitialFromStorage()
let listeners = new Set()
let inFlight = null
let lastNetworkAt = 0

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

function setShared(next) {
  cachedData = next
  notify()
}

async function loadShared(forceRefresh = false) {
  // Coalesce concurrent loads
  if (inFlight) return inFlight

  inFlight = (async () => {
    try {
      const outfitsData = await fetchOutfits(forceRefresh)
      lastNetworkAt = Date.now()

      const newOutfits = outfitsData?.outfits || []
      const influencer = mergeInfluencer(outfitsData, cachedData?.influencer || null)

      setShared({
        outfits: newOutfits,
        influencer
      })

      return cachedData
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}

export const useOutfits = () => {
  const [, bump] = useState(0)
  const [isLoading, setIsLoading] = useState(!cachedData)
  const [error, setError] = useState(null)

  useEffect(() => {
    const listener = () => bump((n) => n + 1)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const runLoad = useCallback(async (forceRefresh = false, silent = false) => {
    try {
      if (!silent && (!cachedData || forceRefresh)) {
        setIsLoading(true)
      }
      setError(null)
      await loadShared(forceRefresh)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load data:', err)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // One load on mount — no immediate forceRefresh (that caused double /outfits/export)
    if (cachedData) {
      runLoad(false, true)
    } else {
      runLoad(false, false)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastNetworkAt < VISIBILITY_REFRESH_MIN_MS) return
      runLoad(true, true)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [runLoad])

  return {
    outfits: cachedData?.outfits || [],
    influencer: cachedData?.influencer || null,
    isLoading,
    error,
    refetch: () => runLoad(true)
  }
}

// Pre-fetch data utility - can be called on hover/anticipation
export const prefetchOutfits = () => {
  if (!cachedData && !inFlight) {
    loadShared(false).catch(() => {})
  }
}
