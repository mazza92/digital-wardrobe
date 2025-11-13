import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const LanguageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  padding: 0.25rem;
`

const LanguageButton = styled.button`
  background: ${props => props.$active ? '#101010' : 'transparent'};
  color: ${props => props.$active ? '#fff' : '#666'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.$active ? '#fff' : '#101010'};
    background: ${props => props.$active ? '#101010' : 'rgba(0, 0, 0, 0.08)'};
  }
`

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <LanguageContainer>
      <LanguageButton
        $active={i18n.language === 'fr'}
        onClick={() => changeLanguage('fr')}
        aria-label="Switch to French"
      >
        FR
      </LanguageButton>
      <LanguageButton
        $active={i18n.language === 'en'}
        onClick={() => changeLanguage('en')}
        aria-label="Switch to English"
      >
        EN
      </LanguageButton>
    </LanguageContainer>
  )
}

export default LanguageSwitcher

