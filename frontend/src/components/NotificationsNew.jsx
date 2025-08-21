import React, { useEffect, useState, useMemo } from 'react'
import { useUser } from '@clerk/clerk-react'
import Navbar from './Navbar'
import { useNotifications } from '../hooks/useRedux'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '../app/features/notificationSlice'

const Notifications = () => {
  const { user } = useUser()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    totalNotifications,
    currentPage,
    totalPages,
    dispatch 
  } = useNotifications()

  // Local state for UI controls
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: '7days'
  })
  const [selectedNotifications, setSelectedNotifications] = useState(new Set())
  const [showDetails, setShowDetails] = useState(null)
  const [sortBy, setSortBy] = useState('newest')

  // Load notifications on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadNotifications()
      // Set up periodic refresh for real-time updates
      const interval = setInterval(() => {
        loadNotifications(false) // Silent refresh
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [user?.id, filters, currentPage, sortBy])

  // Load notifications with current filters
  const loadNotifications = async (showLoading = true) => {
    if (!user?.id) return

    const params = {
      userClerkId: user.id,
      page: currentPage,
      limit: 20,
      ...(filters.type !== 'all' && { type: filters.type }),
      ...(filters.status !== 'all' && { isRead: filters.status === 'read' }),
    }

    // Add date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const daysAgo = parseInt(filters.dateRange.replace('days', ''))
      const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
      params.startDate = startDate.toISOString()
    }

    try {
      await dispatch(getNotifications(params)).unwrap()
      if (showLoading) {
        await dispatch(getUnreadCount(user.id)).unwrap()
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  // Handle notification actions
  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markAsRead(notificationId)).unwrap()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap()
      await dispatch(getUnreadCount(user.id)).unwrap()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await dispatch(deleteNotification(notificationId)).unwrap()
      } catch (error) {
        console.error('Failed to delete notification:', error)
      }
    }
  }

  const handleBulkAction = async (action) => {
    const selectedIds = Array.from(selectedNotifications)
    if (selectedIds.length === 0) return

    try {
      if (action === 'markRead') {
        await Promise.all(selectedIds.map(id => dispatch(markAsRead(id))))
      } else if (action === 'delete') {
        if (window.confirm(`Delete ${selectedIds.length} notifications?`)) {
          await Promise.all(selectedIds.map(id => dispatch(deleteNotification(id))))
        }
      }
      setSelectedNotifications(new Set())
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }

  // Filter and sort notifications
  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = [...notifications]

    // Sort notifications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1)
        case 'unread':
          return b.isRead === a.isRead ? 0 : a.isRead ? 1 : -1
        default:
          return 0
      }
    })

    return filtered
  }, [notifications, sortBy])

  // Get notification icon and color based on type
  const getNotificationStyle = (type, isRead) => {
    const styles = {
      rental_request: { icon: '🏠', color: 'blue', bgColor: 'bg-blue-50' },
      payment: { icon: '💳', color: 'green', bgColor: 'bg-green-50' },
      pickup_scheduled: { icon: '📅', color: 'orange', bgColor: 'bg-orange-50' },
      drop_scheduled: { icon: '📍', color: 'purple', bgColor: 'bg-purple-50' },
      reminder: { icon: '⏰', color: 'yellow', bgColor: 'bg-yellow-50' },
      system: { icon: '⚙️', color: 'gray', bgColor: 'bg-gray-50' },
      promotion: { icon: '🎉', color: 'pink', bgColor: 'bg-pink-50' },
      payment_confirmation: { icon: '✅', color: 'green', bgColor: 'bg-green-50' },
      due_payment: { icon: '⚠️', color: 'red', bgColor: 'bg-red-50' },
      default: { icon: '📬', color: 'gray', bgColor: 'bg-gray-50' }
    }

    const style = styles[type] || styles.default
    return {
      ...style,
      opacity: isRead ? 'opacity-60' : 'opacity-100'
    }
  }

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffMs = now - new Date(date)
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
              <p className="text-gray-600 mt-1">
                Stay updated with your rentals, payments, and schedules
              </p>
              {unreadCount > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={() => loadNotifications(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? '🔄' : '🔄'} Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="rental_request">Rental Requests</option>
                <option value="payment">Payments</option>
                <option value="pickup_scheduled">Pickup Scheduled</option>
                <option value="drop_scheduled">Drop Scheduled</option>
                <option value="reminder">Reminders</option>
                <option value="due_payment">Due Payments</option>
                <option value="system">System</option>
                <option value="promotion">Promotions</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="1days">Last 24 hours</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="unread">Unread First</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.size > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('markRead')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedNotifications(new Set())}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            Showing {filteredAndSortedNotifications.length} of {totalNotifications} notifications
          </p>
          {filteredAndSortedNotifications.length > 0 && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedNotifications.size === filteredAndSortedNotifications.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedNotifications(new Set(filteredAndSortedNotifications.map(n => n._id)))
                  } else {
                    setSelectedNotifications(new Set())
                  }
                }}
                className="rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600 text-lg">Loading notifications...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <div>
                <h3 className="font-medium">Error Loading Notifications</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {filteredAndSortedNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                isSelected={selectedNotifications.has(notification._id)}
                onSelect={(selected) => {
                  const newSelected = new Set(selectedNotifications)
                  if (selected) {
                    newSelected.add(notification._id)
                  } else {
                    newSelected.delete(notification._id)
                  }
                  setSelectedNotifications(newSelected)
                }}
                onMarkAsRead={() => handleMarkAsRead(notification._id)}
                onDelete={() => handleDeleteNotification(notification._id)}
                onShowDetails={() => setShowDetails(notification)}
                formatTimeAgo={formatTimeAgo}
                getNotificationStyle={getNotificationStyle}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredAndSortedNotifications.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📬</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {totalNotifications === 0 ? 'No notifications yet' : 'No notifications found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {totalNotifications === 0 
                  ? "You'll receive notifications about your rentals, payments, and schedules here."
                  : "Try adjusting your filters to find the notifications you're looking for."
                }
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                const page = currentPage <= 3 ? index + 1 : currentPage - 2 + index
                if (page > totalPages) return null
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {showDetails && (
        <NotificationDetailsModal
          notification={showDetails}
          onClose={() => setShowDetails(null)}
          onMarkAsRead={() => handleMarkAsRead(showDetails._id)}
          onDelete={() => {
            handleDeleteNotification(showDetails._id)
            setShowDetails(null)
          }}
          formatTimeAgo={formatTimeAgo}
          getNotificationStyle={getNotificationStyle}
        />
      )}
    </div>
  )
}

// Notification Card Component
const NotificationCard = ({ 
  notification, 
  isSelected, 
  onSelect, 
  onMarkAsRead, 
  onDelete, 
  onShowDetails,
  formatTimeAgo,
  getNotificationStyle 
}) => {
  const style = getNotificationStyle(notification.type, notification.isRead)
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 border-${style.color}-500 hover:shadow-md transition-shadow ${style.opacity}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Selection Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="mt-1 rounded border-gray-300 focus:ring-blue-500"
            />
            
            {/* Notification Icon */}
            <div className={`w-10 h-10 rounded-full ${style.bgColor} flex items-center justify-center text-lg`}>
              {style.icon}
            </div>
            
            {/* Notification Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                  {getNotificationTitle(notification)}
                </p>
                <div className="flex items-center space-x-2">
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
              </div>
              
              <p className={`mt-1 text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                {notification.message}
              </p>
              
              {/* Metadata Display */}
              {notification.metadata && (
                <div className="mt-2 text-xs text-gray-500">
                  {renderNotificationMetadata(notification)}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-3 flex items-center space-x-3">
                <button
                  onClick={onShowDetails}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details
                </button>
                
                {!notification.isRead && (
                  <button
                    onClick={onMarkAsRead}
                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                  >
                    Mark as Read
                  </button>
                )}
                
                <button
                  onClick={onDelete}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
                
                {renderNotificationActions(notification)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Notification Details Modal Component
const NotificationDetailsModal = ({ 
  notification, 
  onClose, 
  onMarkAsRead, 
  onDelete,
  formatTimeAgo,
  getNotificationStyle 
}) => {
  const style = getNotificationStyle(notification.type, notification.isRead)
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full ${style.bgColor} flex items-center justify-center text-xl`}>
              {style.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{getNotificationTitle(notification)}</h2>
              <p className="text-sm text-gray-500">{formatTimeAgo(notification.createdAt)}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Message</h3>
              <p className="text-gray-700">{notification.message}</p>
            </div>
            
            {notification.metadata && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Additional Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {renderDetailedMetadata(notification)}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <span className="ml-2 capitalize">{notification.type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`ml-2 ${notification.isRead ? 'text-gray-500' : 'text-blue-600 font-medium'}`}>
                  {notification.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <span className="ml-2">{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
              {notification.relatedType && (
                <div>
                  <span className="font-medium text-gray-600">Related:</span>
                  <span className="ml-2 capitalize">{notification.relatedType}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {!notification.isRead && (
            <button
              onClick={() => {
                onMarkAsRead()
                onClose()
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Mark as Read
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper Functions
const getNotificationTitle = (notification) => {
  const titles = {
    rental_request: 'New Rental Request',
    payment: 'Payment Notification',
    pickup_scheduled: 'Pickup Scheduled',
    drop_scheduled: 'Drop-off Scheduled',
    reminder: 'Reminder',
    system: 'System Notification',
    promotion: 'Special Offer',
    payment_confirmation: 'Payment Confirmed',
    due_payment: 'Payment Due'
  }
  return titles[notification.type] || 'Notification'
}

const renderNotificationMetadata = (notification) => {
  if (!notification.metadata) return null
  
  const { metadata } = notification
  
  switch (notification.type) {
    case 'pickup_scheduled':
    case 'drop_scheduled':
      return (
        <span>
          📍 {metadata.location} • 📅 {metadata.scheduledDate ? new Date(metadata.scheduledDate).toLocaleDateString() : 'Date TBD'}
        </span>
      )
    case 'payment':
    case 'payment_confirmation':
    case 'due_payment':
      return (
        <span>
          💰 ${metadata.amount} • {metadata.method || 'Payment method not specified'}
        </span>
      )
    case 'rental_request':
      return (
        <span>
          🏠 {metadata.productTitle} • 📅 {metadata.duration || 'Duration not specified'}
        </span>
      )
    default:
      return null
  }
}

const renderDetailedMetadata = (notification) => {
  if (!notification.metadata) return <p className="text-gray-500">No additional details available.</p>
  
  const { metadata } = notification
  
  return (
    <dl className="grid grid-cols-1 gap-2">
      {Object.entries(metadata).map(([key, value]) => (
        <div key={key} className="flex justify-between">
          <dt className="font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</dt>
          <dd className="text-gray-900">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

const renderNotificationActions = (notification) => {
  // Add specific action buttons based on notification type
  switch (notification.type) {
    case 'rental_request':
      return (
        <>
          <button className="text-xs text-green-600 hover:text-green-800 font-medium">
            Accept
          </button>
          <button className="text-xs text-red-600 hover:text-red-800 font-medium">
            Decline
          </button>
        </>
      )
    case 'due_payment':
      return (
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          Pay Now
        </button>
      )
    default:
      return null
  }
}

export default Notifications
