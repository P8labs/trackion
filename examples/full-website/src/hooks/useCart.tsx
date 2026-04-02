import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useTrackion } from '@trackion/web/react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalAmount: number
  totalItems: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const trackion = useTrackion()

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        trackion.track('cart_item_updated', {
          product_id: product.id,
          product_name: product.name,
          old_quantity: existingItem.quantity,
          new_quantity: newQuantity,
          price: product.price
        })
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      } else {
        trackion.track('cart_item_added', {
          product_id: product.id,
          product_name: product.name,
          quantity,
          price: product.price,
          total_value: product.price * quantity
        })
        return [...prev, { ...product, quantity }]
      }
    })
  }, [trackion])

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === productId)
      if (item) {
        trackion.track('cart_item_removed', {
          product_id: productId,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          total_value: item.price * item.quantity
        })
      }
      return prev.filter(item => item.id !== productId)
    })
  }, [trackion])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems(prev => prev.map(item => {
      if (item.id === productId) {
        trackion.track('cart_quantity_changed', {
          product_id: productId,
          product_name: item.name,
          old_quantity: item.quantity,
          new_quantity: quantity,
          price: item.price
        })
        return { ...item, quantity }
      }
      return item
    }))
  }, [trackion, removeFromCart])

  const clearCart = useCallback(() => {
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    trackion.track('cart_cleared', {
      items_count: items.length,
      total_value: totalValue
    })
    setItems([])
  }, [items, trackion])

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}