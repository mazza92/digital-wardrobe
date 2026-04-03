import styled from 'styled-components'

const FavoritesButtonContainer = styled.button`
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  color: #666;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 480px) {
    padding: 0.5rem;
  }
  
  @media (min-width: 768px) {
    padding: 0.75rem;
    border-radius: 12px;
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1a1a1a;
  }
`

const HeartIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: color 0.3s ease;
  
  @media (min-width: 768px) {
    width: 24px;
    height: 24px;
  }
  
  svg {
    width: 100%;
    height: 100%;
    transition: fill 0.2s ease, stroke 0.2s ease;
  }
`

const FavoritesBadge = styled.div`
  position: absolute;
  top: 0.1rem;
  right: 0.1rem;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 600;
  transform: scale(${props => props.$count > 0 ? 1 : 0});
  transition: transform 0.3s ease;
  min-width: 16px;
  
  @media (min-width: 480px) {
    top: 0.15rem;
    right: 0.15rem;
    width: 18px;
    height: 18px;
    font-size: 0.65rem;
    min-width: 18px;
  }
  
  @media (min-width: 768px) {
    top: 0.25rem;
    right: 0.25rem;
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
    min-width: 20px;
  }
`

function FavoritesButton({ onClick, favoritesCount, isFavorited = false }) {
  return (
    <FavoritesButtonContainer onClick={onClick} title="Voir les Favoris">
      <HeartIconWrapper>
        <svg viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </HeartIconWrapper>
      <FavoritesBadge $count={favoritesCount}>
        {favoritesCount > 99 ? '99+' : favoritesCount}
      </FavoritesBadge>
    </FavoritesButtonContainer>
  )
}

export default FavoritesButton
