import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import {
  fetchAllUsers,
  updateUserStatus,
  deleteUser,
  setUserFilter,
  selectFilteredUsers,
  selectAdminLoading,
  selectAdminError,
  selectAdminFilters
} from '../../app/features/adminSlice'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const AdminUserManagement = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Redux selectors
  const users = useSelector(selectFilteredUsers)
  const loading = useSelector(selectAdminLoading)
  const error = useSelector(selectAdminError)
  const filters = useSelector(selectAdminFilters)
  
  // Local state
  const [activeTab, setActiveTab] = useState('all-users')
  const [exporting, setExporting] = useState(false)
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    userGrowth: 0
  })

  // Export functions
  const exportToCSV = () => {
    setExporting(true)
    try {
      const csvData = users.map(user => ({
        'Name': user.firstName + ' ' + user.lastName || user.username,
        'Email': user.email,
        'Role': user.role,
        'Status': user.status,
        'Join Date': user.joinDate,
        'Last Login': user.lastLogin,
        'Total Orders': user.totalOrders,
        'Total Spent': user.totalSpent,
        'Phone': user.phone || 'N/A'
      }))

      const ws = XLSX.utils.json_to_sheet(csvData)
      const csv = XLSX.utils.sheet_to_csv(ws)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, `users_export_${new Date().toISOString().split('T')[0]}.csv`)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV')
    } finally {
      setExporting(false)
    }
  }

  const exportToExcel = () => {
    setExporting(true)
    try {
      const wsData = users.map(user => ({
        'Name': user.firstName + ' ' + user.lastName || user.username,
        'Email': user.email,
        'Role': user.role,
        'Status': user.status,
        'Join Date': user.joinDate,
        'Last Login': user.lastLogin,
        'Total Orders': user.totalOrders,
        'Total Spent': `₹${user.totalSpent}`,
        'Phone': user.phone || 'N/A',
        'Created At': new Date(user.createdAt).toLocaleDateString()
      }))

      const ws = XLSX.utils.json_to_sheet(wsData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Users')
      
      // Add analytics sheet
      const analyticsData = [
        ['Metric', 'Value'],
        ['Total Users', analytics.totalUsers],
        ['Active Users', analytics.activeUsers],
        ['Total Revenue', `₹${analytics.totalRevenue}`],
        ['Average Order Value', `₹${analytics.averageOrderValue}`],
        ['User Growth', `${analytics.userGrowth}%`]
      ]
      const analyticsWs = XLSX.utils.aoa_to_sheet(analyticsData)
      XLSX.utils.book_append_sheet(wb, analyticsWs, 'Analytics')

      XLSX.writeFile(wb, `users_report_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Failed to export Excel')
    } finally {
      setExporting(false)
    }
  }

  const exportToPDF = () => {
    setExporting(true)
    try {
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text('User Management Report', 20, 20)
      
      // Add date
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)
      
      // Add analytics summary
      doc.setFontSize(14)
      doc.text('Summary Analytics', 20, 45)
      doc.setFontSize(10)
      doc.text(`Total Users: ${analytics.totalUsers}`, 20, 55)
      doc.text(`Active Users: ${analytics.activeUsers}`, 20, 65)
      doc.text(`Total Revenue: ₹${analytics.totalRevenue}`, 20, 75)
      doc.text(`Average Order Value: ₹${analytics.averageOrderValue}`, 20, 85)
      
      // Add user table
      const tableColumns = ['Name', 'Email', 'Role', 'Status', 'Orders', 'Spent']
      const tableRows = users.map(user => [
        user.firstName + ' ' + user.lastName || user.username,
        user.email,
        user.role,
        user.status,
        user.totalOrders,
        `₹${user.totalSpent}`
      ])

      doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: 95,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [139, 69, 19] }
      })

      doc.save(`users_report_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF')
    } finally {
      setExporting(false)
    }
  }

  // Fetch users using Redux
  useEffect(() => {
    dispatch(fetchAllUsers())
  }, [dispatch])

  // Calculate analytics when users change
  useEffect(() => {
    if (users.length > 0) {
      const activeUsers = users.filter(user => user.status === 'active').length
      const totalRevenue = users.reduce((sum, user) => sum + user.totalSpent, 0)
      const totalOrders = users.reduce((sum, user) => sum + user.totalOrders, 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      
      // Calculate user growth (simplified - comparing this month vs last month)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const thisMonthUsers = users.filter(user => {
        const userDate = new Date(user.createdAt)
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear
      }).length
      
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
      const lastMonthUsers = users.filter(user => {
        const userDate = new Date(user.createdAt)
        return userDate.getMonth() === lastMonth && userDate.getFullYear() === lastMonthYear
      }).length
      
      const userGrowth = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100) : 0
      
      setAnalytics({
        totalUsers: users.length,
        activeUsers,
        totalRevenue: totalRevenue.toFixed(2),
        averageOrderValue: averageOrderValue.toFixed(2),
        userGrowth: userGrowth.toFixed(1)
      })
    }
  }, [users])

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    confirmPassword: ''
  })

  // Handle filter changes
  const handleSearchChange = (value) => {
    dispatch(setUserFilter({ search: value }))
  }

  const handleRoleChange = (value) => {
    dispatch(setUserFilter({ role: value }))
  }

  const handleStatusChange = (value) => {
    dispatch(setUserFilter({ status: value }))
  }

  const handleInputChange = (field, value) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          password: newUser.password,
          role: newUser.role
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh users list using Redux
        dispatch(fetchAllUsers())
        
        setNewUser({
          name: '', email: '', phone: '', role: 'customer', password: '', confirmPassword: ''
        })
        setActiveTab('all-users')
        alert('User created successfully!')
      } else {
        alert(data.message || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user')
    }
  }

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await dispatch(updateUserStatus({ 
        userId, 
        isActive: newStatus === 'active' 
      })).unwrap()
      alert(`User status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap()
        alert('User deleted successfully')
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
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
              value={filters.users.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Role</label>
            <select
              value={filters.users.role}
              onChange={(e) => handleRoleChange(e.target.value)}
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
              value={filters.users.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        
        {/* Export Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button 
            onClick={exportToCSV}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          
          <button 
            onClick={exportToExcel}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
          </button>
          
          <button 
            onClick={exportToPDF}
            disabled={exporting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>{exporting ? 'Exporting...' : 'Export PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-purple-200 p-4">
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
              <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
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
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.activeUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-4">
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
              <p className="text-2xl font-bold text-gray-900">₹{analytics.totalRevenue}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{analytics.averageOrderValue}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.userGrowth}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
        <div className="p-4 border-b border-purple-200">
          <h3 className="text-lg font-semibold text-midnight-800">
            Users ({users.length})
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No users found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-midnight-800">{user.name || user.username}</div>
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
                    ₹{user.totalSpent.toLocaleString()}
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
                ))
              )}
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
      <h3 className="text-xl font-semibold text-midnight-800">User Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{users.length}</div>
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
              <div className="text-2xl font-bold text-midnight-800">{users.filter(u => u.status === 'active').length}</div>
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
              <div className="text-2xl font-bold text-midnight-800">{users.filter(u => u.role === 'customer').length}</div>
              <div className="text-sm text-navy-600">Customers</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-midnight-800">{users.filter(u => u.status === 'suspended').length}</div>
              <div className="text-sm text-navy-600">Suspended</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-purple-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
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

  if (loading.users) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error.users) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Users</h2>
            <p className="text-gray-600 mb-4">{error.users}</p>
            <button 
              onClick={() => dispatch(fetchAllUsers())} 
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
