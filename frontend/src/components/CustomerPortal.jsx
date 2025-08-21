import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

const CustomerPortal = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [customer] = useState({
    id: 'CUST-001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Downtown, City 12345',
    memberSince: '2024-01-15',
    totalOrders: 12,
    totalSpent: 4250
  })

  const [orders] = useState([
    {
      id: 'R-2025-001',
      date: '2025-01-10',
      status: 'active',
      items: ['Professional Camera', 'Lighting Kit'],
      total: 350,
      startDate: '2025-01-15',
      endDate: '2025-01-18',
      eventType: 'Wedding Photography'
    },
    {
      id: 'R-2024-045',
      date: '2024-12-20',
      status: 'completed',
      items: ['Sound System', 'Microphones'],
      total: 225,
      startDate: '2024-12-25',
      endDate: '2024-12-27',
      eventType: 'Corporate Event'
    },
    {
      id: 'R-2024-038',
      date: '2024-11-15',
      status: 'completed',
      items: ['Party Tent', 'Tables & Chairs'],
      total: 450,
      startDate: '2024-11-20',
      endDate: '2024-11-22',
      eventType: 'Birthday Party'
    }
  ])

  const [wishlist] = useState([
    {
      id: 1,
      name: 'Professional Camera',
      category: 'Electronics',
      dailyRate: 50,
      image: '/api/placeholder/150/150'
    },
    {
      id: 2,
      name: 'DJ Equipment',
      category: 'Audio',
      dailyRate: 90,
      image: '/api/placeholder/150/150'
    }
  ])

  const [notifications] = useState([
    {
      id: 1,
      type: 'reminder',
      title: 'Return Reminder',
      message: 'Your rental items are due for return tomorrow',
      date: '2025-01-17',
      read: false
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Confirmation',
      message: 'Payment of $350 has been processed successfully',
      date: '2025-01-10',
      read: true
    }
  ])

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {customer.name}!</h2>
        <p className="text-purple-100">Manage your rentals and discover new equipment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{customer.totalOrders}</div>
              <div className="text-sm text-navy-600">Total Orders</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">${customer.totalSpent}</div>
              <div className="text-sm text-navy-600">Total Spent</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">⭐</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">VIP</div>
              <div className="text-sm text-navy-600">Member Status</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Rentals */}
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-midnight-800 mb-4">Active Rentals</h3>
          <div className="space-y-3">
            {orders.filter(order => order.status === 'active').map((order) => (
              <div key={order.id} className="border border-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-midnight-800">{order.id}</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
                <p className="text-sm text-navy-600 mb-2">{order.items.join(', ')}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-navy-600">Return Date:</span>
                  <span className="font-medium text-midnight-800">{order.endDate}</span>
                </div>
              </div>
            ))}
            {orders.filter(order => order.status === 'active').length === 0 && (
              <p className="text-navy-600 text-center py-4">No active rentals</p>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-midnight-800 mb-4">Notifications</h3>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`border rounded-lg p-4 ${notification.read ? 'border-gray-200 bg-gray-50' : 'border-purple-200 bg-purple-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-midnight-800 mb-1">{notification.title}</h4>
                    <p className="text-sm text-navy-600 mb-2">{notification.message}</p>
                    <span className="text-xs text-navy-500">{notification.date}</span>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-midnight-800">My Orders</h3>
        <button
          onClick={() => navigate('/catalog')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Browse Products
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg border border-purple-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-midnight-800">{order.id}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
                <p className="text-navy-600">{order.eventType}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-600">${order.total}</div>
                <div className="text-sm text-navy-600">Order Date: {order.date}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-navy-700">Items:</span>
                <p className="text-navy-600">{order.items.join(', ')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-navy-700">Start Date:</span>
                <p className="text-navy-600">{order.startDate}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-navy-700">End Date:</span>
                <p className="text-navy-600">{order.endDate}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                View Details
              </button>
              {order.status === 'active' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Extend Rental
                </button>
              )}
              {order.status === 'completed' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Reorder
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderWishlist = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-midnight-800">My Wishlist</h3>
        <button
          onClick={() => navigate('/catalog')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Add More Items
        </button>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-lg border border-purple-200 p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❤️</span>
          </div>
          <h3 className="text-lg font-semibold text-midnight-800 mb-2">Your wishlist is empty</h3>
          <p className="text-navy-600 mb-4">Start adding items you're interested in renting</p>
          <button
            onClick={() => navigate('/catalog')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-purple-200 overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h4 className="font-semibold text-midnight-800 mb-2">{item.name}</h4>
                <p className="text-sm text-navy-600 mb-3">{item.category}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-purple-600">
                    ${item.dailyRate}<span className="text-sm font-normal text-navy-500">/day</span>
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    Rent Now
                  </button>
                  <button className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Profile Information</h3>
      
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Full Name</label>
            <input
              type="text"
              value={customer.name}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Email Address</label>
            <input
              type="email"
              value={customer.email}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={customer.phone}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Member Since</label>
            <input
              type="text"
              value={customer.memberSince}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              readOnly
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-navy-700 mb-2">Address</label>
            <textarea
              value={customer.address}
              rows={3}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              readOnly
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button className="px-6 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
            Edit Profile
          </button>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Change Password
          </button>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <h4 className="text-lg font-semibold text-midnight-800 mb-4">Account Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-navy-700 font-medium">Email Notifications</label>
              <p className="text-sm text-navy-500">Receive order updates via email</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded text-purple-600 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-navy-700 font-medium">SMS Notifications</label>
              <p className="text-sm text-navy-500">Receive reminders via SMS</p>
            </div>
            <input
              type="checkbox"
              className="rounded text-purple-600 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-navy-700 font-medium">Marketing Communications</label>
              <p className="text-sm text-navy-500">Receive promotional offers and updates</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded text-purple-600 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'orders':
        return renderOrders()
      case 'wishlist':
        return renderWishlist()
      case 'profile':
        return renderProfile()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200">
          {/* Header */}
          <div className="border-b border-purple-200 p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl text-purple-600 font-bold">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-midnight-800">{customer.name}</h1>
                <p className="text-navy-600">Customer ID: {customer.id}</p>
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

export default CustomerPortal
