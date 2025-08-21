import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'
import {
  fetchAdminStats,
  fetchAllUsers,
  fetchAllProducts,
  fetchAllOrders,
  selectAdminStats,
  selectFilteredUsers,
  selectFilteredProducts,
  selectFilteredOrders,
  selectAdminLoading,
  selectAdminError
} from '../../app/features/adminSlice'

const AdminReports = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Redux selectors
  const stats = useSelector(selectAdminStats)
  const users = useSelector(selectFilteredUsers)
  const products = useSelector(selectFilteredProducts)
  const orders = useSelector(selectFilteredOrders)
  const loading = useSelector(selectAdminLoading)
  const error = useSelector(selectAdminError)
  
  // Local state
  const [activeReport, setActiveReport] = useState('overview')
  const [dateRange, setDateRange] = useState('30') // days
  
  useEffect(() => {
    dispatch(fetchAdminStats())
    dispatch(fetchAllUsers())
    dispatch(fetchAllProducts())
    dispatch(fetchAllOrders())
  }, [dispatch])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const calculateRevenue = () => {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
  }

  const calculatePendingRevenue = () => {
    return orders
      .filter(order => ['pending', 'confirmed', 'active'].includes(order.status))
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
  }

  const getTopProducts = () => {
    const productCounts = orders.reduce((acc, order) => {
      const productName = order.productName || 'Unknown Product'
      acc[productName] = (acc[productName] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }

  const getTopCustomers = () => {
    const customerCounts = orders.reduce((acc, order) => {
      const customerName = order.customerName || 'Unknown Customer'
      acc[customerName] = (acc[customerName] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(customerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }

  const exportReport = async (format) => {
    const reportData = {
      generatedOn: new Date().toISOString(),
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: calculateRevenue(),
      pendingRevenue: calculatePendingRevenue(),
      ordersByStatus: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {}),
      topProducts: getTopProducts(),
      topCustomers: getTopCustomers()
    }

    if (format === 'csv') {
      const csvContent = [
        'Admin Report - Generated on ' + new Date().toLocaleDateString(),
        '',
        'Summary Statistics',
        `Total Users,${reportData.totalUsers}`,
        `Total Products,${reportData.totalProducts}`,
        `Total Orders,${reportData.totalOrders}`,
        `Total Revenue,${reportData.totalRevenue}`,
        `Pending Revenue,${reportData.pendingRevenue}`,
        '',
        'Orders by Status',
        ...Object.entries(reportData.ordersByStatus).map(([status, count]) => `${status},${count}`),
        '',
        'Top Products',
        ...reportData.topProducts.map(p => `${p.name},${p.count}`),
        '',
        'Top Customers',
        ...reportData.topCustomers.map(c => `${c.name},${c.count}`)
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `admin_report_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (format === 'pdf') {
      try {
        const { jsPDF } = await import('jspdf')
        const { default: autoTable } = await import('jspdf-autotable')
        
        const doc = new jsPDF()
        
        // Header
        doc.setFontSize(20)
        doc.text('Admin Analytics Report', 14, 22)
        doc.setFontSize(12)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32)
        
        // Summary Statistics
        doc.setFontSize(16)
        doc.text('Summary Statistics', 14, 50)
        
        const summaryData = [
          ['Total Users', reportData.totalUsers],
          ['Total Products', reportData.totalProducts],
          ['Total Orders', reportData.totalOrders],
          ['Total Revenue', formatCurrency(reportData.totalRevenue)],
          ['Pending Revenue', formatCurrency(reportData.pendingRevenue)]
        ]
        
        autoTable(doc, {
          head: [['Metric', 'Value']],
          body: summaryData,
          startY: 55,
          theme: 'striped',
          headStyles: { fillColor: [126, 34, 206] }
        })
        
        // Orders by Status
        doc.text('Orders by Status', 14, doc.lastAutoTable.finalY + 20)
        
        const statusData = Object.entries(reportData.ordersByStatus).map(([status, count]) => [
          status.charAt(0).toUpperCase() + status.slice(1), count
        ])
        
        autoTable(doc, {
          head: [['Status', 'Count']],
          body: statusData,
          startY: doc.lastAutoTable.finalY + 25,
          theme: 'striped',
          headStyles: { fillColor: [126, 34, 206] }
        })
        
        doc.save(`admin_report_${new Date().toISOString().split('T')[0]}.pdf`)
      } catch (error) {
        console.error('Error generating PDF:', error)
        alert('PDF export failed. Please try CSV export instead.')
      }
    }
  }

  const reportTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'revenue', label: 'Revenue', icon: '💰' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'orders', label: 'Orders', icon: '📋' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(calculateRevenue())}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-midnight-800 mb-4">Top Products</h3>
          <div className="space-y-3">
            {getTopProducts().map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                </div>
                <span className="text-sm font-bold text-purple-600">{product.count} orders</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-midnight-800 mb-4">Top Customers</h3>
          <div className="space-y-3">
            {getTopCustomers().map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{customer.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h4 className="text-lg font-semibold text-midnight-800 mb-4">Revenue Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Orders:</span>
              <span className="font-medium text-green-600">{formatCurrency(calculateRevenue())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Revenue:</span>
              <span className="font-medium text-yellow-600">{formatCurrency(calculatePendingRevenue())}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600 font-medium">Total Potential:</span>
              <span className="font-bold text-purple-600">{formatCurrency(calculateRevenue() + calculatePendingRevenue())}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h4 className="text-lg font-semibold text-midnight-800 mb-4">Order Status</h4>
          <div className="space-y-3">
            {Object.entries(orders.reduce((acc, order) => {
              acc[order.status] = (acc[order.status] || 0) + 1
              return acc
            }, {})).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <span className="text-gray-600 capitalize">{status}:</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h4 className="text-lg font-semibold text-midnight-800 mb-4">Average Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Order Value:</span>
              <span className="font-medium">{formatCurrency(orders.length > 0 ? calculateRevenue() / orders.filter(o => o.status === 'completed').length : 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Orders per User:</span>
              <span className="font-medium">{users.length > 0 ? (orders.length / users.length).toFixed(1) : 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading.stats || loading.users || loading.products || loading.orders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
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
                <h1 className="text-3xl font-bold text-midnight-800">Admin Reports & Analytics</h1>
                <p className="text-navy-600 mt-2">Comprehensive business insights and analytics</p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Export Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => exportReport('csv')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportReport('pdf')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                  </button>
                </div>
                
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  ← Back to Admin
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-purple-200">
            <nav className="flex space-x-8 px-6">
              {reportTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveReport(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeReport === tab.id
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
            {activeReport === 'overview' && renderOverview()}
            {activeReport === 'revenue' && renderRevenue()}
            {activeReport === 'products' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Product analytics coming soon...</p>
                <button 
                  onClick={() => navigate('/admin/products')}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Go to Product Management
                </button>
              </div>
            )}
            {activeReport === 'customers' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Customer analytics coming soon...</p>
                <button 
                  onClick={() => navigate('/admin/users')}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Go to User Management
                </button>
              </div>
            )}
            {activeReport === 'orders' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Order analytics coming soon...</p>
                <button 
                  onClick={() => navigate('/admin/orders')}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Go to Order Management
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminReports
