import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from './Navbar'
import RentalForm from './RentalForm'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const ProductDetails = () => {
  const navigate = useNavigate()
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [showRentalForm, setShowRentalForm] = useState(false)

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_BASE_URL}/products/${productId}`)
        const data = await response.json()
        
        if (data.success && data.product) {
          setProduct(data.product)
        } else {
          setError('Product not found')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Failed to load product details. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const formatPrice = (price) => {
    return price ? `₹${price}` : 'N/A'
  }

  const handleRentNow = () => {
    setShowRentalForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading product details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Product</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/products')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
            <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/products')}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-purple-600"
              >
                Home
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <button 
                  onClick={() => navigate('/products')}
                  className="ml-1 text-gray-700 hover:text-purple-600 md:ml-2"
                >
                  Products
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2">{product.title}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-200">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage] || product.images[0]}
                    alt={product.title}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-100">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-purple-600' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                <p className="text-lg text-gray-600 mt-2">{product.brand}</p>
                <div className="flex items-center mt-3">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    Target: {product.targetAudience}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Pricing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {product.pricePerHour && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Per Hour</p>
                      <p className="text-xl font-bold text-purple-600">{formatPrice(product.pricePerHour)}</p>
                    </div>
                  )}
                  {product.pricePerDay && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Per Day</p>
                      <p className="text-xl font-bold text-purple-600">{formatPrice(product.pricePerDay)}</p>
                    </div>
                  )}
                  {product.pricePerWeek && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Per Week</p>
                      <p className="text-xl font-bold text-purple-600">{formatPrice(product.pricePerWeek)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-700"><strong>Location:</strong> {product.location}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700"><strong>Pickup:</strong> {product.pickupLocation}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm text-gray-700"><strong>Drop-off:</strong> {product.dropLocation}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6">
                <button
                  onClick={handleRentNow}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Rent Now
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back to Products
                </button>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="border-t border-gray-200 px-8 py-6">
            <div className="max-w-4xl mx-auto">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', name: 'Overview' },
                    { id: 'details', name: 'Details' },
                    { id: 'availability', name: 'Availability' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'overview' && (
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {product.description || 'No description available for this product.'}
                    </p>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Brand:</span>
                          <span className="text-gray-700">{product.brand}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Category:</span>
                          <span className="text-gray-700">{product.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Target Audience:</span>
                          <span className="text-gray-700">{product.targetAudience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === 'approved' ? 'bg-green-100 text-green-800' :
                            product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Created:</span>
                          <span className="text-gray-700">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Updated:</span>
                          <span className="text-gray-700">
                            {new Date(product.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'availability' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Calendar</h3>
                    {product.availability && product.availability.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-gray-600 mb-4">Available periods:</p>
                        {product.availability.map((period, index) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-green-800">
                                {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600">No specific availability periods set. Contact owner for availability.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Form Modal */}
      {showRentalForm && (
        <RentalForm
          product={product}
          onClose={() => setShowRentalForm(false)}
        />
      )}
    </div>
  )
}

export default ProductDetails
