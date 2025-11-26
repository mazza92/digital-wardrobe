import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { useFavorites } from '../../../hooks/useFavorites';
import { fetchOutfits } from '../../../utils/api';
import { theme } from '../../../design-system/theme';
import { supabase } from '../../../utils/supabaseClient';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Layout
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #F8F6F3 0%, #FDFCF8 100%);
`;

const Header = styled.header`
  background: #F3F0E9;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BackButton = styled(Link)`
  color: #666;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1a1a1a;
  }
`;

const BrandName = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #101010;
  letter-spacing: 1px;
`;

const SignOutButton = styled.button`
  background: none;
  border: 1px solid #999;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    border-color: #dc2626;
    color: #dc2626;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
`;

// Welcome Section
const WelcomeSection = styled.section`
  text-align: center;
  padding: 2rem 0 3rem;
  animation: ${fadeIn} 0.5s ease;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8DFD3 0%, #D4C4B0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const WelcomeTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
`;

const WelcomeSubtitle = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin: 0;
`;

// Stats Section
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease 0.1s both;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
`;

const StatNumber = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Quick Actions
const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.5s ease 0.2s both;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const ActionCard = styled.button`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 1.25rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border-color: #D4C4B0;
  }
`;

const ActionIcon = styled.span`
  font-size: 1.5rem;
`;

const ActionLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
`;

// Section
const Section = styled.section`
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.5s ease 0.3s both;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionLink = styled(Link)`
  font-size: 0.85rem;
  color: #888;
  text-decoration: none;
  
  &:hover {
    color: #1a1a1a;
    text-decoration: underline;
  }
`;

// Style Preferences Card
const PreferencesCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const PreferenceRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
`;

const PreferenceIcon = styled.span`
  font-size: 1.25rem;
  width: 40px;
  height: 40px;
  background: #F8F6F3;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const PreferenceContent = styled.div`
  flex: 1;
`;

const PreferenceLabel = styled.div`
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.5rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  background: ${props => props.$variant === 'style' ? '#E8DFD3' : '#F3F0E9'};
  color: #333;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const EmptyTag = styled.span`
  color: #aaa;
  font-size: 0.85rem;
  font-style: italic;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.05);
  }
`;

// Favorites Grid
const FavoritesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const FavoriteCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const FavoriteImage = styled.div`
  width: 100%;
  padding-top: 125%;
  position: relative;
  background: #f8f9fa;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const FavoriteInfo = styled.div`
  padding: 0.75rem;
`;

const FavoriteBrand = styled.div`
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const FavoriteName = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FavoritePrice = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-top: 0.5rem;
`;

const RemoveButton = styled.button`
  width: 100%;
  background: #f5f5f5;
  border: none;
  padding: 0.5rem;
  font-size: 0.75rem;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #fee2e2;
    color: #dc2626;
  }
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 16px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const EmptyDescription = styled.p`
  color: #888;
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
`;

const PrimaryButton = styled(Link)`
  display: inline-block;
  background: #1a1a1a;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: #333;
    transform: translateY(-2px);
  }
`;

// Engagement Banner
const EngagementBanner = styled.div`
  background: linear-gradient(135deg, #E8DFD3 0%, #D4C4B0 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: ${fadeIn} 0.5s ease 0.4s both;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const BannerIcon = styled.div`
  font-size: 2.5rem;
  flex-shrink: 0;
`;

const BannerContent = styled.div`
  flex: 1;
`;

const BannerTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
`;

const BannerText = styled.p`
  font-size: 0.85rem;
  color: #555;
  margin: 0;
`;

const BannerButton = styled(Link)`
  background: #1a1a1a;
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
  
  &:hover {
    background: #333;
  }
`;

// 7 Days Inspiration Section
const InspirationSection = styled.section`
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.5s ease 0.25s both;
`;

const InspirationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const InspirationTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InspirationSubtitle = styled.span`
  font-size: 0.85rem;
  color: #888;
  font-weight: 400;
`;

const DaysScroller = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  margin: 0 -1.5rem;
  padding: 0 1.5rem 1rem;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const DayCard = styled.div`
  flex: 0 0 auto;
  width: 160px;
  scroll-snap-align: start;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  @media (min-width: 768px) {
    width: 180px;
  }
`;

const DayLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const DayNumber = styled.span`
  width: 28px;
  height: 28px;
  background: ${props => props.$isToday ? '#1a1a1a' : '#F3F0E9'};
  color: ${props => props.$isToday ? 'white' : '#666'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
`;

const DayName = styled.span`
  font-size: 0.85rem;
  font-weight: ${props => props.$isToday ? '600' : '500'};
  color: ${props => props.$isToday ? '#1a1a1a' : '#666'};
`;

const DayOutfitImage = styled.div`
  width: 100%;
  padding-top: 130%;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f6f3 0%, #e8e4df 100%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: ${props => props.$isToday ? '2px solid #1a1a1a' : '1px solid rgba(0, 0, 0, 0.05)'};
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DayOutfitOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 0.75rem 0.75rem;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
`;

const DayOutfitTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MatchBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const InspirationEmpty = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const InspirationEmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
`;

const InspirationEmptyText = styled.p`
  color: #888;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
`;

const InspirationEmptyButton = styled(Link)`
  display: inline-block;
  background: #1a1a1a;
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: #333;
  }
`;

// Loading
const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #666;
`;

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { favorites, removeFromFavorites } = useFavorites();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [outfitsLoading, setOutfitsLoading] = useState(true);

  // Fetch outfits for inspiration
  useEffect(() => {
    const loadOutfits = async () => {
      try {
        const data = await fetchOutfits();
        setOutfits(data.outfits || []);
      } catch (err) {
        console.error('Failed to load outfits:', err);
      } finally {
        setOutfitsLoading(false);
      }
    };
    loadOutfits();
  }, []);

  const [pageReady, setPageReady] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Check for session and set page ready after timeout
  useEffect(() => {
    let mounted = true;
    
    const checkAndSetReady = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (!session && !isAuthenticated) {
            setShouldRedirect(true);
          }
          setPageReady(true);
        }
      } catch (err) {
        console.log('Session check error:', err);
        if (mounted) {
          // On error, still show the page (don't redirect)
          setPageReady(true);
        }
      }
    };
    
    // Check session
    checkAndSetReady();
    
    // Fallback: show page after 2 seconds no matter what
    const timeout = setTimeout(() => {
      if (mounted && !pageReady) {
        console.log('Profile page timeout - showing page');
        setPageReady(true);
      }
    }, 2000);
    
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [isAuthenticated]);

  // Handle redirect
  useEffect(() => {
    if (shouldRedirect && !loggingOut) {
      window.location.href = '/login';
    }
  }, [shouldRedirect, loggingOut]);

  // Show loading state briefly
  if (!pageReady) {
    return <LoadingContainer>{t('common.loading')}</LoadingContainer>;
  }

  // If logging out, show a brief message then the redirect will happen
  if (loggingOut) {
    return <LoadingContainer>{t('auth.logout.loggingOut', 'Logging out...')}</LoadingContainer>;
  }

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loggingOut) return;
    
    setLoggingOut(true);
    try {
      await logout();
      // Redirect immediately using window.location for a full page refresh
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  };

  const brandCount = user?.preferences?.favoriteBrands?.length || 0;
  const userName = 'Shopper';

  // Get day names for 7 days
  const getDayNames = () => {
    const days = [];
    const today = new Date();
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        dayNumber: date.getDate(),
        dayName: i === 0 ? t('profile.inspiration.today') : date.toLocaleDateString(locale, { weekday: 'short' }),
        isToday: i === 0
      });
    }
    return days;
  };

  // Get curated outfits based on user preferences
  const getCuratedOutfits = () => {
    if (!outfits.length) return [];
    
    const userStyles = user?.preferences?.styleInterests || [];
    const userBrands = user?.preferences?.favoriteBrands || [];
    
    // Score outfits based on matching preferences
    const scoredOutfits = outfits.map(outfit => {
      let score = 0;
      let matchReasons = [];
      
      // Check if outfit has products matching user's brands
      if (outfit.products && userBrands.length > 0) {
        outfit.products.forEach(product => {
          if (userBrands.some(brand => 
            product.brand?.toLowerCase().includes(brand.toLowerCase()) ||
            brand.toLowerCase().includes(product.brand?.toLowerCase() || '')
          )) {
            score += 2;
            matchReasons.push('brand');
          }
        });
      }
      
      // Check outfit title/description for style keywords
      const outfitText = `${outfit.title || ''} ${outfit.description || ''}`.toLowerCase();
      userStyles.forEach(style => {
        if (outfitText.includes(style.toLowerCase())) {
          score += 1;
          matchReasons.push('style');
        }
      });
      
      // Add some randomness to keep it fresh
      score += Math.random() * 0.5;
      
      return { ...outfit, score, matchReasons: [...new Set(matchReasons)] };
    });
    
    // Sort by score and take top 7
    return scoredOutfits
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);
  };

  const days = getDayNames();
  const curatedOutfits = getCuratedOutfits();

  return (
    <PageWrapper>
      <Header>
        <BackButton to="/">
          ← {t('common.back')}
        </BackButton>
        <BrandName>Virtual Dressing</BrandName>
        <SignOutButton onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? '...' : t('auth.logout.button')}
        </SignOutButton>
      </Header>
      
      <MainContent>
        {/* Welcome Section */}
        <WelcomeSection>
          <Avatar>👋</Avatar>
          <WelcomeTitle>{t('profile.welcomeBack', { name: userName })}</WelcomeTitle>
          <WelcomeSubtitle>{user?.email}</WelcomeSubtitle>
        </WelcomeSection>

        {/* Stats */}
        <StatsGrid>
          <StatCard>
            <StatNumber>{favorites.length}</StatNumber>
            <StatLabel>{t('profile.stats.favorites')}</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{brandCount}</StatNumber>
            <StatLabel>{t('profile.stats.brands')}</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Quick Actions */}
        <QuickActions>
          <ActionCard onClick={() => navigate('/onboarding')}>
            <ActionIcon>✨</ActionIcon>
            <ActionLabel>{t('profile.actions.updateStyle')}</ActionLabel>
          </ActionCard>
          <ActionCard onClick={() => document.getElementById('favorites-section')?.scrollIntoView({ behavior: 'smooth' })}>
            <ActionIcon>❤️</ActionIcon>
            <ActionLabel>{t('profile.actions.viewFavorites')}</ActionLabel>
          </ActionCard>
        </QuickActions>

        {/* Engagement Banner */}
        {favorites.length < 3 && (
          <EngagementBanner>
            <BannerIcon>💡</BannerIcon>
            <BannerContent>
              <BannerTitle>{t('profile.banner.discoverTitle')}</BannerTitle>
              <BannerText>{t('profile.banner.discoverText')}</BannerText>
            </BannerContent>
            <BannerButton to="/">{t('profile.banner.discoverButton')}</BannerButton>
          </EngagementBanner>
        )}

        {/* 7 Days of Inspiration */}
        <InspirationSection>
          <InspirationHeader>
            <div>
              <InspirationTitle>
                📅 {t('profile.inspiration.title')}
              </InspirationTitle>
              <InspirationSubtitle>{t('profile.inspiration.subtitle')}</InspirationSubtitle>
            </div>
            <SectionLink to="/">{t('profile.inspiration.seeAll')}</SectionLink>
          </InspirationHeader>
          
          {outfitsLoading ? (
            <InspirationEmpty>
              <InspirationEmptyIcon>⏳</InspirationEmptyIcon>
              <InspirationEmptyText>{t('common.loading')}</InspirationEmptyText>
            </InspirationEmpty>
          ) : curatedOutfits.length > 0 ? (
            <DaysScroller>
              {days.map((day, index) => {
                const outfit = curatedOutfits[index];
                if (!outfit) return null;
                
                return (
                  <DayCard 
                    key={day.dayNumber} 
                    onClick={() => navigate(`/outfits/${outfit.id}`)}
                  >
                    <DayLabel>
                      <DayNumber $isToday={day.isToday}>{day.dayNumber}</DayNumber>
                      <DayName $isToday={day.isToday}>{day.dayName}</DayName>
                    </DayLabel>
                    <DayOutfitImage $isToday={day.isToday}>
                      {outfit.image && <img src={outfit.image} alt={outfit.title} />}
                      {outfit.matchReasons?.length > 0 && (
                        <MatchBadge>
                          ✨ {t('profile.inspiration.forYou')}
                        </MatchBadge>
                      )}
                      <DayOutfitOverlay>
                        <DayOutfitTitle>{outfit.title}</DayOutfitTitle>
                      </DayOutfitOverlay>
                    </DayOutfitImage>
                  </DayCard>
                );
              })}
            </DaysScroller>
          ) : (
            <InspirationEmpty>
              <InspirationEmptyIcon>✨</InspirationEmptyIcon>
              <InspirationEmptyText>{t('profile.inspiration.empty')}</InspirationEmptyText>
              <InspirationEmptyButton to="/onboarding">
                {t('profile.inspiration.setupPreferences')}
              </InspirationEmptyButton>
            </InspirationEmpty>
          )}
        </InspirationSection>

        {/* Style Preferences */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              ✨ {t('profile.sections.styleProfile')}
            </SectionTitle>
            <EditButton onClick={() => navigate('/onboarding')}>
              {t('common.edit')}
            </EditButton>
          </SectionHeader>
          
          <PreferencesCard>
            <PreferenceRow>
              <PreferenceIcon>👗</PreferenceIcon>
              <PreferenceContent>
                <PreferenceLabel>{t('profile.styles')}</PreferenceLabel>
                <TagsContainer>
                  {user?.preferences?.styleInterests?.length > 0 ? (
                    user.preferences.styleInterests.map((style, idx) => (
                      <Tag key={idx} $variant="style">
                        {t(`onboarding.style.options.${style}`, style)}
                      </Tag>
                    ))
                  ) : (
                    <EmptyTag>{t('profile.noStyles')}</EmptyTag>
                  )}
                </TagsContainer>
              </PreferenceContent>
            </PreferenceRow>
            
            <PreferenceRow>
              <PreferenceIcon>🏷️</PreferenceIcon>
              <PreferenceContent>
                <PreferenceLabel>{t('profile.brands')}</PreferenceLabel>
                <TagsContainer>
                  {user?.preferences?.favoriteBrands?.length > 0 ? (
                    user.preferences.favoriteBrands.map((brand, idx) => (
                      <Tag key={idx}>{brand}</Tag>
                    ))
                  ) : (
                    <EmptyTag>{t('profile.noBrands')}</EmptyTag>
                  )}
                </TagsContainer>
              </PreferenceContent>
            </PreferenceRow>
          </PreferencesCard>
        </Section>

        {/* Favorites */}
        <Section id="favorites-section">
          <SectionHeader>
            <SectionTitle>
              ❤️ {t('profile.sections.favorites')} ({favorites.length})
            </SectionTitle>
            {favorites.length > 0 && (
              <SectionLink to="/">{t('profile.addMore')}</SectionLink>
            )}
          </SectionHeader>
          
          {favorites.length > 0 ? (
            <FavoritesGrid>
              {favorites.slice(0, 8).map((item) => (
                <FavoriteCard key={item.id}>
                  <FavoriteImage onClick={() => navigate(item.outfitId ? `/outfits/${item.outfitId}` : '/')}>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                  </FavoriteImage>
                  <FavoriteInfo onClick={() => navigate(item.outfitId ? `/outfits/${item.outfitId}` : '/')}>
                    <FavoriteBrand>{item.brand}</FavoriteBrand>
                    <FavoriteName>{item.name}</FavoriteName>
                    <FavoritePrice>{item.price}</FavoritePrice>
                  </FavoriteInfo>
                  <RemoveButton onClick={() => removeFromFavorites(item.id)}>
                    {t('favorites.remove')}
                  </RemoveButton>
                </FavoriteCard>
              ))}
            </FavoritesGrid>
          ) : (
            <EmptyState>
              <EmptyIcon>💝</EmptyIcon>
              <EmptyTitle>{t('profile.emptyFavorites.title')}</EmptyTitle>
              <EmptyDescription>{t('profile.emptyFavorites.description')}</EmptyDescription>
              <PrimaryButton to="/">{t('profile.emptyFavorites.button')}</PrimaryButton>
            </EmptyState>
          )}
        </Section>
      </MainContent>
    </PageWrapper>
  );
};

export default Profile;
