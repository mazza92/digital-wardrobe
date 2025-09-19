import { Link } from 'react-router-dom'
import styled from 'styled-components'
import outfitsData from '../data/outfits.json'

const AboutContainer = styled.div`
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
  backdrop-filter: blur(20px);
`

const BackButton = styled(Link)`
  color: #666;
  text-decoration: none;
  font-size: 1rem;
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

const Content = styled.div`
  padding: 2rem 1.5rem;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
`

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  border: 2px solid #f0f0f0;
  margin: 0 auto 1.5rem auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`

const Name = styled.h1`
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0 0 0.5rem 0;
  letter-spacing: 1px;
  color: #1a1a1a;
`

const Bio = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  color: #666;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
`

const SocialSection = styled.section`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 1.5rem 0;
  text-align: center;
  color: #1a1a1a;
  letter-spacing: 1px;
`

const SocialLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
`

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f8f8;
  border-radius: 8px;
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 400;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0f0f0;
    transform: translateY(-1px);
  }
`

const SocialIcon = styled.div`
  width: 20px;
  height: 20px;
  background: #1a1a1a;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  color: white;
`

const CTA = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`

const CTATitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 0.75rem 0;
  color: #1a1a1a;
`

const CTAText = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 1.25rem 0;
  line-height: 1.5;
`

const ShopButton = styled(Link)`
  display: inline-block;
  background: #1a1a1a;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #333;
    transform: translateY(-1px);
  }
`

function About() {
  const { influencer, socialMedia } = outfitsData

  return (
    <AboutContainer>
      <Header>
        <BackButton to="/">
          ← Back
        </BackButton>
        <BrandName>{influencer.brand}</BrandName>
      </Header>
      
      <Content>
        <ProfileImage image={influencer.heroImage} />
        <Name>{influencer.name}</Name>
        <Bio>{influencer.bio}</Bio>
        
        <SocialSection>
          <SectionTitle>Follow Me</SectionTitle>
          <SocialLinks>
            <SocialLink href={socialMedia.instagram} target="_blank" rel="noopener noreferrer">
              <SocialIcon>IG</SocialIcon>
              Instagram
            </SocialLink>
            <SocialLink href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer">
              <SocialIcon>TT</SocialIcon>
              TikTok
            </SocialLink>
            <SocialLink href={socialMedia.youtube} target="_blank" rel="noopener noreferrer">
              <SocialIcon>YT</SocialIcon>
              YouTube
            </SocialLink>
            <SocialLink href={socialMedia.pinterest} target="_blank" rel="noopener noreferrer">
              <SocialIcon>P</SocialIcon>
              Pinterest
            </SocialLink>
          </SocialLinks>
        </SocialSection>
        
        <CTA>
          <CTATitle>Shop My Style</CTATitle>
          <CTAText>
            Discover all my favorite pieces and recreate these looks for yourself. 
            Click on any outfit to shop the individual items.
          </CTAText>
          <ShopButton to="/">View Outfits</ShopButton>
        </CTA>
      </Content>
    </AboutContainer>
  )
}

export default About
