import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import outfitsData from '../data/outfits.json'

const DetailContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 2rem;
`

const Header = styled.header`
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #667eea;
  }
`

const BrandName = styled.h1`
  font-size: 1.2rem;
  font-weight: 300;
  margin: 0;
  color: #333;
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  border: 3px solid white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    transform: scale(1.2);
    background: #5a6fd8;
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
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 20;
  min-width: 200px;
  max-width: 250px;
  transform: translate(-50%, -100%);
  margin-top: -10px;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid white;
  }
`

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
`

const ProductBrand = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 0.5rem 0;
`

const ProductPrice = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
  margin: 0 0 1rem 0;
`

const ShopButton = styled.a`
  display: block;
  background: #667eea;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: #5a6fd8;
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
