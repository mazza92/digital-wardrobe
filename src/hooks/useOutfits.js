// Custom hook for managing outfits data

import { useState, useEffect, useCallback } from 'react'
import { fetchOutfits, fetchProfile } from '../utils/api'
import { memoizeApiCall, storageManager } from '../utils/performance'

// Create memoized API calls with 5-minute cache
const memoizedFetchOutfits = memoizeApiCall(fetchOutfits, 5 * 60 * 1000)
const memoizedFetchProfile = memoizeApiCall(fetchProfile, 10 * 60 * 1000) // Profile changes less frequently

export const useOutfits = () => {
  const [outfits, setOutfits] = useState([])
  const [influencer, setInfluencer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Helper function to safely store data in localStorage with size limits
  const safeSetItem = (key, data, maxSize = 1024 * 1024) => { // 1MB default limit
    try {
      const jsonData = JSON.stringify(data)
      if (jsonData.length > maxSize) {
        console.warn(`Data for ${key} exceeds size limit, not caching`)
        return false
      }
      localStorage.setItem(key, jsonData)
      return true
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old cache')
        // Clear old cache and try again
        try {
          localStorage.removeItem('cachedOutfits')
          localStorage.removeItem('cachedProfile')
          localStorage.removeItem('cacheTimestamp')
          // Try with smaller data
          const compressedData = {
            outfits: data.outfits?.map(outfit => ({
              id: outfit.id,
              title: outfit.title,
              image: outfit.image,
              category: outfit.category,
              createdAt: outfit.createdAt,
              products: outfit.products?.map(product => ({
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                x: product.x,
                y: product.y
              })) || []
            })) || []
          }
          localStorage.setItem(key, JSON.stringify(compressedData))
          return true
        } catch (retryError) {
          console.error('Failed to cache data even after cleanup:', retryError)
          return false
        }
      }
      console.error('Failed to cache data:', error)
      return false
    }
  }

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Clean up storage if needed before loading
      storageManager.cleanupIfNeeded()
      
      // Check if we have cached data first
      const cachedOutfits = localStorage.getItem('cachedOutfits')
      const cachedProfile = localStorage.getItem('cachedProfile')
      const cacheTimestamp = localStorage.getItem('cacheTimestamp')
      const now = Date.now()
      const cacheExpiry = 5 * 60 * 1000 // 5 minutes
      
      // If we have recent cached data, use it immediately
      if (cachedOutfits && cachedProfile && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
        try {
          setOutfits(JSON.parse(cachedOutfits))
          setInfluencer(JSON.parse(cachedProfile))
          setIsLoading(false)
        } catch (parseError) {
          console.warn('Failed to parse cached data, fetching fresh data')
        }
      }
      
      // Fetch fresh data in parallel (this will use memoized calls)
      const [outfitsData, profileData] = await Promise.all([
        memoizedFetchOutfits(),
        memoizedFetchProfile()
      ])
      
      setOutfits(outfitsData.outfits)
      setInfluencer(profileData)
      
      // Cache the fresh data with size limits
      safeSetItem('cachedOutfits', outfitsData.outfits, 512 * 1024) // 512KB limit for outfits
      safeSetItem('cachedProfile', profileData, 50 * 1024) // 50KB limit for profile
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
