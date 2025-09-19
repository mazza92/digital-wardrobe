import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import outfitsData from '../data/outfits.json'

const MainContainer = styled.div`
  min-height: 100vh;
  background: #fafafa;
  color: #1a1a1a;
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

const BrandName = styled.h1`
  font-size: 1.1rem;
  font-weight: 300;
  margin: 0;
  letter-spacing: 3px;
  color: #1a1a1a;
`

const NavLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-weight: 400;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #1a1a1a;
    background-color: #f5f5f5;
  }
`

const InfluencerSection = styled.section`
  padding: 2rem 1.5rem 1rem;
  text-align: center;
  background: white;
  margin-bottom: 1rem;
`

const InfluencerImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  margin: 0 auto 1rem;
  border: 2px solid #f0f0f0;
`

const InfluencerName = styled.h2`
  font-size: 1.2rem;
  font-weight: 400;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
  letter-spacing: 1px;
`

const InfluencerBio = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
  max-width: 280px;
  margin: 0 auto;
`

const OutfitsSection = styled.section`
  padding: 0 1.5rem 2rem;
`

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 1.5rem 0;
  color: #1a1a1a;
  text-align: center;
  letter-spacing: 1px;
`

const OutfitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
`

const OutfitCard = styled(Link)`
  position: relative;
  aspect-ratio: 0.75;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`

const OutfitImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  position: relative;
`

const OutfitOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 1rem 0.75rem 0.75rem;
  color: white;
`

const OutfitTitle = styled.h4`
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
  letter-spacing: 0.5px;
`

const ShopButton = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #1a1a1a;
  opacity: 0;
  transition: all 0.3s ease;
  
  ${OutfitCard}:hover & {
    opacity: 1;
  }
`

const Footer = styled.footer`
  background: white;
  padding: 2rem 1.5rem;
  text-align: center;
  border-top: 1px solid #f0f0f0;
  margin-top: 2rem;
`

const FooterText = styled.p`
  font-size: 0.8rem;
  color: #999;
  margin: 0;
  line-height: 1.4;
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
      <Header>
        <BrandName>{influencer?.brand}</BrandName>
        <NavLink to="/about">About</NavLink>
      </Header>
      
      <InfluencerSection>
        <InfluencerImage image={influencer?.heroImage} />
        <InfluencerName>{influencer?.name}</InfluencerName>
        <InfluencerBio>{influencer?.bio}</InfluencerBio>
      </InfluencerSection>
      
      <OutfitsSection>
        <SectionTitle>Latest Outfits</SectionTitle>
        <OutfitsGrid>
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.id} to={`/outfits/${outfit.id}`}>
              <OutfitImage image={outfit.image} />
              <ShopButton>→</ShopButton>
              <OutfitOverlay>
                <OutfitTitle>{outfit.title}</OutfitTitle>
              </OutfitOverlay>
            </OutfitCard>
          ))}
        </OutfitsGrid>
      </OutfitsSection>
      
      <Footer>
        <FooterText>
          Tap any outfit to shop the look • All items are shoppable
        </FooterText>
      </Footer>
    </MainContainer>
  )
}

export default MainPortal
