import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'
import {
  fetchAdminStats,
  selectAdminStats,
  selectAdminCharts,
  selectRecentActivity,
  selectAdminLoading,
  selectAdminError
} from '../../app/features/adminSlice'

const AdminDashboardRedux = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const stats = useSelector(selectAdminStats)
  const charts = useSelector(selectAdminCharts)
  const recentActivity = useSelector(selectRecentActivity)
  const loading = useSelector(selectAdminLoading)
  const error = useSelector(selectAdminError)
  
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    dispatch(fetchAdminStats())
  }, [dispatch])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      overdue: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'users':
        navigate('/admin/users')
        break
      case 'products':
        navigate('/admin/products')
        break
      case 'orders':
        navigate('/admin/orders')
        break
      case 'reports':
        // Navigate to admin reports page
        navigate('/admin/reports')
        break
      default:
        break
    }
  }

  if (loading.stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error.stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error.stats}</p>
            <button 
              onClick={() => dispatch(fetchAdminStats())} 
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'recent', label: 'Recent Activity', icon: '🕒' },
    { id: 'quick-actions', label: 'Quick Actions', icon: '⚡' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
              <p className="text-sm text-green-600">+{stats.activeUsers} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalOrders)}</p>
              <p className="text-sm text-yellow-600">{stats.pendingOrders} pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-green-600">+{stats.completedOrders} completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalProducts)}</p>
              <p className="text-sm text-red-600">{stats.lowStockItems} low stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Active Rentals</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.activeRentals}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Pending Orders</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Overdue Returns</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.overduedReturns}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Completed Orders</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.completedOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          <div className="space-y-3">
            {stats.overduedReturns > 0 && (
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {stats.overduedReturns} overdue returns need attention
                  </p>
                </div>
              </div>
            )}
            
            {stats.lowStockItems > 0 && (
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">
                    {stats.lowStockItems} products have low stock
                  </p>
                </div>
              </div>
            )}

            {stats.pendingOrders > 0 && (
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    {stats.pendingOrders} orders waiting for approval
                  </p>
                </div>
              </div>
            )}

            {stats.overduedReturns === 0 && stats.lowStockItems === 0 && stats.pendingOrders === 0 && (
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    All systems operating normally
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends (Last 12 Months)</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {charts.revenueByMonth.map((month, index) => {
            const maxRevenue = Math.max(...charts.revenueByMonth.map(m => m.revenue))
            const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 200 : 0
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="bg-purple-600 rounded-t-sm w-8 min-h-[4px] transition-all duration-300 hover:bg-purple-700"
                  style={{ height: `${height}px` }}
                  title={`${month.month}: ${formatCurrency(month.revenue)}`}
                ></div>
                <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                  {month.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
          <div className="space-y-3">
            {Object.entries(charts.productCategories).map(([category, count]) => {
              const totalProducts = Object.values(charts.productCategories).reduce((sum, c) => sum + c, 0)
              const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0
              
              return (
                <div key={category} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(charts.ordersByStatus).map(([status, count]) => {
              const totalOrders = Object.values(charts.ordersByStatus).reduce((sum, c) => sum + c, 0)
              const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0
              const colors = {
                pending: 'bg-yellow-500',
                active: 'bg-blue-500',
                completed: 'bg-green-500',
                cancelled: 'bg-red-500'
              }
              
              return (
                <div key={status} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors[status] || 'bg-gray-500'} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  const renderRecentActivity = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {recentActivity.recentOrders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Order #{order._id.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.totalPrice || 0)}
                  </p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {recentActivity.recentOrders.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-4">
            {recentActivity.recentUsers.slice(0, 5).map((user) => (
              <div key={user._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.username || 'Unknown User'
                    }
                  </p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.recentUsers.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent users</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderQuickActions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => handleQuickAction('users')}
          className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h4>
          <p className="text-sm text-gray-600">View, edit, and manage user accounts</p>
        </button>

        <button
          onClick={() => handleQuickAction('products')}
          className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Manage Products</h4>
          <p className="text-sm text-gray-600">Add, edit, and manage inventory</p>
        </button>

        <button
          onClick={() => handleQuickAction('orders')}
          className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Manage Orders</h4>
          <p className="text-sm text-gray-600">Track and manage rental orders</p>
        </button>

        <button
          onClick={() => handleQuickAction('reports')}
          className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">View Reports</h4>
          <p className="text-sm text-gray-600">Generate and view analytics reports</p>
        </button>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'analytics':
        return renderAnalytics()
      case 'recent':
        return renderRecentActivity()
      case 'quick-actions':
        return renderQuickActions()
      default:
        return renderOverview()
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
                <h1 className="text-3xl font-bold text-midnight-800">Admin Dashboard</h1>
                <p className="text-navy-600 mt-2">Monitor and manage your rental business</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => dispatch(fetchAdminStats())}
                  className="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
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

export default AdminDashboardRedux
