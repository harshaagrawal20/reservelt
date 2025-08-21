import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'

const RentalModal = ({ product, isOpen, onClose, onSubmit }) => {
  const { user } = useUser()
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  })
  const [pricing, setPricing] = useState({
    basePrice: 0,
    totalDays: 0,
    subtotal: 0,
    tax: 0,
    total: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Calculate pricing when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate && product) {
      calculatePricing()
    }
  }, [formData.startDate, formData.endDate, product])

  const calculatePricing = () => {
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    
    if (start >= end) {
      setPricing({ basePrice: 0, totalDays: 0, subtotal: 0, tax: 0, total: 0 })
      return
    }

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    const basePrice = product.pricePerDay || product.pricePerHour * 24 || product.pricePerWeek / 7 || 0
    const subtotal = basePrice * totalDays
    const tax = subtotal * 0.18 // 18% GST
    const total = subtotal + tax

    setPricing({
      basePrice,
      totalDays,
      subtotal,
      tax,
      total
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past'
      }
      
      if (start >= end) {
        newErrors.endDate = 'End date must be after start date'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const rentalData = {
        productId: product._id,
        productTitle: product.title,
        ownerClerkId: product.ownerClerkId,
        renterClerkId: user.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes,
        pricing: pricing,
        status: 'pending_approval'
      }
      
      await onSubmit(rentalData)
      onClose()
      
      // Reset form
      setFormData({
        startDate: '',
        endDate: '',
        notes: ''
      })
      setPricing({
        basePrice: 0,
        totalDays: 0,
        subtotal: 0,
        tax: 0,
        total: 0
      })
    } catch (error) {
      console.error('Failed to submit rental request:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Rent Product</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{product.title}</h3>
              <p className="text-gray-600">{product.category}</p>
              <p className="text-sm text-gray-500">{product.brand}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">₹{product.pricePerDay || product.pricePerHour * 24 || product.pricePerWeek / 7 || 0}/day</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={getTomorrowDate()}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || getTomorrowDate()}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special requirements or notes for the owner..."
            />
          </div>

          {/* Pricing Summary */}
          {pricing.totalDays > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Pricing Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Price (₹{pricing.basePrice}/day)</span>
                  <span>₹{pricing.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>{pricing.totalDays} day{pricing.totalDays > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18% GST)</span>
                  <span>₹{pricing.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || pricing.totalDays === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Send Rental Request'
              )}
            </button>
          </div>

          {/* Info Message */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your rental request will be sent to the product owner for approval. 
              You'll receive a notification once the owner responds. An invoice will be generated automatically upon approval.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RentalModal
