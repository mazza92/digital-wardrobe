import styled from 'styled-components'

const FavoritesButtonContainer = styled.button`
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: #666;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1a1a1a;
  }
`

const HeartIcon = styled.div`
  width: 24px;
  height: 24px;
  position: relative;
  transition: all 0.3s ease;
  
  &::before {
    content: '♡';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    color: ${props => props.isFavorited ? '#1a1a1a' : 'currentColor'};
    font-weight: 300;
  }
`

const FavoritesBadge = styled.div`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  transform: scale(${props => props.count > 0 ? 1 : 0});
  transition: transform 0.3s ease;
`

function FavoritesButton({ onClick, favoritesCount, isFavorited = false }) {
  return (
    <FavoritesButtonContainer onClick={onClick} title="Voir les Favoris">
      <HeartIcon isFavorited={isFavorited} />
      <FavoritesBadge count={favoritesCount}>
        {favoritesCount > 99 ? '99+' : favoritesCount}
      </FavoritesBadge>
    </FavoritesButtonContainer>
  )
}

export default FavoritesButton
