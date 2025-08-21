import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import AvailabilityCalendar from './AvailabilityCalendar'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const RentalForm = ({ product, onClose }) => {
  const { user } = useUser()
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: product.pickupLocation || '',
    dropLocation: product.dropLocation || '',
    totalPrice: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availability, setAvailability] = useState(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [canProceed, setCanProceed] = useState(false)

  const calculatePrice = (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return days * (product.pricePerDay || product.pricePerHour * 24 || 0)
  }

  const checkAvailability = async (startDate, endDate) => {
    if (!startDate || !endDate || !product._id) return
    
    setCheckingAvailability(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/availability/check?productId=${product._id}&startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()
      setAvailability(data)
      setCanProceed(data.success && data.available)
      return data
    } catch (error) {
      console.error('Error checking availability:', error)
      const errorData = { success: false, available: false, message: 'Failed to check availability' }
      setAvailability(errorData)
      setCanProceed(false)
      return errorData
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleDateRangeSelect = (startDate, endDate) => {
    setFormData(prev => ({
      ...prev,
      startDate: startDate || '',
      endDate: endDate || ''
    }))
    
    if (startDate && endDate) {
      const price = calculatePrice(startDate, endDate)
      setFormData(prev => ({ ...prev, totalPrice: price }))
      checkAvailability(startDate, endDate)
    } else {
      setCanProceed(false)
      setAvailability(null)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!canProceed) {
      alert('Please select available dates before proceeding.')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/rental-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          renterId: user.id,
          renterClerkId: user.id,
          ownerId: product.ownerId._id,
          ownerClerkId: product.ownerClerkId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalPrice: formData.totalPrice,
          pickupLocation: formData.pickupLocation,
          dropLocation: formData.dropLocation
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create rental request')
      }

      const data = await response.json()
      alert('Rental request sent successfully! The owner will review and respond.')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create rental request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Rent {product.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Info & Form */}
            <div className="space-y-6">
              {/* Product Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.brand} • {product.category}</p>
                <p className="text-sm text-gray-600">₹{product.pricePerDay || product.pricePerHour || 0} per day</p>
              </div>

              {/* Selected Dates Display */}
              {formData.startDate && formData.endDate && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Selected Dates</h4>
                  <p className="text-sm text-purple-700">
                    From: {new Date(formData.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-purple-700">
                    To: {new Date(formData.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-purple-700 font-medium mt-2">
                    Duration: {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              )}

              {/* Availability Status */}
              {checkingAvailability && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-3"></div>
                    <span className="text-blue-800">Checking availability...</span>
                  </div>
                </div>
              )}

              {availability && !checkingAvailability && (
                <div className={`border rounded-lg p-4 ${
                  availability.available 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center">
                    <svg 
                      className={`w-5 h-5 mr-3 ${
                        availability.available ? 'text-green-600' : 'text-red-600'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      {availability.available ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      )}
                    </svg>
                    <span className={`font-medium ${
                      availability.available ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {availability.message}
                    </span>
                  </div>
                </div>
              )}

              {/* Rental Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Manual Date Inputs (Read-only, populated from calendar) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                      placeholder="Select from calendar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                      placeholder="Select from calendar"
                    />
                  </div>
                </div>

                {/* Location Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter pickup location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drop Location
                  </label>
                  <input
                    type="text"
                    name="dropLocation"
                    value={formData.dropLocation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter drop location"
                  />
                </div>

                {/* Total Price */}
                {formData.totalPrice > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium">Total Price:</span>
                      <span className="text-xl font-bold text-purple-900">₹{formData.totalPrice}</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !canProceed || !formData.startDate || !formData.endDate}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    loading || !canProceed || !formData.startDate || !formData.endDate
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {loading ? 'Sending Request...' : 'Send Rental Request'}
                </button>

                {!canProceed && formData.startDate && formData.endDate && (
                  <p className="text-sm text-red-600 text-center">
                    Please select available dates to proceed with your rental request.
                  </p>
                )}
              </form>
            </div>

            {/* Right Column - Calendar */}
            <div className="space-y-4">
              <AvailabilityCalendar
                productId={product._id}
                selectedStartDate={formData.startDate}
                selectedEndDate={formData.endDate}
                onDateRangeSelect={handleDateRangeSelect}
                onAvailabilityCheck={checkAvailability}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RentalForm
