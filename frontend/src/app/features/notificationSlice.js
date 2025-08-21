import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Helper function for API calls
const makeApiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`)
  }

  return data
}

// Notification Async Thunks
export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/notifications?${queryString}` : '/notifications'
      const data = await makeApiCall(url)
      return {
        notifications: data.notifications || data,
        pagination: data.pagination || null,
        unreadCount: data.unreadCount || 0
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (userClerkId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/notifications/unread-count?userClerkId=${userClerkId}`)
      return data.count || 0
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getNotificationById = createAsyncThunk(
  'notifications/getNotificationById',
  async (notificationId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/notifications/${notificationId}`)
      return data.notification || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notificationData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      })
      return data.notification || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
      })
      return data.notification || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/notifications/mark-all-read', {
        method: 'PATCH',
      })
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await makeApiCall(`/notifications/${notificationId}`, {
        method: 'DELETE',
      })
      return notificationId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await makeApiCall('/notifications', {
        method: 'DELETE',
      })
      return true
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getUserNotifications = createAsyncThunk(
  'notifications/getUserNotifications',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/notifications/user/${userId}`)
      return data.notifications || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// export const getUnreadCount = createAsyncThunk(
//   'notifications/getUnreadCount',
//   async (_, { rejectWithValue }) => {
//     try {
//       const data = await makeApiCall('/notifications/unread-count')
//       return data.count || 0
//     } catch (error) {
//       return rejectWithValue(error.message)
//     }
//   }
// )

// Initial state
const initialState = {
  notifications: [],
  selectedNotification: null,
  unreadCount: 0,
  isLoading: false,
  error: null,
  totalNotifications: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {
    isRead: '',
    type: '',
    priority: '',
    dateRange: { start: '', end: '' },
  }
}

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedNotification: (state) => {
      state.selectedNotification = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        isRead: '',
        type: '',
        priority: '',
        dateRange: { start: '', end: '' },
      }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Notifications
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = action.payload.notifications || action.payload
        state.unreadCount = action.payload.unreadCount || 0
        if (action.payload.pagination) {
          state.totalNotifications = action.payload.pagination.total
          state.currentPage = action.payload.pagination.page
          state.totalPages = action.payload.pagination.pages
        }
        state.error = null
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Unread Count
      .addCase(getUnreadCount.pending, (state) => {
        state.error = null
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
        state.error = null
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.error = action.payload
      })

      // Get Notification by ID
      .addCase(getNotificationById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getNotificationById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedNotification = action.payload
        state.error = null
      })
      .addCase(getNotificationById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Notification
      .addCase(createNotification.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications.unshift(action.payload)
        state.error = null
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Mark as Read
      .addCase(markAsRead.pending, (state) => {
        state.error = null
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id)
        if (index !== -1) {
          state.notifications[index] = action.payload
          if (!action.payload.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        }
        if (state.selectedNotification && state.selectedNotification._id === action.payload._id) {
          state.selectedNotification = action.payload
        }
        state.error = null
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload
      })

      // Mark All as Read
      .addCase(markAllAsRead.pending, (state) => {
        state.error = null
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          isRead: true
        }))
        state.unreadCount = 0
        state.error = null
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.error = action.payload
      })

      // Delete Notification
      .addCase(deleteNotification.pending, (state) => {
        state.error = null
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload)
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload)
        if (state.selectedNotification && state.selectedNotification._id === action.payload) {
          state.selectedNotification = null
        }
        state.error = null
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload
      })

      // Delete All Notifications
      .addCase(deleteAllNotifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.isLoading = false
        state.notifications = []
        state.unreadCount = 0
        state.selectedNotification = null
        state.error = null
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get User Notifications
      .addCase(getUserNotifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = action.payload
        state.error = null
      })
      .addCase(getUserNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

// Export actions
export const { 
  clearError, 
  clearSelectedNotification, 
  setFilters, 
  clearFilters,
  setCurrentPage,
  addNotification,
  updateUnreadCount
} = notificationSlice.actions

// Export selectors
export const selectNotifications = (state) => state.notifications.notifications
export const selectSelectedNotification = (state) => state.notifications.selectedNotification
export const selectUnreadCount = (state) => state.notifications.unreadCount
export const selectNotificationsLoading = (state) => state.notifications.isLoading
export const selectNotificationsError = (state) => state.notifications.error
export const selectNotificationFilters = (state) => state.notifications.filters
export const selectNotificationCurrentPage = (state) => state.notifications.currentPage

export default notificationSlice.reducer
