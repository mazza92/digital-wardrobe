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

const ShareContainer = styled.div`
  position: relative;
  display: inline-block;
`

const ShareIcon = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #666;
    background: rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`

const ShareDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 0.75rem;
  margin-top: 0.5rem;
  z-index: 1000;
  min-width: 200px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid white;
  }
`

const ShareTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
  text-align: center;
`

const ShareGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
`

const ShareOption = styled.button`
  background: #f8f9fa;
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  font-size: 0.7rem;
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

const ShareIconSmall = styled.span`
  font-size: 1.2rem;
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.05);
`

export default function SubtleShareButton({ outfit, className }) {
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
    <ShareContainer className={className}>
      <ShareIcon onClick={() => setIsOpen(!isOpen)}>
        🔗
      </ShareIcon>
      
      {isOpen && (
        <>
          <Overlay onClick={() => setIsOpen(false)} />
          <ShareDropdown>
            <ShareTitle>Partager</ShareTitle>
            <ShareGrid>
              {shareOptions.map((option) => (
                <ShareOption
                  key={option.id}
                  onClick={() => handleShare(option.action)}
                >
                  <ShareIconSmall>{option.icon}</ShareIconSmall>
                  {option.name}
                </ShareOption>
              ))}
            </ShareGrid>
          </ShareDropdown>
        </>
      )}
    </ShareContainer>
  )
}
