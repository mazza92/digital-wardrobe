// Custom hook for managing favorites state

import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://digital-wardrobe-admin.vercel.app/api'

const trackFavoritesAnalytics = async (product, action) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: product.id,
        outfitId: product.outfitId || 'unknown',
        productName: product.name,
        brand: product.brand,
        action: action // 'add' or 'remove'
      })
    })

    if (response.ok) {
      console.log(`Favorites analytics tracked: ${action} for ${product.name}`)
    } else {
      console.error('Failed to track favorites analytics:', response.status)
    }
  } catch (error) {
    console.error('Error tracking favorites analytics:', error)
  }
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const localFavorites = localStorage.getItem('digital-wardrobe-favorites')
      return localFavorites ? JSON.parse(localFavorites) : []
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error)
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('digital-wardrobe-favorites', JSON.stringify(favorites))
  }, [favorites])

  const addToFavorites = (product) => {
    setFavorites(prevFavorites => {
      const existingItem = prevFavorites.find(item => item.id === product.id)
      if (!existingItem) {
        // Track analytics
        trackFavoritesAnalytics(product, 'add')
        
        return [...prevFavorites, { 
          ...product, 
          favoritedAt: new Date().toISOString() 
        }]
      }
      return prevFavorites
    })
  }

  const removeFromFavorites = (productId) => {
    setFavorites(prevFavorites => {
      const itemToRemove = prevFavorites.find(item => item.id === productId)
      if (itemToRemove) {
        // Track analytics
        trackFavoritesAnalytics(itemToRemove, 'remove')
      }
      return prevFavorites.filter(item => item.id !== productId)
    })
  }

  const toggleFavorite = (product) => {
    const isFavorited = favorites.some(item => item.id === product.id)
    if (isFavorited) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
  }

  const isFavorited = (productId) => {
    return favorites.some(item => item.id === productId)
  }

  const getFavoritesCount = () => {
    return favorites.length
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    getFavoritesCount,
    clearFavorites
  }
}
