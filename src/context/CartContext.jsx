import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'ek_cart'

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setItems(parsed)
      }
    } catch (e) {
      console.error('Failed to load cart:', e)
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error('Failed to save cart:', e)
    }
  }, [items])

  // Add item to cart
  const addItem = useCallback((product, quantity = 1) => {
    const itemId = product.id || product.productId
    setItems(prev => {
      const existingIndex = prev.findIndex(item =>
        item.productId === itemId || item.id === itemId
      )
      
      if (existingIndex > -1) {
        // Update quantity if item exists
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        }
        return updated
      }
      
      // Add new item - use product.id or product.productId as fallback
      const itemId = product.id || product.productId
      if (!itemId) {
        console.error('Cannot add item without id:', product)
        return prev
      }
      return [...prev, {
        productId: itemId,
        id: itemId, // Also store as 'id' for backwards compatibility
        name: product.name,
        nameEn: product.nameEn,
        price: product.price,
        imageUrl: product.imageUrl || product.images?.[0],
        quantity,
        stock: product.stock,
        saleId: product.saleId || null // Track which private sale this item belongs to
      }]
    })
    
    // Open cart drawer when adding
    setIsOpen(true)
  }, [])

  // Remove item from cart
  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(item => item.productId !== productId))
  }, [])

  // Update item quantity
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      removeItem(productId)
      return
    }
    
    setItems(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, quantity }
        : item
    ))
  }, [removeItem])

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  // Calculate totals
  const { itemCount, subtotal } = useMemo(() => {
    return items.reduce((acc, item) => ({
      itemCount: acc.itemCount + item.quantity,
      subtotal: acc.subtotal + (item.price * item.quantity)
    }), { itemCount: 0, subtotal: 0 })
  }, [items])

  // Open/close cart drawer
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), [])

  const value = useMemo(() => ({
    items,
    itemCount,
    subtotal,
    isOpen,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    setIsLoading
  }), [items, itemCount, subtotal, isOpen, isLoading, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart, toggleCart])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext

