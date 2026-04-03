import React, { useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
// Icons as SVG components
const XIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const LockIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.emmanuellek.com/api'

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const ModalHeader = styled.div`
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #101010;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
  color: #666;
  
  &:hover {
    background: #f5f5f5;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`

const ModalBody = styled.div`
  padding: 2rem;
`

const SaleImage = styled.div`
  width: 100%;
  height: 200px;
  background: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  ${props => !props.$hasImage && `
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  `}
`

const SaleDescription = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #101010;
`

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid ${props => props.$hasError ? '#fcc' : '#e5e5e5'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: ${props => props.$hasError ? '#fffafa' : 'white'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#f99' : '#101010'};
    box-shadow: ${props => props.$hasError 
      ? '0 0 0 3px rgba(255, 0, 0, 0.1)' 
      : '0 0 0 3px rgba(16, 16, 16, 0.1)'};
  }
  
  &::placeholder {
    text-transform: none;
    letter-spacing: normal;
    color: #999;
  }
`

const ErrorMessage = styled.div`
  padding: 1rem 1.25rem;
  background: ${props => props.$type === 'warning' ? '#fff4e6' : '#fee'};
  border: 1px solid ${props => props.$type === 'warning' ? '#ffd89b' : '#fcc'};
  border-radius: 8px;
  color: ${props => props.$type === 'warning' ? '#b45309' : '#c33'};
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  line-height: 1.5;
  
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`

const SuccessMessage = styled.div`
  padding: 1rem 1.25rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  line-height: 1.5;
  
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`

const InfoIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const AlertIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const CheckIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #101010;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  
  &:hover:not(:disabled) {
    background: #333;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`

const LoadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

export default function PrivateSaleAccessModal({ sale, onClose, onSuccess }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language || 'fr'
  const [accessCode, setAccessCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState(null)

  // No access code required → grant access immediately
  React.useEffect(() => {
    if (sale?.requiresAccessCode === false) {
      const expiry = new Date().getTime() + 30 * 60 * 1000
      sessionStorage.setItem(`sale_${sale.id}_verified`, JSON.stringify({ verified: true, expiry }))
      onSuccess?.()
    }
  }, [sale?.id, sale?.requiresAccessCode, onSuccess])

  if (sale?.requiresAccessCode === false) {
    return null
  }

  const displayTitle = language === 'en' && sale.titleEn ? sale.titleEn : sale.title
  const displayDescription = language === 'en' && sale.descriptionEn ? sale.descriptionEn : sale.description

  const getErrorMessage = (errorCode, error, language) => {
    if (!errorCode && error) {
      // Fallback to original error message
      return error
    }

    switch (errorCode) {
      case 'SALE_NOT_STARTED':
        return language === 'en' 
          ? 'This sale hasn\'t started yet. Please check back later.'
          : 'Cette vente n\'a pas encore commencé. Revenez plus tard.'
      case 'SALE_ENDED':
        return language === 'en'
          ? 'This sale has ended. Thank you for your interest!'
          : 'Cette vente est terminée. Merci pour votre intérêt !'
      case 'SALE_INACTIVE':
        return language === 'en'
          ? 'This sale is currently inactive. Please contact support if you believe this is an error.'
          : 'Cette vente est actuellement inactive. Contactez le support si vous pensez qu\'il s\'agit d\'une erreur.'
      default:
        if (error) {
          return error
        }
        return language === 'en'
          ? 'Invalid access code. Please check and try again.'
          : 'Code d\'accès invalide. Vérifiez et réessayez.'
    }
  }

  const getErrorType = (errorCode) => {
    if (errorCode === 'SALE_NOT_STARTED' || errorCode === 'SALE_ENDED') {
      return 'warning'
    }
    return 'error'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accessCode.trim()) {
      setError({
        message: language === 'en' ? 'Please enter an access code' : 'Veuillez entrer un code d\'accès',
        type: 'error'
      })
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/private-sales/${sale.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accessCode })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle different HTTP status codes
        let errorMessage = data.error || (language === 'en' ? 'An error occurred' : 'Une erreur s\'est produite')
        let errorType = 'error'
        
        if (response.status === 401) {
          errorMessage = language === 'en' 
            ? 'Invalid access code. Please check and try again.'
            : 'Code d\'accès invalide. Vérifiez et réessayez.'
        } else if (response.status === 403) {
          errorMessage = getErrorMessage(data.errorCode, data.error, language)
          errorType = getErrorType(data.errorCode)
        } else if (response.status === 404) {
          errorMessage = language === 'en'
            ? 'Private sale not found.'
            : 'Vente privée introuvable.'
        } else if (response.status >= 500) {
          errorMessage = language === 'en'
            ? 'Server error. Please try again later.'
            : 'Erreur serveur. Veuillez réessayer plus tard.'
        }

        setError({
          message: errorMessage,
          type: errorType,
          errorCode: data.errorCode
        })
        return
      }

      if (data.verified) {
        // Store verification in sessionStorage with expiry (30 minutes)
        const expiry = new Date().getTime() + 30 * 60 * 1000
        sessionStorage.setItem(`sale_${sale.id}_verified`, JSON.stringify({ verified: true, expiry }))
        onSuccess()
      } else {
        setError({
          message: getErrorMessage(data.errorCode, data.error, language),
          type: getErrorType(data.errorCode),
          errorCode: data.errorCode
        })
      }
    } catch (err) {
      console.error('Error verifying access code:', err)
      setError({
        message: language === 'en' 
          ? 'Network error. Please check your connection and try again.'
          : 'Erreur réseau. Vérifiez votre connexion et réessayez.',
        type: 'error'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{displayTitle}</ModalTitle>
          <CloseButton onClick={onClose}>
            <XIcon />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {sale.imageUrl && (
            <SaleImage $hasImage={true}>
              <img src={sale.imageUrl} alt={displayTitle} />
            </SaleImage>
          )}
          
          {displayDescription && (
            <SaleDescription>{displayDescription}</SaleDescription>
          )}
          
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="accessCode">
                {language === 'en' ? 'Access Code' : 'Code d\'accès'}
              </Label>
              <Input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value.toUpperCase())
                  // Clear error when user starts typing
                  if (error) {
                    setError(null)
                  }
                }}
                placeholder={language === 'en' ? 'Enter your access code' : 'Entrez votre code d\'accès'}
                autoFocus
                $hasError={!!error && error.type !== 'warning'}
                disabled={isVerifying}
              />
            </InputGroup>
            
            {error && (
              <ErrorMessage $type={error.type || 'error'}>
                {error.type === 'warning' ? <AlertIcon /> : <InfoIcon />}
                <span>{error.message}</span>
              </ErrorMessage>
            )}
            
            <SubmitButton type="submit" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <LoadingSpinner />
                  {language === 'en' ? 'Verifying...' : 'Vérification...'}
                </>
              ) : (
                <>
                  <LockIcon />
                  {language === 'en' ? 'Access this sale' : 'Accéder à cette vente'}
                </>
              )}
            </SubmitButton>
          </Form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  )
}
