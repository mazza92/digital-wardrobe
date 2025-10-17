import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Register service worker for caching (only in production)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    // Try main service worker first
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Main SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('Main SW registration failed, trying fallback: ', registrationError)
        
        // Clear any existing registrations first
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister()
          })
        }).then(() => {
          // Try fallback service worker
          return navigator.serviceWorker.register('/sw-fallback.js')
        }).then((registration) => {
          console.log('Fallback SW registered: ', registration)
        }).catch((fallbackError) => {
          console.log('Both SW registrations failed, continuing without SW: ', fallbackError)
        })
      })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
