// Custom hook for managing favorites state with signup incentive

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import * as api from '../utils/supabaseApi'
import { showToast } from '../components/ui/Toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://digital-wardrobe-admin.vercel.app/api'

// Number of favorites allowed before prompting signup (0 = prompt immediately)
const GUEST_FAVORITES_LIMIT = 0;

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

    if (response.ok) {
      console.log(`Favorites analytics tracked: ${action} for ${product.name}`)
    }
  } catch (error) {
    // Silently fail for analytics
  }
}

export const useFavorites = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [favorites, setFavorites] = useState(() => {
    try {
      const localFavorites = localStorage.getItem('digital-wardrobe-favorites')
      return localFavorites ? JSON.parse(localFavorites) : []
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error)
      return []
    }
  })

  // State for signup prompt
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);

  // Sync with server when user logs in
  useEffect(() => {
    const syncWithServer = async () => {
      if (isAuthenticated && user) {
        let localFavorites = [];
        try {
          localFavorites = JSON.parse(localStorage.getItem('digital-wardrobe-favorites') || '[]');
        } catch (e) {
          // localStorage blocked
        }
        
        try {
          const result = await api.syncFavorites(user.id, localFavorites);
          
          if (result && result.favorites) {
             setFavorites(result.favorites);
          }
        } catch (err) {
          // Silently fail - user can still use local favorites
        }
      }
    };
    
    syncWithServer();
  }, [isAuthenticated, user?.id]); 

  // Persist to local storage always (if available)
  useEffect(() => {
    try {
      localStorage.setItem('digital-wardrobe-favorites', JSON.stringify(favorites))
    } catch (e) {
      // localStorage blocked, favorites will only persist in memory
    }
  }, [favorites])

  const addToFavorites = useCallback(async (product) => {
    // Check if already favorited
    if (favorites.find(item => item.id === product.id)) {
      return { success: true, alreadyFavorited: true };
    }

    // If not authenticated and at limit, show signup prompt
    if (!isAuthenticated && favorites.length >= GUEST_FAVORITES_LIMIT) {
      setPendingProduct(product);
      setShowSignupPrompt(true);
      return { success: false, requiresSignup: true };
    }

    // Add to favorites
    const newItem = { 
      ...product, 
      favoritedAt: new Date().toISOString() 
    };

    setFavorites(prev => [...prev, newItem]);
    trackFavoritesAnalytics(product, 'add');

    // Show toast for authenticated users
    if (isAuthenticated) {
      showToast('Added to favorites!', 'success', 2000);
    }

    // Sync to server if authenticated
    if (isAuthenticated && user) {
      try {
        await api.addFavorite(user.id, newItem);
      } catch (err) {
        // Keep local, will sync later
      }
    }

    return { success: true };
  }, [favorites, isAuthenticated, user]);

  const addToFavoritesAsGuest = useCallback(async () => {
    // Force add even if at limit (user chose to continue as guest)
    if (pendingProduct) {
      const newItem = { 
        ...pendingProduct, 
        favoritedAt: new Date().toISOString() 
      };

      setFavorites(prev => {
        if (prev.find(item => item.id === pendingProduct.id)) return prev;
        return [...prev, newItem];
      });
      
      trackFavoritesAnalytics(pendingProduct, 'add');
      setPendingProduct(null);
      setShowSignupPrompt(false);
    }
  }, [pendingProduct]);

  const removeFromFavorites = useCallback(async (productId) => {
    const itemToRemove = favorites.find(item => item.id === productId);
    
    setFavorites(prev => prev.filter(item => item.id !== productId));
    
    if (itemToRemove) {
      trackFavoritesAnalytics(itemToRemove, 'remove');
    }

    if (isAuthenticated && user) {
      try {
         await api.removeFavorite(user.id, productId);
      } catch (err) {
        // Silently fail
      }
    }
  }, [favorites, isAuthenticated, user]);

  const toggleFavorite = useCallback((product) => {
    const isFav = favorites.some(item => item.id === product.id)
    if (isFav) {
      removeFromFavorites(product.id)
      return { action: 'removed' };
    } else {
      return addToFavorites(product)
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  const isFavorited = useCallback((productId) => {
    return favorites.some(item => item.id === productId)
  }, [favorites]);

  const getFavoritesCount = useCallback(() => {
    return favorites.length
  }, [favorites]);

  const clearFavorites = useCallback(async () => {
    setFavorites([])
    if (isAuthenticated && user) {
      try {
        await api.clearFavorites(user.id);
      } catch (err) {
        // Silently fail
      }
    }
  }, [isAuthenticated, user]);

  const closeSignupPrompt = useCallback(() => {
    setShowSignupPrompt(false);
    setPendingProduct(null);
  }, []);

  // Calculate remaining free favorites for guests
  const remainingGuestFavorites = isAuthenticated 
    ? Infinity 
    : Math.max(0, GUEST_FAVORITES_LIMIT - favorites.length);

  return {
    favorites,
    addToFavorites,
    addToFavoritesAsGuest,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    getFavoritesCount,
    clearFavorites,
    // Signup prompt state
    showSignupPrompt,
    closeSignupPrompt,
    pendingProduct,
    remainingGuestFavorites,
    isAuthenticated
  }
}
