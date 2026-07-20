/**
 * Google Analytics 4 (gtag / "pixel" GA4)
 *
 * Set in .env / hosting:
 *   VITE_GA4_MEASUREMENT_ID=G-XXXXXXXX
 *
 * Leave empty to disable.
 */

const GA4_ID = (import.meta.env.VITE_GA4_MEASUREMENT_ID || '').trim()

let inited = false

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

/** Call once at app boot. No-op if VITE_GA4_MEASUREMENT_ID is missing. */
export function initGA4() {
  if (typeof window === 'undefined' || inited || !GA4_ID) return
  inited = true

  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments)
    }

  window.gtag('js', new Date())
  window.gtag('config', GA4_ID, {
    send_page_view: false // SPA: page_view sent on route change
  })

  loadScript(
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`
  ).catch(() => {})
}

export function trackGA4PageView(pagePath) {
  if (!GA4_ID || typeof window.gtag !== 'function') return
  const path = pagePath || `${window.location.pathname}${window.location.search || ''}`
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title
  })
}

export function trackGA4Event(eventName, params = {}) {
  if (!GA4_ID || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

/** Affiliate / merchant outbound click */
export function trackGA4AffiliateClick({ brand, productName, source = 'look' } = {}) {
  trackGA4Event('affiliate_click', {
    brand: brand || undefined,
    item_name: productName || undefined,
    source
  })
}

export function trackGA4Purchase({ value, currency = 'EUR', orderId } = {}) {
  trackGA4Event('purchase', {
    transaction_id: orderId || undefined,
    value: typeof value === 'number' ? value : undefined,
    currency
  })
}

export function trackGA4SignUp() {
  trackGA4Event('sign_up', { method: 'email' })
}

export const ga4Enabled = Boolean(GA4_ID)
