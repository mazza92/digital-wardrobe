import { useState, useEffect, Suspense, memo, useCallback, useMemo, lazy } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useOutfits } from '../../hooks/useOutfits'
import { getRelativeTime } from '../../utils/api'
import { useFavorites } from '../../hooks/useFavorites'
import { useAuth } from '../../context/AuthContext'
import { useSEO, seoConfig } from '../../hooks/useSEO'
import { getOutfitDescription, getOutfitTitle } from '../../utils/outfitUtils'
import { LazyFavoritesList, LazyCartButton, LoadingFallback, preloadResources } from '../../utils/performance'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { PageSkeleton } from '../ui/Skeleton'
import OptimizedImage, { usePreloadImages } from '../ui/OptimizedImage'

// Lazy load non-critical components
const SignupPrompt = lazy(() => import('../ui/SignupPrompt'))
const LoginModal = lazy(() => import('../ui/LoginModal'))

const MainContainer = styled.div`
  min-height: 100vh;
  background: #FDFCF8;
  color: #101010;
`

const Header = styled.header`
  background: #F3F0E9;
  backdrop-filter: blur(20px);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (min-width: 768px) {
    padding: 1rem 1.5rem;
  }
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (min-width: 768px) {
    gap: 1rem;
  }
`


const BrandName = styled.h1`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 1px;
  color: #101010;
  
  @media (min-width: 768px) {
    font-size: 1.25rem;
    letter-spacing: 2px;
  }
`

const NavLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  white-space: nowrap;
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
  }
  
  &:hover {
    color: #101010;
    background-color: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);
  }
`

const NavButton = styled.button`
  color: #666;
  background: none;
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  white-space: nowrap;
  cursor: pointer;
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
  }
  
  &:hover {
    color: #101010;
    background-color: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);
  }
`

const HeroSection = styled.section`
  background: #E3DBCC;
  color: #101010;
  padding: 3rem 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="black" opacity="0.05"/><circle cx="75" cy="75" r="1" fill="black" opacity="0.05"/><circle cx="50" cy="10" r="0.5" fill="black" opacity="0.05"/><circle cx="10" cy="60" r="0.5" fill="black" opacity="0.05"/><circle cx="90" cy="40" r="0.5" fill="black" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
`

const InfluencerImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  margin: 0 auto 1.5rem;
  border: 3px solid rgba(16, 16, 16, 0.1);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
`

const InfluencerName = styled.h2`
  font-size: 2.3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #101010;
  letter-spacing: -0.5px;
  font-family: serif;
  
  @media (max-width: 767px) {
    font-size: 2.01rem;
  }
`

const InfluencerBrand = styled.p`
  font-size: 1.1rem;
  color: #101010;
  opacity: 0.8;
  margin: 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 2px;
`

const InfluencerBio = styled.p`
  font-size: 1.1rem;
  color: #101010;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
  font-weight: 400;
`

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
  padding: 0 1rem;
`

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #101010;
  margin-bottom: 0.25rem;
`

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #101010;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1px;
`


// Tab Menu Components
const TabContainer = styled.div`
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 60px;
  z-index: 50;
  
  @media (min-width: 768px) {
    top: 80px;
  }
`

const TabMenu = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  padding: 0 1.5rem;
`

const TabButton = styled.button`
  background: none;
  border: none;
  padding: 1rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.$active ? '#101010' : '#666'};
  cursor: pointer;
  border-bottom: 3px solid ${props => props.$active ? '#101010' : 'transparent'};
  transition: all 0.3s ease;
  position: relative;
  
  @media (min-width: 768px) {
    padding: 1.5rem 2rem;
    font-size: 1rem;
  }
  
  &:hover {
    color: #101010;
    background: rgba(0, 0, 0, 0.02);
  }
`

const ContentSection = styled.section`
  padding: 3rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`

const OutfitsSection = styled.section`
  padding: 3rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #101010;
  letter-spacing: -0.5px;
  
  @media (max-width: 767px) {
    font-size: 1.75rem;
  }
`

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  font-weight: 400;
`

const OutfitsGrid = styled.div`
  display: grid;
  gap: 2rem;
  
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

const OutfitCard = styled(Link)`
  position: relative;
  background: white;
  border-radius: 17px;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }
`

const OutfitImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(transparent 60%, rgba(0, 0, 0, 0.7));
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 1;
  }
  
  ${OutfitCard}:hover &::after {
    opacity: 1;
  }
`

// Legacy support for background-image based approach (fallback)
const OutfitImage = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(transparent 60%, rgba(0, 0, 0, 0.7));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  ${OutfitCard}:hover &::after {
    opacity: 1;
  }
`

const ProductTags = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${OutfitCard}:hover & {
    opacity: 1;
  }
`

const ProductTag = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #101010;
  border-radius: 50%;
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 0 rgba(16, 16, 16, 0.4);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(16, 16, 16, 0.4);
    }
    70% {
      box-shadow: 0 0 0 8px rgba(16, 16, 16, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(16, 16, 16, 0);
    }
  }
`

const OutfitOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  color: white;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  
  ${OutfitCard}:hover & {
    transform: translateY(0);
  }
`

const OutfitTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: white;
  letter-spacing: 0.5px;
`

const OutfitDescription = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
`

const PublicationDate = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 1rem 0;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '•';
    color: rgba(255, 255, 255, 0.4);
  }
`

const ShopButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`

const ProductCount = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
`

const NoOutfitsMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  font-size: 1.1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 1rem;
  border: 2px dashed rgba(0, 0, 0, 0.1);
`

const Footer = styled.footer`
  background: #E3DBCC;
  color: #101010;
  padding: 2rem 1rem;
  text-align: center;
  margin-top: 4rem;
  
  @media (min-width: 768px) {
    padding: 3rem 1.5rem;
  }
`

const FooterContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
`

const FooterTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #101010;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`

const FooterText = styled.p`
  font-size: 0.9rem;
  color: #101010;
  opacity: 0.8;
  margin: 0 0 2rem 0;
  line-height: 1.6;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (min-width: 768px) {
    gap: 2rem;
  }
`

const SocialLink = styled.a`
  color: #101010;
  opacity: 0.7;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(16, 16, 16, 0.2);
  transition: all 0.3s ease;
  white-space: nowrap;
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
  }
  
  &:hover {
    color: #101010;
    opacity: 1;
    background: rgba(16, 16, 16, 0.1);
    border-color: rgba(16, 16, 16, 0.3);
  }
`

const FooterBottom = styled.p`
  font-size: 0.9rem;
  color: #101010;
  opacity: 0.5;
  margin: 0;
  padding-top: 2rem;
  border-top: 1px solid rgba(16, 16, 16, 0.1);
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
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #101010;
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
  font-size: 1rem;
  font-weight: 500;
`

// Memoized OutfitCard component to prevent unnecessary re-renders
const MemoizedOutfitCard = memo(({ outfit, index, isEager, t, language }) => (
  <OutfitCard key={outfit.id} to={`/outfits/${outfit.id}`}>
    <OutfitImageWrapper>
      <OptimizedImage
        src={outfit.image}
        alt={getOutfitTitle(outfit, language)}
        aspectRatio="3/4"
        loading={isEager ? 'eager' : 'lazy'}
        fetchPriority={index < 2 ? 'high' : undefined}
      />
    </OutfitImageWrapper>
    <ProductTags>
      {outfit.products.map((product) => (
        <ProductTag
          key={product.id}
          x={product.x}
          y={product.y}
          title={`${product.name} - ${product.brand}`}
        />
      ))}
    </ProductTags>
    <ProductCount>{outfit.products.length} {outfit.products.length === 1 ? t('favorites.item') : t('favorites.items')}</ProductCount>
    <OutfitOverlay>
      <OutfitTitle>{getOutfitTitle(outfit, language)}</OutfitTitle>
      <OutfitDescription>{getOutfitDescription(outfit, language)}</OutfitDescription>
      <PublicationDate>{getRelativeTime(outfit.createdAt)}</PublicationDate>
      <ShopButton>
        {t('outfit.shopNow')} →
      </ShopButton>
    </OutfitOverlay>
  </OutfitCard>
))

MemoizedOutfitCard.displayName = 'MemoizedOutfitCard'

function MainPortal() {
  const { t, i18n } = useTranslation()
  const { outfits, influencer, isLoading, error } = useOutfits()
  const { user, isAuthenticated, logout } = useAuth()
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('outfits')
  
  const {
    favorites,
    removeFromFavorites,
    clearFavorites,
    getFavoritesCount,
    showSignupPrompt,
    closeSignupPrompt,
    pendingProduct,
    addToFavoritesAsGuest
  } = useFavorites()

  // SEO optimization
  useSEO(seoConfig.home)

  // Memoize filtered outfits to prevent recalculation on every render
  const outfitsByCategory = useMemo(() => ({
    outfit: outfits.filter(outfit => outfit.category === 'outfit'),
    wishlist: outfits.filter(outfit => outfit.category === 'wishlist')
  }), [outfits])

  // Preload first 4 images for faster LCP
  const criticalImages = useMemo(() => 
    outfitsByCategory.outfit.slice(0, 4).map(outfit => outfit.image).filter(Boolean),
    [outfitsByCategory.outfit]
  )
  usePreloadImages(criticalImages)

  if (isLoading) {
    return <PageSkeleton />
  }

  if (error) {
    return (
      <MainContainer>
        <Header>
          <BrandName>{t('header.brand')}</BrandName>
          <HeaderRight>
            <LanguageSwitcher />
            <NavLink to="/about">{t('nav.about')}</NavLink>
          </HeaderRight>
        </Header>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          gap: '1rem',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h2 style={{ color: '#666', margin: 0 }}>{t('error.unableToLoad')}</h2>
          <p style={{ color: '#999', margin: 0 }}>{t('error.checkConnection')}</p>
        </div>
      </MainContainer>
    )
  }

  return (
    <MainContainer>
      <Header>
        <BrandName>Virtual Dressing</BrandName>
        <HeaderRight>
          <LanguageSwitcher />
          {isAuthenticated ? (
            <NavLink to="/profile">
              {t('nav.account') || 'My Account'}
            </NavLink>
          ) : (
            <NavButton onClick={() => setIsLoginModalOpen(true)}>
              {t('nav.login') || 'Login'}
            </NavButton>
          )}
          <Suspense fallback={<div style={{width: '40px', height: '40px'}} />}>
            <LazyCartButton 
              onClick={() => setIsFavoritesOpen(true)} 
              favoritesCount={getFavoritesCount()} 
            />
          </Suspense>
          <NavLink to="/about">{t('nav.about')}</NavLink>
        </HeaderRight>
      </Header>
      
      <HeroSection>
        <HeroContent>
          <InfluencerImage $image={influencer?.heroImage} />
          <InfluencerName>{influencer?.name}</InfluencerName>
          <InfluencerBrand>{influencer?.brand}</InfluencerBrand>
          <InfluencerBio>{influencer?.bio}</InfluencerBio>
        </HeroContent>
      </HeroSection>

      <TabContainer>
        <TabMenu>
          <TabButton 
            $active={activeTab === 'outfits'} 
            onClick={() => setActiveTab('outfits')}
          >
            {t('nav.outfits')}
          </TabButton>
          <TabButton 
            $active={activeTab === 'wishlist'} 
            onClick={() => setActiveTab('wishlist')}
          >
            {t('nav.wishlist')}
          </TabButton>
        </TabMenu>
      </TabContainer>
      
      <ContentSection>
        {activeTab === 'outfits' ? (
          <>
            <SectionHeader>
              <SectionTitle>{t('hero.latestOutfits')}</SectionTitle>
              <SectionSubtitle>{t('outfit.viewAll')}</SectionSubtitle>
            </SectionHeader>
            
            <OutfitsGrid>
              {outfitsByCategory.outfit.length > 0 ? (
                outfitsByCategory.outfit.map((outfit, index) => (
                  <MemoizedOutfitCard 
                    key={outfit.id} 
                    outfit={outfit} 
                    index={index} 
                    isEager={index < 4}
                    t={t}
                    language={i18n.language}
                  />
                ))
              ) : (
                <NoOutfitsMessage>
                  {t('outfit.noProducts')}
                </NoOutfitsMessage>
              )}
            </OutfitsGrid>
          </>
        ) : (
          <>
            <SectionHeader>
              <SectionTitle>{t('nav.wishlist')}</SectionTitle>
              <SectionSubtitle>{t('favorites.emptyDescription')}</SectionSubtitle>
            </SectionHeader>
            
            <OutfitsGrid>
              {outfitsByCategory.wishlist.length > 0 ? (
                outfitsByCategory.wishlist.map((outfit, index) => (
                  <MemoizedOutfitCard 
                    key={outfit.id} 
                    outfit={outfit} 
                    index={index} 
                    isEager={false}
                    t={t}
                    language={i18n.language}
                  />
                ))
              ) : (
                <NoOutfitsMessage>
                  {t('outfit.noProducts')}
                </NoOutfitsMessage>
              )}
            </OutfitsGrid>
          </>
        )}
      </ContentSection>
      
      {influencer && (
        <Footer>
          <FooterContent>
            <FooterTitle>{t('about.follow')} {influencer.name}</FooterTitle>
            <FooterText>
              {t('about.shopCollection')}
            </FooterText>
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
              <SocialLink href={influencer.socialMedia?.pinterest} target="_blank">
                Pinterest
              </SocialLink>
            </SocialLinks>
            <FooterBottom>
              {t('footer.copyright')}
            </FooterBottom>
          </FooterContent>
        </Footer>
      )}
      
      <Suspense fallback={<LoadingFallback message={t('loading.favorites')} />}>
        <LazyFavoritesList
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
          favorites={favorites}
          onRemoveFavorite={removeFromFavorites}
          onClearFavorites={clearFavorites}
        />
      </Suspense>

      {/* Signup prompt for guest users - lazy loaded */}
      {showSignupPrompt && (
        <Suspense fallback={null}>
          <SignupPrompt
            isOpen={showSignupPrompt}
            onClose={closeSignupPrompt}
            onContinueAsGuest={addToFavoritesAsGuest}
            itemName={pendingProduct?.name}
          />
        </Suspense>
      )}

      {/* Login modal - lazy loaded */}
      {isLoginModalOpen && (
        <Suspense fallback={null}>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onSwitchToSignup={() => {
              setIsLoginModalOpen(false)
              window.location.href = '/signup'
            }}
          />
        </Suspense>
      )}
    </MainContainer>
  )
}

export default memo(MainPortal)