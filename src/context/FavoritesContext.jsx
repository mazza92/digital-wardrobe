import { createContext, useContext, useState, useEffect, useCallback, startTransition, useRef } from 'react'
import { useAuth } from './AuthContext'
import {
  lazySyncFavorites,
  lazyAddFavorite,
  lazyRemoveFavorite,
  lazyClearFavorites
} from '../utils/supabaseLazy'
import { showFavoriteToast } from '../components/ui/FavoriteToast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.emmanuellek.com/api'

// Number of favorites allowed before prompting signup (0 = prompt immediately)
const GUEST_FAVORITES_LIMIT = 0

const FavoritesContext = createContext(null)

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
        action: action
      })
    })

    // Analytics tracked successfully
    if (!response.ok) {
      // Silently fail for analytics
    }
  } catch (error) {
    // Silently fail for analytics
  }
}

export function FavoritesProvider({ children }) {
  const { user, isAuthenticated } = useAuth()

  const [favorites, setFavorites] = useState(() => {
    try {
      const localFavorites = localStorage.getItem('digital-wardrobe-favorites')
      return localFavorites ? JSON.parse(localFavorites) : []
    } catch (error) {
      return []
    }
  })

  // State for signup prompt
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const [pendingProduct, setPendingProduct] = useState(null)
  const [signupRedirectPath, setSignupRedirectPath] = useState(null)

  const getRedirectPathForFavoriteIntent = useCallback((product) => {
    // Prefer explicit outfit linkage when available
    if (product?.outfitId) return `/outfits/${product.outfitId}`

    // Fallback to current page if user is already on an outfit page
    try {
      const p = window.location?.pathname || ''
      const q = window.location?.search || ''
      const h = window.location?.hash || ''
      if (p.startsWith('/outfits/')) return `${p}${q}${h}`
    } catch {
      // ignore browser env edge cases
    }
    return null
  }, [])

  // Sync with server when user logs in
  useEffect(() => {
    const syncWithServer = async () => {
      if (isAuthenticated && user) {
        let localFavorites = []
        try {
          localFavorites = JSON.parse(localStorage.getItem('digital-wardrobe-favorites') || '[]')
        } catch (e) {
          // localStorage blocked
        }

        try {
          const result = await lazySyncFavorites(user.id, localFavorites)

          if (result && result.favorites) {
            setFavorites(result.favorites)
          }
        } catch (err) {
          // Silently fail - user can still use local favorites
        }
      }
    }

    syncWithServer()
  }, [isAuthenticated, user?.id])

  // Persist to localStorage with a debounce
  const lsDebounceRef = useRef(null)
  useEffect(() => {
    if (lsDebounceRef.current) clearTimeout(lsDebounceRef.current)
    lsDebounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem('digital-wardrobe-favorites', JSON.stringify(favorites))
      } catch (e) {
        // localStorage blocked, favorites will only persist in memory
      }
    }, 300)
    return () => clearTimeout(lsDebounceRef.current)
  }, [favorites])

  const addToFavorites = useCallback(async (product) => {
    // Check if already favorited
    if (favorites.find(item => item.id === product.id)) {
      return { success: true, alreadyFavorited: true }
    }

    // If not authenticated and at limit, show signup prompt
    if (!isAuthenticated && favorites.length >= GUEST_FAVORITES_LIMIT) {
      setPendingProduct(product)
      setSignupRedirectPath(getRedirectPathForFavoriteIntent(product))
      setShowSignupPrompt(true)
      return { success: false, requiresSignup: true }
    }

    // Add to favorites
    const newItem = {
      ...product,
      favoritedAt: new Date().toISOString()
    }

    startTransition(() => {
      setFavorites(prev => [...prev, newItem])
    })
    trackFavoritesAnalytics(product, 'add')

    // Show toast feedback
    showFavoriteToast(newItem)

    // Sync to server if authenticated
    if (isAuthenticated && user) {
      try {
        await lazyAddFavorite(user.id, newItem)
      } catch (err) {
        // Keep local, will sync later
      }
    }

    return { success: true }
  }, [favorites, isAuthenticated, user, getRedirectPathForFavoriteIntent])

  const addToFavoritesAsGuest = useCallback(async () => {
    // Force add even if at limit (user chose to continue as guest)
    if (pendingProduct) {
      const newItem = {
        ...pendingProduct,
        favoritedAt: new Date().toISOString()
      }

      startTransition(() => {
        setFavorites(prev => {
          if (prev.find(item => item.id === pendingProduct.id)) return prev
          return [...prev, newItem]
        })
      })

      trackFavoritesAnalytics(pendingProduct, 'add')
      showFavoriteToast(newItem)
      setPendingProduct(null)
      setShowSignupPrompt(false)
      setSignupRedirectPath(null)
    }
  }, [pendingProduct])

  const removeFromFavorites = useCallback(async (productId) => {
    const itemToRemove = favorites.find(item => item.id === productId)

    startTransition(() => {
      setFavorites(prev => prev.filter(item => item.id !== productId))
    })

    if (itemToRemove) {
      trackFavoritesAnalytics(itemToRemove, 'remove')
    }

    if (isAuthenticated && user) {
      try {
        await lazyRemoveFavorite(user.id, productId)
      } catch (err) {
        // Silently fail
      }
    }
  }, [favorites, isAuthenticated, user])

  const toggleFavorite = useCallback((product) => {
    const isFav = favorites.some(item => item.id === product.id)
    if (isFav) {
      removeFromFavorites(product.id)
      return { action: 'removed' }
    } else {
      return addToFavorites(product)
    }
  }, [favorites, addToFavorites, removeFromFavorites])

  // Add multiple products to favorites at once (for saving entire outfit)
  const addMultipleToFavorites = useCallback(async (products) => {
    // Filter out products that are already favorited
    const newProducts = products.filter(product =>
      !favorites.some(item => item.id === product.id)
    )

    if (newProducts.length === 0) {
      return { success: true, added: 0 }
    }

    // If not authenticated and adding would exceed limit, show signup prompt
    if (!isAuthenticated && favorites.length + newProducts.length > GUEST_FAVORITES_LIMIT) {
      // Store first product as pending for signup flow
      setPendingProduct(newProducts[0])
      setSignupRedirectPath(getRedirectPathForFavoriteIntent(newProducts[0]))
      setShowSignupPrompt(true)
      return { success: false, requiresSignup: true }
    }

    // Add all products with timestamp
    const newItems = newProducts.map(product => ({
      ...product,
      favoritedAt: new Date().toISOString()
    }))

    startTransition(() => {
      setFavorites(prev => [...prev, ...newItems])
    })

    // Track analytics for each item
    newItems.forEach(item => {
      trackFavoritesAnalytics(item, 'add')
    })

    // Show toast for the first item (to give visual feedback)
    if (newItems.length > 0) {
      showFavoriteToast(newItems[0], newItems.length)
    }

    // Sync to server if authenticated
    if (isAuthenticated && user) {
      try {
        for (const item of newItems) {
          await lazyAddFavorite(user.id, item)
        }
      } catch (err) {
        // Keep local, will sync later
      }
    }

    return { success: true, added: newItems.length }
  }, [favorites, isAuthenticated, user, getRedirectPathForFavoriteIntent])

  // Remove multiple products from favorites at once
  const removeMultipleFromFavorites = useCallback(async (productIds) => {
    const itemsToRemove = favorites.filter(item => productIds.includes(item.id))

    startTransition(() => {
      setFavorites(prev => prev.filter(item => !productIds.includes(item.id)))
    })

    // Track analytics
    itemsToRemove.forEach(item => {
      trackFavoritesAnalytics(item, 'remove')
    })

    if (isAuthenticated && user) {
      try {
        for (const id of productIds) {
          await lazyRemoveFavorite(user.id, id)
        }
      } catch (err) {
        // Silently fail
      }
    }
  }, [favorites, isAuthenticated, user])

  const isFavorited = useCallback((productId) => {
    return favorites.some(item => item.id === productId)
  }, [favorites])

  const getFavoritesCount = useCallback(() => {
    return favorites.length
  }, [favorites])

  const clearFavorites = useCallback(async () => {
    startTransition(() => { setFavorites([]) })
    if (isAuthenticated && user) {
      try {
        await lazyClearFavorites(user.id)
      } catch (err) {
        // Silently fail
      }
    }
  }, [isAuthenticated, user])

  const closeSignupPrompt = useCallback(() => {
    setShowSignupPrompt(false)
    setPendingProduct(null)
    setSignupRedirectPath(null)
  }, [])

  // Calculate remaining free favorites for guests
  const remainingGuestFavorites = isAuthenticated
    ? Infinity
    : Math.max(0, GUEST_FAVORITES_LIMIT - favorites.length)

  const value = {
    favorites,
    addToFavorites,
    addToFavoritesAsGuest,
    addMultipleToFavorites,
    removeFromFavorites,
    removeMultipleFromFavorites,
    toggleFavorite,
    isFavorited,
    getFavoritesCount,
    clearFavorites,
    // Signup prompt state
    showSignupPrompt,
    closeSignupPrompt,
    pendingProduct,
    signupRedirectPath,
    remainingGuestFavorites,
    isAuthenticated
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
