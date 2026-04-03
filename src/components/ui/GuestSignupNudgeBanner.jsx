import styled from 'styled-components'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import SignupPrompt from './SignupPrompt'
import {
  dismissSignupNudge,
  isSignupNudgeDismissed,
  isSignupNudgeTriggered,
  signupNudgeEventName,
} from '../../utils/engagementNudge'
import { trackBannerEvent } from '../../utils/analytics'

const Banner = styled.aside`
  position: fixed;
  left: 10px;
  right: 10px;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  margin: 0 auto;
  max-width: 960px;
  background: rgba(16, 16, 16, 0.96);
  color: #fff;
  border-radius: 14px;
  padding: 0.8rem 0.95rem;
  z-index: 2147483000;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const Copy = styled.p`
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.92);
  flex: 1;
`

const SignupButton = styled.button`
  border: none;
  background: #fff;
  color: #101010;
  border-radius: 999px;
  padding: 0.48rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
`

const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.2rem 0.35rem;
`

export default function GuestSignupNudgeBanner() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [tick, setTick] = useState(0)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    const onUpdate = () => setTick(t => t + 1)
    window.addEventListener(signupNudgeEventName, onUpdate)
    return () => window.removeEventListener(signupNudgeEventName, onUpdate)
  }, [])

  const shouldHideForRoute = useMemo(() => {
    const p = location.pathname
    return p === '/login' || p === '/signup'
  }, [location.pathname])

  const visible = !isAuthenticated && !shouldHideForRoute && isSignupNudgeTriggered() && !isSignupNudgeDismissed()

  // Track banner show event when it becomes visible
  useEffect(() => {
    if (visible) {
      trackBannerEvent('show', 'engagement_nudge', { page: location.pathname })
    }
  }, [visible, location.pathname])

  if (!visible) return null

  const goSignup = () => {
    trackBannerEvent('click', 'engagement_nudge', { page: location.pathname })
    setIsAuthModalOpen(true)
  }

  const close = () => {
    trackBannerEvent('dismiss', 'engagement_nudge', { page: location.pathname })
    dismissSignupNudge()
    setTick(t => t + 1)
  }

  const redirect = `${location.pathname}${location.search}${location.hash}`

  return (
    <>
      {createPortal(
        <Banner role="status" aria-live="polite" data-tick={tick}>
          <Copy>
            {t('signupNudge.message')}
          </Copy>
          <SignupButton type="button" onClick={goSignup}>{t('signupNudge.cta')}</SignupButton>
          <CloseButton type="button" onClick={close} aria-label={t('signupNudge.closeAria')}>x</CloseButton>
        </Banner>,
        document.body
      )}
      <SignupPrompt
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectAfterLogin={redirect}
      />
    </>
  )
}
