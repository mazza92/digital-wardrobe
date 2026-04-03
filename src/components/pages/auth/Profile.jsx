import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { useFavorites } from '../../../hooks/useFavorites';
import { fetchOutfits } from '../../../utils/api';
import { getOutfitDescription, getOutfitTitle } from '../../../utils/outfitUtils';
import { safeGetSession } from '../../../utils/supabaseClient';
import { SHOW_SECRETS_TAB } from '../../../config/featureFlags';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Layout
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #F8F6F3 0%, #FDFCF8 100%);
`;

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
`;

const BackButton = styled(Link)`
  color: #666;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0.375rem 0.75rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
`;

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
  padding: 1.5rem 1rem 4rem;

  @media (min-width: 768px) {
    padding: 2rem 1.5rem 4rem;
  }
`;

// Welcome Section (Simplified)
const WelcomeSection = styled.section`
  text-align: center;
  padding: 1.5rem 0 2rem;
  animation: ${fadeIn} 0.5s ease;

  @media (min-width: 768px) {
    padding: 2rem 0 2.5rem;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const WelcomeSubtitle = styled.p`
  color: #888;
  font-size: 0.9rem;
  margin: 0;
`;

// Section
const Section = styled.section`
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease ${props => props.$delay || '0.1s'} both;

  @media (min-width: 768px) {
    margin-bottom: 2.5rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
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

// Favorites Grid
const FavoritesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (min-width: 480px) {
    gap: 1rem;
  }

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
  display: flex;
  flex-direction: column;

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
  flex: 1;
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

const ShowMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 0.75rem;
`;

const ShowMoreButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #333;
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ShowLessButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FavoritesCount = styled.span`
  color: #888;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 0.75rem;
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: white;
  border-radius: 16px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.6;
`;

const EmptyTitle = styled.h3`
  font-size: 1rem;
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const EmptyDescription = styled.p`
  color: #888;
  font-size: 0.85rem;
  margin: 0 0 1.25rem 0;
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

// Exclusive Perks Section
const PerksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const PerkCard = styled(Link)`
  background: ${props => props.$gradient || 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)'};
  border-radius: 16px;
  padding: 1.5rem;
  text-decoration: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 100%);
    pointer-events: none;
  }
`;

const PerkIcon = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const PerkContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const PerkTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const PerkDescription = styled.div`
  font-size: 0.8rem;
  opacity: 0.85;
`;

const PerkBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PerkArrow = styled.div`
  opacity: 0.6;
  flex-shrink: 0;
`;

// 7 Days Inspiration Section
const InspirationSection = styled.section`
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease 0.3s both;
`;

const InspirationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const InspirationTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`;

const InspirationSubtitle = styled.span`
  font-size: 0.8rem;
  color: #888;
  font-weight: 400;
  display: block;
  margin-top: 0.25rem;
`;

const DaysScroller = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  margin: 0 -1rem;
  padding: 0 1rem 1rem;
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

  @media (min-width: 768px) {
    margin: 0 -1.5rem;
    padding: 0 1.5rem 1rem;
  }
`;

const DayCard = styled.div`
  flex: 0 0 auto;
  width: 140px;
  scroll-snap-align: start;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }

  @media (min-width: 768px) {
    width: 160px;
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
  font-size: 0.7rem;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const InspirationEmpty = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const InspirationEmptyIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
`;

const InspirationEmptyText = styled.p`
  color: #888;
  font-size: 0.85rem;
  margin: 0;
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

const FAVORITES_PER_PAGE = 8;

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { favorites, removeFromFavorites } = useFavorites();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [outfitsLoading, setOutfitsLoading] = useState(true);
  const [favoritesDisplayCount, setFavoritesDisplayCount] = useState(FAVORITES_PER_PAGE);

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
        const { data: { session } } = await safeGetSession();
        if (mounted) {
          if (!session && !isAuthenticated) {
            setShouldRedirect(true);
          }
          setPageReady(true);
        }
      } catch (err) {
        
        if (mounted) {
          setPageReady(true);
        }
      }
    };

    checkAndSetReady();

    const timeout = setTimeout(() => {
      if (mounted && !pageReady) {
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

  if (!pageReady) {
    return <LoadingContainer>{t('common.loading')}</LoadingContainer>;
  }

  if (loggingOut) {
    return <LoadingContainer>{t('auth.logout.loggingOut', 'Logging out...')}</LoadingContainer>;
  }

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loggingOut) return;

    setLoggingOut(true);
    logout().catch(() => {});

    setTimeout(() => {
      window.location.href = '/?t=' + Date.now();
    }, 500);
  };

  const handleFavoriteClick = (item) => {
    if (item.link) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    } else if (item.outfitId) {
      navigate(`/outfits/${item.outfitId}`);
    }
  };

  const rawName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.name ||
    user?.full_name ||
    '';
  let userName = (typeof rawName === 'string' && rawName.trim()) ? rawName.trim().split(/\s+/)[0] : null;
  if (!userName && user?.email) {
    const local = user.email.split('@')[0] || '';
    const cleaned = local.replace(/\+.*$/, '').trim();
    userName = cleaned || 'Shopper';
  }
  if (!userName) userName = 'Shopper';

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

  // Get curated outfits
  const getCuratedOutfits = () => {
    if (!outfits.length) return [];

    // Shuffle and take 7 outfits for variety
    const shuffled = [...outfits].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 7);
  };

  const days = getDayNames();
  const curatedOutfits = getCuratedOutfits();

  return (
    <PageWrapper>
      <Header>
        <BackButton to="/">
          ← {t('common.backToHome')}
        </BackButton>
        <BrandName to="/">Emmanuelle K</BrandName>
        <SignOutButton onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? '...' : t('auth.logout.button')}
        </SignOutButton>
      </Header>

      <MainContent>
        {/* Welcome Section */}
        <WelcomeSection>
          <WelcomeTitle>{t('profile.greeting', { name: userName })}</WelcomeTitle>
        </WelcomeSection>

        {/* Favorites Section - Now at the top */}
        <Section $delay="0.1s">
          <SectionHeader>
            <SectionTitle>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {t('profile.sections.favorites')} ({favorites.length})
            </SectionTitle>
            {favorites.length > 0 && (
              <SectionLink to="/">{t('profile.addMore')}</SectionLink>
            )}
          </SectionHeader>

          {favorites.length > 0 ? (
            <>
              <FavoritesGrid>
                {favorites.slice(0, favoritesDisplayCount).map((item) => (
                  <FavoriteCard key={item.id}>
                    <FavoriteImage onClick={() => handleFavoriteClick(item)}>
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                    </FavoriteImage>
                    <FavoriteInfo onClick={() => handleFavoriteClick(item)}>
                      <FavoriteBrand>{item.brand}</FavoriteBrand>
                      <FavoriteName>{item.name}</FavoriteName>
                      {item.price != null && item.price !== '' && (
                        <FavoritePrice>{item.price}</FavoritePrice>
                      )}
                    </FavoriteInfo>
                    <RemoveButton onClick={() => removeFromFavorites(item.id)}>
                      {t('favorites.remove')}
                    </RemoveButton>
                  </FavoriteCard>
                ))}
              </FavoritesGrid>

              {favorites.length > FAVORITES_PER_PAGE && (
                <ShowMoreContainer>
                  {favoritesDisplayCount < favorites.length ? (
                    <>
                      <ShowMoreButton onClick={() => setFavoritesDisplayCount(favorites.length)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                        {t('profile.showAll', 'Voir tout')} ({favorites.length - favoritesDisplayCount} {t('profile.more', 'de plus')})
                      </ShowMoreButton>
                    </>
                  ) : (
                    <ShowLessButton onClick={() => setFavoritesDisplayCount(FAVORITES_PER_PAGE)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                      {t('profile.showLess', 'Voir moins')}
                    </ShowLessButton>
                  )}
                </ShowMoreContainer>
              )}
            </>
          ) : (
            <EmptyState>
              <EmptyIcon>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </EmptyIcon>
              <EmptyTitle>{t('profile.emptyFavorites.title')}</EmptyTitle>
              <EmptyDescription>{t('profile.emptyFavorites.description')}</EmptyDescription>
              <PrimaryButton to="/">{t('profile.emptyFavorites.button')}</PrimaryButton>
            </EmptyState>
          )}
        </Section>

        {/* Exclusive Perks Section */}
        <Section $delay="0.2s">
          <SectionHeader>
            <SectionTitle>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              {t('profile.perks.title', 'Avantages Exclusifs')}
            </SectionTitle>
          </SectionHeader>

          <PerksGrid>
            <PerkCard to="/?tab=coup-de-coeur" $gradient="linear-gradient(135deg, #1a1a1a 0%, #333 100%)">
              <PerkIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </PerkIcon>
              <PerkContent>
                <PerkTitle>{t('profile.perks.privateSale.title', 'Ventes Privées')}</PerkTitle>
                <PerkDescription>{t('profile.perks.privateSale.description', 'Accès exclusif aux offres membres')}</PerkDescription>
              </PerkContent>
              <PerkBadge>{t('profile.perks.exclusive', 'Exclusif')}</PerkBadge>
              <PerkArrow>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </PerkArrow>
            </PerkCard>

            {SHOW_SECRETS_TAB && (
              <PerkCard to="/?tab=secrets" $gradient="linear-gradient(135deg, #8B7355 0%, #A08060 100%)">
                <PerkIcon>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </PerkIcon>
                <PerkContent>
                  <PerkTitle>{t('profile.perks.secrets.title', 'Mes Secrets')}</PerkTitle>
                  <PerkDescription>{t('profile.perks.secrets.description', 'Accès exclusif à mes produits')}</PerkDescription>
                </PerkContent>
                <PerkBadge>{t('profile.perks.new', 'Nouveau')}</PerkBadge>
                <PerkArrow>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </PerkArrow>
              </PerkCard>
            )}
          </PerksGrid>
        </Section>

        {/* 7 Days of Inspiration */}
        <InspirationSection>
          <InspirationHeader>
            <div>
              <InspirationTitle>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {t('profile.inspiration.title')}
              </InspirationTitle>
              <InspirationSubtitle>{t('profile.inspiration.subtitle')}</InspirationSubtitle>
            </div>
            <SectionLink to="/">{t('profile.inspiration.seeAll')}</SectionLink>
          </InspirationHeader>

          {outfitsLoading ? (
            <InspirationEmpty>
              <InspirationEmptyIcon>...</InspirationEmptyIcon>
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
                      {outfit.image && <img src={outfit.image} alt={getOutfitTitle(outfit, i18n.language)} />}
                      <DayOutfitOverlay>
                        <DayOutfitTitle>{getOutfitTitle(outfit, i18n.language)}</DayOutfitTitle>
                      </DayOutfitOverlay>
                    </DayOutfitImage>
                  </DayCard>
                );
              })}
            </DaysScroller>
          ) : (
            <InspirationEmpty>
              <InspirationEmptyIcon>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </InspirationEmptyIcon>
              <InspirationEmptyText>{t('profile.inspiration.empty', 'Découvrez nos looks bientôt')}</InspirationEmptyText>
            </InspirationEmpty>
          )}
        </InspirationSection>
      </MainContent>
    </PageWrapper>
  );
};

export default Profile;
