import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'
import Navbar from '../Navbar'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  
  // Dynamic state for admin data
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    activeRentals: 0,
    overduedReturns: 0,
    lowStockItems: 0,
    monthlyGrowth: 0,
    revenueGrowth: 0
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [systemAlerts, setSystemAlerts] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [adminInfo, setAdminInfo] = useState(null)
  const [chartData, setChartData] = useState({
    revenue: [],
    orders: [],
    users: [],
    categories: [],
    monthly: []
  })

  // Fetch admin dashboard data
  const fetchAdminData = async () => {
    try {
      setRefreshing(true)
      
      // Get admin session info
      const adminSession = localStorage.getItem('adminSession')
      if (adminSession) {
        setAdminInfo(JSON.parse(adminSession))
      }

      // Fetch dashboard statistics
      const [usersRes, ordersRes, productsRes, notificationsRes] = await Promise.all([
        fetch('http://localhost:3000/api/users'),
        fetch('http://localhost:3000/api/bookings'),
        fetch('http://localhost:3000/api/products'),
        fetch('http://localhost:3000/api/notifications')
      ])

      const [users, orders, products, notifications] = await Promise.all([
        usersRes.json(),
        ordersRes.json(),
        productsRes.json(),
        notificationsRes.json()
      ])

      // Calculate statistics
      const totalUsers = users.users?.length || 0
      const totalOrders = orders.bookings?.length || 0
      const totalProducts = products.products?.length || 0
      
      // Calculate revenue from completed orders
      const completedOrders = orders.bookings?.filter(order => order.status === 'completed') || []
      const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      
      // Calculate other metrics
      const pendingOrders = orders.bookings?.filter(order => order.status === 'pending')?.length || 0
      const activeRentals = orders.bookings?.filter(order => order.status === 'active')?.length || 0
      const overduedReturns = orders.bookings?.filter(order => {
        if (!order.returnDate) return false
        return new Date(order.returnDate) < new Date() && order.status === 'active'
      })?.length || 0

      // Count low stock items (products with quantity < 5)
      const lowStockItems = products.products?.filter(product => (product.quantity || 0) < 5)?.length || 0

      // Calculate growth metrics
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      const currentMonthOrders = orders.bookings?.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
      })?.length || 0

      const lastMonthOrders = orders.bookings?.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear
      })?.length || 0

      const monthlyGrowth = lastMonthOrders > 0 ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100) : 0

      setAdminStats({
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
        pendingOrders,
        activeRentals,
        overduedReturns,
        lowStockItems,
        monthlyGrowth: Math.round(monthlyGrowth),
        revenueGrowth: Math.round(monthlyGrowth * 1.2) // Approximate revenue growth
      })

      // Set recent orders (last 10 with proper formatting)
      const sortedOrders = orders.bookings
        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        ?.slice(0, 10)
        ?.map(order => ({
          id: order._id,
          customer: order.renterClerkId ? `${order.renterClerkId.firstName || ''} ${order.renterClerkId.lastName || ''}`.trim() || 'Unknown Customer' : 'Unknown Customer',
          product: order.productId?.name || 'Unknown Product',
          amount: order.totalAmount || 0,
          status: order.status,
          date: new Date(order.createdAt).toLocaleDateString(),
          startDate: order.startDate ? new Date(order.startDate).toLocaleDateString() : 'N/A',
          endDate: order.endDate ? new Date(order.endDate).toLocaleDateString() : 'N/A'
        })) || []

      setRecentOrders(sortedOrders)

      // Create system alerts based on data
      const alerts = []
      if (lowStockItems > 0) {
        alerts.push({
          id: 1,
          type: 'warning',
          title: 'Low Stock Alert',
          message: `${lowStockItems} items are running low on stock`,
          time: 'Now',
          action: 'View Products'
        })
      }
      if (overduedReturns > 0) {
        alerts.push({
          id: 2,
          type: 'error',
          title: 'Overdue Returns',
          message: `${overduedReturns} rentals are overdue for return`,
          time: 'Now',
          action: 'Manage Orders'
        })
      }
      if (pendingOrders > 0) {
        alerts.push({
          id: 3,
          type: 'info',
          title: 'Pending Orders',
          message: `${pendingOrders} orders are awaiting approval`,
          time: 'Now',
          action: 'Review Orders'
        })
      }
      
      // Add new user registrations alert (users created today)
      const today = new Date().toDateString()
      const newUsersToday = users.users?.filter(user => 
        new Date(user.createdAt).toDateString() === today
      )?.length || 0
      
      if (newUsersToday > 0) {
        alerts.push({
          id: 4,
          type: 'success',
          title: 'New Registrations',
          message: `${newUsersToday} new users registered today`,
          time: 'Today',
          action: 'View Users'
        })
      }

      setSystemAlerts(alerts)

      // Calculate top products by rental count
      const productStats = {}
      orders.bookings?.forEach(order => {
        if (order.productId && order.status !== 'cancelled') {
          const productId = order.productId._id || order.productId
          const productName = order.productId.name || 'Unknown Product'
          const amount = order.totalAmount || 0
          
          if (!productStats[productId]) {
            productStats[productId] = {
              name: productName,
              rentals: 0,
              revenue: 0,
              category: order.productId.category || 'Other'
            }
          }
          productStats[productId].rentals += 1
          productStats[productId].revenue += amount
        }
      })

      const topProductsList = Object.values(productStats)
        .sort((a, b) => b.rentals - a.rentals)
        .slice(0, 10)

      setTopProducts(topProductsList)

      // Prepare chart data
      prepareChartData(orders.bookings || [], users.users || [], products.products || [])

    } catch (error) {
      console.error('Error fetching admin data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Prepare chart data for visualizations
  const prepareChartData = (orders, users, products) => {
    // Monthly revenue and orders for the last 6 months
    const months = []
    const revenues = []
    const orderCounts = []
    const userCounts = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' })
      months.push(monthYear)

      // Revenue for this month
      const monthRevenue = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear() &&
                 order.status === 'completed'
        })
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      
      revenues.push(monthRevenue)

      // Orders for this month
      const monthOrders = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear()
        }).length

      orderCounts.push(monthOrders)

      // Users registered this month
      const monthUsers = users
        .filter(user => {
          const userDate = new Date(user.createdAt)
          return userDate.getMonth() === date.getMonth() && 
                 userDate.getFullYear() === date.getFullYear()
        }).length

      userCounts.push(monthUsers)
    }

    // Product categories distribution
    const categoryStats = {}
    products.forEach(product => {
      const category = product.category || 'Other'
      categoryStats[category] = (categoryStats[category] || 0) + 1
    })

    setChartData({
      revenue: {
        labels: months,
        data: revenues
      },
      orders: {
        labels: months,
        data: orderCounts
      },
      users: {
        labels: months,
        data: userCounts
      },
      categories: {
        labels: Object.keys(categoryStats),
        data: Object.values(categoryStats)
      },
      monthly: {
        labels: months,
        revenue: revenues,
        orders: orderCounts,
        users: userCounts
      }
    })
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAdminData()
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminSession')
    navigate('/admin-login')
  }

  // Refresh data
  const handleRefresh = () => {
    fetchAdminData()
  }

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  // Revenue Chart Data
  const revenueChartData = {
    labels: chartData.revenue?.labels || [],
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: chartData.revenue?.data || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Orders Chart Data
  const ordersChartData = {
    labels: chartData.orders?.labels || [],
    datasets: [
      {
        label: 'Monthly Orders',
        data: chartData.orders?.data || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  }

  // Users Growth Chart Data
  const usersChartData = {
    labels: chartData.users?.labels || [],
    datasets: [
      {
        label: 'New Users',
        data: chartData.users?.data || [],
        borderColor: 'rgb(220, 38, 38)',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Categories Distribution Chart Data
  const categoriesChartData = {
    labels: chartData.categories?.labels || [],
    datasets: [
      {
        label: 'Products by Category',
        data: chartData.categories?.data || [],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(220, 38, 38, 0.8)',
          'rgba(185, 28, 28, 0.8)',
          'rgba(153, 27, 27, 0.8)',
          'rgba(127, 29, 29, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(220, 38, 38)',
          'rgb(185, 28, 28)',
          'rgb(153, 27, 27)',
          'rgb(127, 29, 29)',
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Combined Performance Chart Data
  const performanceChartData = {
    labels: chartData.monthly?.labels || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: chartData.monthly?.revenue || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        yAxisID: 'y',
        type: 'line',
        tension: 0.4,
      },
      {
        label: 'Orders',
        data: chartData.monthly?.orders || [],
        backgroundColor: 'rgba(220, 38, 38, 0.7)',
        yAxisID: 'y1',
      },
    ],
  }

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (₹)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Orders Count',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Business Performance Overview',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'top',
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertColor = (type) => {
    switch(type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'orders', label: 'Order Management', icon: '📦' },
    { id: 'products', label: 'Product Management', icon: '🛍️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'system', label: 'System Settings', icon: '⚙️' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{adminStats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-navy-600">Total Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{adminStats.totalOrders.toLocaleString()}</div>
              <div className="text-sm text-navy-600">Total Orders</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">${adminStats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-navy-600">Total Revenue</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🛍️</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{adminStats.totalProducts}</div>
              <div className="text-sm text-navy-600">Total Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{adminStats.pendingOrders}</div>
              <div className="text-sm text-navy-600">Pending Orders</div>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{adminStats.activeRentals}</div>
              <div className="text-sm text-navy-600">Active Rentals</div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">🔄</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{adminStats.overduedReturns}</div>
              <div className="text-sm text-navy-600">Overdue Returns</div>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{adminStats.lowStockItems}</div>
              <div className="text-sm text-navy-600">Low Stock Items</div>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600">📉</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-midnight-800">Recent Orders</h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border border-purple-100 rounded-lg">
                <div>
                  <div className="font-medium text-midnight-800">{order.id}</div>
                  <div className="text-sm text-navy-600">{order.customer}</div>
                  <div className="text-xs text-navy-500">{order.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">${order.amount}</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-midnight-800 mb-4">System Alerts</h3>
          
          <div className="space-y-3">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{alert.title}</h4>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <span className="text-xs opacity-75">{alert.time}</span>
                  </div>
                  <button className="text-sm font-medium ml-3">
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <h3 className="text-lg font-semibold text-midnight-800 mb-4">Top Performing Products</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-100">
                <th className="text-left py-3 font-medium text-navy-700">Product Name</th>
                <th className="text-center py-3 font-medium text-navy-700">Total Rentals</th>
                <th className="text-right py-3 font-medium text-navy-700">Revenue</th>
                <th className="text-center py-3 font-medium text-navy-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index} className="border-b border-purple-50">
                  <td className="py-3 text-midnight-800">{product.name}</td>
                  <td className="py-3 text-center text-navy-600">{product.rentals}</td>
                  <td className="py-3 text-right font-medium text-purple-600">${product.revenue.toLocaleString()}</td>
                  <td className="py-3 text-center">
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-midnight-800">User Management</h3>
        <button
          onClick={() => navigate('/admin/users')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Manage Users
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">1,234</div>
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
              <div className="text-2xl font-bold text-midnight-800">1,180</div>
              <div className="text-sm text-navy-600">Active Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">⏰</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">54</div>
              <div className="text-sm text-navy-600">Pending Approval</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <h4 className="font-semibold text-midnight-800 mb-4">Recent User Activity</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">John Smith registered</div>
              <div className="text-sm text-navy-600">2 minutes ago</div>
            </div>
            <button className="text-purple-600 hover:text-purple-800 text-sm">View</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">Sarah Wilson updated profile</div>
              <div className="text-sm text-navy-600">15 minutes ago</div>
            </div>
            <button className="text-purple-600 hover:text-purple-800 text-sm">View</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">Mike Johnson account suspended</div>
              <div className="text-sm text-navy-600">1 hour ago</div>
            </div>
            <button className="text-purple-600 hover:text-purple-800 text-sm">View</button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-midnight-800">Order Management</h3>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
            Export
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Bulk Actions
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-purple-200 p-12 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-semibold text-midnight-800 mb-2">Order Management</h3>
        <p className="text-navy-600">Advanced order management and tracking interface would be displayed here</p>
      </div>
    </div>
  )

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-midnight-800">Product Management</h3>
        <button
          onClick={() => navigate('/admin/products')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Manage Products
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">456</div>
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
              <div className="text-2xl font-bold text-midnight-800">389</div>
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
              <div className="text-2xl font-bold text-midnight-800">23</div>
              <div className="text-sm text-navy-600">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <h4 className="font-semibold text-midnight-800 mb-4">Top Performing Products</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">Professional Camera Kit</div>
              <div className="text-sm text-navy-600">45 rentals this month</div>
            </div>
            <div className="text-green-600 font-bold">$2,250</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">Sound System Package</div>
              <div className="text-sm text-navy-600">38 rentals this month</div>
            </div>
            <div className="text-green-600 font-bold">$2,850</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="font-medium text-midnight-800">Party Tent Large</div>
              <div className="text-sm text-navy-600">32 rentals this month</div>
            </div>
            <div className="text-green-600 font-bold">$3,840</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-midnight-800">Analytics & Reports</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h4 className="font-semibold text-midnight-800 mb-2">Revenue Analytics</h4>
            <p className="text-sm text-navy-600">Revenue trends and forecasting charts</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h4 className="font-semibold text-midnight-800 mb-2">Usage Statistics</h4>
            <p className="text-sm text-navy-600">Product usage and customer behavior data</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-midnight-800 mb-2">Performance Metrics</h4>
            <p className="text-sm text-navy-600">KPI tracking and performance indicators</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h4 className="font-semibold text-midnight-800 mb-2">Custom Reports</h4>
            <p className="text-sm text-navy-600">Generate custom reports and exports</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystem = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-midnight-800">System Settings</h3>
        <button
          onClick={() => navigate('/settings')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Global Settings
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Security Settings</h4>
          <p className="text-sm text-navy-600 mb-4">Manage authentication, permissions, and access controls</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Configure →
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔔</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Notifications</h4>
          <p className="text-sm text-navy-600 mb-4">Configure email, SMS, and in-app notifications</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Configure →
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Integrations</h4>
          <p className="text-sm text-navy-600 mb-4">Manage third-party integrations and APIs</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Configure →
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🗄️</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Database</h4>
          <p className="text-sm text-navy-600 mb-4">Database backup, maintenance, and optimization</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Manage →
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Performance</h4>
          <p className="text-sm text-navy-600 mb-4">System performance monitoring and optimization</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Monitor →
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔧</span>
          </div>
          <h4 className="font-semibold text-midnight-800 mb-2">Maintenance</h4>
          <p className="text-sm text-navy-600 mb-4">System maintenance and update management</p>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Schedule →
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'users':
        return renderUsers()
      case 'orders':
        return renderOrders()
      case 'products':
        return renderProducts()
      case 'analytics':
        return renderAnalytics()
      case 'system':
        return renderSystem()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <p className="text-red-100">
                  Welcome back, {adminInfo?.firstName || 'Administrator'}! 
                  <span className="ml-2 text-sm">({adminInfo?.email})</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right text-white">
                <p className="text-sm text-red-100">Session Active</p>
                <p className="text-xs text-red-200">
                  Since {adminInfo?.loginTime ? new Date(adminInfo.loginTime).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors border border-white/30"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200">
          {/* Header */}
          <div className="border-b border-purple-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-midnight-800">Admin Dashboard</h1>
                <p className="text-navy-600 mt-2">Comprehensive system administration and management</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-navy-600">Last Updated</div>
                  <div className="font-medium text-midnight-800">{new Date().toLocaleString()}</div>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-purple-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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

export default AdminDashboard
