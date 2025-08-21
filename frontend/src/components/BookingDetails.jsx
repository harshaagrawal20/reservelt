import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Navbar from './Navbar'
import OTPVerification from './OTPVerification'
import OrderTimeline from './OrderTimeline'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const BookingDetails = () => {
  const { orderId } = useParams()
  const { user } = useUser()
  const navigate = useNavigate()
  
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otpType, setOtpType] = useState(null) // 'pickup' or 'return'
  const [userRole, setUserRole] = useState(null) // 'owner' or 'renter'
  const [invoice, setInvoice] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    fetchBookingDetails()
    fetchInvoiceDetails()
  }, [orderId])

  const fetchInvoiceDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/booking/${orderId}`)
      const data = await response.json()
      
      if (data.success) {
        setInvoice(data.invoice)
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error)
    }
  }

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/bookings/${orderId}`)
      const data = await response.json()
      
      if (data.success) {
        setBooking(data.booking)
        
        // Determine user role
        if (data.booking.renterClerkId === user?.id) {
          setUserRole('renter')
        } else if (data.booking.ownerClerkId === user?.id) {
          setUserRole('owner')
        }
      } else {
        setError(data.message || 'Failed to fetch booking details')
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerification = (type) => {
    setOtpType(type)
    setShowOTPModal(true)
  }

  const testOTPGeneration = async (type) => {
    try {
      console.log('Testing OTP generation for:', { type, bookingId: orderId, userRole })
      
      const endpoint = type === 'pickup' 
        ? `/bookings/${orderId}/delivery/generate-otp`
        : `/bookings/${orderId}/return/generate-otp`
      
      console.log('Calling endpoint:', `${API_BASE_URL}${endpoint}`)
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType: userRole })
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      setDebugInfo({
        endpoint,
        status: response.status,
        data,
        userRole,
        bookingStatus: booking?.status,
        paymentStatus: booking?.paymentStatus
      })
      
      if (data.success) {
        alert('OTP generated successfully! Check your email.')
      } else {
        alert(`Failed to generate OTP: ${data.message}`)
      }
    } catch (error) {
      console.error('Error testing OTP generation:', error)
      setDebugInfo({
        error: error.message,
        userRole,
        bookingStatus: booking?.status,
        paymentStatus: booking?.paymentStatus
      })
      alert(`Error: ${error.message}`)
    }
  }

  const handleOTPSuccess = (result) => {
    setShowOTPModal(false)
    setOtpType(null)
    
    // Refresh booking details to get updated status
    fetchBookingDetails()
    
    // Show success message
    alert(`${otpType === 'pickup' ? 'Pickup' : 'Return'} completed successfully!`)
  }

  const handleOTPCancel = () => {
    setShowOTPModal(false)
    setOtpType(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_rental': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const canDoPickup = () => {
    return booking?.status === 'confirmed' && 
           booking?.paymentStatus === 'paid' && 
           booking?.deliveryStatus !== 'delivered'
  }

  const canDoReturn = () => {
    return booking?.status === 'in_rental' && 
           booking?.deliveryStatus === 'delivered' && 
           booking?.returnStatus !== 'completed'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-medium">Error</h2>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={() => navigate('/orders')}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-800 font-medium">Booking not found</h2>
            <button
              onClick={() => navigate('/orders')}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li>
              <button 
                onClick={() => navigate('/orders')}
                className="text-gray-700 hover:text-purple-600"
              >
                Orders
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2">Booking Details</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-purple-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Booking #{booking._id.slice(-8)}</h1>
                <p className="opacity-90 mt-1">{booking.productId?.title}</p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status.replace('_', ' ').toUpperCase()}
                </div>
                <p className="mt-1 opacity-90">You are the: <strong>{userRole}</strong></p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Price:</span>
                    <span className="font-medium">₹{booking.totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      booking.pickupStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.pickupStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      booking.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.deliveryStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      booking.returnStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.returnStatus === 'late' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.returnStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  {booking.lateFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Late Fee:</span>
                      <span className="font-medium text-red-600">₹{booking.lateFee}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="flex flex-wrap gap-4">
                
                {/* Pickup Verification */}
                {canDoPickup() && (
                  <button
                    onClick={() => handleOTPVerification('pickup')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Verify Pickup</span>
                  </button>
                )}

                {/* Return Verification */}
                {canDoReturn() && (
                  <button
                    onClick={() => handleOTPVerification('return')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Verify Return</span>
                  </button>
                )}

                {/* Download Invoice */}
                {booking.paymentStatus === 'paid' && (
                  <button
                    onClick={() => window.open(`${API_BASE_URL}/invoices/download/${booking._id}`, '_blank')}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download Invoice</span>
                  </button>
                )}

                {/* Debug OTP Generation */}
                {import.meta.env.DEV && (
                  <>
                    <button
                      onClick={() => testOTPGeneration('pickup')}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                    >
                      <span>🔧 Test Pickup OTP</span>
                    </button>
                    <button
                      onClick={() => testOTPGeneration('return')}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                    >
                      <span>🔧 Test Return OTP</span>
                    </button>
                  </>
                )}
              </div>

              {/* Status Messages */}
              <div className="mt-4 text-sm text-gray-600">
                {!canDoPickup() && !canDoReturn() && booking.status !== 'completed' && (
                  <p>No actions available at this time. Please wait for status updates.</p>
                )}
                {booking.status === 'completed' && (
                  <p className="text-green-600 font-medium">✅ This rental has been completed successfully!</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <OrderTimeline booking={booking} />

            {/* Debug Information (only in development) */}
            {debugInfo && import.meta.env.DEV && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}

            {/* Invoice Details */}
            {invoice && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Invoice Number:</span>
                      <span className="font-medium ml-2">{invoice.invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Issue Date:</span>
                      <span className="font-medium ml-2">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium ml-2">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-sm ml-2 ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <OTPVerification
          booking={booking}
          type={otpType}
          userType={userRole}
          onSuccess={handleOTPSuccess}
          onCancel={handleOTPCancel}
        />
      )}
    </div>
  )
}

export default BookingDetails
