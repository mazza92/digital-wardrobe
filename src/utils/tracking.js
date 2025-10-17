// Click tracking utilities for affiliate links
import React from 'react'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://digital-wardrobe-admin.vercel.app'

export const trackClick = async (productId, outfitId, productName, brand, affiliateLink) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tracking/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        outfitId,
        productName,
        brand,
        affiliateLink
      })
    })

    if (!response.ok) {
      console.error('Failed to track click:', response.statusText)
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

export const handleAffiliateClick = async (product, outfitId, event) => {
  // Track the click before redirecting
  const trackingSuccess = await trackClick(
    product.id,
    outfitId,
    product.name,
    product.brand,
    product.link
  )

  if (trackingSuccess) {
    console.log(`Click tracked for ${product.name} by ${product.brand}`)
  }

  // The link will still open normally due to href attribute
  // This function is called on click but doesn't prevent the default behavior
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
