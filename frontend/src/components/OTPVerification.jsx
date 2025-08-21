import React, { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const OTPVerification = ({ 
  booking, 
  type, // 'pickup' or 'return'
  userType, // 'owner' or 'renter'
  onSuccess, 
  onCancel 
}) => {
  const [otp, setOtp] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [otpGenerated, setOtpGenerated] = useState(false)

  const generateOTP = async () => {
    try {
      setIsGenerating(true)
      setError('')
      setMessage('')
      
      const endpoint = type === 'pickup' 
        ? `/bookings/${booking._id}/delivery/generate-otp`
        : `/bookings/${booking._id}/return/generate-otp`
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`OTP sent to ${userType}'s email address`)
        setOtpGenerated(true)
      } else {
        setError(data.message || 'Failed to generate OTP')
      }
    } catch (error) {
      console.error('Error generating OTP:', error)
      setError('Failed to generate OTP. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }
    
    try {
      setIsVerifying(true)
      setError('')
      setMessage('')
      
      const endpoint = type === 'pickup' 
        ? `/bookings/${booking._id}/delivery/verify-otp`
        : `/bookings/${booking._id}/return/verify-otp`
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          otp: otp.trim(), 
          userType,
          ...(type === 'return' && { dropLocation: booking.dropLocation })
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (data.ownerVerified && data.renterVerified) {
          // Both parties verified - process complete
          setMessage(`✅ ${type === 'pickup' ? 'Pickup' : 'Return'} completed successfully by both parties!`)
          setTimeout(() => {
            onSuccess && onSuccess(data)
          }, 2000)
        } else {
          // Only one party verified so far
          setMessage(`✅ OTP verified by ${userType}. Waiting for ${userType === 'owner' ? 'renter' : 'owner'} verification.`)
        }
      } else {
        setError(data.message || 'Invalid OTP')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setError('Failed to verify OTP. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      verifyOTP()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {type === 'pickup' ? 'Pickup' : 'Return'} Verification
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900">Product: {booking.productId?.title}</h4>
            <p className="text-sm text-blue-700 mt-1">
              Both owner and renter must verify with their OTPs to complete the {type}.
            </p>
            <p className="text-sm text-blue-700">
              You are verifying as: <strong>{userType}</strong>
            </p>
          </div>
        </div>

        {!otpGenerated ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Click the button below to receive an OTP via email for {type} verification.
            </p>
            <button
              onClick={generateOTP}
              disabled={isGenerating}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Sending OTP...' : `Send OTP to ${userType}`}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP (sent to {userType}'s email)
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={verifyOTP}
                disabled={isVerifying || !otp.trim()}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                onClick={generateOTP}
                disabled={isGenerating}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Resend
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>• OTP is valid for 10 minutes</p>
          <p>• Both owner and renter must verify before {type} is complete</p>
          {type === 'pickup' && <p>• Payment will be processed to owner after pickup completion</p>}
          {type === 'return' && <p>• Rental agreement will be completed after return verification</p>}
        </div>
      </div>
    </div>
  )
}

export default OTPVerification
