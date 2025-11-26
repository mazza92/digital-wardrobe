// Custom hook for managing outfits data
// Optimized with caching and SWR-like behavior

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchOutfits, fetchProfile } from '../utils/api'

// Module-level cache for instant subsequent renders
let cachedData = null

export const useOutfits = () => {
  // Initialize with cached data for instant render
  const [outfits, setOutfits] = useState(cachedData?.outfits || [])
  const [influencer, setInfluencer] = useState(cachedData?.influencer || null)
  const [isLoading, setIsLoading] = useState(!cachedData)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      // Only show loading if no cached data
      if (!cachedData || forceRefresh) {
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
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    
    // If we have cached data, show it immediately and refresh in background
    if (cachedData) {
      // Optional: refresh in background (stale-while-revalidate)
      loadData(false)
    } else {
      loadData()
    }
    
    return () => {
      isMounted.current = false
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
