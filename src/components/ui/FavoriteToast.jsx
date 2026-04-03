import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { useTranslation } from 'react-i18next'

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`

const heartPop = keyframes`
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`

const ToastWrapper = styled.div`
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  pointer-events: none;

  @media (max-width: 480px) {
    left: 1rem;
    right: 1rem;
    transform: none;
  }
`

const ToastContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${props => props.$isLeaving ? slideOut : slideIn} 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  pointer-events: auto;
  min-width: 280px;
  max-width: 360px;

  @media (max-width: 480px) {
    min-width: auto;
    max-width: none;
    width: 100%;
  }
`

const ProductImage = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #f5f5f5;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const PlaceholderIcon = styled.div`
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const ToastTitle = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ToastSubtitle = styled.span`
  font-size: 0.8rem;
  color: #666;
`

const HeartIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: ${heartPop} 0.5s ease-out;

  svg {
    width: 20px;
    height: 20px;
    color: #e74c3c;
    fill: #e74c3c;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #f5f5f5;
    color: #666;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

// Global handler
let favoriteToastHandler = null

export const showFavoriteToast = (product, count = 1) => {
  if (favoriteToastHandler) {
    favoriteToastHandler(product, count)
  }
}

function FavoriteToast() {
  const { t } = useTranslation()
  const [toast, setToast] = useState(null)
  const [itemCount, setItemCount] = useState(1)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    favoriteToastHandler = (product, count = 1) => {
      setIsLeaving(false)
      setToast(product)
      setItemCount(count)

      // Start leave animation after delay
      const leaveTimer = setTimeout(() => {
        setIsLeaving(true)
      }, 2500)

      // Remove toast after animation
      const removeTimer = setTimeout(() => {
        setToast(null)
        setIsLeaving(false)
      }, 2850)

      return () => {
        clearTimeout(leaveTimer)
        clearTimeout(removeTimer)
      }
    }

    return () => {
      favoriteToastHandler = null
    }
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setToast(null)
      setIsLeaving(false)
    }, 350)
  }

  if (!toast) return null

  return createPortal(
    <ToastWrapper>
      <ToastContainer $isLeaving={isLeaving}>
        <ProductImage>
          {toast.imageUrl ? (
            <img
              src={toast.imageUrl}
              alt={toast.name}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <PlaceholderIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </PlaceholderIcon>
          )}
        </ProductImage>

        <ContentWrapper>
          <ToastTitle>
            {itemCount > 1
              ? t('favorites.outfitSaved', 'Look sauvegardé!')
              : toast.name
            }
          </ToastTitle>
          <ToastSubtitle>
            {itemCount > 1
              ? t('favorites.itemsAdded', '{{count}} pièces ajoutées', { count: itemCount })
              : t('favorites.added', 'Ajouté aux favoris!')
            }
          </ToastSubtitle>
        </ContentWrapper>

        <HeartIcon>
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </HeartIcon>

        <CloseButton onClick={handleClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </CloseButton>
      </ToastContainer>
    </ToastWrapper>,
    document.body
  )
}

export default FavoriteToast
