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

// Invoice Async Thunks
export const getInvoices = createAsyncThunk(
  'invoices/getInvoices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/invoices?${queryString}` : '/invoices'
      const data = await makeApiCall(url)
      return data.invoices || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getInvoiceById = createAsyncThunk(
  'invoices/getInvoiceById',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/invoices/${invoiceId}`)
      return data.invoice || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      })
      return data.invoice || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ invoiceId, invoiceData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/invoices/${invoiceId}`, {
        method: 'PUT',
        body: JSON.stringify(invoiceData),
      })
      return data.invoice || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteInvoice = createAsyncThunk(
  'invoices/deleteInvoice',
  async (invoiceId, { rejectWithValue }) => {
    try {
      await makeApiCall(`/invoices/${invoiceId}`, {
        method: 'DELETE',
      })
      return invoiceId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const sendInvoice = createAsyncThunk(
  'invoices/sendInvoice',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/invoices/${invoiceId}/send`, {
        method: 'POST',
      })
      return data.invoice || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const markInvoicePaid = createAsyncThunk(
  'invoices/markInvoicePaid',
  async ({ invoiceId, paymentData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/invoices/${invoiceId}/mark-paid`, {
        method: 'PATCH',
        body: JSON.stringify(paymentData),
      })
      return data.invoice || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const downloadInvoice = createAsyncThunk(
  'invoices/downloadInvoice',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      return { blob, filename: `invoice_${invoiceId}.pdf` }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  invoices: [],
  selectedInvoice: null,
  isLoading: false,
  error: null,
  isDownloading: false,
  downloadError: null,
  totalInvoices: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {
    status: '',
    dateRange: { start: '', end: '' },
    search: '',
    customer: '',
  }
}

// Invoice slice
const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearDownloadError: (state) => {
      state.downloadError = null
    },
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        dateRange: { start: '', end: '' },
        search: '',
        customer: '',
      }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Invoices
      .addCase(getInvoices.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getInvoices.fulfilled, (state, action) => {
        state.isLoading = false
        state.invoices = action.payload
        state.error = null
      })
      .addCase(getInvoices.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Invoice by ID
      .addCase(getInvoiceById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getInvoiceById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedInvoice = action.payload
        state.error = null
      })
      .addCase(getInvoiceById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Invoice
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.isLoading = false
        state.invoices.push(action.payload)
        state.error = null
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Invoice
      .addCase(updateInvoice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.invoices.findIndex(i => i._id === action.payload._id)
        if (index !== -1) {
          state.invoices[index] = action.payload
        }
        if (state.selectedInvoice && state.selectedInvoice._id === action.payload._id) {
          state.selectedInvoice = action.payload
        }
        state.error = null
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.isLoading = false
        state.invoices = state.invoices.filter(i => i._id !== action.payload)
        if (state.selectedInvoice && state.selectedInvoice._id === action.payload) {
          state.selectedInvoice = null
        }
        state.error = null
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Send Invoice
      .addCase(sendInvoice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendInvoice.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.invoices.findIndex(i => i._id === action.payload._id)
        if (index !== -1) {
          state.invoices[index] = action.payload
        }
        if (state.selectedInvoice && state.selectedInvoice._id === action.payload._id) {
          state.selectedInvoice = action.payload
        }
        state.error = null
      })
      .addCase(sendInvoice.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Mark Invoice Paid
      .addCase(markInvoicePaid.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(markInvoicePaid.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.invoices.findIndex(i => i._id === action.payload._id)
        if (index !== -1) {
          state.invoices[index] = action.payload
        }
        if (state.selectedInvoice && state.selectedInvoice._id === action.payload._id) {
          state.selectedInvoice = action.payload
        }
        state.error = null
      })
      .addCase(markInvoicePaid.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Download Invoice
      .addCase(downloadInvoice.pending, (state) => {
        state.isDownloading = true
        state.downloadError = null
      })
      .addCase(downloadInvoice.fulfilled, (state, action) => {
        state.isDownloading = false
        // Create download link
        const url = window.URL.createObjectURL(action.payload.blob)
        const link = document.createElement('a')
        link.href = url
        link.download = action.payload.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        state.downloadError = null
      })
      .addCase(downloadInvoice.rejected, (state, action) => {
        state.isDownloading = false
        state.downloadError = action.payload
      })
  },
})

// Export actions
export const { 
  clearError, 
  clearDownloadError,
  clearSelectedInvoice, 
  setFilters, 
  clearFilters,
  setCurrentPage 
} = invoiceSlice.actions

// Export selectors
export const selectInvoices = (state) => state.invoices.invoices
export const selectSelectedInvoice = (state) => state.invoices.selectedInvoice
export const selectInvoicesLoading = (state) => state.invoices.isLoading
export const selectInvoicesError = (state) => state.invoices.error
export const selectIsDownloading = (state) => state.invoices.isDownloading
export const selectDownloadError = (state) => state.invoices.downloadError
export const selectInvoiceFilters = (state) => state.invoices.filters
export const selectInvoiceCurrentPage = (state) => state.invoices.currentPage

export default invoiceSlice.reducer
