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

// Report Async Thunks
export const getReports = createAsyncThunk(
  'reports/getReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/reports?${queryString}` : '/reports'
      const data = await makeApiCall(url)
      return data.reports || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getReportById = createAsyncThunk(
  'reports/getReportById',
  async (reportId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/reports/${reportId}`)
      return data.report || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createReport = createAsyncThunk(
  'reports/createReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      })
      return data.report || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateReport = createAsyncThunk(
  'reports/updateReport',
  async ({ reportId, reportData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify(reportData),
      })
      return data.report || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (reportId, { rejectWithValue }) => {
    try {
      await makeApiCall(`/reports/${reportId}`, {
        method: 'DELETE',
      })
      return reportId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getDashboardStats = createAsyncThunk(
  'reports/getDashboardStats',
  async (dateRange = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(dateRange).toString()
      const url = queryString ? `/reports/dashboard?${queryString}` : '/reports/dashboard'
      const data = await makeApiCall(url)
      return data.stats || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getRevenueReport = createAsyncThunk(
  'reports/getRevenueReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/reports/revenue?${queryString}` : '/reports/revenue'
      const data = await makeApiCall(url)
      return data.revenue || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getBookingReport = createAsyncThunk(
  'reports/getBookingReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/reports/bookings?${queryString}` : '/reports/bookings'
      const data = await makeApiCall(url)
      return data.bookings || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getProductReport = createAsyncThunk(
  'reports/getProductReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/reports/products?${queryString}` : '/reports/products'
      const data = await makeApiCall(url)
      return data.products || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getCustomerReport = createAsyncThunk(
  'reports/getCustomerReport',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/reports/customers?${queryString}` : '/reports/customers'
      const data = await makeApiCall(url)
      return data.customers || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const exportReport = createAsyncThunk(
  'reports/exportReport',
  async ({ reportType, format, params = {} }, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams({ ...params, format }).toString()
      const url = `/reports/${reportType}/export?${queryString}`
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      return { blob, filename: `${reportType}_report.${format}` }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  reports: [],
  selectedReport: null,
  dashboardStats: null,
  revenueReport: null,
  bookingReport: null,
  productReport: null,
  customerReport: null,
  isLoading: false,
  error: null,
  isExporting: false,
  exportError: null,
  filters: {
    dateRange: { start: '', end: '' },
    reportType: '',
    status: '',
  }
}

// Report slice
const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearExportError: (state) => {
      state.exportError = null
    },
    clearSelectedReport: (state) => {
      state.selectedReport = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        dateRange: { start: '', end: '' },
        reportType: '',
        status: '',
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Reports
      .addCase(getReports.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getReports.fulfilled, (state, action) => {
        state.isLoading = false
        state.reports = action.payload
        state.error = null
      })
      .addCase(getReports.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Report by ID
      .addCase(getReportById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getReportById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedReport = action.payload
        state.error = null
      })
      .addCase(getReportById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Report
      .addCase(createReport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.isLoading = false
        state.reports.push(action.payload)
        state.error = null
      })
      .addCase(createReport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Report
      .addCase(updateReport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.reports.findIndex(r => r._id === action.payload._id)
        if (index !== -1) {
          state.reports[index] = action.payload
        }
        if (state.selectedReport && state.selectedReport._id === action.payload._id) {
          state.selectedReport = action.payload
        }
        state.error = null
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Report
      .addCase(deleteReport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.isLoading = false
        state.reports = state.reports.filter(r => r._id !== action.payload)
        if (state.selectedReport && state.selectedReport._id === action.payload) {
          state.selectedReport = null
        }
        state.error = null
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Dashboard Stats
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.dashboardStats = action.payload
        state.error = null
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Revenue Report
      .addCase(getRevenueReport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getRevenueReport.fulfilled, (state, action) => {
        state.isLoading = false
        state.revenueReport = action.payload
        state.error = null
      })
      .addCase(getRevenueReport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Booking Report
      .addCase(getBookingReport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getBookingReport.fulfilled, (state, action) => {
        state.isLoading = false
        state.bookingReport = action.payload
        state.error = null
      })
      .addCase(getBookingReport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Product Report
      .addCase(getProductReport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProductReport.fulfilled, (state, action) => {
        state.isLoading = false
        state.productReport = action.payload
        state.error = null
      })
      .addCase(getProductReport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Customer Report
      .addCase(getCustomerReport.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCustomerReport.fulfilled, (state, action) => {
        state.isLoading = false
        state.customerReport = action.payload
        state.error = null
      })
      .addCase(getCustomerReport.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Export Report
      .addCase(exportReport.pending, (state) => {
        state.isExporting = true
        state.exportError = null
      })
      .addCase(exportReport.fulfilled, (state, action) => {
        state.isExporting = false
        // Create download link
        const url = window.URL.createObjectURL(action.payload.blob)
        const link = document.createElement('a')
        link.href = url
        link.download = action.payload.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        state.exportError = null
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.isExporting = false
        state.exportError = action.payload
      })
  },
})

// Export actions
export const { 
  clearError, 
  clearExportError,
  clearSelectedReport, 
  setFilters, 
  clearFilters
} = reportSlice.actions

// Export selectors
export const selectReports = (state) => state.reports.reports
export const selectSelectedReport = (state) => state.reports.selectedReport
export const selectDashboardStats = (state) => state.reports.dashboardStats
export const selectRevenueReport = (state) => state.reports.revenueReport
export const selectBookingReport = (state) => state.reports.bookingReport
export const selectProductReport = (state) => state.reports.productReport
export const selectCustomerReport = (state) => state.reports.customerReport
export const selectReportsLoading = (state) => state.reports.isLoading
export const selectReportsError = (state) => state.reports.error
export const selectIsExporting = (state) => state.reports.isExporting
export const selectExportError = (state) => state.reports.exportError
export const selectReportFilters = (state) => state.reports.filters

export default reportSlice.reducer
