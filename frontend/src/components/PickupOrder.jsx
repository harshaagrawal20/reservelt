import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const PickupOrder = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [formData, setFormData] = useState({
    orderId: orderId || 'R0001',
    customer: '',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '',
    pickupLocation: '',
    contactPerson: '',
    contactPhone: '',
    specialInstructions: '',
    items: [
      {
        id: 1,
        product: 'Product 1',
        quantity: 5,
        serialNumber: '',
        condition: 'good',
        notes: ''
      }
    ],
    driverName: '',
    vehicleNumber: '',
    pickupStatus: 'pending'
  })

  const [activeTab, setActiveTab] = useState('pickup-details')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: prev.items.length + 1,
          product: '',
          quantity: 1,
          serialNumber: '',
          condition: 'good',
          notes: ''
        }
      ]
    }))
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSchedulePickup = () => {
    setFormData(prev => ({ ...prev, pickupStatus: 'scheduled' }))
    console.log('Pickup scheduled:', formData)
  }

  const handleCompletePickup = () => {
    setFormData(prev => ({ ...prev, pickupStatus: 'completed' }))
    console.log('Pickup completed:', formData)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'in-transit': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <button
                  onClick={() => navigate('/orders')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Pick-up Order {formData.orderId}</h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(formData.pickupStatus)}`}>
                  {formData.pickupStatus.charAt(0).toUpperCase() + formData.pickupStatus.slice(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSchedulePickup}
                disabled={formData.pickupStatus !== 'pending'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Schedule Pickup
              </button>
              <button
                onClick={handleCompletePickup}
                disabled={formData.pickupStatus !== 'scheduled'}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Complete Pickup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Print
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pickup-details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'pickup-details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pickup Details
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Items
              </button>
              <button
                onClick={() => setActiveTab('logistics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'logistics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Logistics
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'pickup-details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer
                      </label>
                      <input
                        type="text"
                        value={formData.customer}
                        onChange={(e) => handleInputChange('customer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Time
                      </label>
                      <input
                        type="time"
                        value={formData.pickupTime}
                        onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Location
                      </label>
                      <textarea
                        value={formData.pickupLocation}
                        onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Enter pickup address"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contact person name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions
                      </label>
                      <textarea
                        value={formData.specialInstructions}
                        onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Any special pickup instructions"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Items to Pickup</h3>
                  <button
                    onClick={addItem}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serial Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Condition
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={item.product}
                              onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Product name"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={item.serialNumber}
                              onChange={(e) => handleItemChange(index, 'serialNumber', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Serial number"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={item.condition}
                              onChange={(e) => handleItemChange(index, 'condition', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="excellent">Excellent</option>
                              <option value="good">Good</option>
                              <option value="fair">Fair</option>
                              <option value="poor">Poor</option>
                              <option value="damaged">Damaged</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Notes"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => removeItem(index)}
                              disabled={formData.items.length === 1}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'logistics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Logistics Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      value={formData.driverName}
                      onChange={(e) => handleInputChange('driverName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Driver name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Vehicle registration number"
                    />
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Pickup Status</h4>
                  <div className="flex items-center space-x-4">
                    {['pending', 'scheduled', 'in-transit', 'completed'].map((status, index) => (
                      <div key={status} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          formData.pickupStatus === status || 
                          ['pending', 'scheduled', 'in-transit', 'completed'].indexOf(formData.pickupStatus) > index
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="ml-2 text-sm text-gray-700 capitalize">{status.replace('-', ' ')}</span>
                        {index < 3 && (
                          <svg className="w-4 h-4 text-gray-400 mx-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PickupOrder
