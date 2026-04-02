import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Lock, ArrowLeft } from 'lucide-react'
import { useTrackion, useFeatureFlag, useCaptureError } from '@trackion/web/react'
import { useCart } from '../hooks/useCart'

interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  zipCode: string
  cardNumber: string
  expiryDate: string
  cvv: string
  saveInfo: boolean
}

export default function CheckoutPage() {
  const [step] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const trackion = useTrackion()
  const navigate = useNavigate()
  const { items, totalAmount, clearCart } = useCart()
  const expressCheckout = useFeatureFlag('express_checkout')
  const captureError = useCaptureError()
  
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>()

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
      return
    }

    trackion.track('checkout_page_viewed', {
      items_count: items.length,
      total_amount: totalAmount,
      step: step
    })
  }, [trackion, items.length, totalAmount, step, navigate])

  const handleFormSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true)
    
    trackion.track('checkout_form_submitted', {
      step: step,
      items_count: items.length,
      total_amount: totalAmount,
      express_checkout: expressCheckout
    })

    try {
      // Simulate payment processing
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional payment failures for testing
          if (Math.random() < 0.1) {
            reject(new Error('Payment processing failed'))
          } else {
            resolve(true)
          }
        }, 2000)
      })

      // Success
      trackion.track('checkout_completed', {
        items_count: items.length,
        total_amount: totalAmount,
        payment_method: 'credit_card',
        customer_email: data.email,
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      })

      clearCart()
      navigate('/profile?success=true')

    } catch (error) {
      captureError(error, {
        checkout_step: step,
        total_amount: totalAmount,
        items_count: items.length,
        form_data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName
        }
      })

      trackion.track('checkout_failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error',
        step: step,
        items_count: items.length,
        total_amount: totalAmount
      })

      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const totalWithTax = totalAmount + (totalAmount * 0.1)

  if (items.length === 0) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="checkout-page">
      <button 
        onClick={() => navigate('/cart')}
        className="btn btn-secondary mb-4 flex items-center gap-2"
        style={{ width: 'fit-content' }}
      >
        <ArrowLeft size={16} />
        Back to Cart
      </button>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Checkout</h1>

      {/* Express Checkout Feature Flag */}
      {expressCheckout && (
        <div className="card" style={{ 
          marginBottom: '2rem', 
          background: 'linear-gradient(90deg, #10b981, #059669)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>⚡</div>
            <div>
              <h3 style={{ margin: 0 }}>Express Checkout Available!</h3>
              <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>
                Complete your order in one click with saved payment info
              </p>
            </div>
            <button 
              className="btn"
              style={{ 
                marginLeft: 'auto',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
              onClick={() => {
                trackion.track('express_checkout_clicked', {
                  items_count: items.length,
                  total_amount: totalAmount
                })
                // This would integrate with a real payment processor
                alert('Express checkout would be implemented here!')
              }}
            >
              Express Checkout
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Step 1: Contact Information */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ 
                  background: step >= 1 ? '#3b82f6' : '#d1d5db',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem'
                }}>
                  1
                </span>
                Contact Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email"
                    className="form-input"
                    {...register('email', { required: 'Email is required' })}
                  />
                  {errors.email && <div className="form-error">{errors.email.message}</div>}
                </div>

                <div></div>

                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  {errors.firstName && <div className="form-error">{errors.firstName.message}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                  {errors.lastName && <div className="form-error">{errors.lastName.message}</div>}
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ 
                  background: step >= 2 ? '#3b82f6' : '#d1d5db',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem'
                }}>
                  2
                </span>
                Shipping Address
              </h3>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input 
                    type="text"
                    className="form-input"
                    {...register('address', { required: 'Address is required' })}
                  />
                  {errors.address && <div className="form-error">{errors.address.message}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input 
                      type="text"
                      className="form-input"
                      {...register('city', { required: 'City is required' })}
                    />
                    {errors.city && <div className="form-error">{errors.city.message}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">ZIP Code</label>
                    <input 
                      type="text"
                      className="form-input"
                      {...register('zipCode', { required: 'ZIP code is required' })}
                    />
                    {errors.zipCode && <div className="form-error">{errors.zipCode.message}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Information */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ 
                  background: step >= 3 ? '#3b82f6' : '#d1d5db',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem'
                }}>
                  3
                </span>
                Payment Information
                <Lock size={16} style={{ color: '#64748b' }} />
              </h3>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="1234 5678 9012 3456"
                    {...register('cardNumber', { required: 'Card number is required' })}
                  />
                  {errors.cardNumber && <div className="form-error">{errors.cardNumber.message}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="MM/YY"
                      {...register('expiryDate', { required: 'Expiry date is required' })}
                    />
                    {errors.expiryDate && <div className="form-error">{errors.expiryDate.message}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="123"
                      {...register('cvv', { required: 'CVV is required' })}
                    />
                    {errors.cvv && <div className="form-error">{errors.cvv.message}</div>}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox"
                      {...register('saveInfo')}
                    />
                    Save payment information for future purchases
                  </label>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                fontSize: '1.125rem', 
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Complete Order - ${totalWithTax.toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            {items.map(item => (
              <div key={item.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{item.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Qty: {item.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: '500' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
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
              <span>${totalWithTax.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}