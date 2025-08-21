import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const RentalOrderForm = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [isEditing, setIsEditing] = useState(!orderId)
  const [orderStatus, setOrderStatus] = useState('quotation')
  const [formData, setFormData] = useState({
    orderId: orderId || 'R0001',
    customer: '',
    invoiceAddress: '',
    deliveryAddress: '',
    rentalTemplate: '',
    expiration: '',
    rentalOrderDate: new Date().toISOString().split('T')[0],
    pricelist: '',
    rentalPeriod: '',
    rentalDuration: '',
    orderLines: [
      {
        id: 1,
        product: 'Product 1',
        quantity: 5,
        unitPrice: 200,
        tax: '',
        subTotal: 1000
      }
    ],
    termsConditions: '',
    untaxedTotal: 1000,
    tax: 0,
    total: 1000
  })

  const [activeTab, setActiveTab] = useState('order-details')

  const statusSteps = [
    { key: 'quotation', label: 'Quotation', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { key: 'quotation-sent', label: 'Quotation Sent', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { key: 'rental-order', label: 'Rental Order', color: 'bg-green-100 text-green-800 border-green-300' }
  ]

  const getCurrentStatusStyle = () => {
    const status = statusSteps.find(s => s.key === orderStatus)
    return status ? status.color : 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOrderLineChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      orderLines: prev.orderLines.map((line, i) => 
        i === index 
          ? { 
              ...line, 
              [field]: value,
              subTotal: field === 'quantity' || field === 'unitPrice' 
                ? (field === 'quantity' ? value : line.quantity) * (field === 'unitPrice' ? value : line.unitPrice)
                : line.subTotal
            }
          : line
      )
    }))
  }

  const addOrderLine = () => {
    setFormData(prev => ({
      ...prev,
      orderLines: [
        ...prev.orderLines,
        {
          id: prev.orderLines.length + 1,
          product: '',
          quantity: 1,
          unitPrice: 0,
          tax: '',
          subTotal: 0
        }
      ]
    }))
  }

  const removeOrderLine = (index) => {
    if (formData.orderLines.length > 1) {
      setFormData(prev => ({
        ...prev,
        orderLines: prev.orderLines.filter((_, i) => i !== index)
      }))
    }
  }

  const calculateTotals = () => {
    const untaxedTotal = formData.orderLines.reduce((sum, line) => sum + line.subTotal, 0)
    const tax = untaxedTotal * 0.1 // Assuming 10% tax
    const total = untaxedTotal + tax

    setFormData(prev => ({
      ...prev,
      untaxedTotal,
      tax,
      total
    }))
  }

  useEffect(() => {
    calculateTotals()
  }, [formData.orderLines])

  const handleSave = () => {
    console.log('Saving order:', formData)
    setIsEditing(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleConfirm = () => {
    setOrderStatus('rental-order')
    setIsEditing(false)
  }

  const handleCancel = () => {
    navigate('/orders')
  }

  const handleStatusChange = (newStatus) => {
    setOrderStatus(newStatus)
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
                <h1 className="text-2xl font-bold text-gray-900">Rental Order {formData.orderId}</h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getCurrentStatusStyle()}`}>
                  {statusSteps.find(s => s.key === orderStatus)?.label}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                1/10
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {isEditing ? 'View' : 'Edit'}
              </button>
              <button
                onClick={handleSave}
                disabled={!isEditing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Print
              </button>
              <button
                onClick={handleConfirm}
                disabled={orderStatus === 'rental-order'}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>

              {/* Status Navigation */}
              <div className="flex items-center space-x-2 ml-auto">
                {statusSteps.map((status, index) => (
                  <div key={status.key} className="flex items-center">
                    <button
                      onClick={() => handleStatusChange(status.key)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        orderStatus === status.key
                          ? status.color
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.label}
                    </button>
                    {index < statusSteps.length - 1 && (
                      <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('order-details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'order-details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order Details
              </button>
              <button
                onClick={() => setActiveTab('rental-notes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'rental-notes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rental Notes
              </button>
              <button
                onClick={() => setActiveTab('other-details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'other-details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Other Details
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'order-details' && (
              <div className="space-y-6">
                {/* Customer Information */}
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
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="Select customer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invoice Address
                      </label>
                      <textarea
                        value={formData.invoiceAddress}
                        onChange={(e) => handleInputChange('invoiceAddress', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        rows="3"
                        placeholder="Invoice address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address
                      </label>
                      <textarea
                        value={formData.deliveryAddress}
                        onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        rows="3"
                        placeholder="Delivery address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rental Template
                      </label>
                      <select
                        value={formData.rentalTemplate}
                        onChange={(e) => handleInputChange('rentalTemplate', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Select template</option>
                        <option value="standard">Standard Rental</option>
                        <option value="premium">Premium Rental</option>
                        <option value="corporate">Corporate Rental</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration
                      </label>
                      <input
                        type="date"
                        value={formData.expiration}
                        onChange={(e) => handleInputChange('expiration', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rental Order Date
                      </label>
                      <input
                        type="date"
                        value={formData.rentalOrderDate}
                        onChange={(e) => handleInputChange('rentalOrderDate', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pricelist
                      </label>
                      <select
                        value={formData.pricelist}
                        onChange={(e) => handleInputChange('pricelist', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Select pricelist</option>
                        <option value="standard">Standard Pricing</option>
                        <option value="discounted">Discounted Pricing</option>
                        <option value="premium">Premium Pricing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rental Period
                      </label>
                      <input
                        type="text"
                        value={formData.rentalPeriod}
                        onChange={(e) => handleInputChange('rentalPeriod', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="e.g., Weekly, Monthly"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rental Duration
                      </label>
                      <input
                        type="text"
                        value={formData.rentalDuration}
                        onChange={(e) => handleInputChange('rentalDuration', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="e.g., 1 week, 2 months"
                      />
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleInputChange('pricelist', 'updated')}
                        disabled={!isEditing || orderStatus === 'rental-order'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Update Prices
                      </button>
                      <span className="ml-2 text-sm text-gray-500">
                        {orderStatus === 'rental-order' ? 'Disabled when order gets confirmed' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Lines */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Order Lines</h3>
                    {isEditing && (
                      <button
                        onClick={addOrderLine}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Add Line
                      </button>
                    )}
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
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tax
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sub Total
                          </th>
                          {isEditing && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.orderLines.map((line, index) => (
                          <tr key={line.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={line.product}
                                onChange={(e) => handleOrderLineChange(index, 'product', e.target.value)}
                                disabled={!isEditing}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={line.quantity}
                                onChange={(e) => handleOrderLineChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                disabled={!isEditing}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={line.unitPrice}
                                onChange={(e) => handleOrderLineChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                disabled={!isEditing}
                                className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={line.tax}
                                onChange={(e) => handleOrderLineChange(index, 'tax', e.target.value)}
                                disabled={!isEditing}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                              >
                                <option value="">None</option>
                                <option value="10">10%</option>
                                <option value="18">18%</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="font-medium">{line.subTotal}</span>
                            </td>
                            {isEditing && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => removeOrderLine(index)}
                                  disabled={formData.orderLines.length === 1}
                                  className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={formData.termsConditions}
                    onChange={(e) => handleInputChange('termsConditions', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    rows="4"
                    placeholder="Enter terms and conditions"
                  />
                </div>

                {/* Totals */}
                <div className="border-t pt-6">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Untaxed Total:</span>
                        <span className="font-medium">{formData.untaxedTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">{formData.tax}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t pt-2">
                        <span>Total:</span>
                        <span>{formData.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rental-notes' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Rental Notes</h3>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="10"
                  placeholder="Add any rental-specific notes here..."
                  disabled={!isEditing}
                />
              </div>
            )}

            {activeTab === 'other-details' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Other Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sales Person
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!isEditing}
                    />
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

export default RentalOrderForm
