import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'

const AdminUserManagement = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all-users')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [users, setUsers] = useState([])
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    customers: 0,
    admins: 0,
    newThisMonth: 0
  })

  // Fetch users data from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const [usersRes, ordersRes] = await Promise.all([
          fetch('http://localhost:3000/api/users'),
          fetch('http://localhost:3000/api/bookings')
        ])

        const [usersData, ordersData] = await Promise.all([
          usersRes.json(),
          ordersRes.json()
        ])

        const usersList = usersData.users || []
        const ordersList = ordersData.bookings || []

        // Calculate user statistics with orders
        const processedUsers = usersList.map(user => {
          const userOrders = ordersList.filter(order => 
            order.renterClerkId && order.renterClerkId._id === user._id
          )
          
          const totalOrders = userOrders.length
          const totalSpent = userOrders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0)

          const lastOrder = userOrders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]

          return {
            id: user._id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
            email: user.email || 'N/A',
            phone: user.phone || 'N/A',
            role: user.role || 'customer',
            status: user.isActive !== false ? 'active' : 'inactive',
            joinDate: new Date(user.createdAt).toLocaleDateString(),
            lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
            totalOrders,
            totalSpent,
            lastOrderDate: lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString() : 'No orders',
            clerkId: user.clerkId || 'N/A'
          }
        })

        setUsers(processedUsers)

        // Calculate statistics
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        const stats = {
          total: processedUsers.length,
          active: processedUsers.filter(u => u.status === 'active').length,
          inactive: processedUsers.filter(u => u.status === 'inactive').length,
          customers: processedUsers.filter(u => u.role === 'customer').length,
          admins: processedUsers.filter(u => u.role === 'admin').length,
          newThisMonth: usersList.filter(user => {
            const userDate = new Date(user.createdAt)
            return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear
          }).length
        }

        setUserStats(stats)

      } catch (error) {
        console.error('Error fetching users:', error)
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    confirmPassword: ''
  })

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleInputChange = (field, value) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateUser = () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    
    const user = {
      ...newUser,
      id: Date.now(),
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      totalOrders: 0,
      totalSpent: 0
    }
    
    setUsers(prev => [...prev, user])
    setNewUser({
      name: '', email: '', phone: '', role: 'customer', password: '', confirmPassword: ''
    })
    setActiveTab('all-users')
    alert('User created successfully!')
  }

  const handleUpdateUserStatus = (userId, newStatus) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    )
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId))
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'customer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    { id: 'all-users', label: 'All Users', icon: '👥' },
    { id: 'add-user', label: 'Add User', icon: '➕' },
    { id: 'bulk-actions', label: 'Bulk Actions', icon: '⚡' },
    { id: 'user-analytics', label: 'User Analytics', icon: '📊' }
  ]

  const renderAllUsers = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Search Users</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
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
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Export Users
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
        <div className="p-4 border-b border-purple-200">
          <h3 className="text-lg font-semibold text-midnight-800">
            Users ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-navy-700">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-navy-700">Contact</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Role</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Status</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Orders</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-navy-700">Total Spent</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-midnight-800">{user.name}</div>
                      <div className="text-sm text-navy-600">Joined: {user.joinDate}</div>
                      <div className="text-sm text-navy-500">Last login: {user.lastLogin}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-navy-700">{user.email}</div>
                      <div className="text-sm text-navy-600">{user.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-navy-700">
                    {user.totalOrders}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-purple-600">
                    ${user.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View
                      </button>
                      <button className="text-purple-600 hover:text-purple-800 text-sm">
                        Edit
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUpdateUserStatus(user.id, 'suspended')}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateUserStatus(user.id, 'active')}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderAddUser = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Add New User</h3>
      
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Email Address *</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="user@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={newUser.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Role *</label>
            <select
              value={newUser.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Password *</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Confirm Password *</label>
            <input
              type="password"
              value={newUser.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirm password"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setNewUser({
              name: '', email: '', phone: '', role: 'customer', password: '', confirmPassword: ''
            })}
            className="px-6 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleCreateUser}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  )

  const renderBulkActions = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Bulk Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Send Notifications</h4>
          <p className="text-sm text-navy-600 mb-4">Send bulk notifications to selected users</p>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Send Notifications
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Activate Users</h4>
          <p className="text-sm text-navy-600 mb-4">Activate multiple suspended users</p>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Bulk Activate
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">⛔</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Suspend Users</h4>
          <p className="text-sm text-navy-600 mb-4">Suspend multiple users at once</p>
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Bulk Suspend
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Export Data</h4>
          <p className="text-sm text-navy-600 mb-4">Export user data in various formats</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Export Users
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Update Roles</h4>
          <p className="text-sm text-navy-600 mb-4">Change roles for multiple users</p>
          <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            Update Roles
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🗑️</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Delete Users</h4>
          <p className="text-sm text-navy-600 mb-4">Permanently delete selected users</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Bulk Delete
          </button>
        </div>
      </div>
    </div>
  )

  const renderUserAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">User Analytics & Statistics</h3>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg border border-purple-200 p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-midnight-800">{userStats.total}</div>
                <div className="text-sm text-navy-600">Total Users</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-midnight-800">{userStats.active}</div>
                <div className="text-sm text-navy-600">Active Users</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🛒</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-midnight-800">{userStats.customers}</div>
                <div className="text-sm text-navy-600">Customers</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🔑</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-midnight-800">{userStats.admins}</div>
                <div className="text-sm text-navy-600">Admins</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🆕</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-midnight-800">{userStats.newThisMonth}</div>
                <div className="text-sm text-navy-600">New This Month</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderAllUsers = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
            </div>
            <h4 className="font-semibold text-midnight-800 mb-2">User Growth Chart</h4>
            <p className="text-sm text-navy-600">User registration trends over time</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-midnight-800 mb-2">User Activity</h4>
            <p className="text-sm text-navy-600">Login frequency and engagement metrics</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all-users':
        return renderAllUsers()
      case 'add-user':
        return renderAddUser()
      case 'bulk-actions':
        return renderBulkActions()
      case 'user-analytics':
        return renderUserAnalytics()
      default:
        return renderAllUsers()
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
                <h1 className="text-3xl font-bold text-midnight-800">User Management</h1>
                <p className="text-navy-600 mt-2">Manage users, roles, and permissions</p>
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

export default AdminUserManagement
