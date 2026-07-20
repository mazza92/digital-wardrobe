import { useState, useEffect, memo, useMemo, useCallback, useRef, lazy, Suspense, startTransition } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { getOutfitDescription, getOutfitTitle, parseOutfitDescriptionBlocks } from '../../utils/outfitUtils'
import { useFavorites } from '../../hooks/useFavorites'
import { useAuth } from '../../context/AuthContext'
import { useSEO, seoConfig } from '../../hooks/useSEO'
import { fetchOutfits, getRelativeTime } from '../../utils/api'
import { outfitToSlug, slugToOutfitId, isOutfitDbId } from '../../utils/slugify'
import FavoritesList from '../ui/FavoritesList'
import CartButton from '../shop/CartButton'
import SubtleShareButton from '../ui/SubtleShareButton'
import { handleAffiliateClick, trackClick } from '../../utils/tracking'
import { trackPageView, trackProductTagClick } from '../../utils/analytics'
import OptimizedImage, { usePreloadImages } from '../ui/OptimizedImage'
import { LazyCartButton, prefetchRoute } from '../../utils/performance'
import { prefetchOutfits } from '../../hooks/useOutfits'
import { registerGuestOutfitView, registerGuestVote } from '../../utils/engagementNudge'

// Lazy load modal components
const SignupPrompt = lazy(() => import('../ui/SignupPrompt'))
const LoginModal = lazy(() => import('../ui/LoginModal'))

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.emmanuellek.com/api'
const VOTE_SESSION_KEY = 'dw_vote_session'

function getOrCreateSessionId() {
  try {
    let id = sessionStorage.getItem(VOTE_SESSION_KEY)
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      sessionStorage.setItem(VOTE_SESSION_KEY, id)
    }
    return id
  } catch {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }
}

const DetailContainer = styled.div`
  min-height: 100vh;
  background: #FDFCF8;
  padding-bottom: max(2rem, env(safe-area-inset-bottom, 0px) + 1.5rem);
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

  /* Instagram in-app browser optimization */
  @media (max-height: 700px) and (max-width: 480px) {
    padding: 0.625rem 0.875rem;
    min-height: 48px;
  }

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

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border-radius: 8px;
  font-weight: 400;
  margin-right: 0.25rem;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style;

  @media (min-width: 480px) {
    font-size: 0.9rem;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    margin-right: 0.5rem;
  }

  @media (min-width: 768px) {
    font-size: 0.95rem;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    margin-right: 0.75rem;
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

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  padding-bottom: max(2rem, env(safe-area-inset-bottom, 0px) + 1.5rem);
  
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: start;
    padding-bottom: max(2rem, env(safe-area-inset-bottom, 0px) + 1.5rem);
  }
`

const ImageSection = styled.div`
  position: relative;
  background: white;
  border-radius: 4px;
  overflow: visible;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  /* Instagram in-app browser optimization */
  @media (max-height: 700px) and (max-width: 480px) {
    margin-bottom: 1rem;
    border-radius: 0;
    box-shadow: none;
  }

  @media (min-width: 768px) {
    margin-bottom: 0;
    position: sticky;
    top: 120px;
  }
`

const ImageCardContent = styled.div`
  padding: 1.5rem 1.25rem;
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 0px) + 1rem);

  /* Instagram in-app browser and small viewport height optimization */
  @media (max-height: 700px) and (max-width: 480px) {
    padding: 1rem 1rem;
    padding-bottom: max(1rem, env(safe-area-inset-bottom, 0px) + 0.75rem);
  }

  @media (min-width: 768px) {
    padding: 1.75rem 1.5rem;
    padding-bottom: max(1.75rem, env(safe-area-inset-bottom, 0px) + 1rem);
  }
`

const InstructionText = styled.p`
  margin: 0;
  padding: 1rem 1.25rem 0.75rem;
  font-size: 0.85rem;
  color: #444;
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: 1.4;
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
    padding: 1.25rem 1.5rem 1rem;
  }
`

const ImageContainer = styled.div`
  position: relative;
  background: #f8f8f8;
  width: 100%;
  overflow: visible;
  /* Prevent CLS - isolate layout */
  contain: layout style;
`

const shimmerAnimation = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const ImageTagWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  /* Prevent CLS - reserve space before image loads */
  contain: layout style;
  background: #f5f5f5;
  /* Allow popup to overflow on desktop */
  overflow: visible;

  /* Instagram in-app browser and small viewport height optimization */
  @media (max-height: 700px) and (max-width: 480px) {
    aspect-ratio: 4/5;
  }

  @media (max-height: 600px) and (max-width: 480px) {
    aspect-ratio: 1/1;
  }

  @media (min-width: 768px) {
    aspect-ratio: 4/5;
  }
`

const ImageShimmer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: ${shimmerAnimation} 1.2s ease-in-out infinite;
  z-index: 1;
`

const OutfitImg = styled.img`
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  cursor: crosshair;
  z-index: 2;
  opacity: ${props => props.$loaded ? 1 : 0};
  transition: opacity 0.3s ease-out;
`

const ImageErrorFallback = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  font-size: 0.9rem;
  z-index: 3;
`

const FavoriteOverlayButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  color: ${props => props.$isFavorited ? '#dc2626' : '#101010'};
  /* Performance: isolate paint, no will-change */
  contain: layout style paint;

  svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    fill: ${props => props.$isFavorited ? 'currentColor' : 'none'};
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`

// Instagram-style pulsing ring: ripples outward 3 times then stops
const tagPing = keyframes`
  0%   { box-shadow: 0 2px 8px rgba(0,0,0,0.18), 0 0 0 0   rgba(255,255,255,0.80); }
  60%  { box-shadow: 0 2px 8px rgba(0,0,0,0.18), 0 0 0 11px rgba(255,255,255,0.00); }
  100% { box-shadow: 0 2px 8px rgba(0,0,0,0.18), 0 0 0 0   rgba(255,255,255,0.00); }
`

const ProductTag = styled.button`
  position: absolute;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #101010;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style paint;
  /* 3 pulses staggered by --entrance-delay (set via inline style), then rests */
  animation: ${tagPing} 1.4s ease-out var(--entrance-delay, 0s) 3 both;

  @media (max-width: 767px) {
    width: 22px;
    height: 22px;
    min-width: 22px;
    min-height: 22px;
    border-width: 1.5px;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`

// Brief "tap a dot" hint — floats over image, auto-fades, non-blocking
const hintFadeIn = keyframes`
  from { opacity: 0; transform: translateX(-50%) translateY(6px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
`
const hintFadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; pointer-events: none; }
`
const TapHint = styled.div`
  position: absolute;
  top: 1.1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(0, 0, 0, 0.70);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.2px;
  padding: 0.55rem 1rem 0.55rem 0.8rem;
  border-radius: 100px;
  white-space: nowrap;
  pointer-events: none;
  animation:
    ${hintFadeIn}  0.35s ease-out 0.6s both,
    ${hintFadeOut} 0.5s  ease-in  2.8s both;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`

const PopupOverlay = styled.div`
  display: ${props => props.$visible ? 'block' : 'none'};
  position: fixed;
  inset: 0;
  z-index: 999;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.38);

  /* Desktop: lighter overlay (popup is absolute, not fixed) */
  @media (min-width: 768px) {
    position: absolute;
    background: transparent;
  }
`

const ProductPopupThumbnail = styled.div`
  display: none;
`

const ProductPopup = styled.div`
  background: #ffffff;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  border-radius: 24px;
  border: 0.5px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: ${props => props.$visible ? 'block' : 'none'};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  overflow: hidden;

  /* Desktop: absolute near the tag dot */
  position: absolute;
  width: 320px;
  max-width: calc(100% - 40px);

  /* Mobile: centered floating card over the image */
  @media (max-width: 767px) {
    position: fixed;
    left: 50% !important;
    top: 50% !important;
    bottom: auto !important;
    transform: translate(-50%, -50%) !important;
    width: min(320px, 88vw);
    max-width: none;
    border-radius: 24px;
  }
`

const PopupHeader = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 14px 14px 12px 14px;
  gap: 14px;
`

const PopupPhoto = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 16px;
  background: #f0efea;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`

const PopupInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const PopupCloseRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
`

const ProductName = styled.h3`
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 3px 0;
  color: #1a1a1a;
  line-height: 1.3;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`

const ProductBrand = styled.p`
  font-size: 9px;
  color: #aaa;
  margin: 0 0 3px 0;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-align: left;
`

const ProductPrice = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #666;
  margin: 0;
  text-align: left;
`

const ProductPopupContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
`

const ProductPopupRow = styled.div`display: contents;`

const ProductPopupDetails = styled.div`
  width: 100%;
  text-align: center;
`

const PopupDivider = styled.hr`
  display: none;
`

const ProductPopupActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1.25rem;
`

const PopupButtons = styled.div`
  padding: 0 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const PopupShopButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  padding: 16px;
  border-radius: 50px;
  text-align: center;
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0;
  text-transform: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background 0.2s ease;

  &:hover {
    background: #333;
  }

  &:active {
    background: #000;
  }
`

const PopupButtonRow = styled.div`
  display: flex;
  gap: 8px;
`

const PopupOutlineButton = styled.button`
  flex: 1;
  padding: 13px 8px;
  background: transparent;
  border: 0.5px solid #ccc;
  border-radius: 50px;
  font-size: 13px;
  color: #1a1a1a;
  cursor: pointer;
  font-family: inherit;
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: all 0.15s ease;

  &:hover {
    border-color: #999;
    background: rgba(0, 0, 0, 0.02);
  }

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
`

const PopupFullButton = styled.button`
  width: 100%;
  padding: 13px;
  background: transparent;
  border: 0.5px solid ${props => props.$saved ? '#dc2626' : '#ccc'};
  border-radius: 50px;
  font-size: 13px;
  color: ${props => props.$saved ? '#dc2626' : '#1a1a1a'};
  cursor: pointer;
  font-family: inherit;
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${props => props.$saved ? '#dc2626' : '#999'};
    background: ${props => props.$saved ? 'rgba(220, 38, 38, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  }
`

const PopupSaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0;
  background: transparent;
  border: 1.5px solid ${props => props.$saved ? '#dc2626' : '#e5e5e5'};
  color: ${props => props.$saved ? '#dc2626' : '#666'};
  padding: 0.75rem 1rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.$saved ? '#dc2626' : '#ccc'};
    background: ${props => props.$saved ? 'rgba(220, 38, 38, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  }

  svg {
    fill: ${props => props.$saved ? 'currentColor' : 'none'};
    flex-shrink: 0;
  }
`

const VoteButtonRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
  contain: layout style;

  @media (min-width: 400px) {
    flex-direction: row;
    gap: 0.5rem;
  }
`

const VoteButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 0.5rem;
  min-height: 2rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--vb-border, #e0e0e0);
  cursor: pointer;
  background: var(--vb-bg, #fafafa);
  color: var(--vb-color, #555);
  min-width: 0;
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: all 0.15s ease;

  &:active {
    background: #f0f0f0;
  }

  @media (min-width: 400px) {
    padding: 0.6rem 0.65rem;
    min-height: 2.25rem;
    font-size: 0.8rem;
    gap: 0.4rem;
  }

  .vote-emoji {
    font-size: 0.85rem;
    line-height: 1;
    flex-shrink: 0;

    @media (min-width: 400px) {
      font-size: 0.95rem;
    }
  }

  .vote-label {
    white-space: nowrap;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 1;
  }
`

// ── Instagram-style poll results ──────────────────────────────────────────
// Single static keyframe — width target is driven by CSS var(--w) set via
// inline style. This avoids injecting a new @keyframes rule per percentage
// value (which styled-components never garbage-collects).
const expandBar = keyframes`
  from { width: 0% }
  to   { width: var(--w, 50%) }
`

const PollWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.375rem;

  @media (min-width: 400px) {
    gap: 0.45rem;
    margin-top: 0.5rem;
  }
`

const PollRow = styled.button`
  position: relative;
  width: 100%;
  height: 1.85rem;
  border-radius: 100px;
  border: 1px solid var(--pr-border, rgba(0,0,0,0.1));
  background: #fafafa;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  @media (min-width: 400px) {
    height: 2rem;
  }
`

const PollFill = styled.div`
  position: absolute;
  inset-block: 0;
  left: 0;
  border-radius: 100px;
  background: var(--pf-bg, rgba(0,0,0,0.05));
  animation: ${expandBar} 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
`

const PollRowContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 0.4rem;
  gap: 0.2rem;
  pointer-events: none;

  @media (min-width: 400px) {
    padding: 0 0.5rem;
    gap: 0.25rem;
  }
`

const PollIcon = styled.span`
  font-size: 0.65rem;
  line-height: 1;
  flex-shrink: 0;
  display: flex;
  align-items: center;

  @media (min-width: 400px) {
    font-size: 0.75rem;
  }
`

const PollLabel = styled.span`
  flex: 1;
  font-size: 0.65rem;
  font-weight: var(--pl-weight, 500);
  color: var(--pl-color, #555);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;

  @media (min-width: 400px) {
    font-size: 0.72rem;
  }
`

const PollPct = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
  color: var(--pp-color, #888);
  white-space: nowrap;

  @media (min-width: 400px) {
    font-size: 0.72rem;
  }
`

// ── Single progress bar poll result (new design) ─────────────────────────────
const SinglePollContainer = styled.div`
  width: 100%;
  margin-top: 0.75rem;
`

const SinglePollBarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
`

const SinglePollBar = styled.div`
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 100px;
  overflow: hidden;
  position: relative;
`

const SinglePollFill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 100px;
  background: linear-gradient(90deg, #059669, #34d399);
  animation: ${expandBar} 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
`

const SinglePollPct = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: #059669;
  min-width: 40px;
  text-align: right;
`

const SinglePollLabel = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: #999;
  text-align: center;
`
// ────────────────────────────────────────────────────────────────────────────

const ShopButton = styled.a`
  display: block;
  background: #404040;
  color: #fff;
  text-decoration: none;
  padding: 0.875rem 1.5rem;
  border-radius: 14px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  border: 1px solid rgba(255, 255, 255, 0.1);
  /* Performance: isolate paint */
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`

const ClosePopup = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f0efea;
  border: 0.5px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #888;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  contain: layout style paint;
  line-height: 1;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e5e0;
    color: #555;
  }
`

const InfoSection = styled.div`
  background: white;
  border-radius: 4px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  /* Prevent CLS - isolate layout */
  contain: layout style;
`

const OutfitTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #101010;
  line-height: 1.2;
  letter-spacing: -0.02em;
  /* Performance: Isolate layout/paint */
  contain: layout style paint;

  /* Instagram in-app browser optimization */
  @media (max-height: 700px) and (max-width: 480px) {
    font-size: 1.25rem;
    margin-bottom: 0.35rem;
  }

  @media (min-width: 768px) {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
`

const OutfitDescription = styled.div`
  font-size: 0.98rem;
  color: #4a4a4a;
  line-height: 1.75;
  margin: 0 0 1rem 0;
  font-weight: 400;
  letter-spacing: 0.01em;
  max-width: 38rem;

  /* Instagram in-app browser optimization */
  @media (max-height: 700px) and (max-width: 480px) {
    font-size: 0.9rem;
    line-height: 1.65;
    margin-bottom: 0.75rem;
  }

  @media (min-width: 768px) {
    font-size: 1.02rem;
    line-height: 1.8;
    margin-bottom: 1.15rem;
  }
`

const DescBlock = styled.div`
  margin: 0 0 1rem 0;

  &:last-child {
    margin-bottom: 0;
  }
`

const DescLead = styled.p`
  margin: 0 0 0.35rem 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1a1a1a;
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 0.74rem;
  }
`

const DescBody = styled.p`
  margin: 0;
  color: #555;
  line-height: inherit;
`

const DescCallout = styled.div`
  margin: 0.15rem 0 0;
  padding: 0.85rem 0 0.85rem 0.9rem;
  border-left: 2px solid #c4b8a8;
  background: linear-gradient(90deg, rgba(196, 184, 168, 0.12), transparent 85%);

  ${DescLead} {
    color: #2a2a2a;
  }

  ${DescBody} {
    color: #3f3f3f;
    font-style: italic;
    line-height: 1.7;
  }
`

const PublicationDate = styled.div`
  font-size: 0.9rem;
  color: #999;
  margin: 0;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 10;

  &::before {
    content: '•';
    color: #ccc;
  }
`

const ProductsSection = styled.div`
  margin-top: 2rem;
  /* Performance: skip rendering until visible */
  content-visibility: auto;
  contain-intrinsic-size: 0 600px;
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  color: #101010;
  letter-spacing: 0.5px;
  text-align: center;
  position: relative;
  /* Performance: Isolate layout/paint to prevent INP issues */
  contain: layout style paint;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(135deg, #101010 0%, #333 100%);
    border-radius: 2px;
  }
`

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  /* Prevent CLS - isolate layout */
  contain: layout style;
  margin: 0 -0.25rem;
  padding: 0 0.25rem;

  @media (min-width: 400px) {
    gap: 1rem;
    margin: 0;
    padding: 0;
  }

  @media (min-width: 768px) {
    gap: 1.25rem;
  }
`

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  /* Performance: isolate paint */
  contain: layout style paint;
`

const ProductThumbnail = styled.div`
  width: 100%;
  height: 200px;
  background: #f0efea;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-image: var(--thumb-img, none);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  &[data-has-image="false"]::before {
    content: '';
    display: block;
    width: 32px;
    height: 32px;
    background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23bbb' stroke-width='1.2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
`

const ProductThumbnailPlaceholderLabel = styled.span`
  display: ${props => props.$hasImage ? 'none' : 'block'};
  font-size: 0.65rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const ProductThumbnailShimmer = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`

const ProductCardContent = styled.div`
  padding: 10px 10px 14px;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
`

const ProductCardName = styled.h3`
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 1px 0;
  color: #1a1a1a;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const ProductCardBrand = styled.p`
  font-size: 10px;
  color: #aaa;
  margin: 0 0 1px 0;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

const ProductCardPrice = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: #666;
  margin: 0;
`

const ProductCardActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
`

const ProductCardButton = styled.a`
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  padding: 10px;
  border-radius: 50px;
  text-align: center;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0;
  border: none;
  display: block;
  width: 100%;
  font-family: inherit;
  /* Performance: isolate paint */
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background 0.15s ease;

  &:hover {
    background: #333;
  }

  &:active {
    background: #000;
  }
`

const ProductCardOutlineButton = styled.button`
  width: 100%;
  padding: 8px;
  background: transparent;
  border: 0.5px solid #ccc;
  border-radius: 50px;
  font-size: 11px;
  color: #1a1a1a;
  cursor: pointer;
  font-family: inherit;
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: all 0.15s ease;

  &:hover {
    border-color: #999;
    background: rgba(0, 0, 0, 0.02);
  }

  &:active {
    background: rgba(0, 0, 0, 0.05);
  }
`

const AddToCartButton = styled.button`
  background: ${props => props.$isFavorited ? '#dc2626' : '#f8f9fa'};
  color: ${props => props.$isFavorited ? 'white' : '#666'};
  border: 2px solid ${props => props.$isFavorited ? '#dc2626' : '#e9ecef'};
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  letter-spacing: 0.5px;
  /* Performance: isolate paint */
  contain: layout style paint;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`

const InfluencerSection = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
`

const InfluencerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`

const InfluencerAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-image: var(--avatar-img);
  background-size: cover;
  background-position: center;
  border: 2px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`

const InfluencerInfo = styled.div`
  flex: 1;
`

const InfluencerName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #101010;
  font-family: serif;
`

const InfluencerBrand = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  font-weight: 500;
`

const InfluencerBio = styled.p`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
`

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`

const SocialLink = styled.a`
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  -webkit-tap-highlight-color: transparent;
  contain: layout style;
`

// Skeleton shimmer animation - uses shimmerAnimation defined above
const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmerAnimation} 1.5s ease-in-out infinite;
`

// Skeleton layout matching actual page structure
const SkeletonContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: start;
  }
`

const SkeletonImageSection = styled.div`
  position: relative;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`

const SkeletonImage = styled(SkeletonBase)`
  width: 100%;
  aspect-ratio: 3/4;

  @media (min-width: 768px) {
    aspect-ratio: 4/5;
  }
`

const SkeletonProductsSection = styled.div`
  margin-top: 2rem;

  @media (min-width: 768px) {
    margin-top: 0;
  }
`

const SkeletonTitle = styled(SkeletonBase)`
  height: 24px;
  width: 200px;
  margin: 0 auto 2rem;
  border-radius: 4px;
`

const SkeletonProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (min-width: 400px) {
    gap: 1rem;
  }
`

const SkeletonProductCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;

  @media (min-width: 400px) {
    border-radius: 16px;
  }
`

const SkeletonProductImage = styled(SkeletonBase)`
  width: 100%;
  aspect-ratio: 3/4;
`

const SkeletonProductContent = styled.div`
  padding: 0.75rem;

  @media (min-width: 400px) {
    padding: 0.875rem;
  }
`

const SkeletonText = styled(SkeletonBase)`
  height: ${props => props.$height || '14px'};
  width: ${props => props.$width || '100%'};
  border-radius: 4px;
  margin-bottom: ${props => props.$mb || '0.5rem'};
`

const SkeletonButton = styled(SkeletonBase)`
  height: 36px;
  width: 100%;
  border-radius: 8px;
  margin-top: 0.75rem;
`

// Skeleton loading component for outfit detail page
const OutfitDetailSkeleton = () => (
  <SkeletonContainer>
    <SkeletonImageSection>
      <SkeletonImage />
    </SkeletonImageSection>
    <SkeletonProductsSection>
      <SkeletonTitle />
      <SkeletonProductsGrid>
        {[1, 2, 3, 4].map(i => (
          <SkeletonProductCard key={i}>
            <SkeletonProductImage />
            <SkeletonProductContent>
              <SkeletonText $width="80%" $height="16px" />
              <SkeletonText $width="60%" $height="12px" />
              <SkeletonText $width="40%" $height="14px" $mb="0" />
              <SkeletonButton />
            </SkeletonProductContent>
          </SkeletonProductCard>
        ))}
      </SkeletonProductsGrid>
    </SkeletonProductsSection>
  </SkeletonContainer>
)

// Keep these for backwards compatibility (used in not found state)
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 4rem 1rem;
  gap: 1.5rem;
  background: #ffffff;
`

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.08);
  border-top: 3px solid #101010;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const LoadingText = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 400;
  text-align: center;
  letter-spacing: 0.2px;
`

// Gallery Components
const RecommendationsSection = styled.section`
  background: #fafafa;
  padding: 1.5rem 1rem;
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 0px) + 1rem);
  margin-top: 2rem;
  /* Performance: skip rendering until visible */
  content-visibility: auto;
  contain-intrinsic-size: 0 400px;
`

const RecommendationsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const RecommendationsHeader = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const RecommendationsTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #101010;
  /* Performance: Isolate layout/paint */
  contain: layout style paint;

  @media (max-width: 767px) {
    font-size: 1.1rem;
  }
`

const ViewAllButton = styled(Link)`
  background: none;
  border: none;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  
  &:hover {
    color: #101010;
  }
`

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
`

const RecommendationCard = styled(Link)`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
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

const RecommendationImage = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  flex-shrink: 0;
  background-color: #f0f0f0;
  position: relative;
  overflow: hidden;
  transition: transform 0.4s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    transition: transform 0.4s ease;
  }

  ${RecommendationCard}:hover & {
    transform: scale(1.03);
  }
`

const ProductTags = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`

const GalleryProductTag = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #101010;
  border-radius: 50%;
  left: var(--tag-x);
  top: var(--tag-y);
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);

  @media (max-width: 767px) {
    width: 10px;
    height: 10px;
    border-width: 1.5px;
  }
`

/* Text panel — separate zone below image, always readable */
const GalleryOverlay = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.8rem 0.9rem;
  background: white;
  flex: 1;
`

const GalleryTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: #111;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const GalleryDescription = styled.p`
  font-size: 0.74rem;
  color: #666;
  margin: 0 0 0.55rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`

const GalleryShopButton = styled.div`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.3rem;
  background: #111;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.2px;
`

const ProductCount = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.62);
  color: white;
  padding: 0.22rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
`



// Isolated favorite button for product cards.
// Uses useFavorites() directly so only this small button re-renders on favorites
// change — the parent memoizedProductCards list stays fully memoized.
const CardFavoriteButton = memo(function CardFavoriteButton({ product, outfitId, resolvedImage }) {
  const { isFavorited, toggleFavorite } = useFavorites()
  const { t } = useTranslation()
  const saved = isFavorited(product.id)
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    startTransition(() => {
      toggleFavorite({ ...product, imageUrl: resolvedImage || product.imageUrl, outfitId })
    })
  }, [product, outfitId, resolvedImage, toggleFavorite])
  return (
    <FavoriteOverlayButton
      type="button"
      onClick={handleClick}
      $isFavorited={saved}
      title={saved ? t('favorites.remove') : t('outfit.addToFavorites')}
      aria-label={saved ? t('favorites.remove') : t('outfit.addToFavorites')}
    >
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </FavoriteOverlayButton>
  )
})

function isCalloutLead(lead) {
  if (!lead) return false
  const n = lead
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  return n.includes('retenir') || n.includes('en resume') || n.includes('a noter')
}

const LookDescription = memo(function LookDescription({ text }) {
  const blocks = useMemo(() => parseOutfitDescriptionBlocks(text), [text])
  if (!blocks.length) return null

  return (
    <OutfitDescription>
      {blocks.map((block, i) => {
        const content = (
          <>
            {block.lead && <DescLead>{block.lead}</DescLead>}
            <DescBody>{block.body}</DescBody>
          </>
        )
        if (isCalloutLead(block.lead)) {
          return <DescCallout key={i}>{content}</DescCallout>
        }
        return <DescBlock key={i}>{content}</DescBlock>
      })}
    </OutfitDescription>
  )
})

function OutfitDetail() {
  const { t, i18n } = useTranslation()
  const { outfitId: outfitSlug } = useParams()
  const location = useLocation()
  // Support legacy ID URLs and clean title-only slug URLs
  const outfitId = slugToOutfitId(outfitSlug)
  const navigate = useNavigate()
  const outfitPageViewTrackedRef = useRef(null)
  const { isAuthenticated } = useAuth()
  const [outfit, setOutfit] = useState(null)
  const [influencer, setInfluencer] = useState(null)
  const [allOutfits, setAllOutfits] = useState([])
  const [recommendedOutfits, setRecommendedOutfits] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [popupPosition, setPopupPosition] = useState({
    x: 0,
    y: 0,
    transform: 'translate(-50%, -100%)',
    arrowPosition: 'bottom',
    mode: 'absolute'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [justFavorited, setJustFavorited] = useState(false)
  const [voteCounts, setVoteCounts] = useState({})
  const [myVotes, setMyVotes] = useState({})
  // Ref mirror of myVotes — lets handleProductVote read the latest value
  // without being listed as a dependency, keeping its identity stable and
  // preventing memoizedProductCards from invalidating on every vote.
  const myVotesRef = useRef(myVotes)
  myVotesRef.current = myVotes
  // Ref mirror of outfit — same pattern as myVotesRef so useCallbacks that
  // reference outfit.id always read the latest value without stale closures.
  const outfitRef = useRef(null)
  const [fetchedProductImages, setFetchedProductImages] = useState({})
  const [loadingProductImages, setLoadingProductImages] = useState(new Set())
  const headerRef = useRef(null)
  const outfitImageRef = useRef(null)
  const imageWrapperRef = useRef(null)
  const [imageLayout, setImageLayout] = useState(null)
  const [heroImageLoaded, setHeroImageLoaded] = useState(false)
  const [heroImageError, setHeroImageError] = useState(false)

  // SEO optimization
  useSEO(outfit ? seoConfig.outfit(outfit, i18n.language) : seoConfig.home)
  
  const {
    favorites,
    addToFavorites,
    addMultipleToFavorites,
    removeFromFavorites,
    removeMultipleFromFavorites,
    clearFavorites,
    toggleFavorite,
    isFavorited,
    getFavoritesCount,
    showSignupPrompt,
    closeSignupPrompt,
    pendingProduct,
    signupRedirectPath,
    addToFavoritesAsGuest
  } = useFavorites()

  // Preload outfit image for faster LCP - critical for performance
  const outfitImageUrl = useMemo(() => outfit?.image ? [outfit.image] : [], [outfit?.image])
  usePreloadImages(outfitImageUrl)

  // Early preload from cache - kicks in before API fetch completes
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('dw_cache_v2_outfits')
      if (cached) {
        const parsed = JSON.parse(cached)
        const cachedOutfit = parsed?.data?.outfits?.find(
          o => o.id === outfitId || outfitToSlug(o) === outfitSlug
        )
        if (cachedOutfit?.image) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = cachedOutfit.image
          link.fetchPriority = 'high'
          document.head.appendChild(link)
        }
      }
    } catch (e) { /* ignore cache errors */ }
  }, [outfitId])

  useEffect(() => {
    outfitPageViewTrackedRef.current = null
  }, [outfitSlug])

  // Reset image state when outfit changes
  useEffect(() => {
    setHeroImageLoaded(false)
    setHeroImageError(false)
  }, [outfit?.id])

  // Check if image is already loaded from cache (onLoad may have fired before React attached listener)
  useEffect(() => {
    const img = outfitImageRef.current
    if (img && img.complete && img.naturalWidth > 0 && !heroImageLoaded) {
      setHeroImageLoaded(true)
    }
  }, [outfit?.image, heroImageLoaded])

  useEffect(() => {
    // Scroll to top when component mounts or outfitId changes
    // Use instant scroll to avoid blocking main thread during navigation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    // Close any open product popup from previous outfit
    setSelectedProduct(null)
    fetchData()
  }, [outfitId])

  // Page views for reports: must use DB outfit id (CUID), not URL slug or fake ids
  useEffect(() => {
    if (!outfit?.id || !isOutfitDbId(outfit.id)) return
    const pagePath = `${location.pathname}${location.search || ''}`
    const dedupeKey = `${outfit.id}|${pagePath}`
    if (outfitPageViewTrackedRef.current === dedupeKey) return
    outfitPageViewTrackedRef.current = dedupeKey
    trackPageView({
      page: pagePath,
      outfitId: outfit.id
    })
  }, [outfit?.id, location.pathname, location.search])

  // Engagement trigger: guest has viewed 3 unique outfits
  useEffect(() => {
    if (isAuthenticated) return
    // Use resolved id when possible; fallback to slug.
    registerGuestOutfitView(outfitId || outfitSlug)
  }, [isAuthenticated, outfitId, outfitSlug])

  const sessionIdRef = useRef(null)
  const getSessionId = useCallback(() => {
    if (!sessionIdRef.current) sessionIdRef.current = getOrCreateSessionId()
    return sessionIdRef.current
  }, [])

  // Initialize vote counts with baseline values from product data (instant display)
  // Then fetch actual counts (baseline + real votes) to get the accurate totals
  useEffect(() => {
    if (!outfit?.products?.length) return

    // Set initial baseline values immediately for instant display
    const initialCounts = {}
    for (const p of outfit.products) {
      const baseUp = p.baseVotesUp || 0
      const baseDown = p.baseVotesDown || 0
      initialCounts[p.id] = { love: baseUp, notMyStyle: baseDown }
    }
    setVoteCounts(initialCounts)

    // Fetch actual vote counts (baseline + real votes) immediately
    const ids = outfit.products.map((p) => p.id).join(',')
    const sid = getSessionId()
    fetch(`${API_BASE_URL}/products/vote-counts?ids=${encodeURIComponent(ids)}&sessionId=${encodeURIComponent(sid)}`)
      .then((res) => res.ok ? res.json() : {})
      .then((data) => {
        if (data?.counts != null) {
          setVoteCounts(data.counts)
          setMyVotes(data.myVotes || {})
        } else if (typeof data === 'object' && !Array.isArray(data) && data !== null && !data.error) {
          setVoteCounts(data)
          setMyVotes({})
        }
      })
      .catch(() => {})
  }, [outfit?.id, getSessionId])

  const handleProductVote = useCallback((productId, voteType) => {
    // Signup nudge trigger: only count positive "Mon style" votes
    if (!isAuthenticated && voteType === 'love') {
      registerGuestVote()
    }
    const sid = getSessionId()
    // Read via ref — no dep on myVotes state, so this callback never changes
    // identity and memoizedProductCards stays stable across votes.
    const prevVote = myVotesRef.current[productId]

    startTransition(() => {
      setMyVotes((m) => ({ ...m, [productId]: voteType }))
      if (prevVote !== voteType) {
        setVoteCounts((c) => {
          const cur = c[productId] || { love: 0, notMyStyle: 0 }
          const next = { ...cur }
          if (prevVote) next[prevVote === 'love' ? 'love' : 'notMyStyle'] = Math.max(0, (next[prevVote === 'love' ? 'love' : 'notMyStyle'] || 0) - 1)
          next[voteType === 'love' ? 'love' : 'notMyStyle'] = (next[voteType === 'love' ? 'love' : 'notMyStyle'] || 0) + 1
          return { ...c, [productId]: next }
        })
      }
    })

    if (prevVote === voteType) return

    fetch(`${API_BASE_URL}/products/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, voteType, sessionId: sid }),
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.counts) {
          startTransition(() => {
            setVoteCounts((c) => ({ ...c, [productId]: data.counts }))
          })
        }
      })
      .catch(() => {
        startTransition(() => {
          setMyVotes((m) => (prevVote ? { ...m, [productId]: prevVote } : (() => { const { [productId]: _, ...rest } = m; return rest })()))
        })
      })
  }, [getSessionId, isAuthenticated]) // stable — myVotes read via ref, not closure

  // Notify ShopMy script to re-scan for dynamically added links
  useEffect(() => {
    if (outfit && outfit.products) {
      // Wait for DOM to update, then trigger ShopMy re-scan
      const timer = setTimeout(() => {
        // ShopMy script should automatically detect new links, but we can trigger a custom event
        // Some ShopMy implementations listen for DOM mutations or custom events
        const event = new CustomEvent('shopmy:rescan', { bubbles: true })
        document.dispatchEvent(event)
        
        // Also try to manually trigger ShopMy if it exposes a global function
        if (window.ShopMy && typeof window.ShopMy.scan === 'function') {
          window.ShopMy.scan()
        }
      }, 500) // Small delay to ensure React has finished rendering
      
      return () => clearTimeout(timer)
    }
  }, [outfit])

  // Convert tag coordinates from "image space" (admin) to "container space" (wrapper with object-fit: contain)
  const updateImageLayout = useCallback(() => {
    const img = outfitImageRef.current
    if (!img || !img.complete || !img.naturalWidth) return
    const containerW = img.clientWidth
    const containerH = img.clientHeight
    const naturalW = img.naturalWidth
    const naturalH = img.naturalHeight
    if (containerW && containerH && naturalW && naturalH) {
      setImageLayout({ containerW, containerH, naturalW, naturalH })
    }
  }, [])

  useEffect(() => {
    setImageLayout(null)
  }, [outfit?.image])

  useEffect(() => {
    const img = outfitImageRef.current
    if (!img) return
    const ro = new ResizeObserver(updateImageLayout)
    ro.observe(img)
    return () => ro.disconnect()
  }, [outfit?.image, updateImageLayout])

  // Prefetch recommendation hero images (4 cards max).
  // Without this, many recommendation outfits won't have a populated `image`
  // field and will rely on the first product's `imageUrl` (which may be empty).
  // We scan ALL products per outfit so that outfits whose first product has no
  // link still have a chance to resolve an image via a sibling product.
  // We keep it small + deferred so it doesn't impact click/tap INP.
  useEffect(() => {
    if (!recommendedOutfits?.length) return

    // For each of the first 4 outfits, find the best candidate product:
    // prefer one with an imageUrl already, then one with a link to fetch from.
    const heroProducts = recommendedOutfits
      .slice(0, 4)
      .map(r => {
        const prods = r.products || []
        if (!prods.length) return null
        // Already has an outfit-level image — no need to fetch via metadata
        if (r.image && r.image.trim()) return null
        // Find first product with a usable imageUrl (already available)
        const withImage = prods.find(p => p.imageUrl && p.imageUrl.trim())
        if (withImage) return null // will be picked up by memoizedRecommendations
        // Find first product with a link (can fetch metadata)
        return prods.find(p => p.link && p.link.trim()) || null
      })
      .filter(Boolean)

    const productsNeedingImages = heroProducts.filter(
      p => (!p.imageUrl || !p.imageUrl.trim()) && p.link && p.link.trim()
    )

    if (!productsNeedingImages.length) return

    const sessionKey = 'dw_product_images_cache'
    let cache = {}
    try {
      cache = JSON.parse(sessionStorage.getItem(sessionKey) || '{}')
    } catch {}

    const toFetch = productsNeedingImages.filter(
      p => !(p.id in cache) && !(p.id in fetchedProductImages)
    )
    if (!toFetch.length) return

    const fetchHeroImage = async (product) => {
      try {
        const encodedUrl = encodeURIComponent(product.link.replace(/&amp;/g, '&'))
        const res = await fetch(`${API_BASE_URL}/metadata?url=${encodedUrl}`)
        if (!res.ok) return
        const data = await res.json()
        const imageUrl = data.image || null

        startTransition(() => {
          setFetchedProductImages(prev => ({ ...prev, [product.id]: imageUrl }))
        })

        try {
          const stored = JSON.parse(sessionStorage.getItem(sessionKey) || '{}')
          stored[product.id] = imageUrl
          sessionStorage.setItem(sessionKey, JSON.stringify(stored))
        } catch {}
      } catch {
        // Silent fail — placeholder stays visible.
      }
    }

    const run = () => {
      toFetch.forEach((product, i) => {
        setTimeout(() => fetchHeroImage(product), 300 + i * 350)
      })
    }

    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(run, { timeout: 2000 })
      return () => cancelIdleCallback(id)
    }

    const t = setTimeout(run, 500)
    return () => clearTimeout(t)
  }, [recommendedOutfits, fetchedProductImages])

  // Auto-fetch images for products that have a link but no imageUrl.
  // All setState calls here are wrapped in startTransition so they are
  // low-priority and interruptible — user clicks always take precedence.
  useEffect(() => {
    if (!outfit?.products?.length) return

    const productsNeedingImages = outfit.products.filter(
      p => (!p.imageUrl || !p.imageUrl.trim()) && p.link && p.link.trim()
    )
    if (!productsNeedingImages.length) return

    const sessionKey = 'dw_product_images_cache'
    let cache = {}
    try { cache = JSON.parse(sessionStorage.getItem(sessionKey) || '{}') } catch {}

    const toFetch = productsNeedingImages.filter(p => !(p.id in cache))

    // Cached entries: apply as a low-priority update so initial render is unblocked
    const cachedEntries = productsNeedingImages
      .filter(p => p.id in cache)
      .reduce((acc, p) => { acc[p.id] = cache[p.id]; return acc }, {})
    if (Object.keys(cachedEntries).length) {
      startTransition(() => {
        setFetchedProductImages(prev => ({ ...prev, ...cachedEntries }))
      })
    }

    if (!toFetch.length) return

    // Mark shimmer starts as low-priority
    startTransition(() => {
      setLoadingProductImages(prev => {
        const next = new Set(prev)
        toFetch.forEach(p => next.add(p.id))
        return next
      })
    })

    const fetchImage = async (product) => {
      try {
        const encodedUrl = encodeURIComponent(product.link.replace(/&amp;/g, '&'))
        const res = await fetch(`${API_BASE_URL}/metadata?url=${encodedUrl}`)
        if (!res.ok) return
        const data = await res.json()
        const imageUrl = data.image || null
        // Low-priority: user clicks always interrupt these re-renders
        startTransition(() => {
          setFetchedProductImages(prev => ({ ...prev, [product.id]: imageUrl }))
        })
        // Persist to sessionStorage (outside React render path)
        try {
          const stored = JSON.parse(sessionStorage.getItem(sessionKey) || '{}')
          stored[product.id] = imageUrl
          sessionStorage.setItem(sessionKey, JSON.stringify(stored))
        } catch {}
      } catch {
        // Silent fail — placeholder stays visible
      } finally {
        startTransition(() => {
          setLoadingProductImages(prev => {
            const next = new Set(prev)
            next.delete(product.id)
            return next
          })
        })
      }
    }

    // Delay the first fetch by 3 s so the user can interact with the page
    // before any background work starts, then stagger subsequent ones by 600 ms.
    toFetch.forEach((product, i) => {
      setTimeout(() => fetchImage(product), 3000 + i * 600)
    })
  }, [outfit?.id, outfit?.products])

  const getTagStyle = useCallback((product) => {
    if (!imageLayout) {
      return { left: `${product.x}%`, top: `${product.y}%` }
    }
    const { containerW, containerH, naturalW, naturalH } = imageLayout
    const scale = Math.min(containerW / naturalW, containerH / naturalH)
    const dW = naturalW * scale
    const dH = naturalH * scale
    const leftPct = ((containerW - dW) / 2 + (product.x / 100) * dW) / containerW * 100
    const topPct = ((containerH - dH) / 2 + (product.y / 100) * dH) / containerH * 100
    return { left: `${leftPct}%`, top: `${topPct}%` }
  }, [imageLayout])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      let data = await fetchOutfits()
      let foundOutfit = data.outfits.find(
        o => o.id === outfitId || outfitToSlug(o) === outfitSlug
      )

      // If the user came from a freshly published card but local cache is stale,
      // force a network refresh before concluding the outfit does not exist.
      if (!foundOutfit) {
        data = await fetchOutfits(true)
        foundOutfit = data.outfits.find(
          o => o.id === outfitId || outfitToSlug(o) === outfitSlug
        )
      }

      outfitRef.current = foundOutfit || null
      setOutfit(foundOutfit || null)
      setInfluencer(data.influencer)
      setAllOutfits(data.outfits)
      if (foundOutfit) {
        const canonicalSlug = outfitToSlug(foundOutfit)
        if (outfitSlug !== canonicalSlug) {
          navigate(`/outfits/${canonicalSlug}`, { replace: true })
        }
      }
      
      // Generate recommendations
      const recommendations = generateRecommendations(foundOutfit, data.outfits)
      setRecommendedOutfits(recommendations)
    } catch (err) {
      console.log('Using fallback data:', err.message)
      const fallbackData = await import('../../data/outfits.json')
      const foundOutfit = fallbackData.default.outfits.find(
        o => o.id === outfitId || outfitToSlug(o) === outfitSlug
      )
      outfitRef.current = foundOutfit || null
      setOutfit(foundOutfit)
      setInfluencer(fallbackData.default.influencer)
      setAllOutfits(fallbackData.default.outfits)
      if (foundOutfit) {
        const canonicalSlug = outfitToSlug(foundOutfit)
        if (outfitSlug !== canonicalSlug) {
          navigate(`/outfits/${canonicalSlug}`, { replace: true })
        }
      }
      
      // Generate recommendations
      const recommendations = generateRecommendations(foundOutfit, fallbackData.default.outfits)
      setRecommendedOutfits(recommendations)
    } finally {
      setIsLoading(false)
      // Hide the instant-render content now that React has real data to display.
      // This must happen AFTER setIsLoading(false) so React renders the content.
      if (typeof window.__hideLoader === 'function') {
        window.__hideLoader()
      }
    }
  }

  // Recommendation algorithm
  const generateRecommendations = (currentOutfit, allOutfits) => {
    if (!currentOutfit || !allOutfits) return []
    
    const currentBrands = currentOutfit.products?.map(p => p.brand.toLowerCase()) || []
    const currentCategory = currentOutfit.category || 'outfit'
    
    // Score outfits based on similarity
    const scoredOutfits = allOutfits
      .filter(o => o.id !== currentOutfit.id) // Exclude current outfit
      .map(outfit => {
        let score = 0
        const outfitBrands = outfit.products?.map(p => p.brand.toLowerCase()) || []
        
        // Brand similarity (40% weight)
        const brandMatches = outfitBrands.filter(brand => 
          currentBrands.some(currentBrand => 
            currentBrand.includes(brand) || brand.includes(currentBrand)
          )
        ).length
        score += (brandMatches / Math.max(currentBrands.length, 1)) * 40
        
        // Category match (20% weight)
        if (outfit.category === currentCategory) {
          score += 20
        }
        
        // Recency bonus (20% weight) - newer outfits get higher scores
        const daysSinceCreated = (Date.now() - new Date(outfit.publishedAt ?? outfit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        const recencyScore = Math.max(0, 20 - (daysSinceCreated / 30) * 20) // Decay over 30 days
        score += recencyScore
        
        // Random factor for diversity (20% weight)
        score += Math.random() * 20
        
        return { ...outfit, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6) // Top 6 recommendations
    
    return scoredOutfits
  }

  const handleProductClick = useCallback((product, event) => {
    event.stopPropagation()

    // Track product tag click — read outfitId via ref to avoid stale closure
    trackProductTagClick(product.id, outfitRef.current?.id ?? outfit?.id, product.brand)

    const vw = window.innerWidth
    const isMobile = vw < 768

    // MOBILE: Use bottom sheet pattern (CSS handles positioning)
    // No position calculation needed - CSS uses fixed bottom: 0
    if (isMobile) {
      setSelectedProduct(product)
      setPopupPosition({ x: 0, y: 0, transform: 'none' })
      return
    }

    // DESKTOP: Absolute position within image wrapper (like Zara, Net-a-Porter)
    const wrapperRect = imageWrapperRef.current?.getBoundingClientRect()
    if (!wrapperRect) {
      setSelectedProduct(product)
      setPopupPosition({ x: 50, y: 50, transform: 'translate(-50%, -50%)' })
      return
    }

    const tagRect = event.currentTarget.getBoundingClientRect()
    const popupWidth = 260 // Match CSS width
    const popupHeight = 300 // Approximate height
    const margin = 16

    // Calculate pixel position for popup relative to wrapper
    const tagCenterXPx = tagRect.left + tagRect.width / 2 - wrapperRect.left
    const tagCenterYPx = tagRect.top + tagRect.height / 2 - wrapperRect.top

    // Determine horizontal position: prefer right of tag, fallback to left
    let popupLeft
    const spaceRight = wrapperRect.width - tagCenterXPx - tagRect.width / 2
    const spaceLeft = tagCenterXPx - tagRect.width / 2

    if (spaceRight >= popupWidth + margin) {
      // Position to the right of tag
      popupLeft = tagCenterXPx + tagRect.width / 2 + margin
    } else if (spaceLeft >= popupWidth + margin) {
      // Position to the left of tag
      popupLeft = tagCenterXPx - tagRect.width / 2 - margin - popupWidth
    } else {
      // Center horizontally, constrained within wrapper
      popupLeft = Math.max(margin, Math.min(wrapperRect.width - popupWidth - margin, tagCenterXPx - popupWidth / 2))
    }

    // Determine vertical position: STRICTLY constrain within image bounds
    // Prefer above tag if near bottom, below tag if near top
    const spaceAbove = tagCenterYPx - tagRect.height / 2
    const spaceBelow = wrapperRect.height - tagCenterYPx - tagRect.height / 2
    let popupTop

    if (spaceBelow >= popupHeight + margin) {
      // Position below tag
      popupTop = tagCenterYPx + tagRect.height / 2 + margin
    } else if (spaceAbove >= popupHeight + margin) {
      // Position above tag
      popupTop = tagCenterYPx - tagRect.height / 2 - margin - popupHeight
    } else {
      // Not enough space above or below - center vertically but strictly within bounds
      popupTop = Math.max(margin, Math.min(wrapperRect.height - popupHeight - margin, tagCenterYPx - popupHeight / 2))
    }

    setSelectedProduct(product)
    setPopupPosition({ x: popupLeft, y: popupTop, transform: 'none' })
  }, [imageWrapperRef])

  const handleImageClick = useCallback(() => {
    setSelectedProduct(null)
  }, [])

  const formatPrice = useCallback((priceString) => {
    if (priceString == null || priceString === '') return ''

    // If price already contains currency symbol, return as-is
    if (String(priceString).includes('€') || String(priceString).includes('$') || String(priceString).includes('£')) {
      return priceString
    }

    // Otherwise, add Euro currency to the price
    return `${priceString} €`
  }, [])

  // ─── Memoized subtrees ────────────────────────────────────────────────────
  // These nodes have no dependency on selectedProduct, so React skips
  // reconciling them entirely when the popup opens/closes. This is the key
  // fix for the ~3 s first-click INP: the reconciler only processes the
  // small popup, not the entire outfit page.

  const memoizedTagDots = useMemo(() => outfit?.products?.map((product, index) => (
    <ProductTag
      key={product.id}
      style={{ ...getTagStyle(product), '--entrance-delay': `${index * 0.08}s` }}
      onClick={(e) => handleProductClick(product, e)}
      title={`${product.name} - ${product.brand}`}
      aria-label={`${product.name} - ${product.brand}`}
    />
  )) ?? null, [outfit?.products, getTagStyle, handleProductClick])

  const memoizedProductCards = useMemo(() => outfit?.products?.map((product) => {
    const rawImage = (product.imageUrl && product.imageUrl.trim())
      ? product.imageUrl
      : fetchedProductImages[product.id] || null
    const resolvedImage = rawImage?.startsWith('http://')
      ? 'https://' + rawImage.slice(7)
      : rawImage
    const isLoadingImg = loadingProductImages.has(product.id)
    return (
      <ProductCard key={product.id}>
        <ProductThumbnail
          data-has-image={resolvedImage ? 'true' : 'false'}
          style={resolvedImage ? { '--thumb-img': `url(${resolvedImage})` } : undefined}
        >
          {isLoadingImg && <ProductThumbnailShimmer />}
          <ProductThumbnailPlaceholderLabel $hasImage={!!(resolvedImage) || isLoadingImg}>
            Pas d&apos;image
          </ProductThumbnailPlaceholderLabel>
          <CardFavoriteButton product={product} outfitId={outfit.id} resolvedImage={resolvedImage} />
        </ProductThumbnail>
        <ProductCardContent>
          <div>
            <ProductCardName>{product.name}</ProductCardName>
            <ProductCardBrand>{product.brand}</ProductCardBrand>
            {product.price != null && product.price !== '' && (
              <ProductCardPrice>{formatPrice(product.price)}</ProductCardPrice>
            )}
          </div>
          <ProductCardActions>
            <ProductCardButton
              href={product.link && (product.link.includes('go.shopmy.us') || product.link.includes('affilae.com') || product.link.includes('feeds.affilae.com') || product.link.includes('go.affilae.com')) ? '#' : (product.link ? product.link.replace(/&amp;/g, '&') : '#')}
              target="_blank"
              rel={product.link && (product.link.includes('go.shopmy.us') || product.link.includes('affilae.com')) ? 'noopener' : 'noopener noreferrer'}
              onClick={(e) => handleAffiliateClick(product, outfit.id, e)}
            >
              {t('outfit.findIt', 'See >')}
            </ProductCardButton>
            {(() => {
              const myVote = myVotes[product.id]
              const counts = voteCounts[product.id] || { love: 0, notMyStyle: 0 }
              const total = counts.love + counts.notMyStyle
              const lovePct = total === 0 ? 50 : Math.round((counts.love / total) * 100)
              const skipPct = 100 - lovePct
              const winner = lovePct >= skipPct ? 'love' : 'not_my_style'
              if (myVote) {
                return (
                  <PollWrap style={{ marginTop: '0' }}>
                    <PollRow
                      type="button"
                      onClick={() => handleProductVote(product.id, 'love')}
                      title={t('outfit.voteLove')}
                      style={{ '--pr-border': myVote === 'love' ? '#059669' : 'rgba(0,0,0,0.12)' }}
                    >
                      <PollFill style={{ '--w': `${lovePct}%`, '--pf-bg': myVote === 'love' ? 'rgba(5,150,105,0.13)' : 'rgba(0,0,0,0.05)' }} />
                      <PollRowContent>
                        <PollIcon aria-hidden>♡</PollIcon>
                        <PollLabel style={{ '--pl-weight': winner === 'love' ? 700 : 500, '--pl-color': myVote === 'love' ? '#059669' : '#555' }}>
                          {t('outfit.voteMyStyle', 'Mon style')}{myVote === 'love' ? ' ✓' : ''}
                        </PollLabel>
                        <PollPct style={{ '--pp-color': myVote === 'love' ? '#059669' : '#888' }}>{lovePct}%</PollPct>
                      </PollRowContent>
                    </PollRow>
                    <PollRow
                      type="button"
                      onClick={() => handleProductVote(product.id, 'not_my_style')}
                      title={t('outfit.voteNotMyStyle')}
                      style={{ '--pr-border': myVote === 'not_my_style' ? '#475569' : 'rgba(0,0,0,0.12)' }}
                    >
                      <PollFill style={{ '--w': `${skipPct}%`, '--pf-bg': myVote === 'not_my_style' ? 'rgba(71,85,105,0.12)' : 'rgba(0,0,0,0.05)' }} />
                      <PollRowContent>
                        <PollLabel style={{ '--pl-weight': winner === 'not_my_style' ? 700 : 500, '--pl-color': myVote === 'not_my_style' ? '#334155' : '#555' }}>
                          {t('outfit.voteNotForMe', 'Pas pour moi')}{myVote === 'not_my_style' ? ' ✓' : ''}
                        </PollLabel>
                        <PollPct style={{ '--pp-color': myVote === 'not_my_style' ? '#334155' : '#888' }}>{skipPct}%</PollPct>
                      </PollRowContent>
                    </PollRow>
                  </PollWrap>
                )
              }
              return (
                <>
                  <ProductCardOutlineButton
                    type="button"
                    onClick={() => handleProductVote(product.id, 'love')}
                    title={t('outfit.voteLove')}
                  >
                    ♡&nbsp;&nbsp;{t('outfit.myStyle', "C'est mon style")}
                  </ProductCardOutlineButton>
                  <ProductCardOutlineButton
                    type="button"
                    onClick={() => handleProductVote(product.id, 'not_my_style')}
                    title={t('outfit.voteNotMyStyle')}
                  >
                    /&nbsp;&nbsp;&nbsp;{t('outfit.notForMe', 'Pas pour moi')}
                  </ProductCardOutlineButton>
                </>
              )
            })()}
          </ProductCardActions>
        </ProductCardContent>
      </ProductCard>
    )
  }) ?? null, [
    outfit?.products, outfit?.id,
    fetchedProductImages, loadingProductImages,
    myVotes, voteCounts,
    handleProductVote, handleAffiliateClick, formatPrice, t,
  ])

  const memoizedRecommendations = useMemo(
    () =>
      recommendedOutfits.slice(0, 4).map((recommendedOutfit) => {
        const products = recommendedOutfit.products || []
        // Scan ALL products for a usable image URL, not just the first one
        const rawRecImg =
          recommendedOutfit.image ||
          products.reduce((found, p) => {
            if (found) return found
            if (p.imageUrl && p.imageUrl.trim()) return p.imageUrl
            if (fetchedProductImages[p.id]) return fetchedProductImages[p.id]
            return null
          }, null)

        const resolvedRecImg = rawRecImg?.startsWith('http://')
          ? 'https://' + rawRecImg.slice(7)
          : rawRecImg || null

        return (
          <RecommendationCard
            key={recommendedOutfit.id}
            to={`/outfits/${outfitToSlug(recommendedOutfit)}`}
            onMouseEnter={() => prefetchRoute('/outfits')}
          >
            <RecommendationImage>
              {resolvedRecImg && (
                <img
                  src={resolvedRecImg}
                  alt={getOutfitTitle(recommendedOutfit, i18n.language)}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <ProductCount>
                {products.length || 0}{' '}
                {(products.length || 0) === 1 ? t('favorites.item') : t('favorites.items')}
              </ProductCount>
            </RecommendationImage>
            <GalleryOverlay>
              <GalleryTitle>{getOutfitTitle(recommendedOutfit, i18n.language)}</GalleryTitle>
              <GalleryDescription>{getOutfitDescription(recommendedOutfit, i18n.language)}</GalleryDescription>
              <GalleryShopButton>{t('outfit.shopNow')} →</GalleryShopButton>
            </GalleryOverlay>
          </RecommendationCard>
        )
      }),
    [recommendedOutfits, i18n.language, t, fetchedProductImages]
  )
  // ─────────────────────────────────────────────────────────────────────────

  const handleToggleFavorite = useCallback((product) => {
    // Include outfitId so we can navigate back to this outfit from favorites
    const productWithOutfit = {
      ...product,
      outfitId: outfit?.id || outfitId
    }
    startTransition(() => { toggleFavorite(productWithOutfit) })
  }, [outfit?.id, outfitId, toggleFavorite])

  const handleToggleOutfitFavorite = useCallback(() => {
    // Save ALL products in the outfit when clicking the heart button
    if (outfit && outfit.products && outfit.products.length > 0) {
      // Check if all products are already favorited
      const allFavorited = outfit.products.every(p => isFavorited(p.id))

      if (allFavorited) {
        // Remove all products from favorites
        const productIds = outfit.products.map(p => p.id)
        removeMultipleFromFavorites(productIds)
      } else {
        // Add all products to favorites with resolved images
        const productsToAdd = outfit.products.map(product => {
          const raw = (product.imageUrl && product.imageUrl.trim())
            ? product.imageUrl
            : fetchedProductImages[product.id] || null
          const resolvedImg = raw?.startsWith('http://')
            ? 'https://' + raw.slice(7)
            : raw
          return {
            ...product,
            imageUrl: resolvedImg || product.imageUrl,
            outfitId: outfit.id
          }
        })

        addMultipleToFavorites(productsToAdd)

        // Animation feedback
        startTransition(() => {
          setJustFavorited(true)
        })
        setTimeout(() => {
          startTransition(() => setJustFavorited(false))
        }, 500)
      }
    }
  }, [outfit, isFavorited, addMultipleToFavorites, removeMultipleFromFavorites, fetchedProductImages])

  // Check if outfit is favorited (check if ALL products are favorited)
  const isOutfitFavorited = useMemo(() => {
    if (outfit && outfit.products && outfit.products.length > 0) {
      return outfit.products.every(p => isFavorited(p.id))
    }
    return false
  }, [outfit, isFavorited])

  if (isLoading) {
    return (
      <DetailContainer>
        <Header ref={headerRef}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BackButton onClick={() => navigate('/')} onMouseEnter={prefetchOutfits} onTouchStart={prefetchOutfits}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t('common.backToHome')}
            </BackButton>
            <BrandName to="/" onMouseEnter={prefetchOutfits}>Emmanuelle K</BrandName>
          </div>
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
        <OutfitDetailSkeleton />
      </DetailContainer>
    )
  }

  if (!outfit) {
    return (
      <DetailContainer>
        <Header ref={headerRef}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BackButton onClick={() => navigate('/')} onMouseEnter={prefetchOutfits} onTouchStart={prefetchOutfits}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t('common.backToHome')}
            </BackButton>
            <BrandName to="/" onMouseEnter={prefetchOutfits}>Emmanuelle K</BrandName>
          </div>
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
      </DetailContainer>
    )
  }

  return (
    <DetailContainer>
      <Header ref={headerRef}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BackButton onClick={() => navigate('/')} onMouseEnter={prefetchOutfits} onTouchStart={prefetchOutfits}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t('common.backToHome')}
          </BackButton>
          <BrandName to="/" onMouseEnter={prefetchOutfits}>Emmanuelle K</BrandName>
        </div>
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
      
      <MainContent>
        <ImageSection>
          <ImageContainer onClick={handleImageClick}>
            <ImageTagWrapper ref={imageWrapperRef} data-image-wrapper>
              {/* Shimmer loading state */}
              {!heroImageLoaded && !heroImageError && <ImageShimmer />}

              {/* Error fallback */}
              {heroImageError && (
                <ImageErrorFallback>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5">
                    <rect x="2" y="2" width="20" height="20" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </ImageErrorFallback>
              )}

              <OutfitImg
                ref={outfitImageRef}
                src={outfit.image}
                alt={getOutfitTitle(outfit, i18n.language)}
                $loaded={heroImageLoaded}
                onLoad={(e) => {
                  setHeroImageLoaded(true)
                  updateImageLayout(e)
                }}
                onError={() => setHeroImageError(true)}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width="600"
                height="800"
              />
            <FavoriteOverlayButton
              onClick={(e) => {
                e.stopPropagation()
                handleToggleOutfitFavorite()
              }}
              $isFavorited={isOutfitFavorited}
              $justFavorited={justFavorited}
              title={isOutfitFavorited ? t('favorites.remove') : t('outfit.addToFavorites')}
              aria-label={isOutfitFavorited ? t('favorites.remove') : t('outfit.addToFavorites')}
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </FavoriteOverlayButton>
            
            {/* Auto-dismissing hint — pure CSS animation, no JS state needed */}
            <TapHint aria-hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
              </svg>
              {t('outfit.tapDotsHint', 'Appuie sur un point pour shopper')}
            </TapHint>

            {memoizedTagDots}
            
            {/* Popup is always in the DOM so styled-components CSS is pre-injected at page load.
                Visibility is toggled via CSS props — zero mounting work on first click. */}
            <PopupOverlay $visible={!!selectedProduct} onClick={() => setSelectedProduct(null)} />
            <ProductPopup
              $visible={!!selectedProduct}
              onClick={(e) => e.stopPropagation()}
              style={selectedProduct ? {
                left: `${popupPosition.x}px`,
                top: `${popupPosition.y}px`,
                transform: popupPosition.transform
              } : {}}
            >
              <PopupHeader>
                <PopupPhoto
                  style={(() => {
                    const raw = selectedProduct?.imageUrl?.trim()
                      ? selectedProduct.imageUrl
                      : (selectedProduct?.id ? fetchedProductImages[selectedProduct.id] : null)
                    const resolved = raw?.startsWith('http://') ? 'https://' + raw.slice(7) : raw
                    return resolved ? { backgroundImage: `url(${resolved})` } : {}
                  })()}
                >
                  {!selectedProduct?.imageUrl && !fetchedProductImages[selectedProduct?.id] && (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="m21 15-5-5L5 21"/>
                    </svg>
                  )}
                </PopupPhoto>
                <PopupInfo>
                  <PopupCloseRow>
                    <ClosePopup onClick={() => setSelectedProduct(null)}>×</ClosePopup>
                  </PopupCloseRow>
                  <ProductBrand>{selectedProduct?.brand}</ProductBrand>
                  <ProductName>{selectedProduct?.name}</ProductName>
                  {selectedProduct?.price != null && selectedProduct?.price !== '' && (
                    <ProductPrice>{formatPrice(selectedProduct.price)}</ProductPrice>
                  )}
                </PopupInfo>
              </PopupHeader>
              <PopupButtons>
                {/* Main CTA - Shop button */}
                <PopupShopButton
                  href={selectedProduct?.link && (selectedProduct.link.includes('go.shopmy.us') || selectedProduct.link.includes('affilae.com') || selectedProduct.link.includes('feeds.affilae.com') || selectedProduct.link.includes('go.affilae.com')) ? '#' : (selectedProduct?.link ? selectedProduct.link.replace(/&amp;/g, '&') : '#')}
                  target="_blank"
                  rel={selectedProduct?.link && (selectedProduct.link.includes('go.shopmy.us') || selectedProduct.link.includes('affilae.com')) ? 'noopener' : 'noopener noreferrer'}
                  onClick={(e) => {
                    if (selectedProduct) handleAffiliateClick(selectedProduct, outfit.id, e)
                  }}
                >
                  {t('outfit.findItHere', 'See >')}
                </PopupShopButton>

                {/* Vote buttons or poll results */}
                {(() => {
                  const pid = selectedProduct?.id
                  const myVote = pid ? myVotes[pid] : null
                  const counts = (pid && voteCounts[pid]) || { love: 0, notMyStyle: 0 }
                  const total = counts.love + counts.notMyStyle
                  const lovePct = total === 0 ? 50 : Math.round((counts.love / total) * 100)

                  if (myVote) {
                    if (myVote === 'love') {
                      return (
                        <SinglePollContainer>
                          <SinglePollBarWrapper>
                            <SinglePollBar>
                              <SinglePollFill style={{ '--w': `${lovePct}%` }} />
                            </SinglePollBar>
                            <SinglePollPct>{lovePct}%</SinglePollPct>
                          </SinglePollBarWrapper>
                          <SinglePollLabel>{t('outfit.likedByCommunity', 'aimé par la communauté')}</SinglePollLabel>
                        </SinglePollContainer>
                      )
                    } else {
                      return (
                        <SinglePollLabel style={{ marginTop: '0', marginBottom: '0', textAlign: 'center' }}>
                          {t('outfit.noted', "C'est noté")} 👍
                        </SinglePollLabel>
                      )
                    }
                  }
                  return (
                    <PopupButtonRow>
                      <PopupOutlineButton
                        type="button"
                        onClick={() => { if (selectedProduct) handleProductVote(selectedProduct.id, 'love') }}
                        title={t('outfit.voteLove')}
                      >
                        ♡&nbsp;&nbsp;{t('outfit.myStyle', "C'est mon style")}
                      </PopupOutlineButton>
                      <PopupOutlineButton
                        type="button"
                        onClick={() => { if (selectedProduct) handleProductVote(selectedProduct.id, 'not_my_style') }}
                        title={t('outfit.voteNotMyStyle')}
                      >
                        /&nbsp;&nbsp;&nbsp;{t('outfit.notForMe', 'Pas pour moi')}
                      </PopupOutlineButton>
                    </PopupButtonRow>
                  )
                })()}

                {/* Save for later button */}
                <PopupFullButton
                  type="button"
                  $saved={selectedProduct ? isFavorited(selectedProduct.id) : false}
                  onClick={() => {
                    if (selectedProduct) {
                      const raw = (selectedProduct.imageUrl && selectedProduct.imageUrl.trim())
                        ? selectedProduct.imageUrl
                        : fetchedProductImages[selectedProduct.id] || null
                      const resolvedImg = raw?.startsWith('http://')
                        ? 'https://' + raw.slice(7)
                        : raw
                      startTransition(() => {
                        toggleFavorite({ ...selectedProduct, imageUrl: resolvedImg || selectedProduct.imageUrl, outfitId: outfit.id })
                      })
                    }
                  }}
                >
                  {selectedProduct && isFavorited(selectedProduct.id)
                    ? t('favorites.saved', 'Sauvegardé')
                    : t('outfit.saveForLater', 'Sauvegarde pour plus tard')}
                </PopupFullButton>
              </PopupButtons>
            </ProductPopup>
            </ImageTagWrapper>
          </ImageContainer>
          <ImageCardContent>
            <OutfitTitle>{getOutfitTitle(outfit, i18n.language)}</OutfitTitle>
            <LookDescription text={getOutfitDescription(outfit, i18n.language)} />
            <PublicationDate>
              {getRelativeTime(outfit.publishedAt ?? outfit.createdAt)}
              <SubtleShareButton outfit={outfit} />
            </PublicationDate>
          </ImageCardContent>
        </ImageSection>
        
        <InfoSection>
          <ProductsSection>
            <SectionTitle>{t('outfit.inThisLook')}</SectionTitle>
            <ProductsGrid>
              {memoizedProductCards}
            </ProductsGrid>
          </ProductsSection>
          
        </InfoSection>
      </MainContent>
      
      {/* Recommendations Gallery */}
      {recommendedOutfits.length > 0 && (
        <RecommendationsSection>
          <RecommendationsContainer>
            <RecommendationsHeader>
              <RecommendationsTitle>{t('outfit.recommendations')}</RecommendationsTitle>
              <ViewAllButton to="/?tab=outfits&scrollTo=outfits-start">
                {t('outfit.viewAll')} →
              </ViewAllButton>
            </RecommendationsHeader>
            
            <GalleryGrid>
              {memoizedRecommendations}
            </GalleryGrid>
          </RecommendationsContainer>
        </RecommendationsSection>
      )}
      
      <FavoritesList
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={removeFromFavorites}
        onClearFavorites={clearFavorites}
      />

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

      {/* Login modal - lazy loaded */}
      {isLoginModalOpen && (
        <Suspense fallback={null}>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onSwitchToSignup={() => {
              setIsLoginModalOpen(false)
              navigate('/signup')
            }}
          />
        </Suspense>
      )}
    </DetailContainer>
  )
}

export default memo(OutfitDetail)