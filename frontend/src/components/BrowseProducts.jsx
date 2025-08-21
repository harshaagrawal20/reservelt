import React, { useEffect, useState, useMemo } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import RentalModal from './RentalModal'
import { useProducts, useBookings } from '../hooks/useRedux'
import { getBrowseProducts, setFilters, clearFilters } from '../app/features/productSlice'
import { createRentalRequest } from '../app/features/bookingSlice'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const BrowseProducts = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const { 
    browseProducts: productsFromState, 
    browseProductsLoading: isLoading, 
    browseProductsError: error, 
    filters,
    dispatch 
  } = useProducts()
  
  const { dispatch: bookingDispatch } = useBookings()
  
  // Ensure products is always an array and filter out user's own products
  const products = Array.isArray(productsFromState) ? productsFromState : []
  
  // UI state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [showRentalModal, setShowRentalModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  
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
      dispatch(getBrowseProducts({ clerkId: user.id }))
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

  // Helper function to get the appropriate price
  const getProductPrice = (product) => {
    if (product.pricePerHour) return product.pricePerHour
    if (product.pricePerDay) return product.pricePerDay
    if (product.pricePerWeek) return product.pricePerWeek
    return product.price || 0
  }

  // Helper function to get product name
  const getProductName = (product) => {
    return product.title || product.name || 'Unnamed Product'
  }

  // Helper function to get availability status
  const getAvailabilityStatus = (product) => {
    if (!product.availability || !Array.isArray(product.availability) || product.availability.length === 0) {
      return 'available'
    }
    
    const now = new Date()
    const hasAvailablePeriod = product.availability.some(period => {
      const endDate = new Date(period.endDate)
      return endDate >= now
    })
    
    return hasAvailablePeriod ? 'available' : 'unavailable'
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

  // Handle rent now action
  const handleRentNow = (product) => {
    setSelectedProduct(product)
    setShowRentalModal(true)
  }

  // Handle rental request submission
  const handleRentalSubmit = async (rentalData) => {
    try {
      await bookingDispatch(createRentalRequest(rentalData)).unwrap()
      alert('Rental request sent successfully! The owner will be notified.')
      setShowRentalModal(false)
      setSelectedProduct(null)
    } catch (error) {
      alert('Failed to send rental request. Please try again.')
      console.error('Rental request error:', error)
    }
  }

  // Handle view details action
  const handleViewDetails = (product) => {
    navigate(`/products/${product._id}`)
  }

  // Get unique values for filter dropdowns
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))]
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Browse Products</h1>
              <p className="text-gray-600 mt-1">Discover rental equipment from the community</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {viewMode === 'grid' ? '📋 List' : '⊞ Grid'} View
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search products..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <select
              value={localFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showAdvancedFilters ? 'Hide' : 'More'} Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Brand */}
              <select
                value={localFilters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Brands</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              {/* Target Audience */}
              <select
                value={localFilters.targetAudience}
                onChange={(e) => handleFilterChange('targetAudience', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Audiences</option>
                {TARGET_AUDIENCES.map(audience => (
                  <option key={audience} value={audience}>{audience}</option>
                ))}
              </select>

              {/* Availability */}
              <select
                value={localFilters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Items</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>

              {/* Clear Filters */}
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Failed to load products</p>
              <button
                onClick={() => dispatch(getBrowseProducts({ clerkId: user?.id }))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m6-6v2m0 4v4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more products.</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  viewMode={viewMode}
                  onRentNow={handleRentNow}
                  onViewDetails={handleViewDetails}
                  getProductPrice={getProductPrice}
                  getProductName={getProductName}
                  getAvailabilityStatus={getAvailabilityStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rental Modal */}
      <RentalModal
        product={selectedProduct}
        isOpen={showRentalModal}
        onClose={() => {
          setShowRentalModal(false)
          setSelectedProduct(null)
        }}
        onSubmit={handleRentalSubmit}
      />
    </div>
  )
}

// Product Card Component with real-time availability status
const ProductCard = ({ product, viewMode, onRentNow, onViewDetails, getProductPrice, getProductName, getAvailabilityStatus }) => {
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

  const canRent = bookingStatus?.currentStatus === 'available' || isAvailable

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
            <p className="font-medium text-gray-900">{product.brand || 'Owner'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onRentNow(product)}
            disabled={!canRent}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              canRent
                ? 'bg-purple-200 hover:bg-purple-300 text-purple-800'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canRent ? 'Rent Now' : 'Not Available'}
          </button>
          <button
            onClick={() => onViewDetails(product)}
            className="flex-1 py-2 px-4 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg font-medium transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default BrowseProducts
