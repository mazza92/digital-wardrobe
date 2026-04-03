import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

const KEY_PENDING = 'dw_signup_welcome_pending'
const KEY_SHOWN = 'dw_signup_welcome_shown'
const SIGNUP_WELCOME_EVENT = 'dw-signup-welcome-ready'
const AUTO_DISMISS_MS = 14000

const slideIn = keyframes`
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

const slideOut = keyframes`
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(12px); opacity: 0; }
`

const Wrap = styled.div`
  position: fixed;
  right: 14px;
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  z-index: 2147483000;
  pointer-events: none;

  @media (max-width: 640px) {
    left: 10px;
    right: 10px;
  }
`

const Card = styled.div`
  width: 360px;
  max-width: 100%;
  background: #111;
  color: #fff;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.3);
  padding: 0.85rem 0.95rem;
  pointer-events: auto;
  animation: ${props => props.$leaving ? slideOut : slideIn} 0.24s ease forwards;
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
`

const Title = styled.div`
  font-size: 0.92rem;
  font-weight: 700;
`

const Copy = styled.p`
  margin: 0.35rem 0 0.75rem 0;
  font-size: 0.82rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
`

const Features = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
`

const Feature = styled.span`
  font-size: 0.72rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  padding: 0.22rem 0.5rem;
  color: rgba(255, 255, 255, 0.95);
`

const Actions = styled.div`
  display: flex;
  gap: 0.45rem;
`

const Button = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.46rem 0.78rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
`

const Primary = styled(Button)`
  background: #fff;
  color: #111;
`

const Ghost = styled(Button)`
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
`

const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  line-height: 1;
  padding: 0.1rem 0.2rem;
  cursor: pointer;
`

function readFlag(key) {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeFlag(key, value) {
  try {
    if (value) sessionStorage.setItem(key, '1')
    else sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export default function SignupWelcomeToast() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [eventTick, setEventTick] = useState(0)

  const isProfileRoute = useMemo(
    () => location.pathname === '/profile',
    [location.pathname]
  )

  useEffect(() => {
    const onReady = () => setEventTick(t => t + 1)
    window.addEventListener(SIGNUP_WELCOME_EVENT, onReady)
    return () => window.removeEventListener(SIGNUP_WELCOME_EVENT, onReady)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || isProfileRoute) return
    const pending = readFlag(KEY_PENDING)
    const shown = readFlag(KEY_SHOWN)
    if (!pending || shown) return
    setLeaving(false)
    setVisible(true)
  }, [isAuthenticated, isProfileRoute, eventTick])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => closeToast(), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [visible])

  const closeToast = () => {
    setLeaving(true)
    setTimeout(() => {
      setVisible(false)
      writeFlag(KEY_PENDING, false)
      writeFlag(KEY_SHOWN, true)
    }, 240)
  }

  const goToAccount = () => {
    closeToast()
    navigate('/profile')
  }

  if (!visible) return null

  return createPortal(
    <Wrap>
      <Card $leaving={leaving} role="status" aria-live="polite">
        <Header>
          <Title>{t('signupWelcome.title')}</Title>
          <CloseButton onClick={closeToast} aria-label={t('signupWelcome.closeAria')}>×</CloseButton>
        </Header>
        <Copy>{t('signupWelcome.subtitle')}</Copy>
        <Features>
          <Feature>{t('signupWelcome.featureFavorites')}</Feature>
          <Feature>{t('signupWelcome.featurePrivateSales')}</Feature>
          <Feature>{t('signupWelcome.featureProfile')}</Feature>
        </Features>
        <Actions>
          <Primary type="button" onClick={goToAccount}>{t('signupWelcome.ctaAccount')}</Primary>
          <Ghost type="button" onClick={closeToast}>{t('signupWelcome.ctaLater')}</Ghost>
        </Actions>
      </Card>
    </Wrap>,
    document.body
  )
}
