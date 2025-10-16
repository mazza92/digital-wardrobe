// Performance Optimization Utilities
// Handles lazy loading, code splitting, image optimization, and performance monitoring

import { lazy, Suspense } from 'react'

// ============================================================================
// LAZY LOADING & CODE SPLITTING
// ============================================================================

// Lazy load components for better performance
export const LazyMainPortal = lazy(() => import('../components/pages/MainPortal'))
export const LazyOutfitDetail = lazy(() => import('../components/pages/OutfitDetail'))
export const LazyAbout = lazy(() => import('../components/pages/About'))

// Lazy load UI components
export const LazyFavoritesList = lazy(() => import('../components/ui/FavoritesList'))
export const LazyCartButton = lazy(() => import('../components/ui/CartButton'))

// Loading component for Suspense fallback
export const LoadingFallback = ({ message = "Chargement..." }) => {
  const React = require('react')
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      gap: '1rem'
    }
  }, 
    React.createElement('div', {
      style: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #1a1a1a',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }
    }),
    React.createElement('p', { style: { color: '#666', margin: 0 } }, message)
  )
}

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

// Image optimization utilities
export const optimizeImageUrl = (url, options = {}) => {
  if (!url) return url
  
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'webp'
  } = options
  
  // If it's already an optimized URL, return as is
  if (url.includes('cdn-cgi/image')) return url
  
  // For external images, use a proxy service or return original
  if (url.startsWith('http')) {
    return url
  }
  
  // For local images, you could implement optimization here
  return url
}

// Lazy image component with intersection observer
export const LazyImage = ({ src, alt, className, ...props }) => {
  const React = require('react')
  const { useState, useRef, useEffect } = React
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef()
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    
    if (imgRef.current) {
      observer.observe(imgRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return React.createElement('div', { ref: imgRef, className, ...props },
    isInView && React.createElement('img', {
      src,
      alt,
      onLoad: () => setIsLoaded(true),
      style: {
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }
    })
  )
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

// Performance monitoring utilities
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName, renderFunction) => {
    const start = performance.now()
    const result = renderFunction()
    const end = performance.now()
    
    console.log(`${componentName} render time: ${end - start}ms`)
    return result
  },
  
  // Measure API call performance
  measureApiCall: async (apiName, apiCall) => {
    const start = performance.now()
    try {
      const result = await apiCall()
      const end = performance.now()
      console.log(`${apiName} API call time: ${end - start}ms`)
      return result
    } catch (error) {
      const end = performance.now()
      console.error(`${apiName} API call failed after ${end - start}ms:`, error)
      throw error
    }
  },
  
  // Measure image load time
  measureImageLoad: (imageUrl) => {
    return new Promise((resolve, reject) => {
      const start = performance.now()
      const img = new Image()
      
      img.onload = () => {
        const end = performance.now()
        console.log(`Image ${imageUrl} load time: ${end - start}ms`)
        resolve({ url: imageUrl, loadTime: end - start })
      }
      
      img.onerror = () => {
        const end = performance.now()
        console.error(`Image ${imageUrl} failed to load after ${end - start}ms`)
        reject(new Error(`Failed to load image: ${imageUrl}`))
      }
      
      img.src = imageUrl
    })
  }
}

// ============================================================================
// MEMOIZATION UTILITIES
// ============================================================================

// Memoize expensive calculations
export const memoize = (fn) => {
  const cache = new Map()
  return (...args) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// Memoize API responses
export const memoizeApiCall = (apiCall, ttl = 5 * 60 * 1000) => { // 5 minutes default
  const cache = new Map()
  
  return async (...args) => {
    const key = JSON.stringify(args)
    const cached = cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }
    
    const data = await apiCall(...args)
    cache.set(key, { data, timestamp: Date.now() })
    return data
  }
}

// ============================================================================
// DEBOUNCING & THROTTLING
// ============================================================================

// Debounce function calls
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function calls
export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// ============================================================================
// RESOURCE PRELOADING
// ============================================================================

// Preload critical resources
export const preloadResources = {
  // Preload critical images
  preloadImages: (imageUrls) => {
    imageUrls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  },
  
  // Preload critical fonts
  preloadFonts: (fontUrls) => {
    fontUrls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.href = url
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
  },
  
  // Preload critical scripts
  preloadScripts: (scriptUrls) => {
    scriptUrls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'script'
      link.href = url
      document.head.appendChild(link)
    })
  }
}

// ============================================================================
// BUNDLE ANALYSIS
// ============================================================================

// Bundle size monitoring
export const bundleAnalyzer = {
  // Log bundle information
  logBundleInfo: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Bundle Analysis:')
      console.log('- React version:', React.version)
      console.log('- Build time:', new Date().toISOString())
      console.log('- User agent:', navigator.userAgent)
    }
  },
  
  // Monitor memory usage
  monitorMemory: () => {
    if (performance.memory) {
      const memory = performance.memory
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
      })
    }
  }
}

// ============================================================================
// ERROR BOUNDARY UTILITIES
// ============================================================================

// Error boundary for performance monitoring
export class PerformanceErrorBoundary {
  constructor(props) {
    this.props = props
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Performance Error Boundary caught an error:', error, errorInfo)
    
    // Log performance metrics when error occurs
    bundleAnalyzer.monitorMemory()
  }
  
  render() {
    const React = require('react')
    
    if (this.state.hasError) {
      return React.createElement('div', {
        style: {
          padding: '2rem',
          textAlign: 'center',
          color: '#666'
        }
      },
        React.createElement('h2', null, 'Une erreur s\'est produite'),
        React.createElement('p', null, 'Veuillez recharger la page ou réessayer plus tard.')
      )
    }
    
    return this.props.children
  }
}

export default {
  // Lazy loading
  LazyMainPortal,
  LazyOutfitDetail,
  LazyAbout,
  LazyFavoritesList,
  LazyCartButton,
  LoadingFallback,
  
  // Image optimization
  optimizeImageUrl,
  LazyImage,
  
  // Performance monitoring
  performanceMonitor,
  
  // Memoization
  memoize,
  memoizeApiCall,
  
  // Debouncing & throttling
  debounce,
  throttle,
  
  // Resource preloading
  preloadResources,
  
  // Bundle analysis
  bundleAnalyzer,
  
  // Error boundary
  PerformanceErrorBoundary
}
