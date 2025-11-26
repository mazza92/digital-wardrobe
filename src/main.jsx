import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config' // Initialize i18n
import App from './App.jsx'

// Suppress storage access errors globally
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('storage') || 
      event.reason?.message?.includes('Access to storage')) {
    event.preventDefault() // Suppress the error
    console.log('Storage access blocked (handled)')
  }
})

// Hide initial loader once React mounts
const hideInitialLoader = () => {
  const loader = document.getElementById('initial-loader')
  if (loader) {
    loader.classList.add('hidden')
    setTimeout(() => loader.remove(), 300)
  }
}

// UNREGISTER all service workers to clear cache
const unregisterServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
        console.log('Service worker unregistered:', registration.scope)
      }

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        console.log('All caches cleared')
      }
    } catch (error) {
      console.log('Service worker cleanup error:', error)
    }
  }
}

// Render app
const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Post-render optimizations
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    hideInitialLoader()
    // UNREGISTER service worker to clear old cache
    unregisterServiceWorkers()
  })
})
