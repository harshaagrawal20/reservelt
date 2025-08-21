import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Navbar from '../components/Navbar'

const PaymentStatus = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useUser()
  
  const [paymentData, setPaymentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const paymentIntentId = searchParams.get('payment_intent')
  const bookingId = searchParams.get('bookingId')
  const status = searchParams.get('status')

  useEffect(() => {
    if (paymentIntentId || bookingId) {
      fetchPaymentDetails()
    } else {
      setError('Missing payment information')
      setLoading(false)
    }
  }, [paymentIntentId, bookingId])

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
      
      let data = null
      
      // Try to get booking details if bookingId is available
      if (bookingId) {
        try {
          const bookingResponse = await fetch(`${API_BASE_URL}/bookings/${bookingId}`)
          if (bookingResponse.ok) {
            const bookingData = await bookingResponse.json()
            if (bookingData.success) {
              data = { booking: bookingData.booking }
            }
          }
        } catch (err) {
          console.log('Failed to fetch booking details:', err)
        }
      }
      
      // Try to get payment details if paymentIntentId is available
      if (paymentIntentId) {
        try {
          const paymentResponse = await fetch(`${API_BASE_URL}/payments`)
          if (paymentResponse.ok) {
            const paymentsData = await paymentResponse.json()
            if (paymentsData.success && paymentsData.payments) {
              const payment = paymentsData.payments.find(p => p.gatewayPaymentId === paymentIntentId)
              if (payment) {
                // Merge payment data with booking data
                data = { 
                  ...data, 
                  payment,
                  booking: payment.bookingId || data?.booking
                }
              }
            }
          }
        } catch (err) {
          console.log('Failed to fetch payment details:', err)
        }
      }
      
      // If we still don't have data, set default values
      if (!data) {
        data = {
          booking: {
            totalPrice: 50, // default minimum amount
            platformFee: 5,
            ownerAmount: 45,
            status: 'confirmed',
            paymentStatus: 'paid'
          },
          payment: {
            amount: 50,
            currency: 'inr',
            status: 'completed'
          }
        }
      }
      
      setPaymentData(data)
    } catch (err) {
      console.error('Error fetching payment details:', err)
      setError(err.message || 'Failed to fetch payment details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'succeeded':
        return '✅'
      case 'processing':
        return '⏳'
      case 'failed':
        return '❌'
      default:
        return '❓'
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'succeeded':
        return 'Payment Successful!'
      case 'processing':
        return 'Payment Processing...'
      case 'failed':
        return 'Payment Failed'
      default:
        return 'Payment Status Unknown'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'processing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`p-6 border-b ${getStatusColor()}`}>
            <div className="text-center">
              <div className="text-6xl mb-4">{getStatusIcon()}</div>
              <h1 className="text-2xl font-bold">{getStatusMessage()}</h1>
              {paymentIntentId && (
                <p className="text-sm opacity-75 mt-2">
                  Payment ID: {paymentIntentId.slice(-12).toUpperCase()}
                </p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6">
            {status === 'succeeded' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">🎉 Congratulations!</h3>
                  <p className="text-green-700 text-sm">
                    Your rental payment has been processed successfully. You will receive a confirmation email shortly.
                  </p>
                </div>

                {paymentData && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-medium">₹{
                          paymentData.payment?.amount || 
                          paymentData.booking?.totalPrice || 
                          paymentData.booking?.totalAmount || 
                          '50'
                        }</span>
                      </div>
                      {paymentData.booking?.platformFee && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Platform Fee:</span>
                          <span className="font-medium">₹{paymentData.booking.platformFee}</span>
                        </div>
                      )}
                      {paymentData.booking?.ownerAmount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Owner Receives:</span>
                          <span className="font-medium">₹{paymentData.booking.ownerAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">
                          {paymentData.payment?.paymentGateway === 'stripe' ? 'Card/Digital Wallet' : 'Card'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction Date:</span>
                        <span className="font-medium">
                          {paymentData.payment?.paymentDate ? 
                            new Date(paymentData.payment.paymentDate).toLocaleDateString() : 
                            new Date().toLocaleDateString()
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-green-600">
                          {paymentData.booking?.paymentStatus === 'paid' ? 'Paid' : 'Completed'}
                        </span>
                      </div>
                      {paymentIntentId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-medium text-xs">
                            {paymentIntentId.slice(-12).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Booking Details */}
                {paymentData?.booking && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Booking Details</h3>
                    <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                      {paymentData.booking.productId?.name && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Product:</span>
                          <span className="font-medium">{paymentData.booking.productId.name}</span>
                        </div>
                      )}
                      {paymentData.booking.startDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-medium">{new Date(paymentData.booking.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {paymentData.booking.endDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Date:</span>
                          <span className="font-medium">{new Date(paymentData.booking.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking Status:</span>
                        <span className="font-medium text-green-600 capitalize">
                          {paymentData.booking.status || 'Confirmed'}
                        </span>
                      </div>
                      {paymentData.booking._id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking ID:</span>
                          <span className="font-medium text-xs">
                            {paymentData.booking._id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">📧</span>
                      <span>Check your email for the payment receipt and booking confirmation</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">📋</span>
                      <span>View your booking details in the Orders section</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">📞</span>
                      <span>The owner will contact you for pickup arrangements</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Payment Failed</h3>
                  <p className="text-red-700 text-sm">
                    Unfortunately, your payment could not be processed. Please try again or contact support.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Common reasons for payment failure:</h3>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Insufficient funds in your account</li>
                    <li>• Incorrect card details</li>
                    <li>• Card expired or blocked</li>
                    <li>• Bank security restrictions</li>
                  </ul>
                </div>
              </div>
            )}

            {status === 'processing' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Payment Processing</h3>
                  <p className="text-yellow-700 text-sm">
                    Your payment is being processed. This usually takes a few minutes. Please do not refresh this page.
                  </p>
                </div>

                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Waiting for payment confirmation...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex justify-center space-x-4">
              {status === 'succeeded' && (
                <>
                  <button
                    onClick={() => {
                      const bookingId = paymentData?.booking?._id || searchParams.get('bookingId');
                      if (bookingId) {
                        window.open(`http://localhost:3000/api/invoices/booking/${bookingId}/pdf`, '_blank');
                      } else {
                        alert('Booking ID not found for invoice download');
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download Invoice</span>
                  </button>
                  <button
                    onClick={() => navigate('/orders')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View My Orders
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </>
              )}
              
              {status === 'failed' && (
                <>
                  <button
                    onClick={() => navigate(`/payment?bookingId=${bookingId}`)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </>
              )}
              
              {status === 'processing' && (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                >
                  Refresh Status
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Test Mode Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800 text-sm">
            🧪 <strong>Test Mode:</strong> This is a test transaction. No real money was charged.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentStatus
