import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useDispatch, useSelector } from 'react-redux'
import { getBookingById } from '../app/features/bookingSlice'
import PaymentForm from '../components/PaymentForm'
import Navbar from '../components/Navbar'

const Payment = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const dispatch = useDispatch()
  
  const bookingId = searchParams.get('bookingId')
  const booking = useSelector(state => state.bookings.selectedBooking)
  const isLoading = useSelector(state => state.bookings.isLoading)
  const error = useSelector(state => state.bookings.error)
  
  const [paymentError, setPaymentError] = useState('')
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    if (bookingId) {
      dispatch(getBookingById(bookingId))
    } else {
      navigate('/dashboard')
    }
  }, [bookingId, dispatch, navigate])

  const handlePaymentSuccess = (data) => {
    // Navigate to payment status page with success status
    navigate(`/payment-status?status=succeeded&bookingId=${booking._id}&payment_intent=${data.payment?.gatewayPaymentId || 'completed'}`)
  }

  const handleClose = () => {
    navigate('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || 'The booking you are trying to pay for could not be found.'}
            </p>
            <button
              onClick={handleClose}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">Complete Your Payment</h1>
            <p className="text-blue-100 mt-2">
              Booking ID: {booking._id?.slice(-8)?.toUpperCase()}
            </p>
          </div>

          {/* Booking Summary */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Product Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Product:</span> {booking.productId?.name || 'N/A'}</p>
                  <p><span className="font-medium">Category:</span> {booking.productId?.category || 'N/A'}</p>
                  <p><span className="font-medium">Quantity:</span> {booking.quantity || 1}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Rental Period</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Start Date:</span> {new Date(booking.startDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">End Date:</span> {new Date(booking.endDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Duration:</span> {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} days</p>
                </div>
              </div>
            </div>
            
            {/* Total Amount */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{(booking.totalPrice || booking.totalAmount || booking.amount || 0).toLocaleString()}
                </span>
              </div>
              {booking.totalPrice < 50 && (
                <div className="mt-2 text-sm text-yellow-600">
                  *Minimum amount ₹50 will be charged for payment processing
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
            {paymentError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{paymentError}</p>
              </div>
            )}
            <PaymentForm
              booking={booking}
              onSuccess={handlePaymentSuccess}
              onClose={handleClose}
              onError={setPaymentError}
            />
          </div>

          {/* Debug Section */}
          <div className="p-6 border-t bg-gray-50">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showDebug ? 'Hide' : 'Show'} Payment Debug Info
            </button>
            
            {showDebug && (
              <div className="mt-4 p-4 bg-white border rounded-md">
                <h4 className="font-medium mb-2">Booking Debug Info</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Booking ID:</strong> {booking._id}</p>
                  <p><strong>Total Price:</strong> ₹{booking.totalPrice || 'N/A'}</p>
                  <p><strong>Total Amount:</strong> ₹{booking.totalAmount || 'N/A'}</p>
                  <p><strong>Amount:</strong> ₹{booking.amount || 'N/A'}</p>
                  <p><strong>Status:</strong> {booking.status}</p>
                  <p><strong>Payment Status:</strong> {booking.paymentStatus || 'Not set'}</p>
                  <p><strong>Product:</strong> {booking.productId?.name || 'N/A'}</p>
                  <p><strong>Renter:</strong> {booking.renterClerkId}</p>
                  <p><strong>Owner:</strong> {booking.ownerClerkId}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex justify-between items-center">
              <button
                onClick={handleClose}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel Payment
              </button>
              <div className="text-sm text-gray-500">
                Secure payment powered by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
