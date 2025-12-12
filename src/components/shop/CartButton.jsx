import React from 'react'
import styled from 'styled-components'
import { useCart } from '../../context/CartContext'

const Button = styled.button`
  position: relative;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #101010;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.7;
  }
`

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #101010;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
)

const CartButton = () => {
  const { itemCount, toggleCart } = useCart()

  return (
    <Button onClick={toggleCart} aria-label="Ouvrir le panier">
      <CartIcon />
      {itemCount > 0 && <Badge>{itemCount > 99 ? '99+' : itemCount}</Badge>}
    </Button>
  )
}

export default CartButton

