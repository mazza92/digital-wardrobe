import { useState } from 'react'
import styled from 'styled-components'

const FavoritesContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
`

const FavoritesHeader = styled.div`
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
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
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
  
  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const ProductImage = styled.div`
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
  padding: 1.5rem;
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

const ClearButton = styled.button`
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

const ViewButton = styled.button`
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

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`

function FavoritesListComponent({ isOpen, onClose, favorites, onRemoveFavorite, onClearFavorites }) {
  const formatPrice = (priceString) => {
    if (!priceString) return 'Prix non disponible'
    
    // If price already contains currency symbol, return as-is
    if (priceString.includes('€') || priceString.includes('$') || priceString.includes('£')) {
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

  return (
    <>
      <Overlay isOpen={isOpen} onClick={handleOverlayClick} />
      <FavoritesContainer isOpen={isOpen}>
        <FavoritesHeader>
          <FavoritesTitle>Mes Favoris</FavoritesTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </FavoritesHeader>
        
        <FavoritesContent>
          {favorites.length === 0 ? (
            <EmptyState>
              <EmptyIcon>💔</EmptyIcon>
              <EmptyTitle>Aucun favori pour le moment</EmptyTitle>
              <EmptyDescription>
                Commencez à ajouter vos pièces préférées en cliquant sur l'icône cœur de n'importe quel produit
              </EmptyDescription>
            </EmptyState>
          ) : (
            <FavoritesList>
              {favorites.map((item) => (
                <FavoriteItem key={item.id}>
                  <ProductImage>👗</ProductImage>
                  <ProductInfo>
                    <ProductName>{item.name}</ProductName>
                    <ProductBrand>{item.brand}</ProductBrand>
                    <ProductPrice>{formatPrice(item.price)}</ProductPrice>
                  </ProductInfo>
                  <RemoveButton 
                    onClick={() => onRemoveFavorite(item.id)}
                    title="Remove from favorites"
                  >
                    ❤️
                  </RemoveButton>
                </FavoriteItem>
              ))}
            </FavoritesList>
          )}
        </FavoritesContent>
        
        {favorites.length > 0 && (
          <FavoritesFooter>
            <FavoritesCount>
              {favorites.length} favori{favorites.length !== 1 ? 's' : ''}
            </FavoritesCount>
            <ActionButtons>
              <ClearButton onClick={onClearFavorites}>
                Tout Effacer
              </ClearButton>
              <ViewButton onClick={onClose}>
                Fermer
              </ViewButton>
            </ActionButtons>
          </FavoritesFooter>
        )}
      </FavoritesContainer>
    </>
  )
}

export default FavoritesListComponent
