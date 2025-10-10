// Custom hook for managing favorites state

import { useState, useEffect } from 'react'

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
        return [...prevFavorites, { 
          ...product, 
          favoritedAt: new Date().toISOString() 
        }]
      }
      return prevFavorites
    })
  }

  const removeFromFavorites = (productId) => {
    setFavorites(prevFavorites => prevFavorites.filter(item => item.id !== productId))
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
