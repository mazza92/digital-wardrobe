import React from 'react'
import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;
`

const Drawer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 420px;
  background: white;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.3s ease;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
`

const Header = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const ItemCount = styled.span`
  background: #101010;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
  
  &:hover {
    color: #101010;
  }
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
`

const EmptyCart = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    opacity: 0.3;
  }
  
  p {
    margin: 0;
    font-size: 1rem;
  }
`

const CartItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`

const ItemImage = styled.img`
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
`

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const ItemName = styled.h3`
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: #101010;
`

const ItemPrice = styled.span`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
`

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f5f5;
    border-color: #101010;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Quantity = styled.span`
  min-width: 24px;
  text-align: center;
  font-weight: 500;
`

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.8rem;
  margin-left: auto;
  
  &:hover {
    color: #e53e3e;
  }
`

const Footer = styled.div`
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #eee;
  background: #fafafa;
`

const Subtotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  
  strong {
    font-weight: 600;
  }
`

const FreeShipping = styled.div`
  background: #f0fdf4;
  color: #166534;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`

const ShippingProgress = styled.div`
  background: #fff7ed;
  color: #9a3412;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`

const CheckoutButton = styled(Link)`
  display: block;
  width: 100%;
  padding: 1rem;
  background: #101010;
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s;
  
  &:hover {
    background: #333;
  }
`

const ContinueShopping = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 0.75rem;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    color: #101010;
  }
`

const FREE_SHIPPING_THRESHOLD = 50

const CartDrawer = () => {
  const { t, i18n } = useTranslation()
  const { 
    items, 
    itemCount, 
    subtotal, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem 
  } = useCart()

  if (!isOpen) return null

  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

  const getItemName = (item) => {
    if (i18n.language === 'en' && item.nameEn) {
      return item.nameEn
    }
    return item.name
  }

  return (
    <>
      <Overlay onClick={closeCart} />
      <Drawer>
        <Header>
          <Title>
            {t('cart.title', 'Mon Panier')}
            {itemCount > 0 && <ItemCount>{itemCount}</ItemCount>}
          </Title>
          <CloseButton onClick={closeCart}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </CloseButton>
        </Header>

        <Content>
          {items.length === 0 ? (
            <EmptyCart>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>{t('cart.empty', 'Votre panier est vide')}</p>
            </EmptyCart>
          ) : (
            items.map((item) => (
              <CartItem key={item.productId}>
                <ItemImage src={item.imageUrl} alt={getItemName(item)} />
                <ItemDetails>
                  <ItemName>{getItemName(item)}</ItemName>
                  <ItemPrice>{item.price.toFixed(2)}€</ItemPrice>
                  <QuantityControl>
                    <QuantityButton
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      −
                    </QuantityButton>
                    <Quantity>{item.quantity}</Quantity>
                    <QuantityButton
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </QuantityButton>
                    <RemoveButton onClick={() => removeItem(item.productId)}>
                      {t('cart.remove', 'Supprimer')}
                    </RemoveButton>
                  </QuantityControl>
                </ItemDetails>
              </CartItem>
            ))
          )}
        </Content>

        {items.length > 0 && (
          <Footer>
            {hasFreeShipping ? (
              <FreeShipping>
                ✓ {t('cart.freeShipping', 'Livraison gratuite !')}
              </FreeShipping>
            ) : (
              <ShippingProgress>
                {t('cart.freeShippingProgress', 'Plus que {{amount}}€ pour la livraison gratuite', {
                  amount: amountToFreeShipping.toFixed(2)
                })}
              </ShippingProgress>
            )}
            
            <Subtotal>
              <span>{t('cart.subtotal', 'Sous-total')}</span>
              <strong>{subtotal.toFixed(2)}€</strong>
            </Subtotal>
            
            <CheckoutButton to="/checkout" onClick={closeCart}>
              {t('cart.checkout', 'Commander')}
            </CheckoutButton>
            
            <ContinueShopping to="/shop" onClick={closeCart}>
              {t('cart.continueShopping', 'Continuer mes achats')}
            </ContinueShopping>
          </Footer>
        )}
      </Drawer>
    </>
  )
}

export default CartDrawer

