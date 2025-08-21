import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Navbar from './Navbar'
import { getAllProducts } from '../lib/actions/product.actions'
import { getUserBookings } from '../lib/actions/booking.actions'
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
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { SuccessHandshake } from './HandshakeAnimation'

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

const Dashboard = () => {
  const { user } = useUser()
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly')
  const [myProducts, setMyProducts] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError('')
        const clerkId = user?.id
        const [productsData, bookingsData] = await Promise.all([
          getAllProducts({ ownerClerkId: clerkId }),
          clerkId ? getUserBookings(clerkId) : Promise.resolve([]),
        ])
        if (!cancelled) {
          setMyProducts(productsData || [])
          setBookings(bookingsData || [])
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load dashboard data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user?.id])

  const totals = useMemo(() => {
    const totalRentals = bookings.length
    const completed = bookings.filter(b => b.status === 'completed').length
    const returns = bookings.filter(b => b.returnStatus === 'completed').length
    return { totalRentals, completed, returns }
  }, [bookings])

  const chartData = useMemo(() => {
    const categoryMap = new Map()
    const productMap = new Map()
    const monthlyRevenue = new Map()
    const dailyBookings = new Map()
    
    for (const b of bookings) {
      const cat = (b.productId?.category) || 'Uncategorized'
      const title = (b.productId?.title) || 'Unknown'
      const amount = Number(b.totalPrice || 0)
      const bookingDate = new Date(b.createdAt || b.startDate)
      const monthKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`
      const dayKey = bookingDate.toISOString().split('T')[0]
      
      // Category data
      const catEntry = categoryMap.get(cat) || { name: cat, delivered: 0, revenue: 0 }
      catEntry.delivered += 1
      catEntry.revenue += amount
      categoryMap.set(cat, catEntry)
      
      // Product data
      const prodEntry = productMap.get(title) || { name: title, delivered: 0, revenue: 0 }
      prodEntry.delivered += 1
      prodEntry.revenue += amount
      productMap.set(title, prodEntry)
      
      // Monthly revenue
      const monthEntry = monthlyRevenue.get(monthKey) || 0
      monthlyRevenue.set(monthKey, monthEntry + amount)
      
      // Daily bookings
      const dayEntry = dailyBookings.get(dayKey) || 0
      dailyBookings.set(dayKey, dayEntry + 1)
    }
    
    const categories = Array.from(categoryMap.values()).sort((a, b) => b.delivered - a.delivered).slice(0, 4)
    const products = Array.from(productMap.values()).sort((a, b) => b.delivered - a.delivered).slice(0, 4)
    
    // Generate chart data for last 6 months
    const last6Months = []
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthlyRevenue.get(monthKey) || 0
      })
    }
    
    // Generate daily bookings for last 7 days
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayKey = date.toISOString().split('T')[0]
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        bookings: dailyBookings.get(dayKey) || 0
      })
    }
    
    return { categories, products, last6Months, last7Days }
  }, [bookings])

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
      .slice(0, 4)
  }, [bookings])

  // Chart configurations
  const revenueChartData = {
    labels: chartData.last6Months.map(item => item.month),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: chartData.last6Months.map(item => item.revenue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  }

  const bookingsChartData = {
    labels: chartData.last7Days.map(item => item.day),
    datasets: [
      {
        label: 'Bookings',
        data: chartData.last7Days.map(item => item.bookings),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(75, 85, 99, 0.8)',
          'rgba(75, 85, 99, 0.7)',
          'rgba(75, 85, 99, 0.6)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(75, 85, 99, 1)',
          'rgba(75, 85, 99, 1)',
          'rgba(75, 85, 99, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const categoryDoughnutData = {
    labels: chartData.categories.map(item => item.name),
    datasets: [
      {
        data: chartData.categories.map(item => item.delivered),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(75, 85, 99, 0.8)',
          'rgba(75, 85, 99, 0.6)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(75, 85, 99, 1)',
          'rgba(75, 85, 99, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#10B981',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#10B981',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    cutout: '60%',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-gray-50">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Timeframe Selection */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
            {['Yearly', 'Monthly', 'Daily'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimeframe(period.toLowerCase())}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === period.toLowerCase()
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="dashboard-overview grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-emerald-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-emerald-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">My Products</h3>
                <div className="text-4xl font-bold text-emerald-600">{myProducts.length}</div>
                <p className="text-sm text-emerald-600 mt-1">Available for rent</p>
              </div>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Rentals</h3>
                <div className="text-4xl font-bold text-gray-600">{totals.totalRentals}</div>
                <p className="text-sm text-gray-600 mt-1">Total bookings</p>
              </div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Completed</h3>
                <div className="text-4xl font-bold text-gray-700">{totals.returns}</div>
                <p className="text-sm text-gray-600 mt-1">Successful returns</p>
              </div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <SuccessHandshake width={32} height={32} showText={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          
          {/* Revenue Trends Chart */}
          <div className="xl:col-span-2 bg-gradient-to-br from-white to-emerald-50 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200">
            <div className="p-6 border-b border-emerald-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-emerald-800">Revenue Trends</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-600 font-medium">Live Data</span>
                </div>
              </div>
              <p className="text-sm text-emerald-600 mt-1">Last 6 months performance</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <Line data={revenueChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Category Distribution</h3>
              <p className="text-sm text-gray-600 mt-1">Top performing categories</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <Doughnut data={categoryDoughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Daily Bookings Chart */}
          <div className="lg:col-span-2 xl:col-span-2 bg-gradient-to-br from-white to-emerald-50 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200">
            <div className="p-6 border-b border-emerald-100">
              <h3 className="text-xl font-bold text-emerald-800">Daily Bookings</h3>
              <p className="text-sm text-emerald-600 mt-1">Last 7 days activity</p>
            </div>
            <div className="p-6">
              <div className="h-80">
                <Bar data={bookingsChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Top Products Performance */}
          <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Top Products</h3>
              <p className="text-sm text-gray-600 mt-1">Best performing items</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {chartData.products.map((item, index) => (
                  <div key={index} className="group hover:bg-gray-50 rounded-lg p-3 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{item.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">{item.delivered} rentals</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-500 group-hover:from-emerald-500 group-hover:to-emerald-700" 
                        style={{width: `${Math.min((item.delivered / Math.max(...chartData.products.map(p => p.delivered), 1)) * 100, 100)}%`}}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-600">Revenue</span>
                      <span className="text-sm font-bold text-gray-800">₹{item.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                <Link 
                  to="/orders" 
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
                >
                  View All
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentBookings.length > 0 ? recentBookings.map((bk, index) => (
                  <div key={bk._id || index} className="group hover:bg-gray-50 rounded-lg p-4 transition-all duration-200 border border-transparent hover:border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-800">{bk.productId?.title || 'Unknown product'}</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                bk.status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : bk.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {bk.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(bk.createdAt || bk.startDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-800">₹{bk.totalPrice?.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No recent bookings</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-white to-emerald-50 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200">
            <div className="p-6 border-b border-emerald-100">
              <h3 className="text-xl font-bold text-emerald-800">Quick Actions</h3>
              <p className="text-sm text-emerald-600 mt-1">Manage your rentals efficiently</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  to="/products/configure" 
                  className="group bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl p-4 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold">Add Product</span>
                  </div>
                </Link>

                <Link 
                  to="/orders" 
                  className="group bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl p-4 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold">View Orders</span>
                  </div>
                </Link>

                <Link 
                  to="/inventory" 
                  className="group bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl p-4 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold">Inventory</span>
                  </div>
                </Link>

                <Link 
                  to="/reports" 
                  className="group bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl p-4 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold">Reports</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  )
}

export default Dashboard
