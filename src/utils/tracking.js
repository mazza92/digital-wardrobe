// Click tracking utilities for affiliate links
import React from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://digital-wardrobe-admin.vercel.app'

export const trackClick = async (productId, outfitId, productName, brand, affiliateLink) => {
  try {
    console.log('Attempting to track click:', { productId, outfitId, productName, brand })
    
    // Use GET request to avoid CORS preflight issues
    const params = new URLSearchParams({
      productId,
      outfitId,
      productName: productName || '',
      brand: brand || ''
    })
    
    const apiUrl = `${API_BASE_URL}/api/track-click?${params}`
    console.log('API URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to track click:', response.status, response.statusText, errorText)
      return false
    }

    const result = await response.json()
    console.log('Click tracked successfully:', result)
    return true
  } catch (error) {
    console.error('Error tracking click:', error)
    return false
  }
}

export const handleAffiliateClick = (product, outfitId, event) => {
  if (!product.link) return
  
  // For links that should be skipped (catalog/affiliate links), use direct window.open
  const shouldSkipShopMy = product.link && (
    product.link.includes('go.shopmy.us') || 
    product.link.includes('affilae.com') || 
    product.link.includes('feeds.affilae.com') || 
    product.link.includes('go.affilae.com')
  )
  
  if (shouldSkipShopMy) {
    // Direct affiliate links - open directly
    const newWindow = window.open(product.link, '_blank', 'noopener,noreferrer')
    
    // Track the click
    trackClick(
      product.id,
      outfitId,
      product.name,
      product.brand,
      product.link
    ).catch(error => {
      console.error('Error tracking click:', error)
    })
    
    // If popup was blocked, copy link to clipboard as fallback
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      console.log('Popup blocked - copying link to clipboard')
      try {
        navigator.clipboard.writeText(product.link).then(() => {
          console.log('Lien copié dans le presse-papiers')
        }).catch(() => {
          console.log('Impossible de copier le lien automatiquement')
        })
      } catch (error) {
        console.log('Clipboard not available')
      }
    }
    
    // Prevent default to avoid double navigation
    if (event) {
      event.preventDefault()
    }
  } else {
    // Manual links - let ShopMy script intercept and convert
    // Don't prevent default - let the link behavior happen naturally
    // ShopMy will intercept the click and convert the URL
    
    // Track the click asynchronously (non-blocking)
    trackClick(
      product.id,
      outfitId,
      product.name,
      product.brand,
      product.link
    ).then(success => {
      if (success) {
        console.log(`Click tracked for ${product.name} by ${product.brand}`)
      }
    }).catch(error => {
      console.error('Error tracking click:', error)
    })
    
    // Let the default link behavior happen (ShopMy will intercept)
    // Don't call event.preventDefault() - this allows ShopMy to work
  }
}

// Utility to create a tracked link component
export const createTrackedLink = (product, outfitId, children, className = '', ...props) => {
  const handleClick = (event) => {
    handleAffiliateClick(product, outfitId, event)
  }

  return React.createElement('a', {
    href: product.link,
    target: '_blank',
    rel: 'noopener noreferrer',
    className: className,
    onClick: handleClick,
    ...props
  }, children)
}
