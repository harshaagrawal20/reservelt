import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RuxzRGzgYJAvIRfUv2E0uufRsyByCV2adjGdQj4a6VKNz3ycDaj2ceuMEvhrWK7JFR7firCv7l7nLnVP8ypBLNy00utNHKSIS'
const stripePromise = loadStripe(stripePublishableKey)

// CheckoutForm component for Stripe Elements
const CheckoutForm = ({ clientSecret, booking, onSuccess, onError, displayAmount }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.')
      return
    }

    setLoading(true)
    setError('')

    // Confirm payment with PaymentElement
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-status?bookingId=${booking._id}`,
      },
      redirect: 'if_required' // Only redirect if needed (like PayPal)
    })

    console.log('Payment confirmation result:', result)

    // Handle error case - check if payment was actually successful
    if (result.error) {
      console.error('Payment error:', result.error)
      
      // Special case: payment_intent_unexpected_state usually means payment already succeeded
      if (result.error.code === 'payment_intent_unexpected_state' && 
          result.error.payment_intent && 
          result.error.payment_intent.status === 'succeeded') {
        
        console.log('Payment already succeeded, proceeding with backend confirmation...')
        
        try {
          const response = await fetch(`${API_BASE_URL}/payments/confirm/${booking._id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: result.error.payment_intent.id
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Payment confirmation failed')
          }

          const data = await response.json()
          console.log('Payment confirmed:', data)
          onSuccess(data)
          setLoading(false)
          return
        } catch (err) {
          console.error('Backend confirmation error:', err)
          const errorMessage = err.message || 'Payment confirmation failed'
          setError(errorMessage)
          onError && onError(errorMessage)
          setLoading(false)
          return
        }
      }
      
      // For other errors, show the error message
      setError(result.error.message || 'Payment failed')
      onError && onError(result.error.message)
      setLoading(false)
      return
    }

    // If we reach here, payment was successful without redirect
    if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      try {
        const response = await fetch(`${API_BASE_URL}/payments/confirm/${booking._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Payment confirmation failed')
        }

        const data = await response.json()
        console.log('Payment confirmed:', data)
        onSuccess(data)
      } catch (err) {
        console.error('Confirmation error:', err)
        const errorMessage = err.message || 'Payment confirmation failed'
        setError(errorMessage)
        onError && onError(errorMessage)
      }
    } else {
      const errorMessage = `Payment status: ${result.paymentIntent?.status || 'unknown'}. Please try again.`
      setError(errorMessage)
      onError && onError(errorMessage)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-md bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['google_pay', 'card', 'paypal'],
            fields: {
              billingDetails: 'auto'
            },
            wallets: {
              googlePay: 'auto',
              applePay: 'auto'
            },
            terms: {
              googlePay: 'auto',
              card: 'auto',
              paypal: 'auto'
            },
            business: {
              name: 'Rental Management System'
            }
          }}
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800">
          <strong>Test Cards:</strong><br/>
          • Visa: 4242 4242 4242 4242<br/>
          • Mastercard: 5555 5555 5555 4444<br/>
          • Expiry: 12/28 | CVC: 123
        </p>
      </div>
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing Payment...' : `Pay ₹${displayAmount || booking.totalPrice || booking.totalAmount || booking.amount || 50}`}
      </button>
    </form>
  )
}

const PaymentForm = ({ booking, onSuccess, onClose, onError }) => {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [paymentData, setPaymentData] = useState(null)

  useEffect(() => {
    if (booking && booking._id) {
      initiatePayment()
    }
  }, [booking])

  const initiatePayment = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_BASE_URL}/payments/initiate/${booking._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to initiate payment')
      }

      const data = await response.json()
      if (data.success && data.paymentIntent) {
        setClientSecret(data.paymentIntent.client_secret)
        setPaymentData(data)
      } else {
        throw new Error('Invalid payment response')
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to initiate payment'
      setError(errorMessage)
      onError && onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!booking) return null

  const totalAmount = booking.totalPrice || booking.totalAmount || 0
  const displayAmount = paymentData?.adjustedAmount || totalAmount

  return (
    <div className="space-y-6">
      {/* Amount Adjustment Notice */}
      {paymentData?.isAmountAdjusted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                Amount Adjusted for Processing
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Minimum payment amount is ₹{paymentData.minimumRequired}. 
                Original amount ₹{paymentData.originalAmount} has been adjusted to ₹{paymentData.adjustedAmount}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm text-gray-600">
          {paymentData?.isAmountAdjusted && (
            <div className="flex justify-between">
              <span>Original Rental Amount:</span>
              <span className="font-medium">₹{paymentData.originalAmount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Amount to Pay:</span>
            <span className="font-medium">₹{displayAmount}</span>
          </div>
          {booking.platformFee && (
            <div className="flex justify-between">
              <span>Platform Fee (10%):</span>
              <span>₹{booking.platformFee}</span>
            </div>
          )}
          {booking.ownerAmount && (
            <div className="flex justify-between">
              <span>Owner Receives:</span>
              <span>₹{booking.ownerAmount}</span>
            </div>
          )}
          <hr className="my-2"/>
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total to Pay:</span>
            <span>₹{displayAmount}</span>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      {loading && !clientSecret && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing secure payment...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {clientSecret && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-800">
                Payment ready! Amount: ₹{displayAmount}
              </p>
            </div>
          </div>

          {/* Stripe Elements integration */}
          <Elements 
            stripe={stripePromise} 
            options={{ 
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#7c3aed',
                  colorBackground: '#ffffff',
                  colorText: '#1f2937',
                  colorDanger: '#ef4444',
                  fontFamily: 'system-ui, sans-serif',
                  borderRadius: '8px'
                }
              },
              locale: 'en'
            }}
          >
            <CheckoutForm 
              clientSecret={clientSecret} 
              booking={booking} 
              onSuccess={onSuccess} 
              onError={onError}
              displayAmount={displayAmount}
            />
          </Elements>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-500">
          🔒 Your payment is secure and encrypted. We use Stripe for payment processing.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Test mode: Use test card numbers above for testing
        </p>
      </div>
    </div>
  )
}

export default PaymentForm
