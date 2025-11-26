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
  // Open the link immediately to avoid popup blockers
  if (product.link) {
    // Try to open in new tab
    const newWindow = window.open(product.link, '_blank', 'noopener,noreferrer')
    
    // Track the click after opening (non-blocking)
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
    
    // If popup was blocked, copy link to clipboard as fallback
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      console.log('Popup blocked - copying link to clipboard')
      try {
        navigator.clipboard.writeText(product.link).then(() => {
          // Show a subtle notification (you could replace this with a toast)
          console.log('Lien copié dans le presse-papiers')
        }).catch(() => {
          console.log('Impossible de copier le lien automatiquement')
        })
      } catch (error) {
        console.log('Clipboard not available')
      }
    }
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
