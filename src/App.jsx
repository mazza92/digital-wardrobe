import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

// Import design system components
import { LoadingFallback, PerformanceErrorBoundary } from './utils/performance.js'
import { LazyMainPortal, LazyOutfitDetail, LazyAbout } from './utils/performance.js'

// Import global styles
import './styles/globals.css'

function App() {
  const { t } = useTranslation()
  
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
                <Suspense fallback={<LoadingFallback message={t('loading.about')} />}>
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
