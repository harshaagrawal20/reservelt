import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { useProducts, useBookings, useOrders, useReports } from '../hooks/useRedux'
import { getProducts } from '../app/features/productSlice'
import { getBookings } from '../app/features/bookingSlice'
import { getOrders } from '../app/features/orderSlice'
import { getDashboardStats } from '../app/features/reportSlice'

const Dashboard = () => {
  const { user } = useUser()
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly')
  
  // Redux hooks
  const { products, isLoading: productsLoading, dispatch: productDispatch } = useProducts()
  const { bookings, isLoading: bookingsLoading, dispatch: bookingDispatch } = useBookings()
  const { orders, isLoading: ordersLoading, dispatch: orderDispatch } = useOrders()
  const { dashboardStats, isLoading: statsLoading, dispatch: reportDispatch } = useReports()

  // Load dashboard data
  useEffect(() => {
    // Load products owned by current user
    if (user?.id) {
      productDispatch(getProducts({ ownerClerkId: user.id }))
      bookingDispatch(getBookings({ userClerkId: user.id }))
      orderDispatch(getOrders({ userClerkId: user.id }))
      reportDispatch(getDashboardStats({ timeframe: selectedTimeframe }))
    }
  }, [user?.id, selectedTimeframe, productDispatch, bookingDispatch, orderDispatch, reportDispatch])

  // Calculate stats from Redux state
  const stats = {
    totalProducts: products.length,
    totalBookings: bookings.length,
    totalOrders: orders.length,
    revenue: dashboardStats?.totalRevenue || 0,
    activeRentals: bookings.filter(b => b.status === 'active').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
  }

  const isLoading = productsLoading || bookingsLoading || ordersLoading || statsLoading

  // Get recent activities
  const recentBookings = bookings.slice(0, 5)
  const recentOrders = orders.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your rental business</p>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        )}

        {/* Stats Cards */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Products</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Rentals</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.activeRentals}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Bookings</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.pendingBookings}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">${stats.revenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Bookings */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
                  <Link to="/orders" className="text-blue-600 hover:text-blue-800 text-sm">
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-800">{booking.productName}</p>
                          <p className="text-sm text-gray-600">{booking.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">${booking.totalAmount}</p>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent bookings</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to="/products" 
                    className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-800">Add Product</span>
                  </Link>
                  
                  <Link 
                    to="/orders" 
                    className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-800">View Orders</span>
                  </Link>
                  
                  <Link 
                    to="/customers" 
                    className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-800">Customers</span>
                  </Link>
                  
                  <Link 
                    to="/reports" 
                    className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <svg className="w-8 h-8 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-800">Reports</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
