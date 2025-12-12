import React, { useState, useEffect, useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'
import { useSEO, seoConfig } from '../../hooks/useSEO'
import CartButton from '../shop/CartButton'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://digital-wardrobe-admin.vercel.app/api'

const Container = styled.div`
  min-height: 100vh;
  background: #FDFCF8;
`

const Header = styled.header`
  background: #F3F0E9;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (min-width: 768px) {
    padding: 1rem 2rem;
  }
`

const Logo = styled(Link)`
  font-size: 1rem;
  font-weight: 600;
  color: #101010;
  text-decoration: none;
  letter-spacing: 1px;
  
  @media (min-width: 768px) {
    font-size: 1.25rem;
    letter-spacing: 2px;
  }
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (min-width: 768px) {
    gap: 1rem;
  }
`

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
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

const ProductsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
`

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  @media (min-width: 768px) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    }
  }
`

const ProductImageWrapper = styled.div`
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #f5f5f5;
`

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`

const FeaturedBadge = styled.span`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: #101010;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  padding: 1rem 1.25rem 1.25rem;
`

const ProductName = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #101010;
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`

const ProductDescription = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const Price = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #101010;
`

const ComparePrice = styled.span`
  font-size: 0.95rem;
  color: #999;
  text-decoration: line-through;
`

const DiscountBadge = styled.span`
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`

const AddToCartButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: #101010;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  
  &:hover:not(:disabled) {
    background: #333;
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
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

const EmptyState = styled.div`
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
    margin: 0 0 0.5rem 0;
    color: #101010;
  }
  
  p {
    margin: 0;
  }
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  
  &:hover {
    color: #101010;
  }
`

// Product Card Component
const ProductCardComponent = memo(({ product, onAddToCart, language, t }) => {
  const name = language === 'en' && product.nameEn ? product.nameEn : product.name
  const description = language === 'en' && product.descriptionEn ? product.descriptionEn : product.description
  
  const discount = product.compareAtPrice 
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  return (
    <ProductCard>
      <ProductImageWrapper>
        <ProductImage src={product.imageUrl} alt={name} loading="lazy" />
        {product.isFeatured && (
          <FeaturedBadge>{t('shop.featured', 'Coup de cœur')}</FeaturedBadge>
        )}
        {!product.inStock && (
          <OutOfStockOverlay>
            <OutOfStockText>{t('shop.outOfStock', 'Rupture de stock')}</OutOfStockText>
          </OutOfStockOverlay>
        )}
      </ProductImageWrapper>
      <ProductInfo>
        <ProductName>{name}</ProductName>
        {description && <ProductDescription>{description}</ProductDescription>}
        <PriceRow>
          <Price>{product.price.toFixed(2)}€</Price>
          {product.compareAtPrice && (
            <>
              <ComparePrice>{product.compareAtPrice.toFixed(2)}€</ComparePrice>
              <DiscountBadge>-{discount}%</DiscountBadge>
            </>
          )}
        </PriceRow>
        <AddToCartButton 
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
        >
          {product.inStock 
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
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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
          setProducts(data.products || [])
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
          <Logo to="/">EMMANUELLE K</Logo>
          <HeaderRight>
            <LanguageSwitcher />
            <CartButton />
          </HeaderRight>
        </Header>
        <LoadingContainer>
          <Spinner />
          <span>{t('loading.shop', 'Chargement de la boutique...')}</span>
        </LoadingContainer>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Logo to="/">EMMANUELLE K</Logo>
        <HeaderRight>
          <LanguageSwitcher />
          <CartButton />
        </HeaderRight>
      </Header>

      <Main>
        <BackLink to="/">
          ← {t('shop.backToOutfits', 'Retour aux tenues')}
        </BackLink>

        <PageTitle>{t('shop.title', 'Ma Boutique')}</PageTitle>
        <PageSubtitle>
          {t('shop.subtitle', 'Mes coups de cœur sélectionnés avec amour')}
        </PageSubtitle>

        {products.length === 0 ? (
          <EmptyState>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2>{t('shop.noProducts', 'Boutique bientôt disponible')}</h2>
            <p>{t('shop.comingSoon', 'De nouveaux produits arrivent très prochainement !')}</p>
          </EmptyState>
        ) : (
          <ProductsGrid>
            {products.map((product) => (
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
      </Main>
    </Container>
  )
}

export default memo(Shop)

