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

// Customer Async Thunks
export const getCustomers = createAsyncThunk(
  'customers/getCustomers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/users?${queryString}` : '/users'
      const data = await makeApiCall(url)
      return data.users || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getCustomerById = createAsyncThunk(
  'customers/getCustomerById',
  async (customerId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/users/${customerId}`)
      return data.user || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ customerId, customerData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/users/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify(customerData),
      })
      return data.user || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      await makeApiCall(`/users/${customerId}`, {
        method: 'DELETE',
      })
      return customerId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getCustomerBookings = createAsyncThunk(
  'customers/getCustomerBookings',
  async (customerId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/bookings/user/${customerId}`)
      return data.bookings || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getCustomerStats = createAsyncThunk(
  'customers/getCustomerStats',
  async (customerId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/users/${customerId}/stats`)
      return data.stats || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  customers: [],
  selectedCustomer: null,
  customerBookings: [],
  customerStats: null,
  isLoading: false,
  error: null,
  totalCustomers: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {
    status: '',
    role: '',
    search: '',
    dateJoined: { start: '', end: '' },
  }
}

// Customer slice
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null
      state.customerBookings = []
      state.customerStats = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        role: '',
        search: '',
        dateJoined: { start: '', end: '' },
      }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Customers
      .addCase(getCustomers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.isLoading = false
        state.customers = action.payload
        state.error = null
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Customer by ID
      .addCase(getCustomerById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCustomerById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedCustomer = action.payload
        state.error = null
      })
      .addCase(getCustomerById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.customers.findIndex(c => c._id === action.payload._id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
        if (state.selectedCustomer && state.selectedCustomer._id === action.payload._id) {
          state.selectedCustomer = action.payload
        }
        state.error = null
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Customer
      .addCase(deleteCustomer.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isLoading = false
        state.customers = state.customers.filter(c => c._id !== action.payload)
        if (state.selectedCustomer && state.selectedCustomer._id === action.payload) {
          state.selectedCustomer = null
          state.customerBookings = []
          state.customerStats = null
        }
        state.error = null
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Customer Bookings
      .addCase(getCustomerBookings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCustomerBookings.fulfilled, (state, action) => {
        state.isLoading = false
        state.customerBookings = action.payload
        state.error = null
      })
      .addCase(getCustomerBookings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Customer Stats
      .addCase(getCustomerStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCustomerStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.customerStats = action.payload
        state.error = null
      })
      .addCase(getCustomerStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

// Export actions
export const { 
  clearError, 
  clearSelectedCustomer, 
  setFilters, 
  clearFilters,
  setCurrentPage 
} = customerSlice.actions

// Export selectors
export const selectCustomers = (state) => state.customers.customers
export const selectSelectedCustomer = (state) => state.customers.selectedCustomer
export const selectCustomerBookings = (state) => state.customers.customerBookings
export const selectCustomerStats = (state) => state.customers.customerStats
export const selectCustomersLoading = (state) => state.customers.isLoading
export const selectCustomersError = (state) => state.customers.error
export const selectCustomerFilters = (state) => state.customers.filters
export const selectCustomerCurrentPage = (state) => state.customers.currentPage

export default customerSlice.reducer
