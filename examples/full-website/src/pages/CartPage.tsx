import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useTrackion } from '@trackion/web/react'
import { useCart } from '../hooks/useCart'

export default function CartPage() {
  const trackion = useTrackion()
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount, totalItems } = useCart()

  useEffect(() => {
    trackion.track('cart_page_viewed', {
      items_count: items.length,
      total_amount: totalAmount,
      total_items: totalItems
    })
  }, [trackion, items.length, totalAmount, totalItems])

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    trackion.track('cart_quantity_updated', {
      product_id: productId,
      new_quantity: newQuantity
    })
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string, productName: string) => {
    trackion.track('cart_item_removed_by_user', {
      product_id: productId,
      product_name: productName,
      source: 'cart_page'
    })
    removeFromCart(productId)
  }

  const handleClearCart = () => {
    trackion.track('cart_cleared_by_user', {
      items_count: items.length,
      total_value: totalAmount,
      source: 'cart_page'
    })
    clearCart()
  }

  const handleCheckoutClick = () => {
    trackion.track('checkout_initiated', {
      items_count: items.length,
      total_amount: totalAmount,
      cart_items: items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    })
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Shopping Cart</h1>
        
        <div className="card text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            <ShoppingBag size={64} style={{ color: '#d1d5db', margin: '0 auto' }} />
          </div>
          <h2>Your cart is empty</h2>
          <p style={{ color: '#64748b', margin: '1rem 0 2rem' }}>
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Shopping Cart</h1>
        <button 
          onClick={handleClearCart}
          className="btn btn-secondary btn-small flex items-center gap-2"
        >
          <Trash2 size={16} />
          Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Cart Items */}
        <div>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '1rem', alignItems: 'center' }}>
                {/* Product Image */}
                <div style={{ 
                  fontSize: '2rem', 
                  width: '60px', 
                  height: '60px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f1f5f9',
                  borderRadius: '0.5rem'
                }}>
                  {item.image}
                </div>

                {/* Product Details */}
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{item.name}</h3>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    ${item.price} each
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="btn btn-secondary"
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  
                  <span style={{ 
                    minWidth: '40px', 
                    textAlign: 'center', 
                    fontWeight: 'bold',
                    padding: '0.5rem'
                  }}>
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="btn btn-secondary"
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Item Total & Remove */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id, item.name)}
                    className="btn btn-danger btn-small"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Items ({totalItems}):</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Shipping:</span>
              <span style={{ color: '#10b981' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Tax:</span>
              <span>${(totalAmount * 0.1).toFixed(2)}</span>
            </div>
            <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '1.25rem', 
              fontWeight: 'bold' 
            }}>
              <span>Total:</span>
              <span>${(totalAmount + totalAmount * 0.1).toFixed(2)}</span>
            </div>
          </div>

          <Link 
            to="/checkout" 
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '1.125rem', padding: '1rem' }}
            onClick={handleCheckoutClick}
          >
            Proceed to Checkout
          </Link>

          <Link 
            to="/products" 
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}