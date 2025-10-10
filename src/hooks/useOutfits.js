// Custom hook for managing outfits data

import { useState, useEffect } from 'react'
import { fetchOutfits } from '../utils/api'

export const useOutfits = () => {
  const [outfits, setOutfits] = useState([])
  const [influencer, setInfluencer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchOutfits()
      setOutfits(data.outfits)
      setInfluencer(data.influencer)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load outfits:', err)
      // Don't set any data on error - let the error state handle it
    } finally {
      setIsLoading(false)
    }
  }

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
