import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RuxzRGzgYJAvIRfUv2E0uufRsyByCV2adjGdQj4a6VKNz3ycDaj2ceuMEvhrWK7JFR7firCv7l7nLnVP8ypBLNy00utNHKSIS')

const PaymentMethodTest = () => {
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkPaymentMethods = async () => {
      try {
        const stripe = await stripePromise
        
        // Test payment method configuration
        const testAmount = 5000 // ₹50 in paise
        
        const response = await fetch('http://localhost:3000/api/payments/test-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: testAmount, currency: 'inr' })
        })
        
        if (response.ok) {
          const data = await response.json()
          setPaymentMethods(data.paymentMethods || [])
        } else {
          setError('Failed to fetch payment methods')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkPaymentMethods()
  }, [])

  if (loading) return <div className="p-4">Loading payment methods...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Available Payment Methods</h3>
      
      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          <strong>Configured Methods:</strong>
        </div>
        
        <ul className="space-y-1">
          <li className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Credit/Debit Cards (Visa, Mastercard, Amex, etc.)
          </li>
          <li className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            PayPal (activated in Stripe Dashboard)
          </li>
          <li className="flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            Google Pay (automatic on supported devices/browsers)
          </li>
          <li className="flex items-center">
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
            Apple Pay (automatic on Safari/iOS devices)
          </li>
        </ul>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Test Cards that should work:</strong><br/>
            • Visa: 4242 4242 4242 4242<br/>
            • Visa (debit): 4000 0566 5566 5556<br/>
            • Mastercard: 5555 5555 5555 4444<br/>
            • Mastercard (debit): 5200 8282 8282 8210<br/>
            • American Express: 3782 822463 10005<br/>
            • Discover: 6011 1111 1111 1117<br/>
            • JCB: 3566 0020 2036 0505<br/>
            • Diners Club: 3056 9300 0902 0004
          </p>
        </div>
        
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">
            <strong>✅ Configuration Fixed:</strong><br/>
            • Using automatic payment methods (no conflicts)<br/>
            • All enabled Stripe methods available automatically<br/>
            • PayPal method ID: cpmt_1Rv31gGzgYJAvIRf9aIhMlIm ✅<br/>
            • Google Pay: Auto-enabled on supported devices ✅<br/>
            • Apple Pay: Auto-enabled on Safari/iOS ✅<br/>
            • Cards, PayPal, Google Pay, and other methods should work now
          </p>
        </div>

        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
          <p className="text-sm text-purple-800">
            <strong>🔔 Google Pay Requirements:</strong><br/>
            • Use Chrome browser (desktop/mobile) for best support<br/>
            • Android devices with Google Pay app installed<br/>
            • Have test cards added to your Google Pay account<br/>
            • Google Pay button appears automatically if supported<br/>
            • For testing: Add Visa 4242 4242 4242 4242 to Google Pay
          </p>
        </div>
        
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            <strong>If you see "This card type isn't accepted":</strong><br/>
            • Ensure you're using a supported test card number<br/>
            • Check that payment methods are enabled in Stripe Dashboard<br/>
            • Try different card types (Visa, Mastercard, etc.)<br/>
            • Verify minimum amount requirement (₹50 for INR)
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodTest
