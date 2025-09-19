import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import outfitsData from '../data/outfits.json'

const MainContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`

const HeroSection = styled.section`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
`

const HeroImage = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  border: 4px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`

const BrandName = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`

const Tagline = styled.p`
  font-size: 1.1rem;
  margin: 1rem 0 3rem 0;
  opacity: 0.9;
  max-width: 300px;
  line-height: 1.6;
`

const OutfitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
`

const OutfitCard = styled(Link)`
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
`

const OutfitImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
`

const OutfitOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1rem;
  color: white;
`

const OutfitTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
`

const Navigation = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
`

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }
`

const ScrollArrow = styled.div`
  width: 2px;
  height: 30px;
  background: white;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -3px;
    width: 8px;
    height: 8px;
    border-right: 2px solid white;
    border-bottom: 2px solid white;
    transform: rotate(45deg);
  }
`

function MainPortal() {
  const [outfits, setOutfits] = useState([])
  const [influencer, setInfluencer] = useState(null)

  useEffect(() => {
    setOutfits(outfitsData.outfits)
    setInfluencer(outfitsData.influencer)
  }, [])

  return (
    <MainContainer>
      <Navigation>
        <BrandName style={{ fontSize: '1.2rem', margin: 0 }}>
          {influencer?.brand}
        </BrandName>
        <NavLink to="/about">About</NavLink>
      </Navigation>
      
      <HeroSection>
        <HeroImage image={influencer?.heroImage} />
        <BrandName>{influencer?.name}</BrandName>
        <Tagline>{influencer?.bio}</Tagline>
        <ScrollIndicator>
          <ScrollArrow />
        </ScrollIndicator>
      </HeroSection>
      
      <OutfitsGrid>
        {outfits.map((outfit) => (
          <OutfitCard key={outfit.id} to={`/outfits/${outfit.id}`}>
            <OutfitImage image={outfit.image} />
            <OutfitOverlay>
              <OutfitTitle>{outfit.title}</OutfitTitle>
            </OutfitOverlay>
          </OutfitCard>
        ))}
      </OutfitsGrid>
    </MainContainer>
  )
}

export default MainPortal
