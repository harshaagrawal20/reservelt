import React, { useEffect, useState, useMemo } from 'react'
import { useUser } from '@clerk/clerk-react'
import Navbar from './Navbar'
import { useProducts } from '../hooks/useRedux'
import { getMyProducts, createProduct, updateProduct, deleteProduct, setFilters, clearFilters } from '../app/features/productSlice'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const Products = () => {
  const { user } = useUser()
  const { 
    myProducts: productsFromState, 
    selectedProduct, 
    myProductsLoading: isLoading, 
    myProductsError: error, 
    filters,
    dispatch 
  } = useProducts()
  
  // Ensure products is always an array and filter to show only user's products
  const products = Array.isArray(productsFromState) ? productsFromState : []
  
  // UI state
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  
  // Local filter state
  const [localFilters, setLocalFilters] = useState({
    search: '',
    category: '',
    priceRange: { min: '', max: '' },
    targetAudience: '',
    availability: '',
    brand: ''
  })

  // Load products on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(getMyProducts({ clerkId: user.id }))
    }
  }, [dispatch, user?.id])

  // Constants for dropdowns
  const CATEGORIES = ['Sports', 'Badminton', 'Cricket', 'Football', 'Cycling', 'Photography', 'Music', 'Camping', 'Tools', 'Electronics']
  const TARGET_AUDIENCES = ['Beginners', 'Professionals', 'Kids', 'Adults', 'All Ages']
  const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' }
  ]

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    
    // Debounce the Redux filter update for search
    if (key === 'search') {
      const timeoutId = setTimeout(() => {
        dispatch(setFilters(newFilters))
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      dispatch(setFilters(newFilters))
    }
  }

  // Clear all filters
  const handleClearFilters = () => {
    const resetFilters = {
      search: '',
      category: '',
      priceRange: { min: '', max: '' },
      targetAudience: '',
      availability: '',
      brand: ''
    }
    setLocalFilters(resetFilters)
    dispatch(clearFilters())
  }

  // Handle create product
  const handleCreateProduct = async (productData) => {
    try {
      await dispatch(createProduct(productData)).unwrap()
      setShowProductForm(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Failed to create product:', error)
    }
  }

  // Handle update product
  const handleUpdateProduct = async (productId, productData) => {
    try {
      await dispatch(updateProduct({ productId, productData })).unwrap()
      setShowProductForm(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  }

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(productId)).unwrap()
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  // Helper function to get the appropriate price
  const getProductPrice = (product) => {
    if (product.pricePerHour) return product.pricePerHour
    if (product.pricePerDay) return product.pricePerDay
    if (product.pricePerWeek) return product.pricePerWeek
    return product.price || 0 // fallback to old structure
  }

  // Helper function to get product name
  const getProductName = (product) => {
    return product.title || product.name || 'Unnamed Product'
  }

  // Enhanced helper function to get availability status with real-time booking data
  const getAvailabilityStatus = (product) => {
    // If no availability periods are set, consider the product available by default
    if (!product.availability || !Array.isArray(product.availability) || product.availability.length === 0) {
      return 'available'
    }
    
    // Check if there are any current or future available periods
    const now = new Date()
    const hasAvailablePeriod = product.availability.some(period => {
      const endDate = new Date(period.endDate)
      // Product is available if the availability period hasn't ended yet
      return endDate >= now
    })
    
    return hasAvailablePeriod ? 'available' : 'unavailable'
  }

  // Get real-time booking status for a product
  const getProductBookingStatus = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/booking-status/${productId}`)
      const data = await response.json()
      
      if (data.success) {
        return {
          currentStatus: data.currentStatus,
          statusMessage: data.statusMessage,
          nextAvailableDate: data.nextAvailableDate,
          currentBooking: data.currentBooking,
          nextBooking: data.nextBooking
        }
      }
    } catch (error) {
      console.error('Error fetching product booking status:', error)
    }
    return null
  }

  // Advanced filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const productName = getProductName(product).toLowerCase()
      const description = (product.description || '').toLowerCase()
      const brand = (product.brand || '').toLowerCase()
      const tags = (product.tags || []).join(' ').toLowerCase()
      
      // Search filter
      const searchMatch = !localFilters.search || 
        productName.includes(localFilters.search.toLowerCase()) ||
        description.includes(localFilters.search.toLowerCase()) ||
        brand.includes(localFilters.search.toLowerCase()) ||
        tags.includes(localFilters.search.toLowerCase())
      
      // Category filter
      const categoryMatch = !localFilters.category || product.category === localFilters.category
      
      // Brand filter
      const brandMatch = !localFilters.brand || brand.includes(localFilters.brand.toLowerCase())
      
      // Target audience filter
      const audienceMatch = !localFilters.targetAudience || product.targetAudience === localFilters.targetAudience
      
      // Availability filter
      const availabilityMatch = !localFilters.availability || 
        getAvailabilityStatus(product) === localFilters.availability
      
      // Price range filter
      const productPrice = getProductPrice(product)
      const priceMatch = (!localFilters.priceRange.min || productPrice >= Number(localFilters.priceRange.min)) &&
                        (!localFilters.priceRange.max || productPrice <= Number(localFilters.priceRange.max))
      
      return searchMatch && categoryMatch && brandMatch && audienceMatch && availabilityMatch && priceMatch
    })

    // Sort the filtered products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'price-low':
          return getProductPrice(a) - getProductPrice(b)
        case 'price-high':
          return getProductPrice(b) - getProductPrice(a)
        case 'name-asc':
          return getProductName(a).localeCompare(getProductName(b))
        case 'name-desc':
          return getProductName(b).localeCompare(getProductName(a))
        default:
          return 0
      }
    })

    return filtered
  }, [products, localFilters, sortBy])

  // Get unique values for filter dropdowns
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))]
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))]
  const priceRange = products.reduce((acc, product) => {
    const price = getProductPrice(product)
    return {
      min: Math.min(acc.min, price),
      max: Math.max(acc.max, price)
    }
  }, { min: Infinity, max: 0 })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
              <p className="text-gray-600 mt-1">Manage your rental equipment inventory</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {viewMode === 'grid' ? '📋 List' : '⊞ Grid'} View
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setShowProductForm(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                ➕ Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Main Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products by name, description, brand, or tags..."
                  value={localFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute left-3 top-3.5 text-gray-400">
                  🔍
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-4 py-3 border rounded-lg transition-colors ${
                  showAdvancedFilters 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                🔧 Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={localFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input
                    type="text"
                    placeholder="Filter by brand..."
                    value={localFilters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Target Audience Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select
                    value={localFilters.targetAudience}
                    onChange={(e) => handleFilterChange('targetAudience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Audiences</option>
                    {TARGET_AUDIENCES.map(audience => (
                      <option key={audience} value={audience}>{audience}</option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    value={localFilters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={localFilters.priceRange.min}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...localFilters.priceRange,
                        min: e.target.value
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="py-2 text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={localFilters.priceRange.max}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...localFilters.priceRange,
                        max: e.target.value
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {priceRange.min !== Infinity && (
                    <p className="text-xs text-gray-500 mt-1">
                      Range: ${priceRange.min} - ${priceRange.max}
                    </p>
                  )}
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            Showing {filteredAndSortedProducts.length} of {products.length} products
          </p>
          {Object.values(localFilters).some(val => 
            val && (typeof val === 'string' ? val : val.min || val.max)
          ) && (
            <button
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600 text-lg">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <div>
                <h3 className="font-medium">Error Loading Products</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Display */}
        {!isLoading && !error && (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard 
                    key={product._id || product.id} 
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    getProductName={getProductName}
                    getProductPrice={getProductPrice}
                    getAvailabilityStatus={getAvailabilityStatus}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedProducts.map((product) => (
                        <ProductRow 
                          key={product._id || product.id} 
                          product={product}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                          getProductName={getProductName}
                          getProductPrice={getProductPrice}
                          getAvailabilityStatus={getAvailabilityStatus}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredAndSortedProducts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {products.length === 0 ? 'No products yet' : 'No products found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {products.length === 0 
                  ? "Get started by adding your first rental product!"
                  : "Try adjusting your search criteria or filters to find what you're looking for."
                }
              </p>
              {products.length === 0 && (
                <button
                  onClick={() => {
                    setEditingProduct(null)
                    setShowProductForm(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Add Your First Product
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Product Form Modal */}
      {showProductForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
          onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
          isEditing={!!editingProduct}
        />
      )}
    </div>
  )
}

// Product Card Component for Grid View
const ProductCard = ({ product, onEdit, onDelete, getProductName, getProductPrice, getAvailabilityStatus }) => {
  const [bookingStatus, setBookingStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const isAvailable = getAvailabilityStatus(product) === 'available'

  useEffect(() => {
    const fetchBookingStatus = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/products/booking-status/${product._id}`)
        const data = await response.json()
        
        if (data.success) {
          setBookingStatus(data)
        }
      } catch (error) {
        console.error('Error fetching booking status:', error)
      } finally {
        setLoading(false)
      }
    }

    if (product._id) {
      fetchBookingStatus()
    }
  }, [product._id])

  const getStatusBadge = () => {
    if (loading) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
          Loading...
        </span>
      )
    }

    if (!bookingStatus) {
      return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
      )
    }

    switch (bookingStatus.currentStatus) {
      case 'available':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✅ Available
          </span>
        )
      case 'rented':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            🔴 Rented
          </span>
        )
      case 'preparing':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            ⏰ Preparing
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
            Unknown
          </span>
        )
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Status Badge */}
      <div className="relative p-4 pb-2">
        <div className="flex justify-between items-start mb-3">
          <div className="w-8 h-8 border-2 border-gray-300 rounded"></div>
          {getStatusBadge()}
        </div>

        {/* Product Image/Icon */}
        <div className="flex justify-center mb-4">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={getProductName(product)}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          )}
        </div>

        {/* Category */}
        <p className="text-center text-gray-600 text-sm mb-2">
          {product.category || 'Rental - Equipment'}
        </p>
      </div>

      {/* Product Details */}
      <div className="px-4 pb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
          {getProductName(product)}
        </h3>
        
        <p className="text-center text-gray-600 text-sm mb-4">
          {product.category || 'Rental - Equipment'} • {product.description && product.description.length > 50 
            ? `${product.description.substring(0, 50)}...` 
            : product.description || 'High quality rentable item.'}
        </p>

        {/* Booking Status Info */}
        {bookingStatus && bookingStatus.currentStatus !== 'available' && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{bookingStatus.statusMessage}</p>
            {bookingStatus.nextAvailableDate && (
              <p className="text-xs text-gray-500 mt-1">
                Next available: {new Date(bookingStatus.nextAvailableDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Price and Owner */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Daily Rate</p>
            <p className="text-2xl font-bold text-gray-900">₹{getProductPrice(product)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Owner</p>
            <p className="font-medium text-gray-900">{product.brand || 'You'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(product._id || product.id)}
            className="flex-1 py-2 px-4 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Product Row Component for List View
const ProductRow = ({ product, onEdit, onDelete, getProductName, getProductPrice, getAvailabilityStatus }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img 
            className="h-12 w-12 rounded-lg object-cover" 
            src={product.images?.[0] || '/placeholder-image.jpg'} 
            alt={getProductName(product)}
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{getProductName(product)}</div>
            <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
          {product.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.brand}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="font-medium">${getProductPrice(product)}</div>
        <div className="text-xs text-gray-500">{product.targetAudience}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          getAvailabilityStatus(product) === 'available' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {getAvailabilityStatus(product)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="text-blue-600 hover:text-blue-900"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(product._id || product.id)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// Enhanced Product Form Modal Component
const ProductFormModal = ({ product, onClose, onSave, isEditing }) => {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  
  const [form, setForm] = useState({
    title: product?.title || '',
    description: product?.description || '',
    category: product?.category || 'Sports',
    brand: product?.brand || '',
    tags: product?.tags ? product.tags.join(', ') : '',
    targetAudience: product?.targetAudience || 'All Ages',
    pricePerHour: product?.pricePerHour || '',
    pricePerDay: product?.pricePerDay || '',
    pricePerWeek: product?.pricePerWeek || '',
    location: product?.location || '',
    pickupLocation: product?.pickupLocation || '',
    dropLocation: product?.dropLocation || '',
    images: product?.images || []
  })

  const CATEGORIES = ['Sports', 'Badminton', 'Cricket', 'Football', 'Cycling', 'Photography', 'Music', 'Camping', 'Tools', 'Electronics']
  const TARGET_AUDIENCES = ['Beginners', 'Professionals', 'Kids', 'Adults', 'All Ages']
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    
    setUploading(true)
    setError('')
    
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('images', f))
      
      const res = await fetch(`${API_BASE_URL}/products/upload`, {
        method: 'POST',
        body: fd
      })
      
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      
      setForm(prev => ({ 
        ...prev, 
        images: [...prev.images, ...data.files] 
      }))
    } catch (err) {
      setError(err.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user?.id) {
      setError('You must be logged in')
      return
    }

    // Validation
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    if (!form.description.trim()) {
      setError('Description is required')
      return
    }
    if (!form.pricePerDay && !form.pricePerHour && !form.pricePerWeek) {
      setError('At least one price field is required')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const payload = {
        clerkId: user.id, // Changed from ownerClerkId to clerkId
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        brand: form.brand.trim(),
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        targetAudience: form.targetAudience,
        ...(form.pricePerHour && { pricePerHour: Number(form.pricePerHour) }),
        ...(form.pricePerDay && { pricePerDay: Number(form.pricePerDay) }),
        ...(form.pricePerWeek && { pricePerWeek: Number(form.pricePerWeek) }),
        location: form.location.trim(),
        pickupLocation: form.pickupLocation.trim(),
        dropLocation: form.dropLocation.trim(),
        images: form.images
      }

      if (isEditing) {
        await onSave(product._id || product.id, payload)
      } else {
        await onSave(payload)
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} product`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your product"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  name="brand"
                  required
                  value={form.brand}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Product brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience *
                </label>
                <select
                  name="targetAudience"
                  value={form.targetAudience}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TARGET_AUDIENCES.map(audience => (
                    <option key={audience} value={audience}>{audience}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., outdoor, sports, waterproof"
                />
              </div>

              {/* Pricing */}
              <div className="md:col-span-2 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                <p className="text-sm text-gray-600 mb-4">Set at least one price. You can offer multiple pricing options.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Hour
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="pricePerHour"
                    value={form.pricePerHour}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Day
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={form.pricePerDay}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Week
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="pricePerWeek"
                    value={form.pricePerWeek}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Locations */}
              <div className="md:col-span-2 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Locations</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  General Location *
                </label>
                <input
                  name="location"
                  required
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location *
                </label>
                <input
                  name="pickupLocation"
                  required
                  value={form.pickupLocation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Specific pickup address"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drop Location *
                </label>
                <input
                  name="dropLocation"
                  required
                  value={form.dropLocation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Specific drop-off address"
                />
              </div>

              {/* Images */}
              <div className="md:col-span-2 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={uploading}
                    />
                    {uploading && <p className="text-sm text-blue-600 mt-1">Uploading images...</p>}
                  </div>

                  {form.images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {form.images.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Products