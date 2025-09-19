import { Link } from 'react-router-dom'
import styled from 'styled-components'
import outfitsData from '../data/outfits.json'

const AboutContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`

const Header = styled.header`
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const BackButton = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    opacity: 0.8;
  }
`

const BrandName = styled.h1`
  font-size: 1.2rem;
  font-weight: 300;
  margin: 0;
`

const Content = styled.div`
  padding: 3rem 2rem;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`

const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  border: 4px solid rgba(255, 255, 255, 0.3);
  margin: 0 auto 2rem auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`

const Name = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  margin: 0 0 1rem 0;
  letter-spacing: 2px;
`

const Bio = styled.p`
  font-size: 1.1rem;
  line-height: 1.8;
  margin: 0 0 3rem 0;
  opacity: 0.9;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`

const SocialSection = styled.section`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0 0 2rem 0;
  text-align: center;
`

const SocialLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`

const SocialIcon = styled.div`
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #667eea;
`

const CTA = styled.div`
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
`

const CTATitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 400;
  margin: 0 0 1rem 0;
`

const CTAText = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
`

const ShopButton = styled(Link)`
  display: inline-block;
  background: white;
  color: #667eea;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
