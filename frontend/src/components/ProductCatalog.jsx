import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

const ProductCatalog = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 1000])

  // Sample product data
  const products = [
    {
      id: 1,
      name: 'Professional Camera',
      category: 'Electronics',
      price: 50,
      period: 'day',
      image: '/api/placeholder/200/200',
      rating: 4.5,
      reviews: 23,
      availability: 'available',
      description: 'High-quality DSLR camera perfect for events'
    },
    {
      id: 2,
      name: 'Sound System',
      category: 'Audio',
      price: 75,
      period: 'day',
      image: '/api/placeholder/200/200',
      rating: 4.8,
      reviews: 15,
      availability: 'available',
      description: 'Professional PA system for events'
    },
    {
      id: 3,
      name: 'Party Tent',
      category: 'Events',
      price: 120,
      period: 'day',
      image: '/api/placeholder/200/200',
      rating: 4.3,
      reviews: 8,
      availability: 'rented',
      description: 'Large outdoor tent for parties and events'
    },
    {
      id: 4,
      name: 'Projector',
      category: 'Electronics',
      price: 40,
      period: 'day',
      image: '/api/placeholder/200/200',
      rating: 4.6,
      reviews: 31,
      availability: 'available',
      description: 'HD projector for presentations and movies'
    },
    {
      id: 5,
      name: 'Tables & Chairs Set',
      category: 'Furniture',
      price: 25,
      period: 'day',
      image: '/api/placeholder/200/200',
      rating: 4.2,
      reviews: 12,
      availability: 'maintenance',
      description: 'Complete dining set for 8 people'
    },
    {
      id: 6,
      name: 'DJ Equipment',
      category: 'Audio',
      price: 90,
      period: 'day',
      image: '/api/placeholder/200/200',
      rating: 4.7,
      reviews: 19,
      availability: 'available',
      description: 'Professional DJ mixing console and speakers'
    }
  ]

  const categories = ['all', 'Electronics', 'Audio', 'Events', 'Furniture']

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  const handleAddToCart = (product) => {
    // Add to cart logic
    alert(`${product.name} added to cart!`)
  }

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'rented': return 'bg-red-100 text-red-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md border border-purple-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.availability)}`}>
              {product.availability}
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-midnight-800 mb-2">{product.name}</h3>
            <p className="text-sm text-navy-600 mb-3 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-navy-600">({product.reviews})</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-purple-600">
                ${product.price}<span className="text-sm font-normal text-navy-500">/{product.period}</span>
              </div>
              <span className="text-sm text-navy-500 bg-purple-50 px-2 py-1 rounded">
                {product.category}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewDetails(product.id)}
                className="flex-1 px-3 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm"
              >
                View Details
              </button>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.availability !== 'available'}
                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {product.availability === 'available' ? 'Add to Cart' : 'Unavailable'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-4">
      {filteredProducts.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md border border-purple-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-6">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-midnight-800">{product.name}</h3>
                  <p className="text-navy-600 mt-1">{product.description}</p>
                  
                  <div className="flex items-center mt-2">
                    <div className="flex items-center mr-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm text-navy-600">({product.reviews})</span>
                    </div>
                    
                    <span className="text-sm text-navy-500 bg-purple-50 px-2 py-1 rounded mr-4">
                      {product.category}
                    </span>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.availability)}`}>
                      {product.availability}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-purple-600 mb-3">
                    ${product.price}<span className="text-sm font-normal text-navy-500">/{product.period}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(product.id)}
                      className="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.availability !== 'available'}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      {product.availability === 'available' ? 'Add to Cart' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-midnight-800">Product Catalog</h1>
              <p className="text-navy-600 mt-1">Browse and rent equipment for your needs</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-purple-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-600'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-600'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-midnight-800 mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-navy-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-navy-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setPriceRange([0, 1000])
                }}
                className="w-full px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-navy-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-12 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-2M4 9h2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-midnight-800 mb-2">No products found</h3>
                <p className="text-navy-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              viewMode === 'grid' ? renderGridView() : renderListView()
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCatalog
