import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'

// Import design system components
import { LoadingFallback, PerformanceErrorBoundary } from './utils/performance.js'
import { LazyMainPortal, LazyOutfitDetail, LazyAbout } from './utils/performance.js'

// Auth - Lazy loaded for better initial load
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

const Login = lazy(() => import('./components/pages/auth/Login.jsx'))
const SignUp = lazy(() => import('./components/pages/auth/SignUp.jsx'))
const Onboarding = lazy(() => import('./components/pages/auth/Onboarding.jsx'))
const Profile = lazy(() => import('./components/pages/auth/Profile.jsx'))
const AuthCallback = lazy(() => import('./components/pages/auth/AuthCallback.jsx'))

// Shop - Lazy loaded
const Shop = lazy(() => import('./components/pages/Shop.jsx'))
const Checkout = lazy(() => import('./components/pages/Checkout.jsx'))
const CheckoutSuccess = lazy(() => import('./components/pages/CheckoutSuccess.jsx'))

// UI Components
import Toast from './components/ui/Toast.jsx'
import CartDrawer from './components/shop/CartDrawer.jsx'

// Import global styles
import './styles/globals.css'

// Minimal loading spinner for auth pages
const AuthLoadingFallback = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FDFCF8'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #1a1a1a',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
)

function App() {
  const { t } = useTranslation()
  
  return (
    <PerformanceErrorBoundary>
      <AuthProvider>
      <CartProvider>
      <div className="app-container">
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
              <Route path="/login" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <Login />
                </Suspense>
              } />
              <Route path="/signup" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <SignUp />
                </Suspense>
              } />
              <Route path="/onboarding" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <Onboarding />
                </Suspense>
              } />
              <Route path="/profile" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <Profile />
                </Suspense>
              } />
              <Route path="/auth/callback" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <AuthCallback />
                </Suspense>
              } />
              {/* Shop Routes */}
              <Route path="/shop" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <Shop />
                </Suspense>
              } />
              <Route path="/checkout" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <Checkout />
                </Suspense>
              } />
              <Route path="/checkout/success" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <CheckoutSuccess />
                </Suspense>
              } />
          </Routes>
          <CartDrawer />
        </Router>
          <Toast />
      </div>
      </CartProvider>
      </AuthProvider>
    </PerformanceErrorBoundary>
  )
}

export default App