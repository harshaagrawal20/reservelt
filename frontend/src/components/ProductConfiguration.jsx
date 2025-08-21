import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const ProductConfiguration = () => {
  const navigate = useNavigate()
  const { productId } = useParams()
  const isEditing = !!productId
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    description: '',
    specifications: {
      weight: '',
      dimensions: '',
      power: '',
      capacity: '',
      fuelType: '',
      engineModel: ''
    },
    pricing: {
      dailyRate: '',
      weeklyRate: '',
      monthlyRate: '',
      depositAmount: '',
      currency: 'INR'
    },
    availability: {
      status: 'available',
      location: '',
      warehouse: '',
      condition: 'excellent'
    },
    maintenance: {
      lastService: '',
      nextService: '',
      serviceInterval: '',
      maintenanceNotes: ''
    },
    insurance: {
      provider: '',
      policyNumber: '',
      expiryDate: '',
      coverage: ''
    },
    documents: [],
    images: [],
    accessories: [],
    tags: []
  })

  const [activeTab, setActiveTab] = useState('basic-info')
  const [newTag, setNewTag] = useState('')
  const [newAccessory, setNewAccessory] = useState('')

  const categories = [
    'Heavy Machinery',
    'Construction Equipment',
    'Material Handling',
    'Power Tools',
    'Safety Equipment',
    'Lifting Equipment',
    'Concrete Equipment',
    'Earthmoving Equipment'
  ]

  const subcategoriesByCategory = {
    'Heavy Machinery': ['Excavators', 'Bulldozers', 'Loaders', 'Graders'],
    'Construction Equipment': ['Mixers', 'Compactors', 'Pumps', 'Generators'],
    'Material Handling': ['Forklifts', 'Cranes', 'Hoists', 'Conveyors'],
    'Power Tools': ['Drills', 'Saws', 'Grinders', 'Sanders'],
    'Safety Equipment': ['Harnesses', 'Helmets', 'Barriers', 'Signs']
  }

  const locations = ['Warehouse A', 'Warehouse B', 'Service Center', 'Site Storage', 'Customer Location']
  const conditions = ['excellent', 'good', 'fair', 'needs-repair', 'out-of-service']
  const statuses = ['available', 'rented', 'maintenance', 'reserved', 'out-of-service']

  useEffect(() => {
    if (isEditing) {
      // Load existing product data
      // This would typically come from an API call
      setFormData(prev => ({
        ...prev,
        name: 'Excavator CAT 320',
        category: 'Heavy Machinery',
        subcategory: 'Excavators',
        model: 'CAT-320-2024',
        manufacturer: 'Caterpillar',
        serialNumber: 'EX001',
        description: 'Heavy-duty excavator suitable for large construction projects'
      }))
    }
  }, [isEditing])

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleAddAccessory = () => {
    if (newAccessory.trim()) {
      setFormData(prev => ({
        ...prev,
        accessories: [...prev.accessories, { name: newAccessory.trim(), included: true }]
      }))
      setNewAccessory('')
    }
  }

  const handleRemoveAccessory = (index) => {
    setFormData(prev => ({
      ...prev,
      accessories: prev.accessories.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    console.log('Saving product:', formData)
    // API call to save product
    navigate('/inventory')
  }

  const handleCancel = () => {
    navigate('/inventory')
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
                  onClick={() => navigate('/inventory')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h1>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {isEditing ? 'Update Product' : 'Save Product'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              {isEditing && (
                <button
                  onClick={() => navigate(`/products/${productId}`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  View Product
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {[
                { key: 'basic-info', label: 'Basic Information' },
                { key: 'specifications', label: 'Specifications' },
                { key: 'pricing', label: 'Pricing' },
                { key: 'availability', label: 'Availability' },
                { key: 'maintenance', label: 'Maintenance' },
                { key: 'documentation', label: 'Documentation' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'basic-info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange(null, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange(null, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subcategory
                      </label>
                      <select
                        value={formData.subcategory}
                        onChange={(e) => handleInputChange(null, 'subcategory', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!formData.category}
                      >
                        <option value="">Select subcategory</option>
                        {formData.category && subcategoriesByCategory[formData.category]?.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => handleInputChange(null, 'model', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Product model"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manufacturer
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer}
                        onChange={(e) => handleInputChange(null, 'manufacturer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Manufacturer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Serial Number *
                      </label>
                      <input
                        type="text"
                        value={formData.serialNumber}
                        onChange={(e) => handleInputChange(null, 'serialNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Unique serial number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange(null, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Product description"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add tag"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="text"
                        value={formData.specifications.weight}
                        onChange={(e) => handleInputChange('specifications', 'weight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 15000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dimensions (L×W×H)
                      </label>
                      <input
                        type="text"
                        value={formData.specifications.dimensions}
                        onChange={(e) => handleInputChange('specifications', 'dimensions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 8.5×2.5×3.2 m"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Power (HP/kW)
                      </label>
                      <input
                        type="text"
                        value={formData.specifications.power}
                        onChange={(e) => handleInputChange('specifications', 'power', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 150 HP"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity
                      </label>
                      <input
                        type="text"
                        value={formData.specifications.capacity}
                        onChange={(e) => handleInputChange('specifications', 'capacity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 2.5 tons"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fuel Type
                      </label>
                      <select
                        value={formData.specifications.fuelType}
                        onChange={(e) => handleInputChange('specifications', 'fuelType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select fuel type</option>
                        <option value="diesel">Diesel</option>
                        <option value="petrol">Petrol</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="lpg">LPG</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Engine Model
                      </label>
                      <input
                        type="text"
                        value={formData.specifications.engineModel}
                        onChange={(e) => handleInputChange('specifications', 'engineModel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Engine model/type"
                      />
                    </div>
                  </div>
                </div>

                {/* Accessories */}
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accessories & Attachments</label>
                  <div className="space-y-2 mb-4">
                    {formData.accessories.map((accessory, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{accessory.name}</span>
                        <button
                          onClick={() => handleRemoveAccessory(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newAccessory}
                      onChange={(e) => setNewAccessory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddAccessory()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add accessory"
                    />
                    <button
                      onClick={handleAddAccessory}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daily Rate *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={formData.pricing.dailyRate}
                          onChange={(e) => handleInputChange('pricing', 'dailyRate', e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weekly Rate
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={formData.pricing.weeklyRate}
                          onChange={(e) => handleInputChange('pricing', 'weeklyRate', e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Rate
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={formData.pricing.monthlyRate}
                          onChange={(e) => handleInputChange('pricing', 'monthlyRate', e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Security Deposit
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={formData.pricing.depositAmount}
                          onChange={(e) => handleInputChange('pricing', 'depositAmount', e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.availability.status}
                        onChange={(e) => handleInputChange('availability', 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Location
                      </label>
                      <select
                        value={formData.availability.location}
                        onChange={(e) => handleInputChange('availability', 'location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select location</option>
                        {locations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warehouse
                      </label>
                      <input
                        type="text"
                        value={formData.availability.warehouse}
                        onChange={(e) => handleInputChange('availability', 'warehouse', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Warehouse details"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition
                      </label>
                      <select
                        value={formData.availability.condition}
                        onChange={(e) => handleInputChange('availability', 'condition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {conditions.map(condition => (
                          <option key={condition} value={condition}>
                            {condition.charAt(0).toUpperCase() + condition.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Service Date
                      </label>
                      <input
                        type="date"
                        value={formData.maintenance.lastService}
                        onChange={(e) => handleInputChange('maintenance', 'lastService', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Service Date
                      </label>
                      <input
                        type="date"
                        value={formData.maintenance.nextService}
                        onChange={(e) => handleInputChange('maintenance', 'nextService', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Interval (days)
                      </label>
                      <input
                        type="number"
                        value={formData.maintenance.serviceInterval}
                        onChange={(e) => handleInputChange('maintenance', 'serviceInterval', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maintenance Notes
                      </label>
                      <textarea
                        value={formData.maintenance.maintenanceNotes}
                        onChange={(e) => handleInputChange('maintenance', 'maintenanceNotes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Maintenance history and notes"
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Insurance Provider
                        </label>
                        <input
                          type="text"
                          value={formData.insurance.provider}
                          onChange={(e) => handleInputChange('insurance', 'provider', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Insurance company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Policy Number
                        </label>
                        <input
                          type="text"
                          value={formData.insurance.policyNumber}
                          onChange={(e) => handleInputChange('insurance', 'policyNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Policy number"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          value={formData.insurance.expiryDate}
                          onChange={(e) => handleInputChange('insurance', 'expiryDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Coverage Details
                        </label>
                        <textarea
                          value={formData.insurance.coverage}
                          onChange={(e) => handleInputChange('insurance', 'coverage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Coverage details"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documentation' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload product images
                        </span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" />
                      </label>
                      <p className="mt-1 text-sm text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M9 12h6m6 0h6m-6 6h6m-12 0h6m6 0h6M9 24h6m6 0h6m-6 6h6m-12 0h6m6 0h6M9 36h6m6 0h6m-6 6h6m-12 0h6m6 0h6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="document-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload documents
                        </span>
                        <input id="document-upload" name="document-upload" type="file" className="sr-only" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" />
                      </label>
                      <p className="mt-1 text-sm text-gray-500">PDF, DOC, XLS up to 25MB each</p>
                      <p className="text-xs text-gray-400 mt-1">Manuals, certificates, warranties, etc.</p>
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

export default ProductConfiguration
