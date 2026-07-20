import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Import design system components
import { LoadingFallback, PerformanceErrorBoundary } from './utils/performance.js'
import { LazyMainPortal, LazyOutfitDetail, LazyAbout, LazyPrivacyPolicy, LazyLegalInfo } from './utils/performance.js'

// Auth - Lazy loaded for better initial load
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'

const Login = lazy(() => import('./components/pages/auth/Login.jsx'))
const SignUp = lazy(() => import('./components/pages/auth/SignUp.jsx'))
// V1: Onboarding flow commented out for MVP
// V2: Uncomment below to re-enable onboarding
// const Onboarding = lazy(() => import('./components/pages/auth/Onboarding.jsx'))
const Profile = lazy(() => import('./components/pages/auth/Profile.jsx'))
const AuthCallback = lazy(() => import('./components/pages/auth/AuthCallback.jsx'))
const ResetPassword = lazy(() => import('./components/pages/auth/ResetPassword.jsx'))

// Shop - Lazy loaded
const TermsOfSale = lazy(() => import('./components/pages/TermsOfSale.jsx'))
const Shop = lazy(() => import('./components/pages/Shop.jsx'))
const PrivateSale = lazy(() => import('./components/pages/PrivateSale.jsx'))
const PrivateSaleProduct = lazy(() => import('./components/pages/PrivateSaleProduct.jsx'))
const Checkout = lazy(() => import('./components/pages/Checkout.jsx'))
const CheckoutSuccess = lazy(() => import('./components/pages/CheckoutSuccess.jsx'))

// Editorial - Lazy loaded with error handling
const EditorialDetail = lazy(() => 
  import('./components/pages/EditorialDetail.jsx').catch(err => {
    // Return a fallback component if import fails
    return { 
      default: () => (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Page non disponible</h2>
          <p>L'article éditorial n'a pas pu être chargé.</p>
        </div>
      )
    }
  })
)

// UI Components
import Toast from './components/ui/Toast.jsx'
import FavoriteToast from './components/ui/FavoriteToast.jsx'
import CartDrawer from './components/shop/CartDrawer.jsx'
import SiteLayout from './components/layout/SiteLayout.jsx'
import InstagramBrowserBanner from './components/ui/InstagramBrowserBanner.jsx'
import GuestSignupNudgeBanner from './components/ui/GuestSignupNudgeBanner.jsx'
import SignupWelcomeToast from './components/ui/SignupWelcomeToast.jsx'
import GlobalSignupPromptLauncher from './components/ui/GlobalSignupPromptLauncher.jsx'
import AnalyticsTracker from './components/ui/AnalyticsTracker.jsx'

// Import global styles
import './styles/globals.css'

// Disable browser scroll restoration so we fully control scroll position on navigation
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

// Scroll to top on route change — useLayoutEffect fires before paint,
// preventing the browser from briefly showing the old scroll position
function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

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

  // Hide the initial HTML loader for non-outfit pages.
  // Outfit pages have their own instant-render content that should persist until
  // OutfitDetail has loaded its data and is ready to display.
  useEffect(() => {
    const isOutfitPage = window.location.pathname.startsWith('/outfits/')
    if (!isOutfitPage && typeof window.__hideLoader === 'function') {
      window.__hideLoader()
    }
  }, [])
  
  return (
    <AuthProvider>
      <PerformanceErrorBoundary>
      <FavoritesProvider>
      <CartProvider>
      <div className="app-container">
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AnalyticsTracker />
          <InstagramBrowserBanner />
          <ScrollToTop />
          <Routes>
            <Route element={<SiteLayout />}>
              <Route
                path="/"
                element={
                  <Suspense fallback={<AuthLoadingFallback />}>
                    <LazyMainPortal />
                  </Suspense>
                }
              />
              <Route
                path="/outfits/:outfitId"
                element={
                  <Suspense fallback={<AuthLoadingFallback />}>
                    <LazyOutfitDetail />
                  </Suspense>
                }
              />
              <Route 
                path="/editorial/:slug" 
                element={
                  <Suspense fallback={<AuthLoadingFallback />}>
                    <EditorialDetail />
                  </Suspense>
                } 
              />
              <Route 
                path="/about" 
                element={
                  <Suspense fallback={<LoadingFallback message={t('loading.about')} />}>
                    <LazyAbout />
                  </Suspense>
                } 
              />
              <Route 
                path="/privacy" 
                element={
                  <Suspense fallback={<LoadingFallback message={t('loading.privacy', 'Chargement...')} />}>
                    <LazyPrivacyPolicy />
                  </Suspense>
                } 
              />
              <Route
                path="/legal"
                element={
                  <Suspense fallback={<LoadingFallback message={t('loading.legal', 'Chargement...')} />}>
                    <LazyLegalInfo />
                  </Suspense>
                }
              />
              <Route
                path="/cgv"
                element={
                  <Suspense fallback={<LoadingFallback message={t('loading.legal', 'Chargement...')} />}>
                    <TermsOfSale />
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
              {/* V1: Onboarding flow commented out for MVP */}
              {/* V2: Uncomment below to re-enable onboarding route */}
              {/* <Route path="/onboarding" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <Onboarding />
                </Suspense>
              } /> */}
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
              <Route path="/auth/reset-password" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <ResetPassword />
                </Suspense>
              } />
              {/* Shop Routes */}
              <Route path="/shop" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <Shop />
                </Suspense>
              } />
              <Route path="/shop/sale/:saleId/item/:itemId" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <PrivateSaleProduct />
                </Suspense>
              } />
              <Route path="/shop/sale/:saleId" element={
                <Suspense fallback={<AuthLoadingFallback />}>
                  <PrivateSale />
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
            </Route>
          </Routes>
          <CartDrawer />
          <GuestSignupNudgeBanner />
          <SignupWelcomeToast />
          <GlobalSignupPromptLauncher />
        </Router>
          <Toast />
          <FavoriteToast />
      </div>
      </CartProvider>
      </FavoritesProvider>
      </PerformanceErrorBoundary>
    </AuthProvider>
  )
}

export default App