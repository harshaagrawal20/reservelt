import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ProductInventory = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Excavator CAT 320',
      category: 'Heavy Machinery',
      model: 'CAT-320-2024',
      serialNumber: 'EX001',
      status: 'available',
      condition: 'excellent',
      location: 'Warehouse A',
      dailyRate: 2500,
      weeklyRate: 15000,
      monthlyRate: 50000,
      lastMaintenance: '2024-07-15',
      nextMaintenance: '2024-08-15',
      totalBookings: 15,
      revenue: 187500
    },
    {
      id: 2,
      name: 'Concrete Mixer',
      category: 'Construction Equipment',
      model: 'CM-500L',
      serialNumber: 'CM002',
      status: 'rented',
      condition: 'good',
      location: 'Site B',
      dailyRate: 800,
      weeklyRate: 5000,
      monthlyRate: 18000,
      lastMaintenance: '2024-07-10',
      nextMaintenance: '2024-08-10',
      totalBookings: 22,
      revenue: 96000
    },
    {
      id: 3,
      name: 'Forklift Toyota 5FG25',
      category: 'Material Handling',
      model: 'Toyota-5FG25',
      serialNumber: 'FL003',
      status: 'maintenance',
      condition: 'fair',
      location: 'Service Center',
      dailyRate: 1200,
      weeklyRate: 7500,
      monthlyRate: 28000,
      lastMaintenance: '2024-08-01',
      nextMaintenance: '2024-09-01',
      totalBookings: 18,
      revenue: 134000
    }
  ])

  const [filteredProducts, setFilteredProducts] = useState(products)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'

  const categories = ['Heavy Machinery', 'Construction Equipment', 'Material Handling', 'Power Tools', 'Safety Equipment']
  const statuses = ['available', 'rented', 'maintenance', 'out-of-service']

  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => product.status === filterStatus)
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, filterStatus, filterCategory, products])

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-300'
      case 'rented': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'out-of-service': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleAddProduct = () => {
    navigate('/products/new')
  }

  const handleEditProduct = (productId) => {
    navigate(`/products/${productId}/edit`)
  }

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <h1 className="text-2xl font-bold text-gray-900 mb-4 lg:mb-0">Product Inventory</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Product</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                        {product.status.replace('-', ' ')}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewProduct(product.id)}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.model}</p>
                    <p className="text-xs text-gray-500 mb-3">SN: {product.serialNumber}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Condition:</span>
                        <span className={`font-medium ${getConditionColor(product.condition)}`}>
                          {product.condition}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{product.location}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Daily Rate:</span>
                        <span className="font-medium text-green-600">₹{product.dailyRate}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{product.totalBookings} bookings</span>
                        <span>₹{product.revenue.toLocaleString()} revenue</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daily Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.model}</div>
                          <div className="text-xs text-gray-400">SN: {product.serialNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                          {product.status.replace('-', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getConditionColor(product.condition)}`}>
                          {product.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ₹{product.dailyRate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProduct(product.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductInventory
