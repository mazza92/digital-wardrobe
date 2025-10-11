import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useFavorites } from '../../hooks/useFavorites'
import { fetchOutfits } from '../../utils/api'
import FavoritesList from '../ui/FavoritesList'
import FavoritesButton from '../ui/CartButton'

const DetailContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding-bottom: 2rem;
`

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`


const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    color: #1a1a1a;
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateX(-2px);
  }
`

const BrandName = styled.h1`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
  letter-spacing: 1px;
`

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: start;
  }
`

const ImageSection = styled.div`
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: visible;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    margin-bottom: 0;
    position: sticky;
    top: 120px;
  }
`

const ImageContainer = styled.div`
  position: relative;
  background: #f8f8f8;
  cursor: crosshair;
  background-image: url(${props => props.image});
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  width: 100%;
  aspect-ratio: 3/4;
  overflow: visible;
  
  @media (min-width: 768px) {
    aspect-ratio: 4/5;
  }
`

const ProductTag = styled.button`
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.$isHovered 
    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
    : 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)'};
  border: 3px solid white;
  cursor: pointer;
  box-shadow: ${props => props.$isHovered 
    ? '0 0 0 6px rgba(59, 130, 246, 0.15), 0 6px 30px rgba(59, 130, 246, 0.25)' 
    : '0 4px 20px rgba(0, 0, 0, 0.3)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${props => props.$isHovered ? 'scale(1.2)' : 'scale(1)'};
  
  &:hover {
    transform: scale(1.3);
    background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
  }
  
  &::after {
    content: '';
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
  }
`

const ProductPopup = styled.div`
  position: absolute;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  z-index: 20;
  min-width: 220px;
  max-width: 280px;
  transform: ${props => props.$transform || 'translate(-50%, -100%)'};
  margin-top: ${props => props.$arrowPosition === 'bottom' ? '-12px' : '12px'};
  border: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20px);
  
  &::after {
    content: '';
    position: absolute;
    ${props => props.$arrowPosition === 'top' ? 'bottom: 100%;' : 'top: 100%;'}
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    ${props => props.$arrowPosition === 'top' 
      ? 'border-bottom: 12px solid white;' 
      : 'border-top: 12px solid white;'}
    display: ${props => props.$arrowPosition === 'none' ? 'none' : 'block'};
  }
`

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
  letter-spacing: 0.5px;
`

const ProductBrand = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 0.75rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const ProductPrice = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
`

const ShopButton = styled.a`
  display: block;
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  color: white;
  text-decoration: none;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
  
  &:hover {
    background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`

const ClosePopup = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
    color: #333;
  }
`

const InfoSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
`

const OutfitTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #1a1a1a;
  line-height: 1.2;
  letter-spacing: -0.5px;
  
  @media (max-width: 767px) {
    font-size: 1.75rem;
  }
`

const OutfitDescription = styled.p`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.7;
  margin: 0 0 2rem 0;
  font-weight: 400;
`

const ProductsSection = styled.div`
  margin-top: 2rem;
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  color: #1a1a1a;
  letter-spacing: 0.5px;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
    border-radius: 2px;
  }
`

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (min-width: 480px) {
    gap: 1.25rem;
  }
  
  @media (min-width: 768px) {
    gap: 1.5rem;
  }
`

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  border: 2px solid ${props => props.$isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 0, 0, 0.06)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.$isHovered 
      ? '0 12px 24px rgba(59, 130, 246, 0.15)' 
      : '0 12px 24px rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.$isHovered 
      ? 'rgba(59, 130, 246, 0.3)' 
      : 'rgba(0, 0, 0, 0.1)'};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$isHovered 
      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
      : 'transparent'};
    transition: all 0.3s ease;
    z-index: 1;
  }
`

const ProductThumbnail = styled.div`
  width: 100%;
  height: 140px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '👗';
    font-size: 2.5rem;
    opacity: 0.4;
  }
`

const ProductCardContent = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const ProductCardName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
  line-height: 1.2;
`

const ProductCardBrand = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 0.75rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const ProductCardPrice = styled.p`
  font-size: 1.1rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
`

const ProductCardActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: auto;
`

const ProductCardButton = styled.a`
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  color: white;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  
  &:hover {
    background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
`

const AddToCartButton = styled.button`
  background: ${props => props.$isFavorited 
    ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'};
  color: ${props => props.$isFavorited ? 'white' : '#666'};
  border: 2px solid ${props => props.$isFavorited ? '#dc2626' : '#e9ecef'};
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  
  &:hover {
    background: ${props => props.$isFavorited 
      ? 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)' 
      : 'linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%)'};
    border-color: ${props => props.$isFavorited ? '#b91c1c' : '#dee2e6'};
    color: ${props => props.$isFavorited ? 'white' : '#333'};
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const InfluencerSection = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
`

const InfluencerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`

const InfluencerAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  border: 2px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`

const InfluencerInfo = styled.div`
  flex: 1;
`

const InfluencerName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
`

const InfluencerBrand = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  font-weight: 500;
`

const InfluencerBio = styled.p`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
`

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`

const SocialLink = styled.a`
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.05);
  }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1.5rem;
`

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1a1a1a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const LoadingText = styled.p`
  color: #666;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
`

function OutfitDetail() {
  const { outfitId } = useParams()
  const navigate = useNavigate()
  const [outfit, setOutfit] = useState(null)
  const [influencer, setInfluencer] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredProductId, setHoveredProductId] = useState(null)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  
  const {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    getFavoritesCount
  } = useFavorites()

  useEffect(() => {
    fetchData()
  }, [outfitId])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const data = await fetchOutfits()
      const foundOutfit = data.outfits.find(o => o.id === outfitId)
      setOutfit(foundOutfit)
      setInfluencer(data.influencer)
    } catch (err) {
      console.log('Using fallback data:', err.message)
      const fallbackData = await import('../../data/outfits.json')
      const foundOutfit = fallbackData.default.outfits.find(o => o.id === outfitId)
      setOutfit(foundOutfit)
      setInfluencer(fallbackData.default.influencer)
    } finally {
      setIsLoading(false)
    }
  }

  // Smart positioning function to avoid edges
  const getSmartPosition = (x, y) => {
    const tagSize = 28
    const margin = 25 // Increased margin for better safety
    
    // Adjust horizontal position if too close to edges
    let adjustedX = x
    if (x < margin) {
      adjustedX = margin
    } else if (x > 100 - margin) {
      adjustedX = 100 - margin
    }
    
    // Much more aggressive vertical positioning to prevent cropping
    let adjustedY = y
    if (y < 12) { // Very close to top edge - force down
      adjustedY = 12
    } else if (y < 20) { // Close to top edge - force down more
      adjustedY = 20
    } else if (y < margin) { // Still too close to top
      adjustedY = margin
    } else if (y > 100 - margin) {
      adjustedY = 100 - margin
    }
    
    return { x: adjustedX, y: adjustedY }
  }

  const handleProductClick = (product, event) => {
    event.stopPropagation()
    const rect = event.currentTarget.getBoundingClientRect()
    const containerRect = event.currentTarget.parentElement.getBoundingClientRect()
    
    // Calculate popup dimensions (approximate)
    const popupWidth = 250 // max-width from styled component
    const popupHeight = 200 // estimated height
    const popupMargin = 30 // increased margin from edges for safety
    
    // Calculate tag center position relative to container
    const tagCenterX = rect.left - containerRect.left + rect.width / 2
    const tagCenterY = rect.top - containerRect.top + rect.height / 2
    
    // Smart positioning logic
    let popupX = tagCenterX
    let popupY = tagCenterY
    let popupTransform = 'translate(-50%, -100%)' // default: above tag
    let arrowPosition = 'bottom' // default arrow position
    
    // Check if popup would go outside container bounds
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height
    
    // Horizontal positioning
    if (popupX - popupWidth / 2 < popupMargin) {
      popupX = popupMargin + popupWidth / 2
    } else if (popupX + popupWidth / 2 > containerWidth - popupMargin) {
      popupX = containerWidth - popupMargin - popupWidth / 2
    }
    
    // Vertical positioning - check if there's space above (be more conservative)
    const spaceAbove = tagCenterY
    const spaceBelow = containerHeight - tagCenterY
    const requiredSpaceAbove = popupHeight + popupMargin + 20 // extra buffer for top
    const requiredSpaceBelow = popupHeight + popupMargin
    
    if (spaceAbove < requiredSpaceAbove && spaceBelow > requiredSpaceBelow) {
      // Not enough space above, position below
      popupY = tagCenterY + rect.height / 2 + popupMargin
      popupTransform = 'translate(-50%, 0%)'
      arrowPosition = 'top'
    } else if (spaceAbove > requiredSpaceAbove) {
      // Enough space above, position above (default)
      popupY = tagCenterY - rect.height / 2 - popupMargin
      popupTransform = 'translate(-50%, -100%)'
      arrowPosition = 'bottom'
    } else {
      // Not enough space in either direction, position in center
      popupY = containerHeight / 2
      popupTransform = 'translate(-50%, -50%)'
      arrowPosition = 'none'
    }
    
    setSelectedProduct(product)
    setPopupPosition({
      x: popupX,
      y: popupY,
      transform: popupTransform,
      arrowPosition: arrowPosition
    })
  }

  const handleImageClick = () => {
    setSelectedProduct(null)
  }

  const convertToEuros = (priceString) => {
    if (!priceString) return '0 €'
    
    // Extract number from price string (handles $89.99, €89.99, etc.)
    const priceNumber = parseFloat(priceString.replace(/[^0-9.-]+/g, ''))
    if (isNaN(priceNumber)) return priceString
    
    // Convert USD to EUR (approximate rate: 1 USD = 0.85 EUR)
    const euroPrice = Math.round(priceNumber * 0.85 * 100) / 100
    return `${euroPrice.toFixed(2)} €`
  }

  const handleToggleFavorite = (product) => {
    toggleFavorite(product)
    // Simple feedback without inline styles - let styled-components handle the styling
    const button = document.querySelector(`[data-product-id="${product.id}"]`)
    if (button) {
      const isCurrentlyFavorited = isFavorited(product.id)
      const originalText = button.textContent
      button.textContent = isCurrentlyFavorited ? '♥ Sauvé!' : 'Ajouté!'
      
      setTimeout(() => {
        button.textContent = originalText
      }, 1000)
    }
  }

  if (isLoading) {
    return (
      <DetailContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading outfit...</LoadingText>
        </LoadingContainer>
      </DetailContainer>
    )
  }

  if (!outfit) {
    return (
      <DetailContainer>
        <Header>
          <BackButton onClick={() => navigate('/')}>
            ← Retour
          </BackButton>
          <BrandName>Outfit Not Found</BrandName>
        </Header>
      </DetailContainer>
    )
  }

  return (
    <DetailContainer>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/')}>
            ← Retour
          </BackButton>
          <BrandName>{influencer?.brand || 'Virtual Wardrobe'}</BrandName>
        </HeaderLeft>
        <HeaderRight>
          <FavoritesButton 
            onClick={() => setIsFavoritesOpen(true)} 
            favoritesCount={getFavoritesCount()} 
          />
        </HeaderRight>
      </Header>
      
      <MainContent>
        <ImageSection>
          <ImageContainer image={outfit.image} onClick={handleImageClick}>
            {outfit.products.map((product) => {
              const smartPos = getSmartPosition(product.x, product.y)
              return (
                <ProductTag
                  key={product.id}
                  style={{
                    left: `${smartPos.x}%`,
                    top: `${smartPos.y}%`
                  }}
                  onClick={(e) => handleProductClick(product, e)}
                  $isHovered={hoveredProductId === product.id}
                />
              )
            })}
            
            {selectedProduct && (
              <ProductPopup
                style={{
                  left: `${popupPosition.x}px`,
                  top: `${popupPosition.y}px`
                }}
                $transform={popupPosition.transform}
                $arrowPosition={popupPosition.arrowPosition}
              >
                <ClosePopup onClick={() => setSelectedProduct(null)}>×</ClosePopup>
                <ProductName>{selectedProduct.name}</ProductName>
                <ProductBrand>{selectedProduct.brand}</ProductBrand>
                <ProductPrice>{convertToEuros(selectedProduct.price)}</ProductPrice>
                <ShopButton 
                  href={selectedProduct.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Acheter
                </ShopButton>
              </ProductPopup>
            )}
          </ImageContainer>
        </ImageSection>
        
        <InfoSection>
          <OutfitTitle>{outfit.title}</OutfitTitle>
          <OutfitDescription>{outfit.description}</OutfitDescription>
          
          <ProductsSection>
            <SectionTitle>Acheter ce Look</SectionTitle>
            <ProductsGrid>
              {outfit.products.map((product) => (
                <ProductCard 
                  key={product.id}
                  $isHovered={hoveredProductId === product.id}
                  onMouseEnter={() => setHoveredProductId(product.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                >
                  <ProductThumbnail />
                  <ProductCardContent>
                    <ProductCardName>{product.name}</ProductCardName>
                    <ProductCardBrand>{product.brand}</ProductCardBrand>
                    <ProductCardPrice>{convertToEuros(product.price)}</ProductCardPrice>
                    <ProductCardActions>
                      <ProductCardButton 
                        href={product.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Acheter
                      </ProductCardButton>
                      <AddToCartButton 
                        onClick={() => handleToggleFavorite(product)}
                        data-product-id={product.id}
                        $isFavorited={isFavorited(product.id)}
                      >
                        {isFavorited(product.id) ? '♥ Sauvé' : 'Sauvegarder'}
                      </AddToCartButton>
                    </ProductCardActions>
                  </ProductCardContent>
                </ProductCard>
              ))}
            </ProductsGrid>
          </ProductsSection>
          
          {influencer && (
            <InfluencerSection>
              <InfluencerHeader>
                <InfluencerAvatar image={influencer.heroImage} />
                <InfluencerInfo>
                  <InfluencerName>{influencer.name}</InfluencerName>
                  <InfluencerBrand>{influencer.brand}</InfluencerBrand>
                </InfluencerInfo>
              </InfluencerHeader>
              <InfluencerBio>{influencer.bio}</InfluencerBio>
              <SocialLinks>
                <SocialLink href={influencer.socialMedia?.instagram} target="_blank">
                  Instagram
                </SocialLink>
                <SocialLink href={influencer.socialMedia?.tiktok} target="_blank">
                  TikTok
                </SocialLink>
                <SocialLink href={influencer.socialMedia?.youtube} target="_blank">
                  YouTube
                </SocialLink>
              </SocialLinks>
            </InfluencerSection>
          )}
        </InfoSection>
      </MainContent>
      
      <FavoritesList
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={removeFromFavorites}
        onClearFavorites={() => {
          if (confirm('Are you sure you want to clear all favorites?')) {
            removeFromFavorites()
          }
        }}
      />
    </DetailContainer>
  )
}

export default OutfitDetail