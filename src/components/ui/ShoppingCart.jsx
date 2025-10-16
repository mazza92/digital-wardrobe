import { useState } from 'react'
import styled from 'styled-components'

const CartContainer = styled.div`
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

const CartHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const CartTitle = styled.h2`
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

const CartContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`

const CartItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
`

const ItemImage = styled.div`
  width: 60px;
  height: 60px;
  background: #f8f8f8;
  border-radius: 8px;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
`

const ItemDetails = styled.div`
  flex: 1;
`

const ItemName = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
`

const ItemBrand = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 0.5rem 0;
`

const ItemPrice = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #666;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f5f5f5;
    color: #1a1a1a;
  }
`

const QuantityInput = styled.input`
  width: 40px;
  height: 28px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 0.8rem;
  color: #1a1a1a;
`

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #e74c3c;
    background: #fdf2f2;
  }
`

const EmptyCart = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
`

const EmptyCartText = styled.p`
  font-size: 1rem;
  margin: 0 0 1rem 0;
`

const CartFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
`

const CartTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const TotalLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
`

const TotalAmount = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
`

const CheckoutButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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

function ShoppingCart({ isOpen, onClose, cart, updateQuantity, removeFromCart, getCartTotal }) {
  const formatPrice = (priceString) => {
    if (!priceString) return 'Prix non disponible'
    
    // If price already contains currency symbol, return as-is
    if (priceString.includes('€') || priceString.includes('$') || priceString.includes('£')) {
      return priceString
    }
    
    // Otherwise, add Euro currency to the price
    return `${priceString} €`
  }

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, parseInt(newQuantity) || 0)
  }

  const handleCheckout = () => {
    // In a real app, this would redirect to checkout
    alert('Checkout functionality would be implemented here!')
  }

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <CartContainer isOpen={isOpen}>
        <CartHeader>
          <CartTitle>Shopping Cart ({cart.length})</CartTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </CartHeader>
        
        <CartContent>
          {cart.length === 0 ? (
            <EmptyCart>
              <EmptyCartText>Your cart is empty</EmptyCartText>
              <p style={{ fontSize: '0.9rem', color: '#999', margin: 0 }}>
                Add some items to get started!
              </p>
            </EmptyCart>
          ) : (
            cart.map((item) => (
              <CartItem key={item.id}>
                <ItemImage image={item.image || '/placeholder.jpg'} />
                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                  <ItemBrand>{item.brand}</ItemBrand>
                  <ItemPrice>{formatPrice(item.price)}</ItemPrice>
                  <QuantityControls>
                    <QuantityButton 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      −
                    </QuantityButton>
                    <QuantityInput
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      min="1"
                    />
                    <QuantityButton 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </QuantityButton>
                  </QuantityControls>
                </ItemDetails>
                <RemoveButton onClick={() => removeFromCart(item.id)}>
                  ×
                </RemoveButton>
              </CartItem>
            ))
          )}
        </CartContent>
        
        {cart.length > 0 && (
          <CartFooter>
            <CartTotal>
              <TotalLabel>Total:</TotalLabel>
              <TotalAmount>{getCartTotal().toFixed(2)} €</TotalAmount>
            </CartTotal>
            <CheckoutButton onClick={handleCheckout}>
              Proceed to Checkout
            </CheckoutButton>
          </CartFooter>
        )}
      </CartContainer>
    </>
  )
}

export default ShoppingCart
