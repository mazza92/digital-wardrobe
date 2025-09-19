import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import outfitsData from '../data/outfits.json'

const DetailContainer = styled.div`
  min-height: 100vh;
  background: #fafafa;
  padding-bottom: 2rem;
`

const Header = styled.header`
  background: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
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
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #1a1a1a;
    background-color: #f5f5f5;
  }
`

const BrandName = styled.h1`
  font-size: 1rem;
  font-weight: 300;
  margin: 0;
  color: #1a1a1a;
  letter-spacing: 2px;
`

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 70vh;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  cursor: crosshair;
`

const ProductTag = styled.button`
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 2px solid white;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    transform: scale(1.3);
    background: #333;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
  }
`

const ProductPopup = styled.div`
  position: absolute;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 20;
  min-width: 180px;
  max-width: 220px;
  transform: translate(-50%, -100%);
  margin-top: -8px;
  border: 1px solid #f0f0f0;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid white;
  }
`

const ProductName = styled.h3`
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
  letter-spacing: 0.5px;
`

const ProductBrand = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 0.5rem 0;
  font-weight: 400;
`

const ProductPrice = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.75rem 0;
`

const ShopButton = styled.a`
  display: block;
  background: #1a1a1a;
  color: white;
  text-decoration: none;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #333;
    transform: translateY(-1px);
  }
`

const OutfitInfo = styled.div`
  padding: 2rem;
  background: white;
  margin: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`

const OutfitTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #333;
`

const OutfitDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
`

const ClosePopup = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
  
  &:hover {
    color: #333;
  }
`

function OutfitDetail() {
  const { outfitId } = useParams()
  const navigate = useNavigate()
  const [outfit, setOutfit] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const foundOutfit = outfitsData.outfits.find(o => o.id === outfitId)
    setOutfit(foundOutfit)
  }, [outfitId])

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

  if (!outfit) {
    return (
      <DetailContainer>
        <Header>
          <BackButton onClick={() => navigate('/')}>
            ← Back
          </BackButton>
          <BrandName>Outfit Not Found</BrandName>
        </Header>
      </DetailContainer>
    )
  }

  return (
    <DetailContainer>
      <Header>
        <BackButton onClick={() => navigate('/')}>
          ← Back
        </BackButton>
        <BrandName>{outfitsData.influencer.brand}</BrandName>
      </Header>
      
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
            <ProductPrice>{selectedProduct.price}</ProductPrice>
            <ShopButton 
              href={selectedProduct.link} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Shop Now
            </ShopButton>
          </ProductPopup>
        )}
      </ImageContainer>
      
      <OutfitInfo>
        <OutfitTitle>{outfit.title}</OutfitTitle>
        <OutfitDescription>{outfit.description}</OutfitDescription>
      </OutfitInfo>
    </DetailContainer>
  )
}

export default OutfitDetail
