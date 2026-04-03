import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SignupPrompt from '../ui/SignupPrompt'
import { POST_LOGIN_REDIRECT_KEY } from '../../utils/authRedirect'
import { trackPrivateSaleAccess } from '../../utils/analytics'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.emmanuellek.com/api'

// Icons
const LockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const ClockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const BellIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const TagIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

// ============================================
// STYLED COMPONENTS - Arlettie-inspired design
// ============================================

const Section = styled.section`
  margin-bottom: 2rem;

  @media (min-width: 1024px) {
    margin-bottom: 0;
  }
`

const Container = styled.div`
  max-width: 100%;

  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }
`

const SalesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
`

// Clean, minimalist card - image header + text body
const SaleCard = styled.div`
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #d0d0d0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
`

// Full-width image banner at the top of the card
const SaleImageBanner = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 7;
  background: #f0f0f0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }

  ${SaleCard}:hover & img {
    transform: scale(1.03);
  }
`

// Overlay badge in the top-left of the image
const ImageOverlay = styled.div`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  pointer-events: none;
`

const OverlayLine = styled.span`
  display: inline-block;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  padding: 0.2rem 0.55rem;
  font-size: 0.72rem;
  font-weight: ${props => props.$bold ? '700' : '400'};
  letter-spacing: 0.04em;
  color: #1a1a1a;
  border-radius: 2px;
  line-height: 1.4;
`

// Image placeholder when no imageUrl
const SaleImagePlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 16 / 7;
  background: linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
`

// Card body with padding — flex column so every child stacks cleanly
const SaleCardBody = styled.div`
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 768px) {
    padding: 1.75rem 1.75rem;
  }
`

// Sale title - prominent, elegant
// min-height reserves space for 2 lines so cards in the same grid row stay aligned
const SaleTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
  width: 100%;
  text-align: center;
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    font-size: 1.6rem;
    min-height: 4.5rem;
  }
`

// Status label - small caps, elegant
const StatusLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    font-size: 0.75rem;
  }
`

// Date display - Arlettie style: "19 / 03 / 26"
const DateDisplay = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  width: 100%;
  text-align: center;

  span {
    margin: 0 0.4rem;
    color: #ccc;
  }

  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`

// Status badge - clean, luxury style
const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid ${props =>
    props.$status === 'current' ? '#1a1a1a' :
    props.$status === 'upcoming' ? '#888' : '#ccc'
  };
  border-radius: 2px;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${props =>
    props.$status === 'current' ? '#1a1a1a' :
    props.$status === 'upcoming' ? '#666' : '#999'
  };
  margin-bottom: 1.5rem;

  svg {
    width: 12px;
    height: 12px;
  }

  @media (min-width: 768px) {
    font-size: 0.7rem;
    padding: 0.45rem 1rem;
  }
`

// CTA button - solid black pill, consistent with site-wide CTAs
const CTALink = styled.button`
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  padding: 0.75rem 1.75rem;
  margin-top: 0.25rem;
  transition: background 0.2s ease, transform 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: #333;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (min-width: 768px) {
    font-size: 0.9rem;
    padding: 0.8rem 2rem;
  }
`

// Countdown - subtle, integrated
const CountdownText = styled.div`
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 1.25rem;
  letter-spacing: 0.05em;

  strong {
    color: #1a1a1a;
    font-weight: 600;
  }
`

// ============================================
// COUNTDOWN TIMER COMPONENT
// ============================================

const CountdownTimer = ({ targetDate, language = 'fr' }) => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft(language === 'en' ? 'Started' : 'Commencé')
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      if (language === 'en') {
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`)
        } else {
          setTimeLeft(`${minutes}m`)
        }
      } else {
        if (days > 0) {
          const dayLabel = days === 1 ? 'jour' : 'jours'
          setTimeLeft(`${days} ${dayLabel} ${hours}h`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}min`)
        } else {
          setTimeLeft(`${minutes}min`)
        }
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [targetDate, language])

  return <span>{timeLeft}</span>
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PrivateSalesSection({ onSaleClick = null } = {}) {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const language = i18n.language || 'fr'
  const [sales, setSales] = useState({ upcoming: [], current: [], past: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [showSignupModal, setShowSignupModal] = useState(false)
  /** Where to send the user after login/signup (private sale they tried to open) */
  const [signupRedirectPath, setSignupRedirectPath] = useState(null)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/private-sales/public`)
      if (response.ok) {
        const data = await response.json()
        setSales({
          upcoming: data.upcoming || [],
          current: data.current || [],
          past: data.past || []
        })
      }
    } catch (err) {
      console.error('Error fetching private sales:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccessClick = (saleId, sale) => {
    // Track private sale access for analytics
    trackPrivateSaleAccess(saleId, isAuthenticated ? 'authenticated' : 'direct_link')

    if (onSaleClick) {
      onSaleClick(saleId, sale)
    } else {
      navigate(`/shop/sale/${saleId}`)
    }
  }

  const openGuestSignup = (saleId = null) => {
    if (saleId) {
      const path = `/shop/sale/${saleId}`
      try {
        sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path)
      } catch {
        // storage may be unavailable in private mode
      }
      setSignupRedirectPath(path)
    } else {
      setSignupRedirectPath(null)
      try {
        sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
      } catch {
        // ignore
      }
    }
    setShowSignupModal(true)
  }

  const closeGuestSignup = () => {
    setShowSignupModal(false)
    setSignupRedirectPath(null)
    try {
      sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
    } catch {
      // ignore
    }
  }

  // Format date as "19 / 03 / 26"
  const formatDateElegant = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return { day, month, year }
  }

  const currentSale = sales.current[0]
  const upcomingSale = sales.upcoming[0]

  if (isLoading) {
    return null
  }

  // ============================================
  // RENDER: Non-authenticated users (Same Arlettie style)
  // ============================================
  const renderTeaser = () => {
    const allSales = [...sales.current, ...sales.upcoming]

    if (allSales.length === 0) {
      return (
        <SaleCard>
          <SaleImagePlaceholder><TagIcon size={32} /></SaleImagePlaceholder>
          <SaleCardBody>
            <SaleTitle>
              {language === 'en' ? 'Private Sales' : 'Ventes Privées'}
            </SaleTitle>
            <StatusLabel>
              {language === 'en' ? 'No sales at the moment' : 'Pas de vente en ce moment'}
            </StatusLabel>
            <StatusBadge $status="none">
              <BellIcon size={12} />
              {language === 'en' ? 'Be notified' : 'Être averti(e)'}
            </StatusBadge>
            <CTALink onClick={() => openGuestSignup()}>
              {language === 'en' ? "Sign up" : "M'inscrire"}
            </CTALink>
          </SaleCardBody>
        </SaleCard>
      )
    }

    return (
      <SalesGrid>
        {allSales.map((sale) => {
          const isCurrent = sales.current.includes(sale)
          const displayTitle = language === 'en' && sale.titleEn ? sale.titleEn : sale.title
          const dateInfo = formatDateElegant(isCurrent ? sale.endDate : sale.startDate)

          return (
            <SaleCard key={sale.id} onClick={() => openGuestSignup(sale.id)}>
              {/* Full-width image banner */}
              {sale.imageUrl ? (
                <SaleImageBanner>
                  <img src={sale.imageUrl} alt={displayTitle} loading="lazy" />
                  <ImageOverlay>
                    <OverlayLine>
                      {isCurrent
                        ? (language === 'en' ? 'Ends in ' : 'Se termine dans ')
                        : (language === 'en' ? 'Starts in ' : 'Commence dans ')
                      }
                      <CountdownTimer targetDate={isCurrent ? sale.endDate : sale.startDate} language={language} />
                    </OverlayLine>
                  </ImageOverlay>
                </SaleImageBanner>
              ) : (
                <SaleImagePlaceholder><TagIcon size={32} /></SaleImagePlaceholder>
              )}

              <SaleCardBody>
                <SaleTitle>{displayTitle}</SaleTitle>
                <StatusLabel>
                  {isCurrent
                    ? (language === 'en' ? 'Private Sale' : 'Vente Privée')
                    : (language === 'en' ? 'Upcoming Private Sale' : 'Prochaine Vente Privée')
                  }
                </StatusLabel>
                <DateDisplay>
                  {dateInfo.day}<span>/</span>{dateInfo.month}<span>/</span>{dateInfo.year}
                </DateDisplay>
                <StatusBadge $status={isCurrent ? 'current' : 'upcoming'}>
                  {isCurrent ? <LockIcon size={12} /> : <ClockIcon size={12} />}
                  {isCurrent
                    ? (language === 'en' ? 'Live' : 'En cours')
                    : (language === 'en' ? 'Coming' : 'À venir')
                  }
                </StatusBadge>
                <CTALink onClick={(e) => { e.stopPropagation(); openGuestSignup(sale.id); }}>
                  {isCurrent
                    ? (language === 'en' ? 'Access the sale' : 'Accéder à la vente')
                    : (language === 'en' ? "Sign up" : "M'inscrire")
                  }
                </CTALink>
              </SaleCardBody>
            </SaleCard>
          )
        })}
      </SalesGrid>
    )
  }

  // ============================================
  // RENDER: Authenticated users (Arlettie style)
  // ============================================
  const renderAuthenticatedContent = () => {
    const allSales = [...sales.current, ...sales.upcoming]

    if (allSales.length === 0) {
      return (
        <SaleCard>
          <SaleImagePlaceholder><TagIcon size={32} /></SaleImagePlaceholder>
          <SaleCardBody>
            <SaleTitle>{language === 'en' ? 'Coming Soon' : 'Bientôt'}</SaleTitle>
            <StatusLabel>
              {language === 'en' ? 'No private sales at the moment' : 'Pas de vente privée en ce moment'}
            </StatusLabel>
            <StatusBadge $status="none">
              <BellIcon size={12} />
              {language === 'en' ? 'Stay tuned' : 'Restez informé(e)'}
            </StatusBadge>
          </SaleCardBody>
        </SaleCard>
      )
    }

    return (
      <SalesGrid>
        {allSales.map((sale) => {
          const isCurrent = sales.current.includes(sale)
          const displayTitle = language === 'en' && sale.titleEn ? sale.titleEn : sale.title
          const dateInfo = formatDateElegant(isCurrent ? sale.endDate : sale.startDate)

          return (
            <SaleCard key={sale.id} onClick={() => isCurrent && handleAccessClick(sale.id, sale)}>
              {/* Full-width image banner */}
              {sale.imageUrl ? (
                <SaleImageBanner>
                  <img src={sale.imageUrl} alt={displayTitle} loading="lazy" />
                  <ImageOverlay>
                    <OverlayLine>
                      {isCurrent
                        ? (language === 'en' ? 'Ends in ' : 'Se termine dans ')
                        : (language === 'en' ? 'Starts in ' : 'Commence dans ')
                      }
                      <CountdownTimer targetDate={isCurrent ? sale.endDate : sale.startDate} language={language} />
                    </OverlayLine>
                  </ImageOverlay>
                </SaleImageBanner>
              ) : (
                <SaleImagePlaceholder><TagIcon size={32} /></SaleImagePlaceholder>
              )}

              <SaleCardBody>
                <SaleTitle>{displayTitle}</SaleTitle>
                <StatusLabel>
                  {isCurrent
                    ? (language === 'en' ? 'Private Sale' : 'Vente Privée')
                    : (language === 'en' ? 'Upcoming Private Sale' : 'Prochaine Vente Privée')
                  }
                </StatusLabel>
                <DateDisplay>
                  {dateInfo.day}<span>/</span>{dateInfo.month}<span>/</span>{dateInfo.year}
                </DateDisplay>
                <StatusBadge $status={isCurrent ? 'current' : 'upcoming'}>
                  {isCurrent ? <LockIcon size={12} /> : <ClockIcon size={12} />}
                  {isCurrent
                    ? (language === 'en' ? 'Live' : 'En cours')
                    : (language === 'en' ? 'Coming' : 'À venir')
                  }
                </StatusBadge>
                {isCurrent && (
                  <CTALink onClick={(e) => { e.stopPropagation(); handleAccessClick(sale.id, sale); }}>
                    {language === 'en' ? 'Access the sale' : 'Accéder à la vente'}
                  </CTALink>
                )}
              </SaleCardBody>
            </SaleCard>
          )
        })}
      </SalesGrid>
    )
  }

  return (
    <>
      <Section>
        <Container>
          {!isAuthenticated ? renderTeaser() : renderAuthenticatedContent()}
        </Container>
      </Section>

      <SignupPrompt
        isOpen={showSignupModal}
        onClose={closeGuestSignup}
        redirectAfterLogin={signupRedirectPath}
        customButtonText={language === 'en' ? "Access Private Sales ✨" : "J'accède aux Ventes Privées ✨"}
      />
    </>
  )
}
