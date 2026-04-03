import React from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://admin.emmanuellek.com'
const SHOPMY_ID = '2FPSlX'

function decodeUrl(url) {
  if (!url) return url
  return url
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

export const convertToShopMyLink = (url) => {
  if (!url) return url

  if (url.includes('go.shopmy.us') ||
      url.includes('affilae.com') ||
      url.includes('feeds.affilae.com') ||
      url.includes('go.affilae.com')) {
    return url
  }

  const encodedUrl = encodeURIComponent(url)
  return `https://go.shopmy.us/apx/${SHOPMY_ID}?url=${encodedUrl}`
}

export const trackClick = async (productId, outfitId, productName, brand, affiliateLink) => {
  try {
    const params = new URLSearchParams({
      productId,
      outfitId,
      productName: productName || '',
      brand: brand || ''
    })

    const apiUrl = `${API_BASE_URL}/api/track-click?${params}`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      return false
    }

    await response.json()
    return true
  } catch (error) {
    return false
  }
}

function isInAppBrowser() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return (
    ua.includes('Instagram') ||
    ua.includes('FBAN') ||
    ua.includes('FBAV') ||
    ua.includes('TikTok') ||
    ua.includes('BytedanceWebview') ||
    ua.includes('Line/') ||
    ua.includes('Snapchat')
  )
}

function isAffiliateRedirectLink(url) {
  if (!url) return false
  return (
    url.includes('go.shopmy.us') ||
    url.includes('affilae.com') ||
    url.includes('feeds.affilae.com') ||
    url.includes('go.affilae.com')
  )
}

export const handleAffiliateClick = (product, outfitId, event) => {
  if (!product.link) return false

  const decodedLink = decodeUrl(product.link)

  trackClick(
    product.id,
    outfitId,
    product.name,
    product.brand,
    decodedLink
  ).catch(() => {})

  if (isAffiliateRedirectLink(decodedLink)) {
    if (event) {
      if (event.preventDefault) event.preventDefault()
      if (event.stopPropagation) event.stopPropagation()
      if (event.stopImmediatePropagation) event.stopImmediatePropagation()
      if (event.nativeEvent) {
        if (event.nativeEvent.stopImmediatePropagation) {
          event.nativeEvent.stopImmediatePropagation()
        }
      }
    }

    if (isInAppBrowser()) {
      setTimeout(() => {
        window.location.href = decodedLink
      }, 100)
      return true
    }

    window.open(decodedLink, '_blank', 'noopener,noreferrer')
    return true
  }

  return false
}

export const createTrackedLink = (product, outfitId, children, className = '', ...props) => {
  const handleClick = (event) => {
    handleAffiliateClick(product, outfitId, event)
  }

  const decodedLink = decodeUrl(product.link)

  return React.createElement('a', {
    href: decodedLink,
    target: '_blank',
    rel: 'noopener noreferrer',
    className: className,
    onClick: handleClick,
    ...props
  }, children)
}
