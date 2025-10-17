// Custom hook for managing outfits data

import { useState, useEffect, useCallback } from 'react'
import { fetchOutfits, fetchProfile } from '../utils/api'
import { memoizeApiCall } from '../utils/performance'

// Create memoized API calls with 5-minute cache
const memoizedFetchOutfits = memoizeApiCall(fetchOutfits, 5 * 60 * 1000)
const memoizedFetchProfile = memoizeApiCall(fetchProfile, 10 * 60 * 1000) // Profile changes less frequently

export const useOutfits = () => {
  const [outfits, setOutfits] = useState([])
  const [influencer, setInfluencer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Check if we have cached data first
      const cachedOutfits = localStorage.getItem('cachedOutfits')
      const cachedProfile = localStorage.getItem('cachedProfile')
      const cacheTimestamp = localStorage.getItem('cacheTimestamp')
      const now = Date.now()
      const cacheExpiry = 5 * 60 * 1000 // 5 minutes
      
      // If we have recent cached data, use it immediately
      if (cachedOutfits && cachedProfile && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
        setOutfits(JSON.parse(cachedOutfits))
        setInfluencer(JSON.parse(cachedProfile))
        setIsLoading(false)
      }
      
      // Fetch fresh data in parallel (this will use memoized calls)
      const [outfitsData, profileData] = await Promise.all([
        memoizedFetchOutfits(),
        memoizedFetchProfile()
      ])
      
      setOutfits(outfitsData.outfits)
      setInfluencer(profileData)
      
      // Cache the fresh data
      localStorage.setItem('cachedOutfits', JSON.stringify(outfitsData.outfits))
      localStorage.setItem('cachedProfile', JSON.stringify(profileData))
      localStorage.setItem('cacheTimestamp', now.toString())
      
    } catch (err) {
      setError(err.message)
      console.error('Failed to load data:', err)
      // Don't set any data on error - let the error state handle it
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  return {
    outfits,
    influencer,
    isLoading,
    error,
    refetch: loadData
  }
}
