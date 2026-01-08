// Click tracking utilities for affiliate links
import React from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://digital-wardrobe-admin.vercel.app'
const SHOPMY_ID = '2FPSlX' // ShopMy Auto-Linking Script ID

// Convert manual link to ShopMy affiliate link
export const convertToShopMyLink = (url) => {
  if (!url) return url
  
  // Don't convert if already a ShopMy or Affilae link
  if (url.includes('go.shopmy.us') || 
      url.includes('affilae.com') || 
      url.includes('feeds.affilae.com') || 
      url.includes('go.affilae.com')) {
    return url
  }
  
  // Convert to ShopMy format: https://go.shopmy.us/apx/{ID}?url={encoded_url}
  const encodedUrl = encodeURIComponent(url)
  return `https://go.shopmy.us/apx/${SHOPMY_ID}?url=${encodedUrl}`
}

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
  
  // Check if this is an affiliate link (catalog product) or manual link
  const isAffiliateLink = product.link && (
    product.link.includes('go.shopmy.us') || 
    product.link.includes('affilae.com') || 
    product.link.includes('feeds.affilae.com') || 
    product.link.includes('go.affilae.com')
  )
  
  // For manual links, convert to ShopMy format manually (since ShopMy script doesn't detect React links)
  const finalLink = isAffiliateLink ? product.link : convertToShopMyLink(product.link)
  
  // Open the link
  const newWindow = window.open(finalLink, '_blank', 'noopener,noreferrer')
  
  // Track the click
  trackClick(
    product.id,
    outfitId,
    product.name,
    product.brand,
    product.link // Track original link, not converted one
  ).catch(error => {
    console.error('Error tracking click:', error)
  })
  
  // If popup was blocked, copy link to clipboard as fallback
  if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
    console.log('Popup blocked - copying link to clipboard')
    try {
      navigator.clipboard.writeText(finalLink).then(() => {
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
