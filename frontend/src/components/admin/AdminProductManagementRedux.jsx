import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'
import {
  fetchAllProducts,
  updateProduct,
  deleteProduct,
  setProductFilter,
  selectFilteredProducts,
  selectAdminLoading,
  selectAdminError,
  selectAdminFilters
} from '../../app/features/adminSlice'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const AdminProductManagementRedux = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Redux selectors
  const products = useSelector(selectFilteredProducts)
  const loading = useSelector(selectAdminLoading)
  const error = useSelector(selectAdminError)
  const filters = useSelector(selectAdminFilters)
  
  // Local state
  const [activeTab, setActiveTab] = useState('all-products')
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'Electronics',
    pricePerDay: '',
    quantity: '',
    images: []
  })

  useEffect(() => {
    dispatch(fetchAllProducts())
  }, [dispatch])

  // Handle filter changes
  const handleSearchChange = (value) => {
    dispatch(setProductFilter({ search: value }))
  }

  const handleCategoryChange = (value) => {
    dispatch(setProductFilter({ category: value }))
  }

  const handleStatusChange = (value) => {
    dispatch(setProductFilter({ status: value }))
  }

  const handleInputChange = (field, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateProduct = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          category: newProduct.category,
          pricePerDay: parseFloat(newProduct.pricePerDay),
          quantity: parseInt(newProduct.quantity),
          images: newProduct.images
        })
      })

      const data = await response.json()
      
      if (data.success) {
        dispatch(fetchAllProducts())
        setNewProduct({
          name: '', description: '', category: 'Electronics', pricePerDay: '', quantity: '', images: []
        })
        setActiveTab('all-products')
        alert('Product created successfully!')
      } else {
        alert(data.message || 'Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product')
    }
  }

  const handleUpdateProduct = async (productId, productData) => {
    try {
      await dispatch(updateProduct({ productId, productData })).unwrap()
      alert('Product updated successfully!')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(productId)).unwrap()
        alert('Product deleted successfully')
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product')
      }
    }
  }

  const getAvailabilityColor = (availability) => {
    switch(availability) {
      case 'Available': return 'bg-green-100 text-green-800'
      case 'Out of Stock': return 'bg-red-100 text-red-800'
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Electronics': 'bg-blue-100 text-blue-800',
      'Furniture': 'bg-green-100 text-green-800',
      'Vehicles': 'bg-purple-100 text-purple-800',
      'Sports': 'bg-orange-100 text-orange-800',
      'Tools': 'bg-gray-100 text-gray-800',
      'Other': 'bg-indigo-100 text-indigo-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const tabs = [
    { id: 'all-products', label: 'All Products', icon: '📦' },
    { id: 'add-product', label: 'Add Product', icon: '➕' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'inventory', label: 'Inventory', icon: '📊' }
  ]

  const renderAllProducts = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Search Products</label>
            <input
              type="text"
              value={filters.products.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Category</label>
            <select
              value={filters.products.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Sports">Sports</option>
              <option value="Tools">Tools</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Availability</label>
            <select
              value={filters.products.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
        <div className="p-4 border-b border-purple-200">
          <h3 className="text-lg font-semibold text-midnight-800">
            Products ({products.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-navy-700">Product</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Category</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Price/Day</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Stock</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Rentals</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-navy-700">Revenue</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No products found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              className="h-10 w-10 rounded-lg object-cover" 
                              src={product.images[0]} 
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40x40?text=No+Image'
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-midnight-800">{product.name}</div>
                          <div className="text-sm text-navy-600">{product.description?.slice(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-purple-600">
                      ₹{product.pricePerDay?.toLocaleString()}/day
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-navy-700">{product.quantity}</span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(product.availability)}`}>
                          {product.availability}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-navy-700">
                        <div>Total: {product.totalRentals}</div>
                        <div className="text-blue-600">Active: {product.activeRentals}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-purple-600">
                      ₹{product.totalRevenue?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View
                        </button>
                        <button className="text-purple-600 hover:text-purple-800 text-sm">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderAddProduct = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Add New Product</h3>
      
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Product Name *</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Category *</label>
            <select
              value={newProduct.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Sports">Sports</option>
              <option value="Tools">Tools</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Price per Day (₹) *</label>
            <input
              type="number"
              value={newProduct.pricePerDay}
              onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Quantity *</label>
            <input
              type="number"
              value={newProduct.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-navy-700 mb-2">Description</label>
            <textarea
              value={newProduct.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter product description"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setNewProduct({
              name: '', description: '', category: 'Electronics', pricePerDay: '', quantity: '', images: []
            })}
            className="px-6 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleCreateProduct}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Product
          </button>
        </div>
      </div>
    </div>
  )

  const renderCategories = () => {
    const categoryStats = products.reduce((acc, product) => {
      const category = product.category || 'Other'
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalRevenue: 0,
          totalStock: 0,
          activeRentals: 0
        }
      }
      acc[category].count++
      acc[category].totalRevenue += product.totalRevenue || 0
      acc[category].totalStock += product.quantity || 0
      acc[category].activeRentals += product.activeRentals || 0
      return acc
    }, {})

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-midnight-800">Product Categories</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(categoryStats).map(([category, stats]) => (
            <div key={category} className="bg-white rounded-lg border border-purple-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-midnight-800">{category}</h4>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
                  {stats.count} products
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Revenue:</span>
                  <span className="text-sm font-medium text-purple-600">₹{stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Stock:</span>
                  <span className="text-sm font-medium">{stats.totalStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Rentals:</span>
                  <span className="text-sm font-medium text-blue-600">{stats.activeRentals}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderInventory = () => {
    const lowStockProducts = products.filter(product => (product.quantity || 0) < 5)
    const outOfStockProducts = products.filter(product => (product.quantity || 0) === 0)

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-midnight-800">Inventory Management</h3>
        
        {/* Inventory Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-red-200 p-6">
            <h4 className="text-lg font-semibold text-red-800 mb-4">Out of Stock ({outOfStockProducts.length})</h4>
            <div className="space-y-3">
              {outOfStockProducts.slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-900">{product.name}</span>
                  <span className="text-xs text-red-600">0 left</span>
                </div>
              ))}
              {outOfStockProducts.length === 0 && (
                <p className="text-gray-500 text-center py-4">No out of stock products</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-yellow-200 p-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-4">Low Stock ({lowStockProducts.length})</h4>
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-900">{product.name}</span>
                  <span className="text-xs text-yellow-600">{product.quantity} left</span>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-gray-500 text-center py-4">No low stock products</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all-products':
        return renderAllProducts()
      case 'add-product':
        return renderAddProduct()
      case 'categories':
        return renderCategories()
      case 'inventory':
        return renderInventory()
      default:
        return renderAllProducts()
    }
  }

  if (loading.products) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error.products) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Products</h2>
            <p className="text-gray-600 mb-4">{error.products}</p>
            <button 
              onClick={() => dispatch(fetchAllProducts())} 
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
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
                <h1 className="text-3xl font-bold text-midnight-800">Product Management</h1>
                <p className="text-navy-600 mt-2">Manage products, inventory, and categories</p>
              </div>
              
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                ← Back to Admin
              </button>
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

export default AdminProductManagementRedux
