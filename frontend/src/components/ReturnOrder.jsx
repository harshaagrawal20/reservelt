import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const ReturnOrder = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [formData, setFormData] = useState({
    orderId: orderId || 'R0001',
    customer: '',
    returnDate: new Date().toISOString().split('T')[0],
    returnTime: '',
    returnLocation: '',
    contactPerson: '',
    contactPhone: '',
    returnReason: '',
    items: [
      {
        id: 1,
        product: 'Product 1',
        quantityRented: 5,
        quantityReturned: 5,
        serialNumber: '',
        conditionAtReturn: 'good',
        damages: '',
        notes: '',
        charges: 0
      }
    ],
    inspectionNotes: '',
    additionalCharges: 0,
    returnStatus: 'pending'
  })

  const [activeTab, setActiveTab] = useState('return-details')

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
          quantityRented: 1,
          quantityReturned: 1,
          serialNumber: '',
          conditionAtReturn: 'good',
          damages: '',
          notes: '',
          charges: 0
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

  const handleProcessReturn = () => {
    setFormData(prev => ({ ...prev, returnStatus: 'processing' }))
    console.log('Return processing:', formData)
  }

  const handleCompleteReturn = () => {
    setFormData(prev => ({ ...prev, returnStatus: 'completed' }))
    console.log('Return completed:', formData)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'inspection': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'partial': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const calculateTotalCharges = () => {
    const itemCharges = formData.items.reduce((sum, item) => sum + (item.charges || 0), 0)
    return itemCharges + (formData.additionalCharges || 0)
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
                <h1 className="text-2xl font-bold text-gray-900">Return Order {formData.orderId}</h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(formData.returnStatus)}`}>
                  {formData.returnStatus.charAt(0).toUpperCase() + formData.returnStatus.slice(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleProcessReturn}
                disabled={formData.returnStatus !== 'pending'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Process Return
              </button>
              <button
                onClick={handleCompleteReturn}
                disabled={formData.returnStatus !== 'processing'}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Complete Return
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Print Receipt
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
                onClick={() => setActiveTab('return-details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'return-details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Return Details
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Items & Inspection
              </button>
              <button
                onClick={() => setActiveTab('charges')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'charges'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Charges & Damages
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'return-details' && (
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
                        Return Date
                      </label>
                      <input
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => handleInputChange('returnDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Return Time
                      </label>
                      <input
                        type="time"
                        value={formData.returnTime}
                        onChange={(e) => handleInputChange('returnTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Return Location
                      </label>
                      <textarea
                        value={formData.returnLocation}
                        onChange={(e) => handleInputChange('returnLocation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Enter return address"
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
                        Return Reason
                      </label>
                      <select
                        value={formData.returnReason}
                        onChange={(e) => handleInputChange('returnReason', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select reason</option>
                        <option value="rental-ended">Rental Period Ended</option>
                        <option value="early-return">Early Return</option>
                        <option value="damaged">Equipment Damaged</option>
                        <option value="replacement">Replacement Required</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Items Being Returned</h3>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rented
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Returned
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Serial No.
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Condition
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Damages
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={item.product}
                              onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Product name"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.quantityRented}
                              onChange={(e) => handleItemChange(index, 'quantityRented', parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.quantityReturned}
                              onChange={(e) => handleItemChange(index, 'quantityReturned', parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={item.serialNumber}
                              onChange={(e) => handleItemChange(index, 'serialNumber', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Serial"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <select
                              value={item.conditionAtReturn}
                              onChange={(e) => handleItemChange(index, 'conditionAtReturn', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="excellent">Excellent</option>
                              <option value="good">Good</option>
                              <option value="fair">Fair</option>
                              <option value="poor">Poor</option>
                              <option value="damaged">Damaged</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={item.damages}
                              onChange={(e) => handleItemChange(index, 'damages', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Damage details"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
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

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspection Notes
                  </label>
                  <textarea
                    value={formData.inspectionNotes}
                    onChange={(e) => handleInputChange('inspectionNotes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="General inspection notes and observations"
                  />
                </div>
              </div>
            )}

            {activeTab === 'charges' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Damage Charges & Additional Fees</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Damage Charge
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.product || `Product ${index + 1}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.charges}
                              onChange={(e) => handleItemChange(index, 'charges', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0.00"
                              step="0.01"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Charge notes"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Charges
                    </label>
                    <input
                      type="number"
                      value={formData.additionalCharges}
                      onChange={(e) => handleInputChange('additionalCharges', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                    <p className="text-sm text-gray-500 mt-1">Late fees, cleaning charges, etc.</p>
                  </div>
                </div>

                {/* Total Charges Summary */}
                <div className="border-t pt-6">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Damage Charges:</span>
                        <span className="font-medium">₹{formData.items.reduce((sum, item) => sum + (item.charges || 0), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Additional Charges:</span>
                        <span className="font-medium">₹{(formData.additionalCharges || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t pt-2">
                        <span>Total Charges:</span>
                        <span>₹{calculateTotalCharges().toFixed(2)}</span>
                      </div>
                    </div>
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

export default ReturnOrder
