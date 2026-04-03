import { useState, useEffect, Suspense, memo, useCallback, useMemo, lazy, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useOutfits } from '../../hooks/useOutfits'
import { getRelativeTime } from '../../utils/api'
import { useFavorites } from '../../hooks/useFavorites'
import { useAuth } from '../../context/AuthContext'
import { useSEO, seoConfig } from '../../hooks/useSEO'
import { getOutfitDescription, getOutfitTitle } from '../../utils/outfitUtils'
import { outfitToSlug } from '../../utils/slugify'
import { LazyFavoritesList, LazyCartButton, LoadingFallback, preloadResources, prefetchRoute } from '../../utils/performance'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { PageSkeleton } from '../ui/Skeleton'
import OptimizedImage, { usePreloadImages } from '../ui/OptimizedImage'
import CartButton from '../shop/CartButton'
import PrivateSalesSection from '../shop/PrivateSalesSection'
import { useCart } from '../../context/CartContext'
import SubtleShareButton from '../ui/SubtleShareButton'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.emmanuellek.com/api'

// Lazy load non-critical components
const SignupPrompt = lazy(() => import('../ui/SignupPrompt'))
const SignUp = lazy(() => import('./auth/SignUp'))
const LoginModal = lazy(() => import('../ui/LoginModal'))
const CoupDeCoeurAccessModal = lazy(() => import('../ui/CoupDeCoeurAccessModal'))
const SecretsAccessModal = lazy(() => import('../ui/SecretsAccessModal'))
import { getCoupDeCoeurUnlocked } from '../ui/CoupDeCoeurAccessModal'
import { trackDiscoverClick } from '../../utils/analytics'
import { resolveHeroCuratedBy, resolveHeroTagline } from '../../utils/heroCopy'
import { SHOW_SECRETS_TAB } from '../../config/featureFlags'

const MainContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
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

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  padding-right: 0.25rem;
  
  @media (min-width: 480px) {
    gap: 0.375rem;
    padding-right: 0.5rem;
  }
  
  @media (min-width: 768px) {
    gap: 0.75rem;
    padding-right: 0;
  }
  
  @media (min-width: 1024px) {
    gap: 1rem;
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

const NavLink = styled(Link)`
  color: #101010;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  -webkit-tap-highlight-color: transparent;
  contain: layout style;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }
`

const NavButton = styled.button`
  color: #101010;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }
`

// Hero Section (ShopMy-inspired)
const HeroSection = styled.section`
  background: white;
  padding: 1.25rem 1.5rem 2.5rem;
  text-align: center;
  position: relative;
  
  @media (min-width: 768px) {
    padding: 2rem 2rem 3rem;
  }
`

const HeroCuratedBy = styled.p`
  font-size: 0.9rem;
  font-style: italic;
  color: #666;
  margin: 0 0 0.75rem 0;
  font-family: Georgia, serif;
  letter-spacing: 0.3px;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`

/* Full-width hero banner (replaces medallion) - editable in backend profile */
const HeroBannerWrap = styled.div`
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-top: 1rem;
  margin-bottom: 1.25rem;
  background: #f0efec;
  overflow: hidden;
  @media (min-width: 768px) {
    margin-top: 1.25rem;
    margin-bottom: 1.5rem;
  }
`

const HeroBannerImg = styled.img`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  object-position: center;
  /* Aspect ratio bandeau typique (ex. 21:9) - évite le saut de layout */
  min-height: 140px;
  max-height: 42vw;
  @media (min-width: 768px) {
    min-height: 200px;
    max-height: 380px;
  }
`

const HeroBannerPlaceholder = styled.div`
  width: 100%;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1rem;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.25);
  letter-spacing: 0.02em;
  @media (min-width: 768px) {
    min-height: 200px;
    font-size: 1.1rem;
  }
`

const HeroName = styled.h1`
  font-size: 2.25rem;
  font-weight: 400;
  color: #101010;
  margin: 0 0 0.2rem 0;
  font-family: 'Playfair Display', Georgia, serif;
  letter-spacing: 0.5px;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`

const HeroTagline = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 1.25rem 0;
  font-weight: 400;
  line-height: 1.5;
  white-space: pre-line;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`

const HeroSocial = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`

const SocialLink = styled.a`
  color: #101010;
  text-decoration: none;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;

  svg {
    width: 22px;
    height: 22px;
  }
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


// Tab Menu Components - Clean modern design
const TabContainer = styled.div`
  background: #FAFAF8;
  position: sticky;
  top: 56px;
  z-index: 50;
  padding: 0.75rem 0.5rem;

  @media (min-width: 768px) {
    top: 64px;
    padding: 1.25rem 2rem;
  }
`

const TabMenu = styled.div`
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  background: #EFEDE8;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;

  @media (min-width: 768px) {
    max-width: 650px;
    border-radius: 14px;
    padding: 4px;
    gap: 4px;
  }
`

const TabButton = styled.button`
  flex: 1 1 0;
  min-width: 0;
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  padding: 0.5rem 0.25rem;
  font-size: 0.68rem;
  font-weight: ${props => props.$active ? '600' : '500'};
  color: ${props => props.$active ? '#101010' : '#555'};
  cursor: pointer;
  border-radius: 7px;
  position: relative;
  text-align: center;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' : 'none'};
  line-height: 1.3;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style;

  @media (min-width: 400px) {
    padding: 0.5rem 0.4rem;
    font-size: 0.72rem;
    min-height: 2.6rem;
  }

  @media (min-width: 480px) {
    padding: 0.6rem 0.6rem;
    font-size: 0.78rem;
    border-radius: 9px;
    min-height: 2.75rem;
  }

  @media (min-width: 768px) {
    padding: 0.875rem 1.25rem;
    font-size: 0.85rem;
    border-radius: 10px;
    min-height: auto;
  }
`

// Editorial Section Components (ReSee-inspired)
const EditorialSection = styled.section`
  padding: 2rem 1.5rem 4rem;
  max-width: 1400px;
  margin: 0 auto;
  /* Performance: skip rendering until visible */
  content-visibility: auto;
  contain-intrinsic-size: 0 600px;

  @media (min-width: 768px) {
    padding: 2.5rem 2rem 5rem;
  }
`

const SectionHeaderRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: baseline;
  margin-bottom: 1.5rem;
  
  @media (max-width: 767px) {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0;
  color: #101010;
  letter-spacing: 0.5px;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`

const SectionLink = styled(Link)`
  font-size: 0.9rem;
  color: #101010;
  text-decoration: none;
  font-weight: 400;
  -webkit-tap-highlight-color: transparent;
`

const SecretEmmanuelleLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 3rem;
    align-items: start;
  }
`

const MainContentArea = styled.div`
  flex: 1;
  min-width: 0; /* Prevent flex item from overflowing */
`

const SidebarArea = styled.aside`
  width: 100%;
  
  @media (min-width: 1024px) {
    width: 320px;
    flex-shrink: 0;
    position: sticky;
    top: 80px;
  }
`

// Keep old SectionTitle for backward compatibility but use new one above
const OldSectionTitle = styled.h2`
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

const SectionHeaderStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
`

const PrivateSalesTeaser = styled.section`
  width: 100%;
  margin-top: 0;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  background: #fdf8f5;
  @media (min-width: 768px) {
    padding: 2.5rem 2rem;
  }
`
const PrivateSalesContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`
const PrivateSalesSubtitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
`
const PrivateSalesActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
`
const PrivateSalesPrimaryButton = styled.button`
  padding: 0.85rem 1.75rem;
  background: #111827;
  color: #f9fafb;
  border: none;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style;
`
const PrivateSalesWrapper = styled.div`
  margin-top: 1.5rem;
  @media (min-width: 768px) { margin-top: 2rem; }
`

const OutfitsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  /* Performance: skip rendering until visible */
  content-visibility: auto;
  contain-intrinsic-size: 0 800px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 2.5rem;
  }
`

const PaginationWrap = styled.div`
  margin-top: 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
`

const PaginationInfo = styled.div`
  font-size: 0.82rem;
  color: #666;
  letter-spacing: 0.02em;
`

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: center;
`

const PageButton = styled.button`
  min-width: 36px;
  height: 36px;
  padding: 0 0.7rem;
  border-radius: 999px;
  border: 1px solid ${props => props.$active ? '#101010' : '#d8d8d8'};
  background: ${props => props.$active ? '#101010' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  font-size: 0.82rem;
  font-weight: ${props => props.$active ? 700 : 600};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.45 : 1};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#101010' : '#f5f5f5'};
    border-color: ${props => props.$active ? '#101010' : '#c8c8c8'};
  }
`

const PaginationEllipsis = styled.span`
  min-width: 20px;
  text-align: center;
  color: #999;
  font-size: 0.9rem;
`

const OutfitCard = styled(Link)`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(0, 0, 0, 0.06);
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.13);
    transform: translateY(-2px);
  }
`

const OutfitImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;

  /* Hover effect on loaded image */
  ${OutfitCard}:hover & img {
    transform: scale(1.03);
    transition: transform 0.4s ease;
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
  contain: layout style paint;
`

/* Subtle dots — just visual markers, no text competing with them */
const ProductTags = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 6;
`

const ProductTag = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  transform: translate(-50%, -50%);
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  z-index: 7;
`

/* Article count badge — top right corner only, minimal */
const ProductCount = styled.div`
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  background: rgba(0, 0, 0, 0.62);
  color: white;
  padding: 0.25rem 0.55rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  backdrop-filter: blur(6px);
  z-index: 10;
`

/* ── Text panel — completely separate from the image, always readable ── */
const OutfitOverlay = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.85rem 0.9rem 1rem;
  background: white;
  flex: 1;
`

const OutfitTitle = styled.h3`
  font-size: 0.92rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  color: #111;
  letter-spacing: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const OutfitDescription = styled.p`
  font-size: 0.78rem;
  color: #666;
  margin: 0 0 0.5rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`

const PublicationDate = styled.div`
  font-size: 0.7rem;
  color: #999;
  margin: 0 0 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  &::before {
    content: '•';
    color: #ccc;
  }
`

const ShopButton = styled.div`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.35rem;
  background: #111;
  color: white;
  padding: 0.45rem 0.9rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.2px;
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

// Editorial Loading Skeleton
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const EditorialSkeletonCard = styled.div`
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  contain: layout style;
`

const SkeletonImage = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`

const SkeletonInfo = styled.div`
  padding: 1.5rem;
`

const SkeletonTitle = styled.div`
  height: 1.25rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  width: 80%;
`

const SkeletonSubtitle = styled.div`
  height: 0.9rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  width: 100%;
  
  &:last-of-type {
    width: 60%;
    margin-bottom: 0;
  }
`

const SkeletonMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`

const SkeletonBadge = styled.div`
  height: 0.8rem;
  width: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`

const EditorialSkeletonGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 2.5rem;
  }
`

const EditorialSkeleton = () => (
  <EditorialSkeletonGrid>
    {[...Array(4)].map((_, index) => (
      <EditorialSkeletonCard key={index}>
        <SkeletonImage />
        <SkeletonInfo>
          <SkeletonTitle />
          <SkeletonSubtitle />
          <SkeletonSubtitle />
          <SkeletonMeta>
            <SkeletonBadge />
            <SkeletonBadge style={{ width: '40px' }} />
          </SkeletonMeta>
        </SkeletonInfo>
      </EditorialSkeletonCard>
    ))}
  </EditorialSkeletonGrid>
)

// Product Loading Skeleton for "Secret d'Emmanuelle"
const ProductSkeletonCard = styled.div`
  position: relative;
  background: white;
  border-radius: 0;
  overflow: hidden;
  contain: layout style;
`

const ProductSkeletonImage = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`

const ProductSkeletonInfo = styled.div`
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const ProductSkeletonName = styled.div`
  height: 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
  width: 85%;
  margin-bottom: 0.25rem;
  
  &:last-of-type {
    width: 60%;
    margin-bottom: 0;
  }
`

const ProductSkeletonPrice = styled.div`
  height: 1rem;
  width: 70px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
  margin-top: 0.25rem;
`

const ProductSkeletonGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 2.5rem;
  }
`

const ProductSkeleton = () => (
  <ProductSkeletonGrid>
    {[...Array(4)].map((_, index) => (
      <ProductSkeletonCard key={index}>
        <ProductSkeletonImage />
        <ProductSkeletonInfo>
          <ProductSkeletonName />
          <ProductSkeletonName />
          <ProductSkeletonPrice />
        </ProductSkeletonInfo>
      </ProductSkeletonCard>
    ))}
  </ProductSkeletonGrid>
)

// Product Card Components for "Secret d'Emmanuelle" section - ReSee style
const ProductCard = styled(Link)`
  position: relative;
  background: white;
  border-radius: 0;
  overflow: hidden;
  text-decoration: none;
  /* Performance: isolate paint */
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`

const ProductImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  position: relative;
  overflow: hidden;
  contain: layout style paint;
  background: #f5f5f5;
`

const ProductInfo = styled.div`
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const ProductName = styled.h3`
  font-size: 0.9rem;
  font-weight: 400;
  margin: 0;
  color: #101010;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
  }
`

const ProductPrice = styled.div`
  font-size: 0.95rem;
  font-weight: 400;
  color: #101010;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`

const OutOfStockBadge = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

// Editorial Card Component (ReSee-inspired blog style)
const EditorialCard = styled(Link)`
  position: relative;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  /* Performance: isolate paint */
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`

const EditorialImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  position: relative;
  overflow: hidden;
  contain: layout style paint;
  background: #f5f5f5;
`

const EditorialInfo = styled.div`
  padding: 1.5rem;
`

const EditorialTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #101010;
  line-height: 1.3;
`

const EditorialSubtitle = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const EditorialMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #999;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`

const ProductCountBadge = styled.span`
  background: rgba(0, 0, 0, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
`

const MemoizedEditorialCard = memo(({ post, index, language }) => {
  const title = language === 'en' && post.titleEn ? post.titleEn : post.title
  const subtitle = language === 'en' && post.subtitleEn ? post.subtitleEn : post.subtitle
  
  return (
    <EditorialCard to={`/editorial/${post.slug || post.id}`}>
      <EditorialImageWrapper>
        <OptimizedImage
          src={post.featuredImage}
          alt={title}
          aspectRatio="3/4"
          loading={index < 2 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : index === 1 ? 'high' : 'auto'}
        />
      </EditorialImageWrapper>
      <EditorialInfo>
        <EditorialTitle>{title}</EditorialTitle>
        {subtitle && <EditorialSubtitle>{subtitle}</EditorialSubtitle>}
        <EditorialMeta>
          <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR') : ''}</span>
          {post.curatedProducts?.length > 0 && (
            <ProductCountBadge>
              {post.curatedProducts.length} {post.curatedProducts.length === 1 ? 'produit' : 'produits'}
            </ProductCountBadge>
          )}
        </EditorialMeta>
      </EditorialInfo>
    </EditorialCard>
  )
})

MemoizedEditorialCard.displayName = 'MemoizedEditorialCard'

// Memoized OutfitCard component to prevent unnecessary re-renders - Original design restored
const MemoizedOutfitCard = memo(({ outfit, index, isEager, t, language }) => (
  <OutfitCard
    key={outfit.id}
    to={`/outfits/${outfitToSlug(outfit)}`}
    onMouseEnter={() => prefetchRoute('/outfits')}
    onTouchStart={() => prefetchRoute('/outfits')}
    onClick={() => trackDiscoverClick(outfit.id)}
  >
    <OutfitImageWrapper>
      <OptimizedImage
        src={outfit.image}
        alt={getOutfitTitle(outfit, language)}
        fill
        loading={isEager ? 'eager' : 'lazy'}
        fetchPriority={index < 2 ? 'high' : undefined}
      />
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
    </OutfitImageWrapper>
    <OutfitOverlay>
      <OutfitTitle>{getOutfitTitle(outfit, language)}</OutfitTitle>
      <OutfitDescription>{getOutfitDescription(outfit, language)}</OutfitDescription>
      <PublicationDate>{getRelativeTime(outfit.publishedAt ?? outfit.createdAt)}</PublicationDate>
      <ShopButton>
        {t('outfit.shopNow')} →
      </ShopButton>
    </OutfitOverlay>
  </OutfitCard>
))

MemoizedOutfitCard.displayName = 'MemoizedOutfitCard'

// Shop Products Components for Secrets tab
const ShopProductsGrid = styled.div`
  display: grid;
  gap: 1.5rem;

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
`

const ShopProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  /* Performance: isolate paint */
  contain: layout style paint;
`

const ShopProductImage = styled.div`
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #f5f5f5;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ShopProductInfo = styled.div`
  padding: 1rem;
`

const ShopProductName = styled.h3`
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: #101010;
`

const ShopProductPrice = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0;
`

const ShopEmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;

  p {
    margin: 0 0 1rem 0;
  }
`

const NotifyLink = styled.a`
  display: inline-block;
  background: #101010;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  -webkit-tap-highlight-color: transparent;
`

// Inline Sale Detail Components
const SaleDetailContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`

const BackToSalesButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style;
`

const SaleHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`

const SaleImage = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto 1.5rem;
  border-radius: 12px;
  overflow: hidden;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`

const SaleTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #101010;
`

const SaleDescription = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin: 0 0 1.5rem;
  line-height: 1.6;
`

const AccessForm = styled.form`
  max-width: 400px;
  margin: 0 auto;
`

const AccessInput = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid ${props => props.$hasError ? '#e53e3e' : '#ddd'};
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.75rem;

  &:focus {
    outline: none;
    border-color: #101010;
  }
`

const AccessError = styled.p`
  color: #e53e3e;
  font-size: 0.85rem;
  text-align: center;
  margin: 0 0 0.75rem;
`

const AccessSubmitButton = styled.button`
  width: 100%;
  padding: 0.875rem 1rem;
  background: #101010;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SaleProductsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-top: 2rem;

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const SaleProductCard = styled(Link)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
  /* Performance: isolate paint */
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`

const SaleProductImage = styled.div`
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const SaleProductInfo = styled.div`
  padding: 1rem;
`

const SaleProductName = styled.h4`
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 0.25rem;
  color: #101010;
`

const SaleProductPrice = styled.p`
  font-size: 0.95rem;
  font-weight: 600;
  color: #101010;
  margin: 0;
`

// Inline Product Detail Components
const ProductDetailContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`

const BackToProductsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style;
`

const ProductDetailGrid = styled.div`
  display: grid;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
`

const ProductDetailImages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const ProductMainImage = styled.div`
  aspect-ratio: 3/4;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ProductThumbnails = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
`

const ProductThumbnail = styled.button`
  width: 60px;
  height: 80px;
  flex-shrink: 0;
  border: 2px solid ${props => props.$active ? '#101010' : 'transparent'};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  background: #f5f5f5;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style paint;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ProductDetailInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const ProductDetailName = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #101010;

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`

const ProductDetailPriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
`

const ProductDetailPrice = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #101010;
`

const ProductDetailOriginalPrice = styled.span`
  font-size: 1.1rem;
  color: #999;
  text-decoration: line-through;
`

const ProductDetailDescription = styled.div`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.7;

  p {
    margin: 0 0 1rem;
    &:last-child {
      margin-bottom: 0;
    }
  }
`

const ProductDetailMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
  color: #666;
`

const ProductDetailMetaItem = styled.div`
  display: flex;
  gap: 0.5rem;

  strong {
    color: #101010;
    font-weight: 500;
  }
`

const AddToCartButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  background: #101010;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const OutOfStockButton = styled(AddToCartButton)`
  background: #999;
  cursor: not-allowed;
`

// Clickable product card (not Link) for inline navigation
const SaleProductCardClickable = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  /* Performance: isolate paint */
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`

// Inline Editorial Detail Components
const EditorialDetailContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`

const BackToEditorialsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style;
`

const EditorialHeroImage = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 2rem;
  background: #f5f5f5;
`

const EditorialDetailTitle = styled.h2`
  font-size: 2rem;
  font-weight: 400;
  margin: 0 0 1rem 0;
  color: #101010;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`

const EditorialDetailSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  font-weight: 300;

  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`

const EditorialMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  color: #999;
  font-size: 0.9rem;
`

const EditorialDate = styled.span`
  &::after {
    content: '•';
    margin-left: 1rem;
    color: #ccc;
  }
`

const EditorialContent = styled.div`
  font-size: 1rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 3rem;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }

  p {
    margin: 0 0 1.5rem 0;
  }

  a {
    color: #101010;
    text-decoration: underline;
  }
`

const EditorialProductsSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
`

const EditorialProductsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0 0 1.5rem 0;
  color: #101010;
`

const EditorialProductsGrid = styled.div`
  display: grid;
  gap: 1.5rem;

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

const EditorialProductCard = styled.a`
  text-decoration: none;
  color: inherit;
  display: block;
  -webkit-tap-highlight-color: transparent;
`

const EditorialProductImage = styled.div`
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
  margin-bottom: 0.75rem;
`

const EditorialProductName = styled.h4`
  font-size: 0.9rem;
  font-weight: 400;
  margin: 0 0 0.25rem;
  color: #101010;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const EditorialProductBrand = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.25rem;
`

const EditorialProductPrice = styled.p`
  font-size: 0.9rem;
  font-weight: 500;
  color: #101010;
  margin: 0;
`

// Related Posts Section
const RelatedPostsSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
`

const RelatedPostsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0 0 1.5rem 0;
  color: #101010;
`

const RelatedPostsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(2, 1fr);

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
`

const RelatedPostCard = styled.div`
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`

const RelatedPostImage = styled.div`
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
  margin-bottom: 0.75rem;
`

const RelatedPostTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 0.25rem;
  color: #101010;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const RelatedPostDate = styled.p`
  font-size: 0.8rem;
  color: #999;
  margin: 0;
`

// Scroll to top button for editorial posts
const ScrollToTopButton = styled.button`
  position: fixed;
  bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
  right: 1.5rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #101010;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(20px)'};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: #333;
  }

  &:active {
    transform: ${props => props.$visible ? 'scale(0.95)' : 'translateY(20px)'};
  }

  svg {
    width: 24px;
    height: 24px;
  }

  @media (min-width: 768px) {
    bottom: 2rem;
    right: 2rem;
  }
`

// Clickable editorial card (not Link) for inline navigation
const EditorialCardClickable = styled.div`
  position: relative;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  /* Performance: isolate paint */
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`

function MainPortal() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const outfitsSectionRef = useRef(null)
  const { outfits, influencer, isLoading, error } = useOutfits()
  const { user, isAuthenticated, logout } = useAuth()
  const { addItem: addToCart, openCart } = useCart()
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [coupDeCoeurRequirePassword, setCoupDeCoeurRequirePassword] = useState(null)
  const [isCoupDeCoeurModalOpen, setIsCoupDeCoeurModalOpen] = useState(false)
  const [hasPrivateSales, setHasPrivateSales] = useState(null)
  const [isSecretsAccessModalOpen, setIsSecretsAccessModalOpen] = useState(false)
  const [ventePriveesSignupOpen, setVentePriveesSignupOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('outfits')
  const [outfitsPage, setOutfitsPage] = useState(1)
  const [wishlistPage, setWishlistPage] = useState(1)
  // Support deep-linking to a specific tab from profile cards, etc.
  // Example: /?tab=coup-de-coeur
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (!tab) return
    const allowedTabs = new Set(
      SHOW_SECRETS_TAB
        ? ['outfits', 'wishlist', 'secrets', 'coup-de-coeur']
        : ['outfits', 'wishlist', 'coup-de-coeur']
    )
    if (allowedTabs.has(tab)) {
      setActiveTab(tab)
    }
  }, [location.search])

  // If secrets is disabled, never stay on secrets (e.g. stale state)
  useEffect(() => {
    if (!SHOW_SECRETS_TAB && activeTab === 'secrets') {
      setActiveTab('outfits')
    }
  }, [activeTab])

  // Optional deep-link scroll target used by "Voir plus" from outfit detail.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const scrollTo = params.get('scrollTo')
    if (scrollTo !== 'outfits-start') return
    if (activeTab !== 'outfits') return
    if (!outfitsSectionRef.current) return

    requestAnimationFrame(() => {
      outfitsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.search, activeTab, outfits.length])

  const [shopProducts, setShopProducts] = useState([])
  const [isLoadingShopProducts, setIsLoadingShopProducts] = useState(false)
  // Private sale inline view state
  const [selectedSale, setSelectedSale] = useState(null)
  const [saleAccessCode, setSaleAccessCode] = useState('')
  const [saleVerified, setSaleVerified] = useState(false)
  const [saleProducts, setSaleProducts] = useState([])
  const [isLoadingSaleProducts, setIsLoadingSaleProducts] = useState(false)
  const [saleError, setSaleError] = useState(null)
  // Inline product detail view state
  const [selectedProduct, setSelectedProduct] = useState(null)
  // Inline editorial detail view state
  const [selectedEditorial, setSelectedEditorial] = useState(null)
  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false)
  // "Mes coups de coeur" editorial list
  const [editorialPosts, setEditorialPosts] = useState([])
  // null = not yet initiated, true = fetching, false = done
  const [isLoadingEditorial, setIsLoadingEditorial] = useState(null)

  const {
    favorites,
    removeFromFavorites,
    clearFavorites,
    getFavoritesCount,
    showSignupPrompt,
    closeSignupPrompt,
    pendingProduct,
    signupRedirectPath,
    addToFavoritesAsGuest
  } = useFavorites()

  // SEO optimization
  useSEO(seoConfig.home)

  // Preload hero image for faster LCP
  usePreloadImages(influencer?.heroImage ? [influencer.heroImage] : [])

  // iOS / Add to Home Screen: use hero image as app icon and "Emmanuelle K" as title when profile loads
  useEffect(() => {
    const title = influencer?.name || 'Emmanuelle K'
    const existingMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]')
    if (existingMeta) existingMeta.setAttribute('content', title)
    if (influencer?.heroImage) {
      let link = document.querySelector('link[rel="apple-touch-icon"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'apple-touch-icon')
        document.head.appendChild(link)
      }
      link.setAttribute('href', influencer.heroImage)
    }
  }, [influencer?.name, influencer?.heroImage])

  // Memoize filtered outfits to prevent recalculation on every render
  const outfitsByCategory = useMemo(() => ({
    outfit: outfits.filter(outfit => outfit.category === 'outfit'),
    wishlist: outfits.filter(outfit => outfit.category === 'wishlist'),
    coupDeCoeur: outfits.filter(outfit => outfit.category === 'coup-de-coeur')
  }), [outfits])

  const OUTFITS_PER_PAGE = 12
  const WISHLIST_PER_PAGE = 12
  const totalOutfitPages = Math.max(1, Math.ceil(outfitsByCategory.outfit.length / OUTFITS_PER_PAGE))
  const totalWishlistPages = Math.max(1, Math.ceil(editorialPosts.length / WISHLIST_PER_PAGE))
  const paginatedOutfits = useMemo(() => {
    const start = (outfitsPage - 1) * OUTFITS_PER_PAGE
    return outfitsByCategory.outfit.slice(start, start + OUTFITS_PER_PAGE)
  }, [outfitsByCategory.outfit, outfitsPage])
  const paginatedWishlistPosts = useMemo(() => {
    const start = (wishlistPage - 1) * WISHLIST_PER_PAGE
    return editorialPosts.slice(start, start + WISHLIST_PER_PAGE)
  }, [editorialPosts, wishlistPage])

  const buildVisiblePages = useCallback((current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 3) return [1, 2, 3, 4, '…', total]
    if (current >= total - 2) return [1, '…', total - 3, total - 2, total - 1, total]
    return [1, '…', current - 1, current, current + 1, '…', total]
  }, [])

  const visibleOutfitPages = useMemo(
    () => buildVisiblePages(outfitsPage, totalOutfitPages),
    [buildVisiblePages, outfitsPage, totalOutfitPages]
  )
  const visibleWishlistPages = useMemo(
    () => buildVisiblePages(wishlistPage, totalWishlistPages),
    [buildVisiblePages, wishlistPage, totalWishlistPages]
  )

  useEffect(() => {
    // Reset pagination when leaving/coming back to outfit tab
    if (activeTab !== 'outfits') return
    if (outfitsPage > totalOutfitPages) setOutfitsPage(1)
  }, [activeTab, outfitsPage, totalOutfitPages])
  useEffect(() => {
    // Reset pagination when leaving/coming back to wishlist tab
    if (activeTab !== 'wishlist') return
    if (wishlistPage > totalWishlistPages) setWishlistPage(1)
  }, [activeTab, wishlistPage, totalWishlistPages])

  // Scroll to top of section on page change
  const prevOutfitsPageRef = useRef(outfitsPage)
  useEffect(() => {
    if (prevOutfitsPageRef.current === outfitsPage) return
    prevOutfitsPageRef.current = outfitsPage
    requestAnimationFrame(() => {
      if (outfitsSectionRef.current) {
        outfitsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  }, [outfitsPage])

  const prevWishlistPageRef = useRef(wishlistPage)
  useEffect(() => {
    if (prevWishlistPageRef.current === wishlistPage) return
    prevWishlistPageRef.current = wishlistPage
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }, [wishlistPage])

  // Fetch "Coup de coeur" section settings - DEFERRED until idle to not block initial render
  useEffect(() => {
    let cancelled = false
    // Use requestIdleCallback to defer non-critical API calls
    const fetchSettings = () => {
      fetch(`${API_BASE_URL}/coup-de-coeur/settings`)
        .then(res => (res.ok ? res.json() : { requirePassword: false }))
        .then(data => {
          if (!cancelled) setCoupDeCoeurRequirePassword(!!data?.requirePassword)
        })
        .catch(() => {
          if (!cancelled) setCoupDeCoeurRequirePassword(false)
        })
    }

    // Defer to idle time or after 2 seconds max
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(fetchSettings, { timeout: 2000 })
      return () => { cancelled = true; cancelIdleCallback(id) }
    } else {
      const timeout = setTimeout(fetchSettings, 100)
      return () => { cancelled = true; clearTimeout(timeout) }
    }
  }, [])

  // Reset selected sale and product when leaving coup-de-coeur tab
  useEffect(() => {
    if (activeTab !== 'coup-de-coeur') {
      if (selectedSale) {
        setSelectedSale(null)
        setSaleAccessCode('')
        setSaleVerified(false)
        setSaleProducts([])
        setSaleError(null)
      }
      if (selectedProduct) {
        setSelectedProduct(null)
      }
    }
  }, [activeTab, selectedSale, selectedProduct])

  // Reset selected editorial when leaving wishlist tab
  useEffect(() => {
    if (activeTab !== 'wishlist' && selectedEditorial) {
      setSelectedEditorial(null)
    }
  }, [activeTab, selectedEditorial])

  // Reset active image index when product changes
  useEffect(() => {
    setActiveImageIndex(0)
  }, [selectedProduct])

  // Fetch editorial posts for "Mes coups de coeur" section (wishlist tab, below products)
  useEffect(() => {
    if (activeTab === 'wishlist') {
      setWishlistPage(1)
      setIsLoadingEditorial(true)
      import('../../utils/api').then(({ fetchEditorialPosts }) => {
        fetchEditorialPosts()
          .then(data => {
            setEditorialPosts(data.posts || [])
            setIsLoadingEditorial(false)
          })
          .catch(() => {
            setEditorialPosts([])
            setIsLoadingEditorial(false)
          })
      })
    }
  }, [activeTab])

  // Scroll to top button visibility for editorial posts
  useEffect(() => {
    if (!selectedEditorial) {
      setShowScrollTop(false)
      return
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [selectedEditorial])

  // Fetch shop products when secrets tab is active
  useEffect(() => {
    if (activeTab === 'secrets' && shopProducts.length === 0) {
      setIsLoadingShopProducts(true)
      fetch(`${API_BASE_URL}/shop/products/public`)
        .then(res => res.ok ? res.json() : { products: [] })
        .then(data => {
          const productsWithStock = (data.products || []).map(p => ({
            ...p,
            inStock: p.stock > 0
          }))
          setShopProducts(productsWithStock)
          setIsLoadingShopProducts(false)
        })
        .catch(() => {
          setShopProducts([])
          setIsLoadingShopProducts(false)
        })
    }
  }, [activeTab, shopProducts.length])

  // Fetch private sales - DEFERRED until idle to not block initial render
  useEffect(() => {
    let cancelled = false
    const fetchPrivateSales = () => {
      fetch(`${API_BASE_URL}/private-sales/public`)
        .then(res => (res.ok ? res.json() : {}))
        .then(data => {
          if (cancelled) return
          const all = [...(data.current || []), ...(data.upcoming || []), ...(data.past || [])]
          setHasPrivateSales(all.length > 0)
        })
        .catch(() => { if (!cancelled) setHasPrivateSales(false) })
    }

    // Defer to idle time or after 2 seconds max
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(fetchPrivateSales, { timeout: 2000 })
      return () => { cancelled = true; cancelIdleCallback(id) }
    } else {
      const timeout = setTimeout(fetchPrivateSales, 150)
      return () => { cancelled = true; clearTimeout(timeout) }
    }
  }, [])

  // Handle sale click for inline display
  const handleSaleClick = useCallback(async (saleId, sale) => {
    setSelectedSale(sale)
    setSaleAccessCode('')
    setSaleError(null)
    setSaleProducts([])

    // If no access code required, directly fetch products
    if (!sale.requiresAccessCode) {
      setSaleVerified(true)
      setIsLoadingSaleProducts(true)
      try {
        const productsRes = await fetch(`${API_BASE_URL}/private-sales/${saleId}/products`)
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setSaleProducts(productsData.products || [])
        }
      } catch {
        // Ignore errors
      }
      setIsLoadingSaleProducts(false)
    } else {
      setSaleVerified(false)
    }
  }, [])

  // Handle sale access verification
  const handleSaleVerify = useCallback(async (e) => {
    e.preventDefault()
    if (!selectedSale || !saleAccessCode.trim()) return

    setSaleError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/private-sales/${selectedSale.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: saleAccessCode.trim().toUpperCase() })
      })
      const data = await response.json()

      if (response.ok && data.verified) {
        setSaleVerified(true)
        // Fetch products
        setIsLoadingSaleProducts(true)
        const productsRes = await fetch(`${API_BASE_URL}/private-sales/${selectedSale.id}/products?code=${saleAccessCode.trim().toUpperCase()}`)
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setSaleProducts(productsData.products || [])
        }
        setIsLoadingSaleProducts(false)
      } else {
        setSaleError(data.error || (i18n.language === 'en' ? 'Invalid access code' : 'Code d\'accès invalide'))
      }
    } catch {
      setSaleError(i18n.language === 'en' ? 'Verification failed' : 'Échec de la vérification')
    }
  }, [selectedSale, saleAccessCode, i18n.language])

  // Go back to sales list
  const handleBackToSales = useCallback(() => {
    setSelectedSale(null)
    setSaleAccessCode('')
    setSaleVerified(false)
    setSaleProducts([])
    setSaleError(null)
    setSelectedProduct(null)
  }, [])

  // Handle product click for inline detail view
  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product)
  }, [])

  // Go back to products list
  const handleBackToProducts = useCallback(() => {
    setSelectedProduct(null)
  }, [])

  // Handle editorial click for inline detail view
  const handleEditorialClick = useCallback((post) => {
    setSelectedEditorial(post)
    // Scroll to top after React renders the new content
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }, [])

  // Go back to editorials list
  const handleBackToEditorials = useCallback(() => {
    setSelectedEditorial(null)
  }, [])

  // Scroll to top handler for editorial posts
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Preload first 2 images for faster LCP - Optimized
  const criticalImages = useMemo(() => 
    outfitsByCategory.outfit.slice(0, 2).map(outfit => outfit.image).filter(Boolean),
    [outfitsByCategory.outfit]
  )

  const heroCuratedText = useMemo(
    () => resolveHeroCuratedBy(i18n.language, influencer, t),
    [i18n.language, influencer, t]
  )
  const heroTaglineText = useMemo(
    () => resolveHeroTagline(i18n.language, influencer, t),
    [i18n.language, influencer, t]
  )
  
  // Add preload link for LCP image immediately - Critical for performance
  useEffect(() => {
    if (criticalImages.length > 0) {
      // Preload LCP image with highest priority
      const lcpImage = criticalImages[0]
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = lcpImage
      link.fetchPriority = 'high'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
      
      // Preload second image with lower priority
      if (criticalImages[1]) {
        const link2 = document.createElement('link')
        link2.rel = 'preload'
        link2.as = 'image'
        link2.href = criticalImages[1]
        link2.fetchPriority = 'auto'
        link2.crossOrigin = 'anonymous'
        document.head.appendChild(link2)
        return () => {
          link.remove()
          link2.remove()
        }
      }
      
      return () => link.remove()
    }
  }, [criticalImages])

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
        <BrandName to="/">{influencer?.name ?? 'Emmanuelle K'}</BrandName>
        <HeaderRight>
          {isAuthenticated ? (
            <NavLink to="/profile" title={t('nav.account') || 'Mon Compte'} aria-label={t('nav.account') || 'Mon Compte'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </NavLink>
          ) : (
            <NavButton onClick={() => setIsLoginModalOpen(true)} title={t('nav.login') || 'Connexion'} aria-label={t('nav.login') || 'Connexion'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </NavButton>
          )}
          <LazyCartButton 
            onClick={() => setIsFavoritesOpen(true)} 
            favoritesCount={getFavoritesCount()} 
          />
          <CartButton />
        </HeaderRight>
      </Header>

      {/* Hero Section - full-width banner (editable in backend profile) */}
      <HeroSection>
        {heroCuratedText ? <HeroCuratedBy>{heroCuratedText}</HeroCuratedBy> : null}
        <HeroBannerWrap>
          {influencer?.heroImage ? (
            <HeroBannerImg src={influencer.heroImage} alt="" fetchPriority="high" loading="eager" decoding="sync" />
          ) : (
            <HeroBannerPlaceholder>{influencer?.name ?? 'Emmanuelle K'}</HeroBannerPlaceholder>
          )}
        </HeroBannerWrap>
        <HeroName>{influencer?.name ?? 'Emmanuelle K'}</HeroName>
        {heroTaglineText ? <HeroTagline>{heroTaglineText}</HeroTagline> : null}
        <HeroSocial>
          {influencer?.socialMedia?.instagram && (
            <SocialLink href={influencer.socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </SocialLink>
          )}
          {influencer?.socialMedia?.tiktok && (
            <SocialLink href={influencer.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </SocialLink>
          )}
          {influencer?.socialMedia?.website && (
            <SocialLink href={influencer.socialMedia.website} target="_blank" rel="noopener noreferrer" aria-label="Site web">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </SocialLink>
          )}
          {influencer?.socialMedia?.email && (
            <SocialLink href={influencer.socialMedia.email.startsWith('mailto:') ? influencer.socialMedia.email : `mailto:${influencer.socialMedia.email}`} aria-label="Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </SocialLink>
          )}
        </HeroSocial>
      </HeroSection>
      
      {/* Tab Menu - Restored */}
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
            onClick={() => {
              const needPassword = coupDeCoeurRequirePassword === true && !getCoupDeCoeurUnlocked()
              if (needPassword) setIsCoupDeCoeurModalOpen(true)
              else setActiveTab('wishlist')
            }}
          >
            {t('nav.wishlist')}
          </TabButton>
          {SHOW_SECRETS_TAB && (
            <TabButton
              $active={activeTab === 'secrets'}
              onClick={() => setActiveTab('secrets')}
            >
              {t('nav.secretEmmanuelle')}
            </TabButton>
          )}
          <TabButton 
            $active={activeTab === 'coup-de-coeur'} 
            onClick={() => setActiveTab('coup-de-coeur')}
          >
            {t('nav.coupDeCoeur')}
          </TabButton>
        </TabMenu>
      </TabContainer>

      {/* Content based on active tab */}
      {activeTab === 'outfits' && (
        <EditorialSection ref={outfitsSectionRef}>
          <SectionHeaderRow>
            <SectionHeaderStack>
              <SectionTitle>{t('nav.outfitsSubtitle')}</SectionTitle>
            </SectionHeaderStack>
          </SectionHeaderRow>
          <OutfitsGrid>
            {outfitsByCategory.outfit.length > 0 ? (
              paginatedOutfits.map((outfit, index) => (
                <MemoizedOutfitCard 
                  key={outfit.id} 
                  outfit={outfit} 
                  index={index} 
                  isEager={outfitsPage === 1 && index < 4}
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
          {outfitsByCategory.outfit.length > OUTFITS_PER_PAGE && (
            <PaginationWrap>
              <PaginationInfo>
                {i18n.language === 'en'
                  ? `Page ${outfitsPage} of ${totalOutfitPages}`
                  : `Page ${outfitsPage} sur ${totalOutfitPages}`}
              </PaginationInfo>
              <PaginationControls>
                <PageButton
                  type="button"
                  $disabled={outfitsPage === 1}
                  onClick={() => setOutfitsPage(p => Math.max(1, p - 1))}
                >
                  {i18n.language === 'en' ? 'Prev' : 'Prec.'}
                </PageButton>
                {visibleOutfitPages.map((p, idx) =>
                  p === '…' ? (
                    <PaginationEllipsis key={`ellipsis-${idx}`}>…</PaginationEllipsis>
                  ) : (
                    <PageButton
                      key={`page-${p}`}
                      type="button"
                      $active={p === outfitsPage}
                      onClick={() => setOutfitsPage(p)}
                    >
                      {p}
                    </PageButton>
                  )
                )}
                <PageButton
                  type="button"
                  $disabled={outfitsPage === totalOutfitPages}
                  onClick={() => setOutfitsPage(p => Math.min(totalOutfitPages, p + 1))}
                >
                  {i18n.language === 'en' ? 'Next' : 'Suiv.'}
                </PageButton>
              </PaginationControls>
            </PaginationWrap>
          )}
        </EditorialSection>
      )}

      {activeTab === 'wishlist' && (
        <EditorialSection>
          {/* Only show header when not viewing editorial detail */}
          {!selectedEditorial && (
            <SectionHeaderRow style={{ marginBottom: '1.5rem' }}>
              <SectionHeaderStack>
                <SectionTitle style={{ margin: 0 }}>{t('nav.wishlistSubtitle')}</SectionTitle>
              </SectionHeaderStack>
            </SectionHeaderRow>
          )}

          {/* Inline editorial detail view */}
          {selectedEditorial ? (
            <>
            <EditorialDetailContainer>
              <BackToEditorialsButton onClick={handleBackToEditorials}>
                ← {i18n.language === 'en' ? 'Back to articles' : 'Retour aux articles'}
              </BackToEditorialsButton>

              <EditorialHeroImage>
                <OptimizedImage
                  src={selectedEditorial.featuredImage}
                  alt={i18n.language === 'en' && selectedEditorial.titleEn ? selectedEditorial.titleEn : selectedEditorial.title}
                  aspectRatio="16/9"
                />
              </EditorialHeroImage>

              <EditorialDetailTitle>
                {i18n.language === 'en' && selectedEditorial.titleEn ? selectedEditorial.titleEn : selectedEditorial.title}
              </EditorialDetailTitle>

              {(selectedEditorial.subtitle || selectedEditorial.subtitleEn) && (
                <EditorialDetailSubtitle>
                  {i18n.language === 'en' && selectedEditorial.subtitleEn ? selectedEditorial.subtitleEn : selectedEditorial.subtitle}
                </EditorialDetailSubtitle>
              )}

              <EditorialMetaRow>
                <EditorialDate>
                  {selectedEditorial.publishedAt
                    ? new Date(selectedEditorial.publishedAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : ''}
                </EditorialDate>
                <SubtleShareButton post={selectedEditorial} />
              </EditorialMetaRow>

              {(selectedEditorial.content || selectedEditorial.contentEn) && (
                <EditorialContent
                  dangerouslySetInnerHTML={{
                    __html: i18n.language === 'en' && selectedEditorial.contentEn ? selectedEditorial.contentEn : selectedEditorial.content
                  }}
                />
              )}

              {selectedEditorial.curatedProducts && selectedEditorial.curatedProducts.length > 0 && (
                <EditorialProductsSection>
                  <EditorialProductsTitle>
                    {t('editorial.shopTheEdit', 'Shop the Edit')}
                  </EditorialProductsTitle>
                  <EditorialProductsGrid>
                    {selectedEditorial.curatedProducts.map((product, index) => (
                      <EditorialProductCard
                        key={product.id || index}
                        href={product.affiliateLink ? product.affiliateLink.replace(/&amp;/g, '&') : '#'}
                        target={product.affiliateLink ? '_blank' : undefined}
                        rel={product.affiliateLink ? 'noopener noreferrer' : undefined}
                      >
                        <EditorialProductImage>
                          {product.imageUrl && (
                            <OptimizedImage
                              src={product.imageUrl}
                              alt={product.name}
                              aspectRatio="3/4"
                              loading={index < 4 ? 'eager' : 'lazy'}
                            />
                          )}
                        </EditorialProductImage>
                        <EditorialProductName>{product.name}</EditorialProductName>
                        {product.brand && (
                          <EditorialProductBrand>{product.brand}</EditorialProductBrand>
                        )}
                        {product.price && (
                          <EditorialProductPrice>{product.price}</EditorialProductPrice>
                        )}
                      </EditorialProductCard>
                    ))}
                  </EditorialProductsGrid>
                </EditorialProductsSection>
              )}

              {/* Related Posts Section */}
              {editorialPosts.filter(p => p.id !== selectedEditorial.id).length > 0 && (
                <RelatedPostsSection>
                  <RelatedPostsTitle>
                    {i18n.language === 'en' ? 'My Other Editos' : 'Mes autres éditos'}
                  </RelatedPostsTitle>
                  <RelatedPostsGrid>
                    {editorialPosts
                      .filter(p => p.id !== selectedEditorial.id)
                      .slice(0, 3)
                      .map((post, index) => (
                        <RelatedPostCard
                          key={post.id}
                          onClick={() => handleEditorialClick(post)}
                        >
                          <RelatedPostImage>
                            <OptimizedImage
                              src={post.featuredImage}
                              alt={i18n.language === 'en' && post.titleEn ? post.titleEn : post.title}
                              aspectRatio="3/4"
                              loading="lazy"
                            />
                          </RelatedPostImage>
                          <RelatedPostTitle>
                            {i18n.language === 'en' && post.titleEn ? post.titleEn : post.title}
                          </RelatedPostTitle>
                          <RelatedPostDate>
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR') : ''}
                          </RelatedPostDate>
                        </RelatedPostCard>
                      ))}
                  </RelatedPostsGrid>
                </RelatedPostsSection>
              )}
            </EditorialDetailContainer>

              {/* Scroll to top button */}
              <ScrollToTopButton
                $visible={showScrollTop}
                onClick={scrollToTop}
                aria-label={i18n.language === 'en' ? 'Scroll to top' : 'Remonter'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </ScrollToTopButton>
            </>
          ) : isLoadingEditorial !== false ? (
            <EditorialSkeleton />
          ) : editorialPosts.length > 0 ? (
            <>
              <OutfitsGrid>
                {paginatedWishlistPosts.map((post, index) => (
                  <EditorialCardClickable
                    key={post.id}
                    onClick={() => handleEditorialClick(post)}
                  >
                    <EditorialImageWrapper>
                      <OptimizedImage
                        src={post.featuredImage}
                        alt={i18n.language === 'en' && post.titleEn ? post.titleEn : post.title}
                        aspectRatio="3/4"
                        loading={index < 2 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : index === 1 ? 'high' : 'auto'}
                      />
                    </EditorialImageWrapper>
                    <EditorialInfo>
                      <EditorialTitle>
                        {i18n.language === 'en' && post.titleEn ? post.titleEn : post.title}
                      </EditorialTitle>
                      {(post.subtitle || post.subtitleEn) && (
                        <EditorialSubtitle>
                          {i18n.language === 'en' && post.subtitleEn ? post.subtitleEn : post.subtitle}
                        </EditorialSubtitle>
                      )}
                      <EditorialMeta>
                        <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR') : ''}</span>
                        {post.curatedProducts?.length > 0 && (
                          <ProductCountBadge>
                            {post.curatedProducts.length} {post.curatedProducts.length === 1 ? 'produit' : 'produits'}
                          </ProductCountBadge>
                        )}
                      </EditorialMeta>
                    </EditorialInfo>
                  </EditorialCardClickable>
                ))}
              </OutfitsGrid>
              {editorialPosts.length > WISHLIST_PER_PAGE && (
                <PaginationWrap>
                  <PaginationInfo>
                    {i18n.language === 'en'
                      ? `Page ${wishlistPage} of ${totalWishlistPages}`
                      : `Page ${wishlistPage} sur ${totalWishlistPages}`}
                  </PaginationInfo>
                  <PaginationControls>
                    <PageButton
                      type="button"
                      $disabled={wishlistPage === 1}
                      onClick={() => setWishlistPage(p => Math.max(1, p - 1))}
                    >
                      {i18n.language === 'en' ? 'Prev' : 'Prec.'}
                    </PageButton>
                    {visibleWishlistPages.map((p, idx) =>
                      p === '…' ? (
                        <PaginationEllipsis key={`wishlist-ellipsis-${idx}`}>…</PaginationEllipsis>
                      ) : (
                        <PageButton
                          key={`wishlist-page-${p}`}
                          type="button"
                          $active={p === wishlistPage}
                          onClick={() => setWishlistPage(p)}
                        >
                          {p}
                        </PageButton>
                      )
                    )}
                    <PageButton
                      type="button"
                      $disabled={wishlistPage === totalWishlistPages}
                      onClick={() => setWishlistPage(p => Math.min(totalWishlistPages, p + 1))}
                    >
                      {i18n.language === 'en' ? 'Next' : 'Suiv.'}
                    </PageButton>
                  </PaginationControls>
                </PaginationWrap>
              )}
            </>
          ) : (
            <NoOutfitsMessage>{t('outfit.noProducts')}</NoOutfitsMessage>
          )}
        </EditorialSection>
      )}

      {activeTab === 'coup-de-coeur' && (
        <EditorialSection>
          {/* Show heading for all users */}
          <SectionHeaderRow style={{ marginBottom: '1.5rem' }}>
            <SectionHeaderStack>
              <SectionTitle style={{ margin: 0 }}>{t('nav.coupDeCoeurSubtitle')}</SectionTitle>
            </SectionHeaderStack>
          </SectionHeaderRow>

          {/* Show inline sale detail when a sale is selected */}
          {selectedSale ? (
            <SaleDetailContainer>
              {/* Only show "Back to sales" when not viewing a product */}
              {!selectedProduct && (
                <BackToSalesButton onClick={handleBackToSales}>
                  ← {i18n.language === 'en' ? 'Back to sales' : 'Retour aux ventes'}
                </BackToSalesButton>
              )}

              {!saleVerified ? (
                <AccessForm onSubmit={handleSaleVerify}>
                  <AccessInput
                    type="text"
                    value={saleAccessCode}
                    onChange={(e) => {
                      setSaleAccessCode(e.target.value.toUpperCase())
                      if (saleError) setSaleError(null)
                    }}
                    placeholder={i18n.language === 'en' ? 'Enter access code' : 'Entrez le code d\'accès'}
                    $hasError={!!saleError}
                    autoFocus
                  />
                  {saleError && <AccessError>{saleError}</AccessError>}
                  <AccessSubmitButton type="submit" disabled={!saleAccessCode.trim()}>
                    {i18n.language === 'en' ? 'Access this sale' : 'Accéder à cette vente'}
                  </AccessSubmitButton>
                </AccessForm>
              ) : selectedProduct ? (
                // Inline product detail view
                <ProductDetailContainer>
                  <BackToProductsButton onClick={handleBackToProducts}>
                    ← {i18n.language === 'en' ? 'Back to products' : 'Retour aux produits'}
                  </BackToProductsButton>

                  <ProductDetailGrid>
                    <ProductDetailImages>
                      <ProductMainImage>
                        <OptimizedImage
                          src={(selectedProduct.images && selectedProduct.images[activeImageIndex]) || selectedProduct.imageUrl}
                          alt={i18n.language === 'en' && selectedProduct.nameEn ? selectedProduct.nameEn : selectedProduct.name}
                          aspectRatio="3/4"
                        />
                      </ProductMainImage>
                      {selectedProduct.images && selectedProduct.images.length > 1 && (
                        <ProductThumbnails>
                          {selectedProduct.images.map((img, idx) => (
                            <ProductThumbnail
                              key={idx}
                              $active={idx === activeImageIndex}
                              onClick={() => setActiveImageIndex(idx)}
                            >
                              <img src={img} alt="" />
                            </ProductThumbnail>
                          ))}
                        </ProductThumbnails>
                      )}
                    </ProductDetailImages>

                    <ProductDetailInfo>
                      <ProductDetailName>
                        {i18n.language === 'en' && selectedProduct.nameEn ? selectedProduct.nameEn : selectedProduct.name}
                      </ProductDetailName>

                      {selectedProduct.price && (
                        <ProductDetailPriceContainer>
                          <ProductDetailPrice>{Number(selectedProduct.price).toFixed(2)}€</ProductDetailPrice>
                          {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                            <ProductDetailOriginalPrice>{Number(selectedProduct.originalPrice).toFixed(2)}€</ProductDetailOriginalPrice>
                          )}
                        </ProductDetailPriceContainer>
                      )}

                      {(selectedProduct.description || selectedProduct.descriptionEn) && (
                        <ProductDetailDescription>
                          <p>{i18n.language === 'en' && selectedProduct.descriptionEn ? selectedProduct.descriptionEn : selectedProduct.description}</p>
                        </ProductDetailDescription>
                      )}

                      <ProductDetailMeta>
                        {selectedProduct.brand && (
                          <ProductDetailMetaItem>
                            <strong>{i18n.language === 'en' ? 'Brand:' : 'Marque:'}</strong> {selectedProduct.brand}
                          </ProductDetailMetaItem>
                        )}
                        {selectedProduct.condition && (
                          <ProductDetailMetaItem>
                            <strong>{i18n.language === 'en' ? 'Condition:' : 'État:'}</strong> {selectedProduct.condition}
                          </ProductDetailMetaItem>
                        )}
                        {selectedProduct.size && (
                          <ProductDetailMetaItem>
                            <strong>{i18n.language === 'en' ? 'Size:' : 'Taille:'}</strong> {selectedProduct.size}
                          </ProductDetailMetaItem>
                        )}
                      </ProductDetailMeta>

                      {selectedProduct.stock > 0 ? (
                        <AddToCartButton
                          onClick={() => {
                            addToCart({
                              productId: selectedProduct.id,
                              name: selectedProduct.name,
                              nameEn: selectedProduct.nameEn,
                              price: selectedProduct.price,
                              imageUrl: selectedProduct.images?.[0] || selectedProduct.imageUrl,
                              stock: selectedProduct.stock,
                              saleId: selectedSale.id
                            })
                            openCart()
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                          </svg>
                          {i18n.language === 'en' ? 'Add to cart' : 'Ajouter au panier'}
                        </AddToCartButton>
                      ) : (
                        <OutOfStockButton disabled>
                          {i18n.language === 'en' ? 'Out of stock' : 'Rupture de stock'}
                        </OutOfStockButton>
                      )}
                    </ProductDetailInfo>
                  </ProductDetailGrid>
                </ProductDetailContainer>
              ) : (
                <>
                  {isLoadingSaleProducts ? (
                    <EditorialSkeleton />
                  ) : saleProducts.length > 0 ? (
                    <SaleProductsGrid>
                      {saleProducts.map((product) => (
                        <SaleProductCardClickable key={product.id} onClick={() => handleProductClick(product)}>
                          <SaleProductImage>
                            <OptimizedImage
                              src={product.images?.[0] || product.imageUrl}
                              alt={i18n.language === 'en' && product.nameEn ? product.nameEn : product.name}
                              aspectRatio="1"
                              loading="lazy"
                            />
                          </SaleProductImage>
                          <SaleProductInfo>
                            <SaleProductName>
                              {i18n.language === 'en' && product.nameEn ? product.nameEn : product.name}
                            </SaleProductName>
                            {product.price && (
                              <SaleProductPrice>{product.price}€</SaleProductPrice>
                            )}
                          </SaleProductInfo>
                        </SaleProductCardClickable>
                      ))}
                    </SaleProductsGrid>
                  ) : (
                    <NoOutfitsMessage>
                      {i18n.language === 'en' ? 'No items in this sale yet.' : 'Aucun article pour le moment.'}
                    </NoOutfitsMessage>
                  )}
                </>
              )}
            </SaleDetailContainer>
          ) : (
            <>
              {hasPrivateSales === false && (
                <PrivateSalesTeaser>
                  <PrivateSalesContent>
                    <PrivateSalesSubtitle>
                      {t('ventesPrivees.teaserParagraph1', "Trouve ici, sur invitation, certaines pièces et accessoires qui m'ont accompagnée le temps d'un moment de vie, d'un shooting ou d'une inspiration.")}
                    </PrivateSalesSubtitle>
                    <PrivateSalesSubtitle>
                      {t('ventesPrivees.teaserParagraph2', "Parce qu'ils font partie de mes préférés, parce qu'ils ont été choisis avec soin et conservés avec attention, je suis heureuse de leur offrir aujourd'hui la chance de continuer leur histoire ailleurs.")}
                    </PrivateSalesSubtitle>
                    <PrivateSalesActions>
                      <PrivateSalesPrimaryButton type="button" onClick={() => setVentePriveesSignupOpen(true)}>
                        {t('ventesPrivees.invitationCta', 'Clique ici pour recevoir une invitation')}
                      </PrivateSalesPrimaryButton>
                    </PrivateSalesActions>
                  </PrivateSalesContent>
                </PrivateSalesTeaser>
              )}
              <PrivateSalesWrapper>
                <PrivateSalesSection hideHeading onSaleClick={handleSaleClick} />
              </PrivateSalesWrapper>
            </>
          )}
        </EditorialSection>
      )}

      {SHOW_SECRETS_TAB && activeTab === 'secrets' && (
        <EditorialSection>
          <SectionHeaderRow>
            <SectionTitle>{t('nav.secretEmmanuelle')}</SectionTitle>
          </SectionHeaderRow>
          {isLoadingShopProducts ? (
            <EditorialSkeleton />
          ) : shopProducts.filter(p => p.inStock).length > 0 ? (
            <ShopProductsGrid>
              {shopProducts.filter(p => p.inStock).map((product) => (
                <ShopProductCard key={product.id}>
                  <ShopProductImage>
                    <OptimizedImage
                      src={product.imageUrl}
                      alt={i18n.language === 'en' && product.nameEn ? product.nameEn : product.name}
                      aspectRatio="3/4"
                      loading="lazy"
                    />
                  </ShopProductImage>
                  <ShopProductInfo>
                    <ShopProductName>
                      {i18n.language === 'en' && product.nameEn ? product.nameEn : product.name}
                    </ShopProductName>
                    {product.price && (
                      <ShopProductPrice>{Number(product.price).toFixed(2)} €</ShopProductPrice>
                    )}
                  </ShopProductInfo>
                </ShopProductCard>
              ))}
            </ShopProductsGrid>
          ) : (
            <ShopEmptyState>
              <p>{t('shop.comingSoon', 'Bientôt disponible...')}</p>
              <NotifyLink
                href="https://tally.so/r/eqrGq0"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('shop.clickToBeNotified', 'Clique ici pour être avertie')}
              </NotifyLink>
            </ShopEmptyState>
          )}
        </EditorialSection>
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
            redirectAfterLogin={signupRedirectPath}
            itemName={pendingProduct?.name}
          />
        </Suspense>
      )}

      {/* Signup modal from Vente Privées "receive an invitation" CTA (same as /signup page) */}
      {ventePriveesSignupOpen && (
        <Suspense fallback={null}>
          <SignUp asModal onClose={() => setVentePriveesSignupOpen(false)} fromInvitationFlow />
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

      {isCoupDeCoeurModalOpen && (
        <Suspense fallback={null}>
          <CoupDeCoeurAccessModal
            isOpen={isCoupDeCoeurModalOpen}
            onClose={() => setIsCoupDeCoeurModalOpen(false)}
            onSuccess={() => setActiveTab('wishlist')}
          />
        </Suspense>
      )}

      {isSecretsAccessModalOpen && (
        <Suspense fallback={null}>
          <SecretsAccessModal
            isOpen={isSecretsAccessModalOpen}
            onClose={() => setIsSecretsAccessModalOpen(false)}
          />
        </Suspense>
      )}
    </MainContainer>
  )
}

export default memo(MainPortal)