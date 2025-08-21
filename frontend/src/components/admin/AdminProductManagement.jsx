import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'

const AdminProductManagement = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all-products')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        // Get all products
        const productsResponse = await fetch('http://localhost:3000/api/products')
        const productsData = await productsResponse.json()
        
        // Get all orders to calculate product stats
        const ordersResponse = await fetch('http://localhost:3000/api/bookings')
        const ordersData = await ordersResponse.json()
        
        if (productsData.success && ordersData.success) {
          const orders = ordersData.bookings || []
          
          // Calculate stats for each product
          const productsWithStats = productsData.products.map(product => {
            const productOrders = orders.filter(order => 
              order.productId?._id === product._id || order.productId === product._id
            )
            const completedOrders = productOrders.filter(order => order.status === 'completed')
            
            return {
              ...product,
              id: product._id,
              sku: product.sku || `PRD-${product._id.slice(-6).toUpperCase()}`,
              stock: product.quantity || 0,
              status: product.quantity > 0 ? 'available' : 'out-of-stock',
              condition: product.condition || 'good',
              addedDate: new Date(product.createdAt).toLocaleDateString(),
              totalRentals: productOrders.length,
              revenue: completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
              image: product.images?.[0]?.url || product.imageUrl || '/api/placeholder/150/150'
            }
          })
          
          setProducts(productsWithStats)
        } else {
          setError('Failed to fetch products')
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    sku: '',
    rentalPrice: '',
    purchasePrice: '',
    stock: '',
    description: '',
    condition: 'excellent'
  })

  const categories = ['Photography', 'Audio', 'Presentation', 'Lighting', 'Events', 'Sports', 'Tools']

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleInputChange = (field, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateProduct = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProduct.name,
          category: newProduct.category,
          sku: newProduct.sku,
          rentalPrice: parseFloat(newProduct.rentalPrice),
          purchasePrice: parseFloat(newProduct.purchasePrice),
          quantity: parseInt(newProduct.stock),
          description: newProduct.description,
          condition: newProduct.condition
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh products list
        const productsResponse = await fetch('http://localhost:3000/api/products')
        const productsData = await productsResponse.json()
        
        if (productsData.success) {
          const ordersResponse = await fetch('http://localhost:3000/api/bookings')
          const ordersData = await ordersResponse.json()
          const orders = ordersData.bookings || []
          
          const productsWithStats = productsData.products.map(product => {
            const productOrders = orders.filter(order => 
              order.productId?._id === product._id || order.productId === product._id
            )
            const completedOrders = productOrders.filter(order => order.status === 'completed')
            
            return {
              ...product,
              id: product._id,
              sku: product.sku || `PRD-${product._id.slice(-6).toUpperCase()}`,
              stock: product.quantity || 0,
              status: product.quantity > 0 ? 'available' : 'out-of-stock',
              condition: product.condition || 'good',
              addedDate: new Date(product.createdAt).toLocaleDateString(),
              totalRentals: productOrders.length,
              revenue: completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
              image: product.images?.[0]?.url || product.imageUrl || '/api/placeholder/150/150'
            }
          })
          
          setProducts(productsWithStats)
        }
        
        setNewProduct({
          name: '', category: '', sku: '', rentalPrice: '', purchasePrice: '', 
          stock: '', description: '', condition: 'excellent'
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

  const handleUpdateProductStatus = async (productId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setProducts(prev => 
          prev.map(product => 
            product.id === productId ? { ...product, status: newStatus } : product
          )
        )
        alert(`Product status updated to ${newStatus}`)
      } else {
        alert('Failed to update product status')
      }
    } catch (error) {
      console.error('Error updating product status:', error)
      alert('Failed to update product status')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
          method: 'DELETE'
        })

        const data = await response.json()
        
        if (data.success) {
          setProducts(prev => prev.filter(product => product.id !== productId))
          alert('Product deleted successfully')
        } else {
          alert('Failed to delete product')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product')
      }
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'out-of-stock': return 'bg-red-100 text-red-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'rented': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionColor = (condition) => {
    switch(condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    { id: 'all-products', label: 'All Products', icon: '📦' },
    { id: 'add-product', label: 'Add Product', icon: '➕' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'inventory', label: 'Inventory', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📈' }
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or SKU..."
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="maintenance">Maintenance</option>
              <option value="rented">Rented</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Export Products
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border border-purple-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-purple-50 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-midnight-800 text-sm">{product.name}</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {product.status}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-navy-600">SKU:</span>
                  <span className="text-midnight-800 font-medium">{product.sku}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-navy-600">Category:</span>
                  <span className="text-midnight-800">{product.category}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-navy-600">Stock:</span>
                  <span className="text-midnight-800 font-medium">{product.stock}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-navy-600">Rental Price:</span>
                  <span className="text-purple-600 font-bold">${product.rentalPrice}/day</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-navy-600">Condition:</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(product.condition)}`}>
                    {product.condition}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-navy-600">Total Rentals:</span>
                  <span className="text-midnight-800">{product.totalRentals}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-navy-600">Revenue:</span>
                  <span className="text-green-600 font-medium">${product.revenue}</span>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                  View
                </button>
                <button className="flex-1 px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors">
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-midnight-800 mb-2">No products found</h3>
          <p className="text-navy-600">Try adjusting your search criteria or add new products.</p>
        </div>
      )}
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
            <label className="block text-sm font-medium text-navy-700 mb-2">SKU *</label>
            <input
              type="text"
              value={newProduct.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., CAM-001"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Category *</label>
            <select
              value={newProduct.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Condition *</label>
            <select
              value={newProduct.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Rental Price ($/day) *</label>
            <input
              type="number"
              value={newProduct.rentalPrice}
              onChange={(e) => handleInputChange('rentalPrice', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Purchase Price ($) *</label>
            <input
              type="number"
              value={newProduct.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Stock Quantity *</label>
            <input
              type="number"
              value={newProduct.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
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
              placeholder="Enter product description..."
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setNewProduct({
              name: '', category: '', sku: '', rentalPrice: '', purchasePrice: '', 
              stock: '', description: '', condition: 'excellent'
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

  const renderCategories = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Product Categories</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const categoryProducts = products.filter(p => p.category === category)
          const totalRevenue = categoryProducts.reduce((sum, p) => sum + p.revenue, 0)
          
          return (
            <div key={category} className="bg-white rounded-lg border border-purple-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-midnight-800">{category}</h4>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🏷️</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-navy-600">Products:</span>
                  <span className="font-medium text-midnight-800">{categoryProducts.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-navy-600">Total Stock:</span>
                  <span className="font-medium text-midnight-800">
                    {categoryProducts.reduce((sum, p) => sum + p.stock, 0)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-navy-600">Revenue:</span>
                  <span className="font-medium text-green-600">${totalRevenue.toLocaleString()}</span>
                </div>
              </div>
              
              <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Manage Category
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderInventory = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Inventory Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{products.length}</div>
              <div className="text-sm text-navy-600">Total Products</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{products.filter(p => p.status === 'available').length}</div>
              <div className="text-sm text-navy-600">Available</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">❌</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{products.filter(p => p.status === 'out-of-stock').length}</div>
              <div className="text-sm text-navy-600">Out of Stock</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🔧</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{products.filter(p => p.status === 'maintenance').length}</div>
              <div className="text-sm text-navy-600">Maintenance</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <h4 className="font-semibold text-midnight-800 mb-4">Low Stock Alert</h4>
        <div className="space-y-3">
          {products.filter(p => p.stock <= 2 && p.status !== 'out-of-stock').map(product => (
            <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <div className="font-medium text-midnight-800">{product.name}</div>
                <div className="text-sm text-navy-600">SKU: {product.sku}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-yellow-600">{product.stock} left</div>
                <button className="text-sm text-purple-600 hover:text-purple-800">Restock</button>
              </div>
            </div>
          ))}
          {products.filter(p => p.stock <= 2 && p.status !== 'out-of-stock').length === 0 && (
            <div className="text-center py-4 text-navy-600">No low stock items</div>
          )}
        </div>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Product Reports</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h4 className="font-semibold text-midnight-800 mb-4">Top Performing Products</h4>
          <div className="space-y-3">
            {products
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
              .map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-midnight-800">{product.name}</div>
                      <div className="text-sm text-navy-600">{product.totalRentals} rentals</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-bold">${product.revenue}</div>
                </div>
              ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h4 className="font-semibold text-midnight-800 mb-4">Product Performance</h4>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                ${products.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}
              </div>
              <div className="text-sm text-navy-600">Total Revenue</div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {products.reduce((sum, p) => sum + p.totalRentals, 0)}
              </div>
              <div className="text-sm text-navy-600">Total Rentals</div>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                ${Math.round(products.reduce((sum, p) => sum + p.revenue, 0) / products.reduce((sum, p) => sum + p.totalRentals, 0) || 0)}
              </div>
              <div className="text-sm text-navy-600">Average Revenue per Rental</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

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
      case 'reports':
        return renderReports()
      default:
        return renderAllProducts()
    }
  }

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Products</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
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

export default AdminProductManagement
