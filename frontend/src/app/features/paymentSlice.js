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

// Payment Async Thunks
export const getPayments = createAsyncThunk(
  'payments/getPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/payments?${queryString}` : '/payments'
      const data = await makeApiCall(url)
      return data.payments || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getPaymentById = createAsyncThunk(
  'payments/getPaymentById',
  async (paymentId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/payments/${paymentId}`)
      return data.payment || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      })
      return data.payment || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updatePayment = createAsyncThunk(
  'payments/updatePayment',
  async ({ paymentId, paymentData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/payments/${paymentId}`, {
        method: 'PUT',
        body: JSON.stringify(paymentData),
      })
      return data.payment || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deletePayment = createAsyncThunk(
  'payments/deletePayment',
  async (paymentId, { rejectWithValue }) => {
    try {
      await makeApiCall(`/payments/${paymentId}`, {
        method: 'DELETE',
      })
      return paymentId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const processPayment = createAsyncThunk(
  'payments/processPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/payments/process', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      })
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const refundPayment = createAsyncThunk(
  'payments/refundPayment',
  async ({ paymentId, refundData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/payments/${paymentId}/refund`, {
        method: 'POST',
        body: JSON.stringify(refundData),
      })
      return data.payment || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createPaymentIntent = createAsyncThunk(
  'payments/createPaymentIntent',
  async (intentData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/payments/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify(intentData),
      })
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const confirmPayment = createAsyncThunk(
  'payments/confirmPayment',
  async ({ paymentIntentId, paymentMethodId }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({ paymentIntentId, paymentMethodId }),
      })
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getUserPayments = createAsyncThunk(
  'payments/getUserPayments',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/payments/user/${userId}`)
      return data.payments || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getPaymentStats = createAsyncThunk(
  'payments/getPaymentStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/payments/stats?${queryString}` : '/payments/stats'
      const data = await makeApiCall(url)
      return data.stats || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  payments: [],
  userPayments: [],
  selectedPayment: null,
  paymentIntent: null,
  paymentStats: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  processError: null,
  totalPayments: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {
    status: '',
    method: '',
    dateRange: { start: '', end: '' },
    search: '',
    minAmount: '',
    maxAmount: '',
  }
}

// Payment slice
const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearProcessError: (state) => {
      state.processError = null
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null
    },
    clearPaymentIntent: (state) => {
      state.paymentIntent = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        method: '',
        dateRange: { start: '', end: '' },
        search: '',
        minAmount: '',
        maxAmount: '',
      }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Payments
      .addCase(getPayments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.payments = action.payload
        state.error = null
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Payment by ID
      .addCase(getPaymentById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPaymentById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedPayment = action.payload
        state.error = null
      })
      .addCase(getPaymentById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Payment
      .addCase(createPayment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.isLoading = false
        state.payments.push(action.payload)
        state.error = null
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Payment
      .addCase(updatePayment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.payments.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.payments[index] = action.payload
        }
        if (state.selectedPayment && state.selectedPayment._id === action.payload._id) {
          state.selectedPayment = action.payload
        }
        state.error = null
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Payment
      .addCase(deletePayment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.isLoading = false
        state.payments = state.payments.filter(p => p._id !== action.payload)
        if (state.selectedPayment && state.selectedPayment._id === action.payload) {
          state.selectedPayment = null
        }
        state.error = null
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Process Payment
      .addCase(processPayment.pending, (state) => {
        state.isProcessing = true
        state.processError = null
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.isProcessing = false
        state.processError = null
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isProcessing = false
        state.processError = action.payload
      })

      // Refund Payment
      .addCase(refundPayment.pending, (state) => {
        state.isProcessing = true
        state.processError = null
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        state.isProcessing = false
        const index = state.payments.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.payments[index] = action.payload
        }
        if (state.selectedPayment && state.selectedPayment._id === action.payload._id) {
          state.selectedPayment = action.payload
        }
        state.processError = null
      })
      .addCase(refundPayment.rejected, (state, action) => {
        state.isProcessing = false
        state.processError = action.payload
      })

      // Create Payment Intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.isProcessing = true
        state.processError = null
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isProcessing = false
        state.paymentIntent = action.payload
        state.processError = null
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.isProcessing = false
        state.processError = action.payload
      })

      // Confirm Payment
      .addCase(confirmPayment.pending, (state) => {
        state.isProcessing = true
        state.processError = null
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isProcessing = false
        state.processError = null
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.isProcessing = false
        state.processError = action.payload
      })

      // Get User Payments
      .addCase(getUserPayments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.userPayments = action.payload
        state.error = null
      })
      .addCase(getUserPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Payment Stats
      .addCase(getPaymentStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPaymentStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.paymentStats = action.payload
        state.error = null
      })
      .addCase(getPaymentStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

// Export actions
export const { 
  clearError, 
  clearProcessError,
  clearSelectedPayment, 
  clearPaymentIntent,
  setFilters, 
  clearFilters,
  setCurrentPage 
} = paymentSlice.actions

// Export selectors
export const selectPayments = (state) => state.payments.payments
export const selectUserPayments = (state) => state.payments.userPayments
export const selectSelectedPayment = (state) => state.payments.selectedPayment
export const selectPaymentIntent = (state) => state.payments.paymentIntent
export const selectPaymentStats = (state) => state.payments.paymentStats
export const selectPaymentsLoading = (state) => state.payments.isLoading
export const selectPaymentProcessing = (state) => state.payments.isProcessing
export const selectPaymentsError = (state) => state.payments.error
export const selectPaymentProcessError = (state) => state.payments.processError
export const selectPaymentFilters = (state) => state.payments.filters
export const selectPaymentCurrentPage = (state) => state.payments.currentPage

export default paymentSlice.reducer
