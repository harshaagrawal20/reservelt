import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'
import {
  fetchAllOrders,
  updateOrderStatus,
  setOrderFilter,
  selectFilteredOrders,
  selectAdminLoading,
  selectAdminError,
  selectAdminFilters
} from '../../app/features/adminSlice'

const AdminOrderManagementRedux = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Redux selectors
  const orders = useSelector(selectFilteredOrders)
  const loading = useSelector(selectAdminLoading)
  const error = useSelector(selectAdminError)
  const filters = useSelector(selectAdminFilters)
  
  // Local state
  const [activeTab, setActiveTab] = useState('all-orders')

  useEffect(() => {
    dispatch(fetchAllOrders())
  }, [dispatch])

  // Handle filter changes
  const handleSearchChange = (value) => {
    dispatch(setOrderFilter({ search: value }))
  }

  const handleStatusChange = (value) => {
    dispatch(setOrderFilter({ status: value }))
  }

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status })).unwrap()
      alert(`Order status updated to ${status}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      overdue: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Export functions
  const exportToCSV = () => {
    const csvData = orders.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.customerName,
      'Customer Email': order.customerEmail,
      'Product Name': order.productName,
      'Duration (days)': order.duration,
      'Status': order.isOverdue ? 'Overdue' : order.status,
      'Total Price': order.totalPrice || 0,
      'Order Date': order.orderDate,
      'Return Date': order.returnDate
    }))
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = async () => {
    try {
      const { utils, writeFile } = await import('xlsx')
      
      const excelData = orders.map(order => ({
        'Order ID': order.id,
        'Customer Name': order.customerName,
        'Customer Email': order.customerEmail,
        'Product Name': order.productName,
        'Duration (days)': order.duration,
        'Status': order.isOverdue ? 'Overdue' : order.status,
        'Total Price': order.totalPrice || 0,
        'Order Date': order.orderDate,
        'Return Date': order.returnDate
      }))
      
      const ws = utils.json_to_sheet(excelData)
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Orders')
      
      writeFile(wb, `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Excel export failed. Please try CSV export instead.')
    }
  }

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      
      const doc = new jsPDF()
      
      doc.setFontSize(20)
      doc.text('Orders Report', 14, 22)
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32)
      doc.text(`Total Orders: ${orders.length}`, 14, 42)
      
      const tableData = orders.map(order => [
        order.id.slice(-8),
        order.customerName,
        order.productName,
        `${order.duration} days`,
        order.isOverdue ? 'Overdue' : order.status,
        formatCurrency(order.totalPrice || 0),
        order.orderDate
      ])
      
      autoTable(doc, {
        head: [['Order ID', 'Customer', 'Product', 'Duration', 'Status', 'Amount', 'Date']],
        body: tableData,
        startY: 50,
        theme: 'striped',
        headStyles: { fillColor: [126, 34, 206] }
      })
      
      doc.save(`orders_report_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      alert('PDF export failed. Please try CSV export instead.')
    }
  }

  const tabs = [
    { id: 'all-orders', label: 'All Orders', icon: '📋' },
    { id: 'pending', label: 'Pending', icon: '⏳' },
    { id: 'active', label: 'Active', icon: '🟢' },
    { id: 'overdue', label: 'Overdue', icon: '🔴' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ]

  const renderAllOrders = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-4">
          <h3 className="text-lg font-semibold text-midnight-800">Search & Filter Orders</h3>
          
          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Search Orders</label>
            <input
              type="text"
              value={filters.orders.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by customer, product, or order ID..."
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Status</label>
            <select
              value={filters.orders.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{orders.filter(o => o.status === 'pending').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-xl font-bold text-gray-900">{orders.filter(o => o.status === 'active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">{orders.filter(o => o.status === 'completed').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-xl font-bold text-gray-900">{orders.filter(o => o.isOverdue).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
        <div className="p-4 border-b border-purple-200">
          <h3 className="text-lg font-semibold text-midnight-800">
            Orders ({orders.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-navy-700">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-navy-700">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-navy-700">Product</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Duration</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-navy-700">Amount</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No orders found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={order.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-purple-25'} ${order.isOverdue ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-midnight-800">#{order.id.slice(-8)}</div>
                        <div className="text-sm text-navy-600">{order.orderDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-midnight-800">{order.customerName}</div>
                        <div className="text-sm text-navy-600">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {order.productImage && (
                          <img 
                            className="h-8 w-8 rounded object-cover mr-3" 
                            src={order.productImage} 
                            alt={order.productName}
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        )}
                        <div>
                          <div className="font-medium text-midnight-800">{order.productName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm">
                        <div className="font-medium">{order.duration} days</div>
                        <div className="text-navy-600">Return: {order.returnDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} ${order.isOverdue ? 'ring-2 ring-red-300' : ''}`}>
                        {order.isOverdue ? 'Overdue' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-purple-600">
                      {formatCurrency(order.totalPrice || 0)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Confirm
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'active')}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Start
                          </button>
                        )}
                        {order.status === 'active' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                            className="text-purple-600 hover:text-purple-800 text-sm"
                          >
                            Complete
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderFilteredOrders = (filterStatus) => {
    const filteredOrders = orders.filter(order => {
      if (filterStatus === 'overdue') return order.isOverdue
      return order.status === filterStatus
    })

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-midnight-800 mb-4 capitalize">
            {filterStatus} Orders ({filteredOrders.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-navy-700">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-navy-700">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-navy-700">Product</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Duration</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-navy-700">Amount</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-navy-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <p className="text-gray-500">No {filterStatus} orders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-midnight-800">#{order.id.slice(-8)}</div>
                          <div className="text-sm text-navy-600">{order.orderDate}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-midnight-800">{order.customerName}</div>
                          <div className="text-sm text-navy-600">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-midnight-800">{order.productName}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm">
                          <div className="font-medium">{order.duration} days</div>
                          <div className="text-navy-600">Return: {order.returnDate}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-purple-600">
                        {formatCurrency(order.totalPrice || 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            View
                          </button>
                          {filterStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {filterStatus === 'active' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                              className="text-purple-600 hover:text-purple-800 text-sm"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderAnalytics = () => {
    const totalRevenue = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
    
    const averageOrderValue = orders.length > 0 
      ? orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0) / orders.length 
      : 0

    const statusDistribution = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-midnight-800">Order Analytics</h3>
          
          {/* Export Buttons for Analytics */}
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h4 className="text-lg font-semibold text-midnight-800 mb-4">Revenue Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-medium">{orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-medium text-purple-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Order Value:</span>
                <span className="font-medium">{formatCurrency(averageOrderValue)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h4 className="text-lg font-semibold text-midnight-800 mb-4">Status Distribution</h4>
            <div className="space-y-3">
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{status}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h4 className="text-lg font-semibold text-midnight-800 mb-4">Recent Activity</h4>
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="text-sm">
                  <div className="font-medium">Order #{order.id.slice(-6)}</div>
                  <div className="text-gray-600">{order.orderDate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all-orders':
        return renderAllOrders()
      case 'pending':
        return renderFilteredOrders('pending')
      case 'active':
        return renderFilteredOrders('active')
      case 'overdue':
        return renderFilteredOrders('overdue')
      case 'analytics':
        return renderAnalytics()
      default:
        return renderAllOrders()
    }
  }

  if (loading.orders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error.orders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-4">{error.orders}</p>
            <button 
              onClick={() => dispatch(fetchAllOrders())} 
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
                <h1 className="text-3xl font-bold text-midnight-800">Order Management</h1>
                <p className="text-navy-600 mt-2">Track and manage rental orders</p>
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

export default AdminOrderManagementRedux
