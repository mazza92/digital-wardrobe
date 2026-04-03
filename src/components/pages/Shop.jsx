import React, { useState, useEffect, useMemo, memo, Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../hooks/useFavorites'
import { useOutfits } from '../../hooks/useOutfits'
import { useSEO, seoConfig } from '../../hooks/useSEO'
import CartButton from '../shop/CartButton'
import OptimizedImage from '../ui/OptimizedImage'
import { LazyCartButton, LazyFavoritesList } from '../../utils/performance'

const TALLY_NOTIFY_URL = 'https://tally.so/r/eqrGq0'

const LoginModal = lazy(() => import('../ui/LoginModal'))
const SecretsAccessModal = lazy(() => import('../ui/SecretsAccessModal'))

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.emmanuellek.com/api'

const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
`

const Header = styled.header`
  background: #fdfcf8;
  padding: 0.875rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 56px;
  
  @media (min-width: 480px) {
    padding: 1rem 1.25rem;
  }
  
  @media (min-width: 768px) {
    padding: 1.125rem 2rem;
    min-height: 64px;
  }
`

const BrandName = styled(Link)`
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.3px;
  color: #101010;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  
  @media (min-width: 480px) {
    font-size: 1.05rem;
  }
  
  @media (min-width: 768px) {
    font-size: 1.2rem;
    letter-spacing: 0.5px;
  }
  
  &:hover {
    opacity: 0.7;
  }
`

const NavLink = styled(Link)`
  color: #101010;
  text-decoration: none;
  font-weight: 400;
  font-size: 0.85rem;
  padding: 0.375rem 0.75rem;
  transition: opacity 0.2s ease;
  white-space: nowrap;
  
  @media (min-width: 480px) {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
    padding: 0.5rem 1.25rem;
  }
  
  &:hover {
    opacity: 0.6;
  }
`

const NavButton = styled.button`
  color: #101010;
  background: none;
  font-weight: 400;
  font-size: 0.85rem;
  padding: 0.375rem 0.75rem;
  transition: opacity 0.2s ease;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  
  @media (min-width: 480px) {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
    padding: 0.5rem 1.25rem;
  }
  
  &:hover {
    opacity: 0.6;
  }
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  padding-right: 0.25rem;
  
  @media (min-width: 480px) {
    gap: 0.375rem;
    padding-right: 0.5rem;
  }
  
  @media (min-width: 768px) {
    gap: 0.75rem;
    padding-right: 0;
  }
  
  @media (min-width: 1024px) {
    gap: 1rem;
  }
`

const Main = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem 2rem;
  }
  
  @media (min-width: 1024px) {
    padding: 3rem 2rem 4rem;
  }
`

const MainContent = styled.div`
  width: 100%;
`

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 0.5rem 0;
  color: #101010;
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`

const PageSubtitle = styled.p`
  text-align: center;
  color: #666;
  margin: 0 0 2rem 0;
  font-size: 1rem;
  
  @media (min-width: 768px) {
    margin-bottom: 3rem;
  }
`

const ShopProductsSection = styled.section`
  width: 100%;
`

const Breadcrumb = styled.nav`
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    margin-bottom: 2.5rem;
  }
`

const BreadcrumbLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: #101010;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`

const SectionHeader = styled.div`
  margin-bottom: 2.5rem;
  
  @media (min-width: 768px) {
    margin-bottom: 3.5rem;
  }
`

const SectionTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #101010;
  letter-spacing: -0.02em;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
  
  @media (min-width: 1024px) {
    font-size: 2.5rem;
  }
`

const SectionSubtitle = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin: 0;
  line-height: 1.6;
  font-weight: 400;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`

const ProductsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem;
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }
`

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  @media (min-width: 768px) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }
`

const ProductImageWrapper = styled.div`
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #f5f5f5;
`


const FeaturedBadge = styled.span`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: rgba(16, 16, 16, 0.9);
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 2;
  backdrop-filter: blur(4px);
`

const OutOfStockOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`

const OutOfStockText = styled.span`
  background: white;
  color: #101010;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
`

const ProductInfo = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const ProductName = styled.h3`
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  color: #101010;
  line-height: 1.4;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`

const ProductDescription = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
`

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`

const Price = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #101010;
  
  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`

const ComparePrice = styled.span`
  font-size: 0.85rem;
  color: #999;
  text-decoration: line-through;
`

const DiscountBadge = styled.span`
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
`

const AddToCartButton = styled.button`
  width: 100%;
  padding: 0.875rem 1rem;
  background: #101010;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: auto;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover:not(:disabled) {
    background: #333;
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #e5e5e5;
    color: #999;
    cursor: not-allowed;
    transform: none;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #101010;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const EmptyStateAvatar = styled.img`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
  border: 2px solid rgba(0, 0, 0, 0.06);
  display: block;
  margin-left: auto;
  margin-right: auto;
  @media (min-width: 768px) {
    width: 180px;
    height: 180px;
  }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  
  svg {
    width: 80px;
    height: 80px;
    margin-bottom: 1.5rem;
    opacity: 0.3;
  }
  
  h2 {
    font-size: 1.25rem;
    margin: 0 0 1rem 0;
    color: #101010;
    font-weight: 400;
  }
  
  p {
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
    line-height: 1.6;
  }
`

const NotificationLink = styled.a`
  background: #101010;
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    background: #333;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  transition: color 0.2s ease;
  
  @media (min-width: 768px) {
    padding: 0;
  }
  
  &:hover {
    color: #101010;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`

// Product Card Component
const ProductCardComponent = memo(({ product, onAddToCart, language, t }) => {
  const name = language === 'en' && product.nameEn ? product.nameEn : product.name
  const description = language === 'en' && product.descriptionEn ? product.descriptionEn : product.description
  const inStock = product.inStock !== undefined ? product.inStock : (product.stock > 0)
  
  const hasPrice = product.price != null && product.price !== ''
  const discount = hasPrice && product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  return (
    <ProductCard>
      <ProductImageWrapper>
        <OptimizedImage
          src={product.imageUrl}
          alt={name}
          aspectRatio="3/4"
          loading="lazy"
        />
        {product.isFeatured && (
          <FeaturedBadge>{t('shop.featured', 'FAVORITE')}</FeaturedBadge>
        )}
        {!inStock && (
          <OutOfStockOverlay>
            <OutOfStockText>{t('shop.outOfStock', 'Rupture de stock')}</OutOfStockText>
          </OutOfStockOverlay>
        )}
      </ProductImageWrapper>
      <ProductInfo>
        <ProductName>{name}</ProductName>
        {description && <ProductDescription>{description}</ProductDescription>}
        {hasPrice && (
          <PriceRow>
            <Price>{Number(product.price).toFixed(2)}€</Price>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <ComparePrice>{Number(product.compareAtPrice).toFixed(2)}€</ComparePrice>
                {discount > 0 && <DiscountBadge>-{discount}%</DiscountBadge>}
              </>
            )}
          </PriceRow>
        )}
        <AddToCartButton 
          onClick={() => onAddToCart(product)}
          disabled={!inStock}
        >
          {inStock 
            ? t('shop.addToCart', 'Ajouter au panier')
            : t('shop.outOfStock', 'Rupture de stock')
          }
        </AddToCartButton>
      </ProductInfo>
    </ProductCard>
  )
})

ProductCardComponent.displayName = 'ProductCard'

// Main Shop Component
function Shop() {
  const { t, i18n } = useTranslation()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { getFavoritesCount, favorites, removeFromFavorites, clearFavorites } = useFavorites()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSecretsAccessModalOpen, setIsSecretsAccessModalOpen] = useState(false)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const { influencer } = useOutfits()

  // SEO
  useSEO({
    title: t('shop.seoTitle', 'Boutique - EMMANUELLE K'),
    description: t('shop.seoDescription', 'Découvrez la collection exclusive de produits sélectionnés par Emmanuelle K. Mode, accessoires et bijoux de qualité.')
  })

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/shop/products/public`)
        if (response.ok) {
          const data = await response.json()
          const productsWithStock = (data.products || []).map(p => ({
            ...p,
            inStock: p.stock > 0
          }))
          setProducts(productsWithStock)
        } else {
          throw new Error('Failed to fetch products')
        }
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])


  const handleAddToCart = (product) => {
    addItem(product)
  }

  if (isLoading) {
    return (
      <Container>
        <Header>
          <BrandName to="/">Emmanuelle K</BrandName>
          <HeaderRight>
            {isAuthenticated ? (
              <NavLink to="/profile">
                {t('nav.account') || 'My Account'}
              </NavLink>
            ) : (
              <NavButton onClick={() => setIsLoginModalOpen(true)}>
                {t('nav.login') || 'Login'}
              </NavButton>
            )}
            {/* Favorites - commented out for now
            <Suspense fallback={<div style={{width: '40px', height: '40px'}} />}>
              <LazyCartButton 
                onClick={() => setIsFavoritesOpen(true)}
                favoritesCount={getFavoritesCount()} 
              />
            </Suspense>
            */}
            <CartButton />
          </HeaderRight>
        </Header>
        <LoadingContainer>
          <Spinner />
          <span>{t('loading.shop', 'Chargement de la boutique...')}</span>
        </LoadingContainer>
        {isLoginModalOpen && (
          <Suspense fallback={null}>
            <LoginModal
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
            />
          </Suspense>
        )}
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <BrandName to="/">Emmanuelle K</BrandName>
        <HeaderRight>
          {isAuthenticated ? (
            <NavLink to="/profile">
              {t('nav.account') || 'My Account'}
            </NavLink>
          ) : (
            <NavButton onClick={() => setIsLoginModalOpen(true)}>
              {t('nav.login') || 'Login'}
            </NavButton>
          )}
          {/* Favorites - commented out for now
          <Suspense fallback={<div style={{width: '40px', height: '40px'}} />}>
            <LazyCartButton 
              onClick={() => {}}
              favoritesCount={getFavoritesCount()} 
            />
          </Suspense>
          */}
          <CartButton />
        </HeaderRight>
      </Header>

      <Main>
        <MainContent>
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbLink to="/">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t('common.backToHome')}
            </BreadcrumbLink>
          </Breadcrumb>

          {/* Shop Products Section - Main Content */}
          <ShopProductsSection>
            <SectionHeader>
              <SectionTitle>{t('shop.title', 'Mes secrets')}</SectionTitle>
              <SectionSubtitle>{t('shop.subtitle', 'Des produits exclusifs, pensés par moi, pour toi')}</SectionSubtitle>
            </SectionHeader>

            {/* Temporarily show empty state - replace with products.length > 0 when ready */}
            {true ? (
          <EmptyState>
            {influencer?.heroImage ? (
              <EmptyStateAvatar src={influencer.heroImage} alt="" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4" />
                <path d="M8 6h8M8 10h8M8 14h8" />
                <path d="M6 8h2M16 8h2M6 12h2M16 12h2" />
              </svg>
            )}
            <h2>{t('shop.firstSecret', 'Mon premier secret arrive bientôt')}</h2>
            <NotificationLink
              href={TALLY_NOTIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('shop.clickToBeNotified', 'Clique ici pour être avertie')}
            </NotificationLink>
          </EmptyState>
        ) : (
          <ProductsGrid>
            {products.filter(p => p.inStock).map((product) => (
              <ProductCardComponent
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                language={i18n.language}
                t={t}
              />
            ))} 
            </ProductsGrid>
            )}
          </ShopProductsSection>

        </MainContent>
      </Main>
      
      {/* Favorites sidebar - commented out for now
      <Suspense fallback={null}>
        <LazyFavoritesList
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
          favorites={favorites}
          onRemoveFavorite={removeFromFavorites}
          onClearFavorites={() => {
            if (confirm(t('favorites.clearAll') + '?')) {
              clearFavorites()
            }
          }}
        />
      </Suspense>
      */}

      {/* Login modal - lazy loaded (nav Connexion) */}
      {isLoginModalOpen && (
        <Suspense fallback={null}>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onSwitchToSignup={() => {
              setIsLoginModalOpen(false)
              window.location.href = '/signup'
            }}
          />
        </Suspense>
      )}

      {/* Accès Mes secrets - mot de passe uniquement (être averti / ventes privées) */}
      {isSecretsAccessModalOpen && (
        <Suspense fallback={null}>
          <SecretsAccessModal
            isOpen={isSecretsAccessModalOpen}
            onClose={() => setIsSecretsAccessModalOpen(false)}
          />
        </Suspense>
      )}
    </Container>
  )
}

export default memo(Shop)

