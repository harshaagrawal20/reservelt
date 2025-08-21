import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getBookingById, updateBookingPaymentStatus } from '../app/features/bookingSlice'

const PaymentPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const bookingId = searchParams.get('bookingId')
  const { selectedBooking, isLoading } = useSelector(state => state.bookings)
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: ''
  })
  
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (bookingId) {
      dispatch(getBookingById(bookingId))
    }
  }, [bookingId, dispatch])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    // Add a space every 4 digits
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setPaymentData(prev => ({
      ...prev,
      cardNumber: formatted
    }))
  }

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value)
    setPaymentData(prev => ({
      ...prev,
      expiryDate: formatted
    }))
  }

  const validatePaymentForm = () => {
    if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length < 16) {
      alert('Please enter a valid card number')
      return false
    }
    if (!paymentData.expiryDate || paymentData.expiryDate.length < 5) {
      alert('Please enter a valid expiry date')
      return false
    }
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      alert('Please enter a valid CVV')
      return false
    }
    if (!paymentData.cardholderName.trim()) {
      alert('Please enter cardholder name')
      return false
    }
    return true
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePaymentForm()) return
    
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update booking payment status
      const result = await dispatch(updateBookingPaymentStatus({
        bookingId,
        paymentStatus: 'paid',
        paymentMethod: 'card',
        paymentData: {
          last4: paymentData.cardNumber.slice(-4),
          cardType: 'visa', // Could be determined from card number
          transactionId: `TXN_${Date.now()}`
        }
      })).unwrap()
      
      if (result.success) {
        alert('Payment completed successfully!')
        
        // Navigate to success page with invoice download option
        navigate(`/payment-success?bookingId=${bookingId}&invoiceId=${result.invoiceId}`)
      }
    } catch (error) {
      console.error('Payment failed:', error)
      alert(error.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!selectedBooking) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Booking Not Found</h2>
        <p className="text-red-600">The booking you're trying to pay for could not be found.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="text-blue-100 mt-1">Secure payment for your rental booking</p>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Payment Form */}
          <div className="lg:w-2/3 p-6">
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="19"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength="5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength="4"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={paymentData.cardholderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Address
                </label>
                <textarea
                  name="billingAddress"
                  value={paymentData.billingAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your billing address"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                  isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay ₹${selectedBooking.totalPrice?.toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{selectedBooking.productId?.title || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {new Date(selectedBooking.startDate).toLocaleDateString()} - {new Date(selectedBooking.endDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Days:</span>
                <span className="font-medium">
                  {Math.ceil((new Date(selectedBooking.endDate) - new Date(selectedBooking.startDate)) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              
              <hr className="my-3" />
              
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{((selectedBooking.totalPrice || 0) / 1.18).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">GST (18%):</span>
                <span className="font-medium">₹{((selectedBooking.totalPrice || 0) - (selectedBooking.totalPrice || 0) / 1.18).toFixed(2)}</span>
              </div>
              
              <hr className="my-3" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>₹{selectedBooking.totalPrice?.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-blue-800 text-sm font-medium">Secure Payment</span>
              </div>
              <p className="text-blue-600 text-xs mt-1">Your payment information is encrypted and secure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
