import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

const QuoteOrder = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('quote-details')
  const [formData, setFormData] = useState({
    quoteNumber: 'Q-2025-001',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventDate: '',
    eventType: '',
    eventLocation: '',
    deliveryAddress: '',
    pickupDate: '',
    returnDate: '',
    notes: '',
    items: [
      {
        id: 1,
        product: 'Professional Camera',
        description: 'Canon EOS 5D Mark IV with lenses',
        quantity: 2,
        days: 3,
        unitPrice: 50,
        total: 300
      },
      {
        id: 2,
        product: 'Sound System',
        description: 'Professional PA system for events',
        quantity: 1,
        days: 3,
        unitPrice: 75,
        total: 225
      }
    ],
    subtotal: 525,
    tax: 42,
    delivery: 50,
    total: 617,
    status: 'draft'
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      
      // Recalculate total for the item
      if (field === 'quantity' || field === 'days' || field === 'unitPrice') {
        const item = newItems[index]
        newItems[index].total = item.quantity * item.days * item.unitPrice
      }
      
      // Recalculate subtotal
      const subtotal = newItems.reduce((sum, item) => sum + item.total, 0)
      const tax = Math.round(subtotal * 0.08) // 8% tax
      const total = subtotal + tax + prev.delivery
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        tax,
        total
      }
    })
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now(),
        product: '',
        description: '',
        quantity: 1,
        days: 1,
        unitPrice: 0,
        total: 0
      }]
    }))
  }

  const removeItem = (index) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index)
      const subtotal = newItems.reduce((sum, item) => sum + item.total, 0)
      const tax = Math.round(subtotal * 0.08)
      const total = subtotal + tax + prev.delivery
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        tax,
        total
      }
    })
  }

  const handleSaveQuote = () => {
    // Save quote logic
    alert('Quote saved successfully!')
  }

  const handleSendQuote = () => {
    // Send quote logic
    setFormData(prev => ({ ...prev, status: 'sent' }))
    alert('Quote sent to customer!')
  }

  const handleConvertToOrder = () => {
    // Convert to order logic
    setFormData(prev => ({ ...prev, status: 'confirmed' }))
    alert('Quote converted to order!')
  }

  const tabs = [
    { id: 'quote-details', label: 'Quote Details', icon: '📋' },
    { id: 'customer-info', label: 'Customer Info', icon: '👤' },
    { id: 'event-details', label: 'Event Details', icon: '📅' },
    { id: 'delivery', label: 'Delivery', icon: '🚚' }
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderQuoteDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Quote Number</label>
          <input
            type="text"
            value={formData.quoteNumber}
            onChange={(e) => handleInputChange('quoteNumber', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Status</label>
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(formData.status)}`}>
            {formData.status.toUpperCase()}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Quote Date</label>
          <input
            type="date"
            value={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Items Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-midnight-800">Quote Items</h3>
          <button
            onClick={addItem}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Item
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border border-purple-200 rounded-lg">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-navy-700">Description</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-navy-700">Qty</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-navy-700">Days</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-navy-700">Unit Price</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-navy-700">Total</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-navy-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={item.id} className="border-t border-purple-100">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.product}
                      onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                      className="w-full px-2 py-1 border border-purple-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Product name"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 border border-purple-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Description"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-purple-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                      min="1"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={item.days}
                      onChange={(e) => handleItemChange(index, 'days', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-purple-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                      min="1"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border border-purple-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                      step="0.01"
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${item.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-purple-50 rounded-lg p-6">
        <div className="max-w-md ml-auto space-y-2">
          <div className="flex justify-between">
            <span className="text-navy-700">Subtotal:</span>
            <span className="font-medium">${formData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-navy-700">Tax (8%):</span>
            <span className="font-medium">${formData.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-navy-700">Delivery:</span>
            <span className="font-medium">${formData.delivery.toFixed(2)}</span>
          </div>
          <div className="border-t border-purple-200 pt-2 flex justify-between text-lg font-bold">
            <span className="text-midnight-800">Total:</span>
            <span className="text-purple-600">${formData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">Internal Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Add any internal notes or special instructions..."
        />
      </div>
    </div>
  )

  const renderCustomerInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Customer Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Customer Name *</label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter customer name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Email Address *</label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="customer@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Phone Number *</label>
          <input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>
  )

  const renderEventDetails = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Event Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Event Date</label>
          <input
            type="date"
            value={formData.eventDate}
            onChange={(e) => handleInputChange('eventDate', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Event Type</label>
          <select
            value={formData.eventType}
            onChange={(e) => handleInputChange('eventType', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select event type</option>
            <option value="wedding">Wedding</option>
            <option value="corporate">Corporate Event</option>
            <option value="birthday">Birthday Party</option>
            <option value="conference">Conference</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">Event Location</label>
        <textarea
          value={formData.eventLocation}
          onChange={(e) => handleInputChange('eventLocation', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter event venue address"
        />
      </div>
    </div>
  )

  const renderDelivery = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Delivery & Pickup</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Pickup Date</label>
          <input
            type="date"
            value={formData.pickupDate}
            onChange={(e) => handleInputChange('pickupDate', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">Return Date</label>
          <input
            type="date"
            value={formData.returnDate}
            onChange={(e) => handleInputChange('returnDate', e.target.value)}
            className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">Delivery Address</label>
        <textarea
          value={formData.deliveryAddress}
          onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter delivery address"
        />
      </div>
      
      <div className="bg-purple-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-midnight-800">Delivery Service</h4>
            <p className="text-sm text-navy-600">Professional delivery and setup included</p>
          </div>
          <div className="text-lg font-bold text-purple-600">
            ${formData.delivery.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'quote-details':
        return renderQuoteDetails()
      case 'customer-info':
        return renderCustomerInfo()
      case 'event-details':
        return renderEventDetails()
      case 'delivery':
        return renderDelivery()
      default:
        return renderQuoteDetails()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200">
          {/* Header */}
          <div className="border-b border-purple-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-midnight-800">Create Quote</h1>
                <p className="text-navy-600 mt-2">Generate professional quotes for rental orders</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveQuote}
                  className="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleSendQuote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Quote
                </button>
                <button
                  onClick={handleConvertToOrder}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Convert to Order
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-purple-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-navy-500 hover:text-navy-700 hover:border-navy-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteOrder
