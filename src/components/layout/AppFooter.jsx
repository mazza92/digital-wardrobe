import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useOutfits } from '../../hooks/useOutfits'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const Footer = styled.footer`
  background: #fdfcf8;
  color: #101010;
  padding: 2rem 1rem;
  text-align: center;
  margin-top: 4rem;

  @media (min-width: 768px) {
    padding: 3rem 1.5rem;
  }
`

const FooterLanguageSwitcher = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
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
  text-decoration: none;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 22px;
    height: 22px;
  }
`

const NewsletterLink = styled(Link)`
  display: inline-block;
  background: none;
  border: none;
  color: #101010;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.75rem 1.5rem;
  margin: 1rem 0 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-decoration: underline;
  text-underline-offset: 4px;

  @media (min-width: 768px) {
    font-size: 1rem;
    margin: 1.5rem 0 1rem;
  }

  &:hover {
    opacity: 0.7;
  }
`

const FooterBottom = styled.div`
  font-size: 0.9rem;
  color: #101010;
  opacity: 0.5;
  margin: 0;
  padding-top: 2rem;
  border-top: 1px solid rgba(16, 16, 16, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    gap: 1.5rem;
  }
`

const FooterLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`

const FooterExternalLink = styled.a`
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`

export default function AppFooter() {
  const { t } = useTranslation()
  const { influencer } = useOutfits()
  const sm = influencer?.socialMedia || {}
  const emailHref = sm.email ? (sm.email.startsWith('mailto:') ? sm.email : `mailto:${sm.email}`) : null

  return (
    <Footer>
      <FooterContent>
        <FooterLanguageSwitcher>
          <LanguageSwitcher />
        </FooterLanguageSwitcher>
        <FooterTitle>{t('about.follow')}</FooterTitle>
        <SocialLinks>
          {sm.instagram && (
            <SocialLink href={sm.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </SocialLink>
          )}
          {sm.tiktok && (
            <SocialLink href={sm.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </SocialLink>
          )}
          {sm.website && (
            <SocialLink href={sm.website} target="_blank" rel="noopener noreferrer" aria-label="Site web">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </SocialLink>
          )}
          {emailHref && (
            <SocialLink href={emailHref} aria-label="Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </SocialLink>
          )}
        </SocialLinks>
        <NewsletterLink to="/signup">
          {t('footer.newsletter', 'Recevoir ma newsletter')}
        </NewsletterLink>
        <FooterBottom>
          <span>{t('footer.copyright')}</span>
          <FooterExternalLink
            href="https://curatedcloset.cc/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('footer.joinCuratedCloset', 'Rejoindre CuratedCloset')}
          </FooterExternalLink>
          <FooterLink to="/privacy">
            {t('footer.privacyPolicy', 'Politique de confidentialité')}
          </FooterLink>
          <FooterLink to="/legal">
            {t('footer.legalInfo', 'Legal information')}
          </FooterLink>
        </FooterBottom>
      </FooterContent>
    </Footer>
  )
}
