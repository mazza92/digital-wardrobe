/**
 * Lightweight analytics utility for tracking user interactions
 * Uses sendBeacon for non-blocking requests that don't slow down the page
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.emmanuellek.com/api'

// Get or create a persistent session ID
const getSessionId = () => {
  const SESSION_KEY = 'dw_session_id'
  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

// Detect social media source from referrer and user agent
const detectSocialSource = () => {
  try {
    const referrer = document.referrer || ''
    const userAgent = navigator.userAgent || ''
    const params = new URLSearchParams(window.location.search)
    const fbclid = params.get('fbclid')

    // Instagram detection
    if (
      referrer.includes('instagram.com') ||
      referrer.includes('l.instagram.com') ||
      userAgent.includes('Instagram') ||
      (fbclid && userAgent.includes('Instagram'))
    ) {
      return {
        utmSource: 'instagram',
        utmMedium: 'social',
        utmCampaign: 'story_or_link',
        utmContent: 'auto_detected',
        fbclid: fbclid
      }
    }

    // Facebook detection
    if (
      referrer.includes('facebook.com') ||
      referrer.includes('fb.com') ||
      referrer.includes('l.facebook.com') ||
      referrer.includes('lm.facebook.com') ||
      userAgent.includes('FBAN') ||
      userAgent.includes('FBAV') ||
      (fbclid && !userAgent.includes('Instagram'))
    ) {
      return {
        utmSource: 'facebook',
        utmMedium: 'social',
        utmCampaign: 'post_or_link',
        utmContent: 'auto_detected',
        fbclid: fbclid
      }
    }

    // TikTok detection
    if (
      referrer.includes('tiktok.com') ||
      userAgent.includes('TikTok') ||
      userAgent.includes('BytedanceWebview')
    ) {
      return {
        utmSource: 'tiktok',
        utmMedium: 'social',
        utmCampaign: 'video_link',
        utmContent: 'auto_detected'
      }
    }

    // Twitter/X detection
    if (
      referrer.includes('twitter.com') ||
      referrer.includes('t.co') ||
      referrer.includes('x.com')
    ) {
      return {
        utmSource: 'twitter',
        utmMedium: 'social',
        utmCampaign: 'tweet_link',
        utmContent: 'auto_detected'
      }
    }

    return null
  } catch {
    return null
  }
}

// Parse UTM parameters from URL
const getUtmParams = () => {
  try {
    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get('utm_source')
    const utmMedium = params.get('utm_medium')
    const utmCampaign = params.get('utm_campaign')
    const utmContent = params.get('utm_content')

    // If we have explicit UTMs, use them
    if (utmSource || utmMedium || utmCampaign) {
      return {
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmContent: utmContent || null
      }
    }

    // Otherwise, try to detect social source automatically
    const socialSource = detectSocialSource()
    if (socialSource) {
      return socialSource
    }

    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null
    }
  } catch {
    return {}
  }
}

// Store UTM params in session for attribution across page navigations
const storeUtmParams = () => {
  const UTM_KEY = 'dw_utm_params'
  const utmParams = getUtmParams()

  // Only store if we have at least one UTM param
  if (utmParams.utmSource || utmParams.utmMedium || utmParams.utmCampaign) {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utmParams))
    return utmParams
  }

  // Return previously stored UTM params if available
  try {
    const stored = sessionStorage.getItem(UTM_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Get stored UTM params (persisted across page navigations within session)
const getStoredUtmParams = () => {
  const UTM_KEY = 'dw_utm_params'
  try {
    const stored = sessionStorage.getItem(UTM_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Initialize UTM tracking on page load
if (typeof window !== 'undefined') {
  storeUtmParams()
}

/**
 * Send tracking data using sendBeacon (non-blocking) with fetch fallback
 */
const sendTrackingData = (endpoint, data) => {
  const payload = JSON.stringify({
    ...data,
    sessionId: getSessionId(),
    ...getStoredUtmParams(),
    timestamp: new Date().toISOString()
  })

  const url = `${API_BASE_URL}${endpoint}`

  if (import.meta.env.DEV) {
    const preview = {
      ...data,
      sessionId: getSessionId(),
      ...getStoredUtmParams()
    }
    console.log('[Analytics]', endpoint, preview)
  }

  // Use fetch for better reliability and error visibility
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true
  })
    .then(res => {
      if (!res.ok && import.meta.env.DEV) {
        console.warn('[Analytics] Failed:', endpoint, res.status)
      }
    })
    .catch(err => {
      if (import.meta.env.DEV) {
        console.warn('[Analytics] Error:', endpoint, err.message)
      }
    })
}

/**
 * Track a page view
 */
export const trackPageView = (options = {}) => {
  const { outfitId, productId, brand, page } = options
  const pagePath = page || `${window.location.pathname}${window.location.search || ''}`

  sendTrackingData('/analytics/page-view', {
    page: pagePath,
    outfitId,
    productId,
    brand,
    referrer: document.referrer || null,
    userAgent: navigator.userAgent
  })
}

/**
 * Track "Découvrir" button click on outfit cards
 */
export const trackDiscoverClick = (outfitId) => {
  sendTrackingData('/analytics/discover-click', {
    outfitId,
    referrer: document.referrer || null
  })
}

/**
 * Track product tag click (when user clicks on a tag overlay on outfit image)
 */
export const trackProductTagClick = (productId, outfitId, brand) => {
  sendTrackingData('/analytics/product-tag-click', {
    productId,
    outfitId,
    brand
  })
}

/**
 * Track signup event
 */
export const trackSignup = (userId, source, outfitId = null) => {
  sendTrackingData('/analytics/signup', {
    userId,
    source, // e.g., "favorites", "private_sale", "header", "comment"
    outfitId,
    referrer: document.referrer || null
  })
}

/**
 * Track engagement banner events
 */
export const trackBannerEvent = (eventType, bannerId, options = {}) => {
  const { page, outfitId } = options

  sendTrackingData('/analytics/banner-event', {
    eventType, // "show", "click", "dismiss"
    bannerId,  // e.g., "engagement_nudge", "signup_prompt"
    page: page || window.location.pathname,
    outfitId
  })
}

/**
 * Track private sale access
 */
export const trackPrivateSaleAccess = (privateSaleId, accessMethod, success = true) => {
  sendTrackingData('/analytics/private-sale-access', {
    privateSaleId,
    accessMethod, // "code_entry", "direct_link", "authenticated"
    success
  })
}

/**
 * Track favorite action (add/remove)
 */
export const trackFavorite = (productId, outfitId, brand, action) => {
  sendTrackingData('/analytics/favorite', {
    productId,
    outfitId,
    brand,
    action // "add" or "remove"
  })
}

/**
 * Track affiliate link click from an editorial (product card or in-content link)
 */
export const trackEditorialAffiliateClick = ({
  editorialPostId,
  editorialProductId = null,
  productName = null,
  brand = null,
  affiliateLink = null,
  source = 'card'
} = {}) => {
  if (!editorialPostId) return
  sendTrackingData('/analytics/editorial-click', {
    editorialPostId,
    editorialProductId,
    productName,
    brand,
    affiliateLink,
    source // "card" | "content"
  })
}

/**
 * Get session ID for use in other tracking calls
 */
export const getAnalyticsSessionId = getSessionId

/**
 * Get current UTM parameters
 */
export const getAnalyticsUtmParams = getStoredUtmParams

export default {
  trackPageView,
  trackDiscoverClick,
  trackProductTagClick,
  trackSignup,
  trackBannerEvent,
  trackPrivateSaleAccess,
  trackFavorite,
  trackEditorialAffiliateClick,
  getSessionId: getAnalyticsSessionId,
  getUtmParams: getAnalyticsUtmParams
}
