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
  font-size: 1.1rem;
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
  font-size: 1.5rem;
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
  
  const shareUrl = generateShareUrl(outfit.id)
  const shareText = generateShareText(outfit.title)
  
  const shareOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      action: () => shareToWhatsApp(shareUrl, shareText)
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      action: () => shareToInstagram(shareUrl, shareText)
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      action: () => shareToFacebook(shareUrl, shareText)
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      action: () => shareToTwitter(shareUrl, shareText)
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: '📌',
      action: () => shareToPinterest(shareUrl, shareText, outfit.image)
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      action: () => shareToTelegram(shareUrl, shareText)
    },
    {
      id: 'email',
      name: 'Email',
      icon: '📧',
      action: () => shareToEmail(shareUrl, shareText)
    },
    {
      id: 'copy',
      name: 'Copier',
      icon: '📋',
      action: () => copyToClipboard(shareUrl, shareText)
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
        <ShareIcon>🔗</ShareIcon>
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
