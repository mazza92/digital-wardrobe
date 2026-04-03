import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
`

const Banner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  background: #101010;
  color: #fff;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.82rem;
  line-height: 1.4;
  animation: ${slideDown} 0.3s ease;
  /* Push page content down */
  & + * { margin-top: 56px; }
`

const BannerText = styled.span`
  flex: 1;
`

const OpenButton = styled.button`
  background: #fff;
  color: #101010;
  border: none;
  border-radius: 20px;
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.25rem;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`

function isInstagramBrowser() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return ua.includes('Instagram') || ua.includes('FBAN') || ua.includes('FBAV')
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || '')
}

function openInExternalBrowser() {
  const url = window.location.href
  if (isIOS()) {
    // iOS: deep-link into Safari (works for most iOS versions)
    window.location.href = url.replace(/^https?:\/\//, 'googlechrome://')
    // Fallback after 1s if Chrome isn't installed
    setTimeout(() => {
      window.open(url, '_blank')
    }, 1000)
  } else {
    // Android: intent URL to open in Chrome
    const intent = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
    window.location.href = intent
  }
}

const DISMISSED_KEY = 'ig_banner_dismissed'

export default function InstagramBrowserBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isInstagramBrowser()) return
    // Only show once per session
    if (sessionStorage.getItem(DISMISSED_KEY)) return
    setVisible(true)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  return (
    <Banner role="alert">
      <BannerText>
        Pour une meilleure expérience, ouvre dans ton navigateur.
      </BannerText>
      <OpenButton onClick={openInExternalBrowser}>
        Ouvrir ↗
      </OpenButton>
      <CloseBtn onClick={dismiss} aria-label="Fermer">×</CloseBtn>
    </Banner>
  )
}
