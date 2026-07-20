import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'
import { useSEO } from '../../hooks/useSEO'
import CartButton from '../shop/CartButton'
import OptimizedImage from '../ui/OptimizedImage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.emmanuellek.com/api'

const Container = styled.div`
  min-height: 100vh;
  background: #FDFCF8;
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
  @media (min-width: 768px) {
    padding: 1.125rem 2rem;
    min-height: 64px;
  }
`

const BackLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  &:hover {
    color: #101010;
    background-color: rgba(0, 0, 0, 0.05);
  }
`

const Logo = styled(Link)`
  font-size: 1rem;
  font-weight: 500;
  color: #101010;
  text-decoration: none;
  &:hover { opacity: 0.7; }
`

const HeaderRight = styled.div`display: flex; align-items: center;`

const Main = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  @media (min-width: 768px) {
    padding: 2rem 2rem 4rem;
  }
`

const ProductLayout = styled.div`
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    align-items: start;
  }
`

const GalleryWrap = styled.div`
  margin-bottom: 1.5rem;
  @media (min-width: 768px) {
    margin-bottom: 0;
    position: sticky;
    top: 5rem;
  }
`

const MainImageWrap = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f8f6f3;
  margin-bottom: 0.75rem;
  touch-action: pan-y;
  user-select: none;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`

const Thumbnails = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const Thumb = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${p => p.$active ? '#101010' : 'transparent'};
  background: #f0efec;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const DetailWrap = styled.div``

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`

const TypeBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #666;
  background: #f0efec;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
`

const ConditionText = styled.span`
  font-size: 0.8rem;
  color: #888;
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #101010;
  line-height: 1.3;
  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`

const Description = styled.p`
  font-size: 0.95rem;
  color: #555;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  white-space: pre-wrap;
`

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #101010;
  margin-bottom: 1.5rem;
`

const AddToCartBtn = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  background: #101010;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover:not(:disabled) {
    background: #333;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.08);
  border-top: 3px solid #101010;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const ErrorMessage = styled.p`
  text-align: center;
  color: #c00;
  padding: 2rem 1rem;
`

export default function PrivateSaleProduct() {
  const { saleId, itemId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const language = i18n.language?.startsWith('en') ? 'en' : 'fr'
  const { addItem } = useCart()

  const [sale, setSale] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageIndex, setImageIndex] = useState(0)
  const swipeStartX = useRef(null)
  const swipeStartY = useRef(null)
  const galleryRef = useRef(null)
  const SWIPE_THRESHOLD = 50

  // Same sessionStorage key as PrivateSale listing: sale_${saleId}_verified
  const checkVerified = () => {
    if (typeof window === 'undefined' || !saleId) return false
    const raw = sessionStorage.getItem(`sale_${saleId}_verified`)
    if (!raw) return false
    if (raw === 'true') return true
    try {
      const data = JSON.parse(raw)
      if (data?.verified && data?.expiry && Date.now() < data.expiry) return true
      if (data?.verified) return true
    } catch (_) {}
    return false
  }
  const isVerified = checkVerified()

  useEffect(() => {
    if (!saleId || !itemId) return
    if (!checkVerified()) {
      navigate(`/shop/sale/${saleId}`, { replace: true })
      return
    }

    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [saleRes, productsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/private-sales/${saleId}`),
          fetch(`${API_BASE_URL}/private-sales/${saleId}/products`)
        ])
        if (cancelled) return
        if (!saleRes.ok) {
          setError(language === 'en' ? 'Sale not found.' : 'Vente introuvable.')
          return
        }
        const saleData = await saleRes.json()
        if (!productsRes.ok) {
          setError(language === 'en' ? 'Could not load items.' : 'Impossible de charger les articles.')
          return
        }
        const { products } = await productsRes.json()
        const item = products?.find(p => String(p.id) === String(itemId))
        if (!item) {
          setError(language === 'en' ? 'Item not found.' : 'Article introuvable.')
          return
        }
        setSale(saleData)
        setProduct(item)
        setImageIndex(0)
      } catch (e) {
        if (!cancelled) setError(language === 'en' ? 'Network error.' : 'Erreur réseau.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [saleId, itemId, navigate, language])

  useSEO({
    title: product
      ? (language === 'en' && product.nameEn ? product.nameEn : product.name)
      : (language === 'en' ? 'Item' : 'Article'),
    description: product?.description || ''
  })

  // Derive from product (safe when product is null) so hooks below run unconditionally
  const images = product
    ? ((product.images && product.images.length) ? product.images : (product.imageUrl ? [product.imageUrl] : []))
    : []
  const numImages = images.length

  const goToPrevImage = useCallback(() => {
    setImageIndex((i) => (i <= 0 ? Math.max(0, numImages - 1) : i - 1))
  }, [numImages])

  const goToNextImage = useCallback(() => {
    setImageIndex((i) => (i >= numImages - 1 ? 0 : i + 1))
  }, [numImages])

  const handleSwipeStart = useCallback((clientX, clientY) => {
    swipeStartX.current = clientX
    swipeStartY.current = clientY
  }, [])

  const handleSwipeEnd = useCallback(
    (clientX) => {
      const start = swipeStartX.current
      swipeStartX.current = null
      swipeStartY.current = null
      if (start == null || numImages <= 1) return
      const delta = clientX - start
      if (delta < -SWIPE_THRESHOLD) goToNextImage()
      else if (delta > SWIPE_THRESHOLD) goToPrevImage()
    },
    [numImages, goToNextImage, goToPrevImage]
  )

  const onTouchStart = useCallback(
    (e) => {
      if (numImages <= 1) return
      handleSwipeStart(e.touches[0].clientX, e.touches[0].clientY)
    },
    [numImages, handleSwipeStart]
  )

  const onTouchEnd = useCallback(
    (e) => {
      if (numImages <= 1 || !e.changedTouches.length) return
      handleSwipeEnd(e.changedTouches[0].clientX)
    },
    [numImages, handleSwipeEnd]
  )

  const onMouseDown = useCallback(
    (e) => {
      if (numImages <= 1) return
      e.preventDefault()
      handleSwipeStart(e.clientX, e.clientY)
    },
    [numImages, handleSwipeStart]
  )

  const onMouseUp = useCallback(
    (e) => {
      if (numImages <= 1) return
      handleSwipeEnd(e.clientX)
    },
    [numImages, handleSwipeEnd]
  )

  useEffect(() => {
    const el = galleryRef.current
    if (!el || numImages <= 1) return
    const move = (e) => {
      if (swipeStartX.current == null) return
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      const dx = Math.abs(x - swipeStartX.current)
      const dy = Math.abs(y - (swipeStartY.current ?? 0))
      if (dx > dy && dx > 10) e.preventDefault()
    }
    el.addEventListener('touchmove', move, { passive: false })
    return () => el.removeEventListener('touchmove', move)
  }, [numImages])

  const handleAddToCart = useCallback(() => {
    if (!product) return
    addItem({
      ...product,
      price: product.price.toString(),
      saleId: saleId // Include the sale ID for shipping calculation
    })
  }, [product, addItem, saleId])

  if (!isVerified) return null

  if (loading) {
    return (
      <Container>
        <Header>
          <BackLink to="/">← {t('common.backToHome')}</BackLink>
          <Logo to="/">Emmanuelle K</Logo>
          <HeaderRight><CartButton /></HeaderRight>
        </Header>
        <Main>
          <LoadingContainer>
            <Spinner />
            <p>{language === 'en' ? 'Loading...' : 'Chargement...'}</p>
          </LoadingContainer>
        </Main>
      </Container>
    )
  }

  if (error || !product) {
    return (
      <Container>
        <Header>
          <BackLink to={`/shop/sale/${saleId}`}>← {language === 'en' ? 'Back to sale' : 'Retour à la vente'}</BackLink>
          <Logo to="/">Emmanuelle K</Logo>
          <HeaderRight><CartButton /></HeaderRight>
        </Header>
        <Main>
          <ErrorMessage>{error || (language === 'en' ? 'Item not found.' : 'Article introuvable.')}</ErrorMessage>
        </Main>
      </Container>
    )
  }

  const mainImage = images[imageIndex] || images[0]
  const displayName = language === 'en' && product.nameEn ? product.nameEn : product.name
  const inStock = product.inStock !== false && (product.stock == null || product.stock > 0)

  return (
    <Container>
      <Header>
        <BackLink to={`/shop/sale/${saleId}`}>← {language === 'en' ? 'Back to sale' : 'Retour à la vente'}</BackLink>
        <Logo to="/">Emmanuelle K</Logo>
        <HeaderRight><CartButton /></HeaderRight>
      </Header>
      <Main>
        <ProductLayout>
          <GalleryWrap>
            <MainImageWrap
              ref={galleryRef}
              role="img"
              aria-label={images.length > 1 ? `${language === 'en' ? 'Image' : 'Image'} ${imageIndex + 1} ${language === 'en' ? 'of' : 'sur'} ${images.length}` : undefined}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseLeave={() => { swipeStartX.current = null; swipeStartY.current = null }}
            >
              {mainImage && (
                <OptimizedImage
                  src={mainImage}
                  alt={displayName}
                  aspectRatio="1"
                />
              )}
            </MainImageWrap>
            {images.length > 1 && (
              <Thumbnails>
                {images.map((src, i) => (
                  <Thumb
                    key={i}
                    type="button"
                    $active={i === imageIndex}
                    onClick={() => setImageIndex(i)}
                    aria-label={`${language === 'en' ? 'Image' : 'Image'} ${i + 1}`}
                  >
                    <img src={src} alt="" />
                  </Thumb>
                ))}
              </Thumbnails>
            )}
          </GalleryWrap>
          <DetailWrap>
            <MetaRow>
              {product.itemType && <TypeBadge>{product.itemType}</TypeBadge>}
              {product.condition && <ConditionText>{product.condition}</ConditionText>}
            </MetaRow>
            <Title>{displayName}</Title>
            {product.description && <Description>{product.description}</Description>}
            <Price>{product.price}€</Price>
            <AddToCartBtn onClick={handleAddToCart} disabled={!inStock}>
              {inStock ? 'Ajouter au panier' : 'Indisponible'}
            </AddToCartBtn>
          </DetailWrap>
        </ProductLayout>
      </Main>
    </Container>
  )
}
