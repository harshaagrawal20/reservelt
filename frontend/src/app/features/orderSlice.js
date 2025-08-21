import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

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

// Order Async Thunks
export const getOrders = createAsyncThunk(
  'orders/getOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/orders?${queryString}` : '/orders'
      const data = await makeApiCall(url)
      return data.orders || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getOrderById = createAsyncThunk(
  'orders/getOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/orders/${orderId}`)
      return data.order || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      })
      return data.order || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, orderData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(orderData),
      })
      return data.order || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await makeApiCall(`/orders/${orderId}`, {
        method: 'DELETE',
      })
      return orderId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      return data.order || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getUserOrders = createAsyncThunk(
  'orders/getUserOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/orders/user/${userId}`)
      return data.orders || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getOrderStats = createAsyncThunk(
  'orders/getOrderStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/orders/stats')
      return data.stats || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  orders: [],
  userOrders: [],
  selectedOrder: null,
  orderStats: null,
  isLoading: false,
  error: null,
  totalOrders: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {
    status: '',
    dateRange: { start: '', end: '' },
    search: '',
    minAmount: '',
    maxAmount: '',
    paymentStatus: '',
  }
}

// Order slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        dateRange: { start: '', end: '' },
        search: '',
        minAmount: '',
        maxAmount: '',
        paymentStatus: '',
      }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Orders
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload
        state.error = null
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Order by ID
      .addCase(getOrderById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedOrder = action.payload
        state.error = null
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders.push(action.payload)
        state.error = null
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Order
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.orders.findIndex(o => o._id === action.payload._id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (state.selectedOrder && state.selectedOrder._id === action.payload._id) {
          state.selectedOrder = action.payload
        }
        state.error = null
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Order
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = state.orders.filter(o => o._id !== action.payload)
        if (state.selectedOrder && state.selectedOrder._id === action.payload) {
          state.selectedOrder = null
        }
        state.error = null
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.orders.findIndex(o => o._id === action.payload._id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (state.selectedOrder && state.selectedOrder._id === action.payload._id) {
          state.selectedOrder = action.payload
        }
        state.error = null
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get User Orders
      .addCase(getUserOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.userOrders = action.payload
        state.error = null
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Order Stats
      .addCase(getOrderStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOrderStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.orderStats = action.payload
        state.error = null
      })
      .addCase(getOrderStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

// Export actions
export const { 
  clearError, 
  clearSelectedOrder, 
  setFilters, 
  clearFilters,
  setCurrentPage 
} = orderSlice.actions

// Export selectors
export const selectOrders = (state) => state.orders.orders
export const selectUserOrders = (state) => state.orders.userOrders
export const selectSelectedOrder = (state) => state.orders.selectedOrder
export const selectOrderStats = (state) => state.orders.orderStats
export const selectOrdersLoading = (state) => state.orders.isLoading
export const selectOrdersError = (state) => state.orders.error
export const selectOrderFilters = (state) => state.orders.filters
export const selectOrderCurrentPage = (state) => state.orders.currentPage

export default orderSlice.reducer
