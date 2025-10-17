import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'

// Import design system components
import { LoadingFallback, PerformanceErrorBoundary } from './utils/performance.js'
import { LazyMainPortal, LazyOutfitDetail, LazyAbout } from './utils/performance.js'

// Import global styles
import './styles/globals.css'

function App() {
  return (
    <PerformanceErrorBoundary>
      <div className="app-container">
        <Router>
          <Routes>
            <Route 
              path="/" 
              element={<LazyMainPortal />} 
            />
            <Route 
              path="/outfits/:outfitId" 
              element={<LazyOutfitDetail />} 
            />
            <Route 
              path="/about" 
              element={
                <Suspense fallback={<LoadingFallback message="Chargement de la page À propos..." />}>
                  <LazyAbout />
                </Suspense>
              } 
            />
          </Routes>
        </Router>
      </div>
    </PerformanceErrorBoundary>
  )
}

export default App
