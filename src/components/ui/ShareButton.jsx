import { useState } from 'react'
import styled from 'styled-components'
import { 
  generateShareUrl, 
  generateShareText, 
  shareToWhatsApp, 
  shareToFacebook, 
  shareToTwitter, 
  shareToInstagram, 
  shareToPinterest, 
  copyToClipboard, 
  shareToEmail, 
  shareToTelegram 
} from '../../utils/sharing'

const ShareButtonContainer = styled.div`
  position: relative;
  display: inline-block;
`

const ShareButton = styled.button`
  background: ${props => props.variant === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.variant === 'primary' ? 'white' : '#333'};
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
`

const ShareIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 18px;
    height: 18px;
  }
`

const ShareDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  margin-top: 0.5rem;
  z-index: 1000;
  min-width: 280px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    min-width: 260px;
    left: -50%;
    right: -50%;
  }
`

const ShareTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  text-align: center;
`

const ShareGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
`

const ShareOption = styled.button`
  background: #f8f9fa;
  border: none;
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
  
  &:hover {
    background: #e9ecef;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const ShareIconLarge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
  }
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.1);
`

export default function ShareButtonComponent({ outfit, variant = 'primary', className }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const shareUrl = generateShareUrl(outfit)
  const shareText = generateShareText(outfit.title)
  
  const shareOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      action: () => shareToWhatsApp(shareUrl, shareText)
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      action: () => shareToInstagram(shareUrl, shareText)
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
      action: () => shareToFacebook(shareUrl, shareText)
    },
    {
      id: 'x',
      name: 'X',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      action: () => shareToTwitter(shareUrl, shareText)
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      action: () => shareToPinterest(shareUrl, shareText, outfit.image)
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      ),
      action: () => shareToTelegram(shareUrl, shareText)
    },
    {
      id: 'email',
      name: 'Email',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      action: () => shareToEmail(shareUrl, shareText)
    },
    {
      id: 'copy',
      name: 'Copier',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      ),
      action: () => copyToClipboard(shareUrl)
    }
  ]
  
  const handleShare = (action) => {
    action()
    setIsOpen(false)
  }
  
  return (
    <ShareButtonContainer className={className}>
      <ShareButton 
        variant={variant} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <ShareIcon>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </ShareIcon>
        Partager
      </ShareButton>
      
      {isOpen && (
        <>
          <Overlay onClick={() => setIsOpen(false)} />
          <ShareDropdown>
            <ShareTitle>Partager cette tenue</ShareTitle>
            <ShareGrid>
              {shareOptions.map((option) => (
                <ShareOption
                  key={option.id}
                  onClick={() => handleShare(option.action)}
                >
                  <ShareIconLarge>{option.icon}</ShareIconLarge>
                  {option.name}
                </ShareOption>
              ))}
            </ShareGrid>
          </ShareDropdown>
        </>
      )}
    </ShareButtonContainer>
  )
}
