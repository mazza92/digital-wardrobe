import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config' // Initialize i18n
import App from './App.jsx'

// Hide initial loader once React mounts
const hideInitialLoader = () => {
  const loader = document.getElementById('initial-loader')
  if (loader) {
    loader.classList.add('hidden')
    setTimeout(() => loader.remove(), 300)
  }
}

// Register service worker for caching (production only)
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      // Check for updates periodically
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000) // Check every hour
      
    } catch (error) {
      // Service worker registration failed, app will work without caching
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
    // Register service worker after initial render
    registerServiceWorker()
  })
})
