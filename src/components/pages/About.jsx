import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useSEO, seoConfig } from '../../hooks/useSEO'
import { useOutfits } from '../../hooks/useOutfits'
import { resolveHeroTagline } from '../../utils/heroCopy'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const AboutContainer = styled.div`
  min-height: 100vh;
  background: #FDFCF8;
  color: #101010;
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

const BackButton = styled(Link)`
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
  
  @media (min-width: 480px) {
    font-size: 0.9rem;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    margin-right: 1rem;
  }
  
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

const BrandName = styled(Link)`
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
  color: #101010;
  font-family: serif;
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
  color: #101010;
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
  color: #101010;
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
  background: #101010;
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
  color: #101010;
`

const CTAText = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 1.25rem 0;
  line-height: 1.5;
`

const ShopButton = styled(Link)`
  display: inline-block;
  background: #101010;
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
  const { t, i18n } = useTranslation()
  const { influencer } = useOutfits()
  const socialMedia = influencer?.socialMedia || {}

  useSEO(seoConfig.about)

  if (!influencer) {
    return (
      <AboutContainer>
        <div style={{ padding: '2rem', textAlign: 'center' }}>{t('loading.default', 'Chargement...')}</div>
      </AboutContainer>
    )
  }

  const displayBio = resolveHeroTagline(i18n.language, influencer, t)

  return (
    <AboutContainer>
      <Header>
        <BackButton to="/">
          ← {t('common.backToHome')}
        </BackButton>
        <BrandName to="/">{influencer.name}</BrandName>
        <LanguageSwitcher />
      </Header>
      
      <Content>
        <ProfileImage image={influencer.heroImage} />
        <Name>{influencer.name}</Name>
        {displayBio && <Bio>{displayBio}</Bio>}
        
        <SocialSection>
          <SectionTitle>{t('about.follow')}</SectionTitle>
          <SocialLinks>
            {socialMedia.instagram && (
              <SocialLink href={socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                <SocialIcon>IG</SocialIcon>
                Instagram
              </SocialLink>
            )}
            {socialMedia.tiktok && (
              <SocialLink href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer">
                <SocialIcon>TikTok</SocialIcon>
                TikTok
              </SocialLink>
            )}
            {socialMedia.website && (
              <SocialLink href={socialMedia.website} target="_blank" rel="noopener noreferrer">
                <SocialIcon>Web</SocialIcon>
                {t('about.website', 'Site web')}
              </SocialLink>
            )}
            {socialMedia.email && (
              <SocialLink href={socialMedia.email.startsWith('mailto:') ? socialMedia.email : `mailto:${socialMedia.email}`}>
                <SocialIcon>@</SocialIcon>
                Email
              </SocialLink>
            )}
          </SocialLinks>
        </SocialSection>
        
        <CTA>
          <CTATitle>{t('about.shopCollection')}</CTATitle>
          <CTAText>
            {t('about.shopMyStyle')}
          </CTAText>
          <ShopButton to="/">{t('nav.outfits')}</ShopButton>
        </CTA>
      </Content>
    </AboutContainer>
  )
}

export default About
