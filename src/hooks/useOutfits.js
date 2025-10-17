// Custom hook for managing outfits data

import { useState, useEffect, useCallback } from 'react'
import { fetchOutfits, fetchProfile } from '../utils/api'

export const useOutfits = () => {
  const [outfits, setOutfits] = useState([])
  const [influencer, setInfluencer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch fresh data in parallel
      const [outfitsData, profileData] = await Promise.all([
        fetchOutfits(),
        fetchProfile()
      ])
      
      setOutfits(outfitsData.outfits)
      setInfluencer(profileData)
      
    } catch (err) {
      setError(err.message)
      console.error('Failed to load data:', err)
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
