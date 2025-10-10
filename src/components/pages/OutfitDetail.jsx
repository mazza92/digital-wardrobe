import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useFavorites } from '../../hooks/useFavorites'
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
  overflow: hidden;
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
  
  @media (min-width: 768px) {
    aspect-ratio: 4/5;
  }
`

const ProductTag = styled.button`
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  border: 3px solid white;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  
  &:hover {
    transform: scale(1.4);
    background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
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
  transform: translate(-50%, -100%);
  margin-top: -12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20px);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-top: 12px solid white;
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
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: #1a1a1a;
  letter-spacing: 0.5px;
`

const ProductsGrid = styled.div`
  display: grid;
  gap: 1rem;
  
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const ProductCard = styled.div`
  background: #f8f9fa;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    background: white;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`

const ProductCardName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
`

const ProductCardBrand = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 0.75rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const ProductCardPrice = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
`

const ProductCardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ProductCardButton = styled.a`
  flex: 1;
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  color: white;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
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
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  
  &:hover {
    background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
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
      const response = await fetch('http://localhost:3000/api/outfits/export?' + Date.now())
      if (response.ok) {
        const data = await response.json()
        const foundOutfit = data.outfits.find(o => o.id === outfitId)
        setOutfit(foundOutfit)
        setInfluencer(data.influencer)
      } else {
        throw new Error('API not available')
      }
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

  const handleProductClick = (product, event) => {
    event.stopPropagation()
    const rect = event.currentTarget.getBoundingClientRect()
    const containerRect = event.currentTarget.parentElement.getBoundingClientRect()
    
    setSelectedProduct(product)
    setPopupPosition({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top
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
    // Show a brief success message
    const button = document.querySelector(`[data-product-id="${product.id}"]`)
    if (button) {
      const isCurrentlyFavorited = isFavorited(product.id)
      const originalText = button.textContent
      button.textContent = isCurrentlyFavorited ? 'Removed!' : 'Added!'
      button.style.background = isCurrentlyFavorited 
        ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
        : 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
      setTimeout(() => {
        button.textContent = originalText
        button.style.background = isCurrentlyFavorited
          ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
          : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
      }, 1500)
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
            {outfit.products.map((product) => (
              <ProductTag
                key={product.id}
                style={{
                  left: `${product.x}%`,
                  top: `${product.y}%`
                }}
                onClick={(e) => handleProductClick(product, e)}
              />
            ))}
            
            {selectedProduct && (
              <ProductPopup
                style={{
                  left: `${popupPosition.x}px`,
                  top: `${popupPosition.y}px`
                }}
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
                <ProductCard key={product.id}>
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
                    >
                      {isFavorited(product.id) ? '♥ Sauvé' : 'Sauvegarder'}
                    </AddToCartButton>
                  </ProductCardActions>
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