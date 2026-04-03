import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../../utils/analytics'

/**
 * Component that tracks page views on route changes
 * Place this inside Router to track all navigation
 *
 * Note: /outfits/* is handled in OutfitDetail with the real DB outfit id.
 * URL slugs here are not CUIDs and would break report rollups.
 */
const AnalyticsTracker = () => {
  const location = useLocation()
  const prevPageRef = useRef(null)

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search || ''}`

    // Same path + query = skip (e.g. remount). Different ?tab= on home = new view.
    if (prevPageRef.current === pagePath) return
    prevPageRef.current = pagePath

    // Outfit detail: real outfitId is sent after data loads (see OutfitDetail.jsx)
    if (location.pathname.startsWith('/outfits/')) {
      return
    }

    trackPageView({ page: pagePath })
  }, [location.pathname, location.search])

  return null
}

export default AnalyticsTracker
