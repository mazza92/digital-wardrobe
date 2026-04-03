import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'
import { useSEO, seoConfig } from '../../hooks/useSEO'
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
  
  @media (min-width: 480px) {
    padding: 1rem 1.25rem;
  }
  
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
  margin-right: 0.5rem;
  flex-shrink: 0;
  
  @media (min-width: 768px) {
    font-size: 1rem;
    border-radius: 12px;
  }
  
  &:hover {
    color: #101010;
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateX(-2px);
  }
`

const Logo = styled(Link)`
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

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  
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

const AccessFormContainer = styled.div`
  max-width: 500px;
  margin: 4rem auto;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
`

const SaleTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #101010;
  letter-spacing: -0.02em;
  line-height: 1.2;
  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`

const SaleDescription = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  max-width: 560px;
  @media (min-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`

/* Access form (code) still uses a simple image block */
const SaleImage = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto 2rem;
  border-radius: 12px;
  overflow: hidden;
  img {
    width: 100%;
    height: auto;
    display: block;
  }
`

const AccessForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
`

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #101010;
`

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid ${props => props.$hasError ? '#fcc' : '#e5e5e5'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: ${props => props.$hasError ? '#fffafa' : 'white'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#f99' : '#101010'};
    box-shadow: ${props => props.$hasError 
      ? '0 0 0 3px rgba(255, 0, 0, 0.1)' 
      : '0 0 0 3px rgba(16, 16, 16, 0.1)'};
  }
  
  &::placeholder {
    text-transform: none;
    letter-spacing: normal;
    color: #999;
  }
`

const ErrorMessage = styled.div`
  padding: 1rem 1.25rem;
  background: ${props => props.$type === 'warning' ? '#fff4e6' : '#fee'};
  border: 1px solid ${props => props.$type === 'warning' ? '#ffd89b' : '#fcc'};
  border-radius: 8px;
  color: ${props => props.$type === 'warning' ? '#b45309' : '#c33'};
  font-size: 0.9rem;
  text-align: left;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  line-height: 1.5;
  
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #101010;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background: #333;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const LoadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const InfoIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const AlertIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const LockIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 2rem 0 1rem 0;
  letter-spacing: -0.01em;
`

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;

  @media (min-width: 640px) {
    gap: 1.25rem;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
`

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`

const ProductCardLink = styled(Link)`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  text-decoration: none;
  color: inherit;
`

const ProductImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f8f6f3;
  position: relative;
`

const ProductInfo = styled.div`
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const ProductActions = styled.div`
  padding: 0 1.25rem 1rem;
`

const CardTopMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`

const ItemTypeBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #666;
  background: #f0efec;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
`

const ConditionLabel = styled.span`
  font-size: 0.75rem;
  color: #888;
`

const ProductName = styled.h3`
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 0.35rem 0;
  color: #101010;
  line-height: 1.3;
`

const ProductDescription = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const ProductPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.75rem;
`

const CurrentPrice = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #101010;
`

const ComparePrice = styled.span`
  font-size: 0.9rem;
  color: #999;
  text-decoration: line-through;
`

const AddToCartButton = styled.button`
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.85rem;
  background: #101010;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
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
  min-height: 400px;
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

export default function PrivateSale() {
  const { saleId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { addItem } = useCart()
  const language = i18n.language || 'fr'
  
  const [sale, setSale] = useState(null)
  const [products, setProducts] = useState([])
  const [accessCode, setAccessCode] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Check if already verified (stored in sessionStorage)
  useEffect(() => {
    const verifiedData = sessionStorage.getItem(`sale_${saleId}_verified`)
    if (verifiedData) {
      try {
        const parsed = JSON.parse(verifiedData)
        const expiry = parsed.expiry || new Date().getTime() + 30 * 60 * 1000
        if (new Date().getTime() < expiry && parsed.verified) {
          setIsVerified(true)
          fetchSaleInfo()
          fetchProducts()
          return
        } else {
          // Expired, remove it
          sessionStorage.removeItem(`sale_${saleId}_verified`)
        }
      } catch (e) {
        // Legacy format, check if it's 'true'
        if (verifiedData === 'true') {
          setIsVerified(true)
          fetchSaleInfo()
          fetchProducts()
          return
        }
      }
    }
    fetchSaleInfo()
  }, [saleId])

  useEffect(() => {
    if (sale && sale.requiresAccessCode === false && isVerified) {
      fetchProducts()
    }
  }, [sale, isVerified])

  const fetchSaleInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/private-sales/${saleId}`)
      if (response.ok) {
        const data = await response.json()
        const saleData = data.sale
        setSale(saleData)
        if (saleData && saleData.requiresAccessCode === false) {
          setIsVerified(true)
          sessionStorage.setItem(`sale_${saleId}_verified`, JSON.stringify({ verified: true, expiry: new Date().getTime() + 30 * 60 * 1000 }))
        }
      } else {
        setError('Vente privée introuvable')
      }
    } catch (err) {
      setError('Erreur lors du chargement de la vente')
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (errorCode, error, language) => {
    if (!errorCode && error) {
      return error
    }

    switch (errorCode) {
      case 'SALE_NOT_STARTED':
        return language === 'en' 
          ? 'This sale hasn\'t started yet. Please check back later.'
          : 'Cette vente n\'a pas encore commencé. Revenez plus tard.'
      case 'SALE_ENDED':
        return language === 'en'
          ? 'This sale has ended. Thank you for your interest!'
          : 'Cette vente est terminée. Merci pour votre intérêt !'
      case 'SALE_INACTIVE':
        return language === 'en'
          ? 'This sale is currently inactive. Please contact support if you believe this is an error.'
          : 'Cette vente est actuellement inactive. Contactez le support si vous pensez qu\'il s\'agit d\'une erreur.'
      default:
        if (error) {
          return error
        }
        return language === 'en'
          ? 'Invalid access code. Please check and try again.'
          : 'Code d\'accès invalide. Vérifiez et réessayez.'
    }
  }

  const getErrorType = (errorCode) => {
    if (errorCode === 'SALE_NOT_STARTED' || errorCode === 'SALE_ENDED') {
      return 'warning'
    }
    return 'error'
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!accessCode.trim()) {
      setError({
        message: language === 'en' ? 'Please enter an access code' : 'Veuillez entrer un code d\'accès',
        type: 'error'
      })
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/private-sales/${saleId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accessCode })
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = data.error || (language === 'en' ? 'An error occurred' : 'Une erreur s\'est produite')
        let errorType = 'error'
        
        if (response.status === 401) {
          errorMessage = language === 'en' 
            ? 'Invalid access code. Please check and try again.'
            : 'Code d\'accès invalide. Vérifiez et réessayez.'
        } else if (response.status === 403) {
          errorMessage = getErrorMessage(data.errorCode, data.error, language)
          errorType = getErrorType(data.errorCode)
        } else if (response.status === 404) {
          errorMessage = language === 'en'
            ? 'Private sale not found.'
            : 'Vente privée introuvable.'
        } else if (response.status >= 500) {
          errorMessage = language === 'en'
            ? 'Server error. Please try again later.'
            : 'Erreur serveur. Veuillez réessayer plus tard.'
        }

        setError({
          message: errorMessage,
          type: errorType,
          errorCode: data.errorCode
        })
        return
      }

      if (data.verified) {
        setIsVerified(true)
        const expiry = new Date().getTime() + 30 * 60 * 1000
        sessionStorage.setItem(`sale_${saleId}_verified`, JSON.stringify({ verified: true, expiry }))
        fetchProducts()
      } else {
        setError({
          message: getErrorMessage(data.errorCode, data.error, language),
          type: getErrorType(data.errorCode),
          errorCode: data.errorCode
        })
      }
    } catch (err) {
      console.error('Error verifying access code:', err)
      setError({
        message: language === 'en' 
          ? 'Network error. Please check your connection and try again.'
          : 'Erreur réseau. Vérifiez votre connexion et réessayez.',
        type: 'error'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const response = await fetch(`${API_BASE_URL}/private-sales/${saleId}/products`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        setError('Impossible de charger les produits')
      }
    } catch (err) {
      setError('Erreur lors du chargement des produits')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleAddToCart = (product) => {
    addItem({
      ...product,
      price: product.price.toString()
    })
  }

  useSEO({
    title: sale ? (language === 'en' && sale.titleEn ? sale.titleEn : sale.title) : 'Vente Privée',
    description: sale?.description || 'Accédez à notre vente privée exclusive'
  })

  if (isLoading) {
    return (
      <Container>
        <Header>
          <BackLink to="/">← {t('common.backToHome')}</BackLink>
          <Logo to="/">Emmanuelle K</Logo>
          <HeaderRight>
            <CartButton />
          </HeaderRight>
        </Header>
        <LoadingContainer>
          <Spinner />
          <p>Chargement...</p>
        </LoadingContainer>
      </Container>
    )
  }

  if (!sale) {
    return (
      <Container>
        <Header>
          <BackLink to="/">← {t('common.backToHome')}</BackLink>
          <Logo to="/">Emmanuelle K</Logo>
          <HeaderRight>
            <CartButton />
          </HeaderRight>
        </Header>
        <Main>
          <ErrorMessage>
            {error || 'Vente privée introuvable'}
          </ErrorMessage>
        </Main>
      </Container>
    )
  }

  const displayTitle = language === 'en' && sale.titleEn ? sale.titleEn : sale.title
  const displayDescription = language === 'en' && sale.descriptionEn ? sale.descriptionEn : sale.description

  return (
    <Container>
      <Header>
        <BackLink to="/">← {t('common.backToHome')}</BackLink>
        <Logo to="/">Emmanuelle K</Logo>
        <HeaderRight>
          <CartButton />
        </HeaderRight>
      </Header>
      <Main>
        {!isVerified ? (
          <AccessFormContainer>
            {sale.imageUrl && (
              <SaleImage>
                <img src={sale.imageUrl} alt={displayTitle} />
              </SaleImage>
            )}
            <SaleTitle>{displayTitle}</SaleTitle>
            {displayDescription && (
              <SaleDescription>{displayDescription}</SaleDescription>
            )}
            <AccessForm onSubmit={handleVerify}>
              <InputGroup>
                <Label htmlFor="accessCode">
                  {language === 'en' ? 'Access Code' : 'Code d\'accès'}
                </Label>
                <Input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value.toUpperCase())
                    if (error) {
                      setError(null)
                    }
                  }}
                  placeholder={language === 'en' ? 'Enter your access code' : 'Entrez votre code d\'accès'}
                  autoFocus
                  $hasError={!!error && error.type !== 'warning'}
                  disabled={isVerifying}
                />
              </InputGroup>
              {error && (
                <ErrorMessage $type={error.type || 'error'}>
                  {error.type === 'warning' ? <AlertIcon /> : <InfoIcon />}
                  <span>{error.message}</span>
                </ErrorMessage>
              )}
              <SubmitButton type="submit" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <LoadingSpinner />
                    {language === 'en' ? 'Verifying...' : 'Vérification...'}
                  </>
                ) : (
                  <>
                    <LockIcon />
                    {language === 'en' ? 'Access this sale' : 'Accéder à cette vente'}
                  </>
                )}
              </SubmitButton>
            </AccessForm>
          </AccessFormContainer>
        ) : (
          <>
            <section aria-label={language === 'en' ? 'Items for sale' : 'Articles à la vente'}>
              <SectionTitle>
                {language === 'en' ? 'Items for sale' : 'Articles à la vente'}
              </SectionTitle>

            {isLoadingProducts ? (
              <LoadingContainer>
                <Spinner />
                <p>{language === 'en' ? 'Loading items...' : 'Chargement des articles...'}</p>
              </LoadingContainer>
            ) : products.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                {language === 'en' ? 'No items in this sale yet.' : 'Aucun article pour le moment.'}
              </p>
            ) : (
              <ProductsGrid>
                {products.map((product) => {
                  const mainImage = (product.images && product.images[0]) || product.imageUrl
                  const inStock = product.inStock !== false && (product.stock == null || product.stock > 0)
                  return (
                    <ProductCard key={product.id}>
                      <ProductCardLink to={`/shop/sale/${saleId}/item/${String(product.id)}`}>
                        <ProductImageWrapper>
                          <OptimizedImage
                            src={mainImage}
                            alt={product.name}
                            aspectRatio="1"
                            loading="lazy"
                          />
                        </ProductImageWrapper>
                        <ProductInfo>
                          <CardTopMeta>
                            {product.itemType && (
                              <ItemTypeBadge>{product.itemType}</ItemTypeBadge>
                            )}
                            {product.condition && (
                              <ConditionLabel>{product.condition}</ConditionLabel>
                            )}
                          </CardTopMeta>
                          <ProductName>
                            {language === 'en' && product.nameEn ? product.nameEn : product.name}
                          </ProductName>
                          {product.description && (
                            <ProductDescription>{product.description}</ProductDescription>
                          )}
                          <ProductPrice>
                            <CurrentPrice>{product.price}€</CurrentPrice>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <ComparePrice>{product.compareAtPrice}€</ComparePrice>
                            )}
                          </ProductPrice>
                        </ProductInfo>
                      </ProductCardLink>
                      <ProductActions>
                        <AddToCartButton
                          onClick={() => handleAddToCart(product)}
                          disabled={!inStock}
                        >
                          {inStock ? 'Ajouter au panier' : 'Indisponible'}
                        </AddToCartButton>
                      </ProductActions>
                    </ProductCard>
                  )
                })}
              </ProductsGrid>
            )}
            </section>
          </>
        )}
      </Main>
    </Container>
  )
}
