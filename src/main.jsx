import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.jsx'
import { initGA4 } from './utils/ga4'

initGA4()

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('storage') ||
      event.reason?.message?.includes('Access to storage')) {
    event.preventDefault()
  }
})

const hideInitialLoader = () => {
  const loader = document.getElementById('initial-loader')
  if (loader) {
    loader.classList.add('hidden')
    setTimeout(() => loader.remove(), 300)
  }
}

const unregisterServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
    } catch (error) {}
  }
}

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    hideInitialLoader()
    unregisterServiceWorkers()
  })
})
