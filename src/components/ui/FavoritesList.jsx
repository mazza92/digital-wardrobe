import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { handleAffiliateClick } from '../../utils/tracking'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

const FavoritesContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 400px;
  height: 100vh;
  height: 100dvh;
  background: white;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overscroll-behavior: contain;
`

const FavoritesHeader = styled.div`
  flex-shrink: 0;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const FavoritesTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #1a1a1a;
    background: #f5f5f5;
  }
`

const FavoritesContent = styled.div`
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 1rem;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 2rem 1rem;
  padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
  text-align: center;
  color: #666;
`

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
`

const EmptyDescription = styled.p`
  font-size: 0.95rem;
  margin: 0;
  color: #666;
`

const FavoritesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const FavoriteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  cursor: ${props => props.$hasLink ? 'pointer' : 'default'};
  
  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const ProductImage = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'imageUrl'
})`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #666;
  flex-shrink: 0;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ProductName = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ProductBrand = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ProductPrice = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  
  &:hover {
    background: #ffe6e6;
    transform: scale(1.1);
  }
`

const FavoritesFooter = styled.div`
  flex-shrink: 0;
  padding: 1.5rem;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
`

const FavoritesCount = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`

const ViewAllButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  background: #1a1a1a;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #333;
    transform: translateY(-1px);
  }
`

const CloseButton2 = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
`

function FavoritesListComponent({ isOpen, onClose, favorites, onRemoveFavorite, onClearFavorites }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Lock body scroll when sidebar is open
  useBodyScrollLock(isOpen)

  const handleViewAll = () => {
    onClose()
    navigate('/profile')
  }

  const formatPrice = (priceString) => {
    if (priceString == null || priceString === '') return ''
    
    // If price already contains currency symbol, return as-is
    if (String(priceString).includes('€') || String(priceString).includes('$') || String(priceString).includes('£')) {
      return priceString
    }
    
    // Otherwise, add Euro currency to the price
    return `${priceString} €`
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleItemClick = (item, e) => {
    // Prevent click if clicking on remove button
    if (e.target.closest('button')) {
      return
    }

    // If item has affiliate link, track click and open in new tab
    if (item.link) {
      // handleAffiliateClick returns true if it handled opening the link (e.g., ShopMy/Affilae links)
      const linkHandled = handleAffiliateClick(item, 'favorites', e)
      if (!linkHandled) {
        // For non-affiliate redirect links, open in new tab manually
        window.open(item.link, '_blank', 'noopener,noreferrer')
      }
    }
  }

  const handleRemoveClick = (itemId, e) => {
    e.stopPropagation()
    onRemoveFavorite(itemId)
  }

  return createPortal(
    <>
      <Overlay $isOpen={isOpen} onClick={handleOverlayClick} />
      <FavoritesContainer $isOpen={isOpen}>
        <FavoritesHeader>
          <FavoritesTitle>{t('favorites.title')}</FavoritesTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </FavoritesHeader>

        <FavoritesContent>
          {favorites.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </EmptyIcon>
              <EmptyTitle>{t('favorites.empty')}</EmptyTitle>
              <EmptyDescription>
                {t('favorites.emptyDescription')}
              </EmptyDescription>
            </EmptyState>
          ) : (
            <FavoritesList>
              {favorites.map((item) => (
                <FavoriteItem
                  key={item.id}
                  $hasLink={!!item.link}
                  onClick={(e) => handleItemClick(item, e)}
                >
                  <ProductImage imageUrl={item.imageUrl}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    )}
                  </ProductImage>
                  <ProductInfo>
                    <ProductName>{item.name}</ProductName>
                    <ProductBrand>{item.brand}</ProductBrand>
                    {item.price != null && item.price !== '' && (
                      <ProductPrice>{formatPrice(item.price)}</ProductPrice>
                    )}
                  </ProductInfo>
                  <RemoveButton
                    onClick={(e) => handleRemoveClick(item.id, e)}
                    title={t('favorites.remove')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </RemoveButton>
                </FavoriteItem>
              ))}
            </FavoritesList>
          )}
        </FavoritesContent>

        {favorites.length > 0 && (
          <FavoritesFooter>
            <FavoritesCount>
              {favorites.length} {favorites.length === 1 ? t('favorites.item') : t('favorites.items')}
            </FavoritesCount>
            <ActionButtons>
              <ViewAllButton onClick={handleViewAll}>
                {t('favorites.viewAll', 'Voir tout')}
              </ViewAllButton>
              <CloseButton2 onClick={onClose}>
                {t('common.close')}
              </CloseButton2>
            </ActionButtons>
          </FavoritesFooter>
        )}
      </FavoritesContainer>
    </>,
    document.body
  )
}

export default FavoritesListComponent
