import React, { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'
import { trackGA4Purchase } from '../../utils/ga4'

const Container = styled.div`
  min-height: 100vh;
  background: #FDFCF8;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  background: #fdfcf8;
  padding: 0.875rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 56px;
  
  @media (min-width: 480px) {
    padding: 1rem 1.25rem;
  }
  
  @media (min-width: 768px) {
    padding: 1.125rem 2rem;
    min-height: 64px;
  }
`

const Logo = styled(Link)`
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.3px;
  color: #101010;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  
  @media (min-width: 480px) {
    font-size: 1.05rem;
  }
  
  @media (min-width: 768px) {
    font-size: 1.2rem;
    letter-spacing: 0.5px;
  }
  
  &:hover {
    opacity: 0.7;
  }
`

const Main = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
`

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  svg {
    width: 40px;
    height: 40px;
    color: #10b981;
  }
`

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: #101010;
`

const Message = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
`

const OrderNumber = styled.div`
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  
  span {
    display: block;
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.25rem;
  }
  
  strong {
    font-size: 1.1rem;
    color: #101010;
    letter-spacing: 1px;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const PrimaryButton = styled(Link)`
  display: block;
  padding: 1rem;
  background: #101010;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: background 0.2s;
  
  &:hover {
    background: #333;
  }
`

const SecondaryButton = styled(Link)`
  display: block;
  padding: 1rem;
  background: transparent;
  color: #101010;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 500;
  border: 1px solid #ddd;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f5f5;
    border-color: #101010;
  }
`

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

function CheckoutSuccess() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  
  const orderNumber = searchParams.get('order')

  // Clear cart on successful checkout + GA4 purchase
  useEffect(() => {
    clearCart()
    if (orderNumber) {
      trackGA4Purchase({ orderId: orderNumber })
    }
  }, [clearCart, orderNumber])

  return (
    <Container>
      <Header>
        <Logo to="/">Emmanuelle K</Logo>
      </Header>

      <Main>
        <Card>
          <SuccessIcon>
            <CheckIcon />
          </SuccessIcon>

          <Title>{t('checkoutSuccess.title', 'Merci pour votre commande !')}</Title>
          
          <Message>
            {t('checkoutSuccess.message', 'Votre commande a été confirmée. Vous recevrez un email de confirmation avec les détails de votre commande.')}
          </Message>

          {orderNumber && (
            <OrderNumber>
              <span>{t('checkoutSuccess.orderNumber', 'Numéro de commande')}</span>
              <strong>{orderNumber}</strong>
            </OrderNumber>
          )}

          <ButtonGroup>
            <PrimaryButton to="/shop">
              {t('checkoutSuccess.continueShopping', 'Continuer mes achats')}
            </PrimaryButton>
            <SecondaryButton to="/">
              {t('common.backToHome')}
            </SecondaryButton>
          </ButtonGroup>
        </Card>
      </Main>
    </Container>
  )
}

export default CheckoutSuccess

