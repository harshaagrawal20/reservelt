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

// Pricelist Async Thunks
export const getPricelists = createAsyncThunk(
  'pricelists/getPricelists',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/pricelists?${queryString}` : '/pricelists'
      const data = await makeApiCall(url)
      return data.pricelists || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getPricelistById = createAsyncThunk(
  'pricelists/getPricelistById',
  async (pricelistId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/pricelists/${pricelistId}`)
      return data.pricelist || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createPricelist = createAsyncThunk(
  'pricelists/createPricelist',
  async (pricelistData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/pricelists', {
        method: 'POST',
        body: JSON.stringify(pricelistData),
      })
      return data.pricelist || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updatePricelist = createAsyncThunk(
  'pricelists/updatePricelist',
  async ({ pricelistId, pricelistData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/pricelists/${pricelistId}`, {
        method: 'PUT',
        body: JSON.stringify(pricelistData),
      })
      return data.pricelist || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deletePricelist = createAsyncThunk(
  'pricelists/deletePricelist',
  async (pricelistId, { rejectWithValue }) => {
    try {
      await makeApiCall(`/pricelists/${pricelistId}`, {
        method: 'DELETE',
      })
      return pricelistId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const activatePricelist = createAsyncThunk(
  'pricelists/activatePricelist',
  async (pricelistId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/pricelists/${pricelistId}/activate`, {
        method: 'PATCH',
      })
      return data.pricelist || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deactivatePricelist = createAsyncThunk(
  'pricelists/deactivatePricelist',
  async (pricelistId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/pricelists/${pricelistId}/deactivate`, {
        method: 'PATCH',
      })
      return data.pricelist || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const duplicatePricelist = createAsyncThunk(
  'pricelists/duplicatePricelist',
  async (pricelistId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/pricelists/${pricelistId}/duplicate`, {
        method: 'POST',
      })
      return data.pricelist || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getActivePricelists = createAsyncThunk(
  'pricelists/getActivePricelists',
  async (_, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/pricelists/active')
      return data.pricelists || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  pricelists: [],
  activePricelists: [],
  selectedPricelist: null,
  isLoading: false,
  error: null,
  totalPricelists: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {
    status: '',
    type: '',
    search: '',
    dateRange: { start: '', end: '' },
  }
}

// Pricelist slice
const pricelistSlice = createSlice({
  name: 'pricelists',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedPricelist: (state) => {
      state.selectedPricelist = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        type: '',
        search: '',
        dateRange: { start: '', end: '' },
      }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Pricelists
      .addCase(getPricelists.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPricelists.fulfilled, (state, action) => {
        state.isLoading = false
        state.pricelists = action.payload
        state.error = null
      })
      .addCase(getPricelists.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Pricelist by ID
      .addCase(getPricelistById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPricelistById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedPricelist = action.payload
        state.error = null
      })
      .addCase(getPricelistById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Pricelist
      .addCase(createPricelist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPricelist.fulfilled, (state, action) => {
        state.isLoading = false
        state.pricelists.push(action.payload)
        state.error = null
      })
      .addCase(createPricelist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Pricelist
      .addCase(updatePricelist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePricelist.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.pricelists.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.pricelists[index] = action.payload
        }
        if (state.selectedPricelist && state.selectedPricelist._id === action.payload._id) {
          state.selectedPricelist = action.payload
        }
        state.error = null
      })
      .addCase(updatePricelist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Pricelist
      .addCase(deletePricelist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePricelist.fulfilled, (state, action) => {
        state.isLoading = false
        state.pricelists = state.pricelists.filter(p => p._id !== action.payload)
        if (state.selectedPricelist && state.selectedPricelist._id === action.payload) {
          state.selectedPricelist = null
        }
        state.error = null
      })
      .addCase(deletePricelist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Activate Pricelist
      .addCase(activatePricelist.pending, (state) => {
        state.error = null
      })
      .addCase(activatePricelist.fulfilled, (state, action) => {
        const index = state.pricelists.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.pricelists[index] = action.payload
        }
        if (state.selectedPricelist && state.selectedPricelist._id === action.payload._id) {
          state.selectedPricelist = action.payload
        }
        state.error = null
      })
      .addCase(activatePricelist.rejected, (state, action) => {
        state.error = action.payload
      })

      // Deactivate Pricelist
      .addCase(deactivatePricelist.pending, (state) => {
        state.error = null
      })
      .addCase(deactivatePricelist.fulfilled, (state, action) => {
        const index = state.pricelists.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.pricelists[index] = action.payload
        }
        if (state.selectedPricelist && state.selectedPricelist._id === action.payload._id) {
          state.selectedPricelist = action.payload
        }
        state.error = null
      })
      .addCase(deactivatePricelist.rejected, (state, action) => {
        state.error = action.payload
      })

      // Duplicate Pricelist
      .addCase(duplicatePricelist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(duplicatePricelist.fulfilled, (state, action) => {
        state.isLoading = false
        state.pricelists.push(action.payload)
        state.error = null
      })
      .addCase(duplicatePricelist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Active Pricelists
      .addCase(getActivePricelists.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getActivePricelists.fulfilled, (state, action) => {
        state.isLoading = false
        state.activePricelists = action.payload
        state.error = null
      })
      .addCase(getActivePricelists.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

// Export actions
export const { 
  clearError, 
  clearSelectedPricelist, 
  setFilters, 
  clearFilters,
  setCurrentPage 
} = pricelistSlice.actions

// Export selectors
export const selectPricelists = (state) => state.pricelists.pricelists
export const selectActivePricelists = (state) => state.pricelists.activePricelists
export const selectSelectedPricelist = (state) => state.pricelists.selectedPricelist
export const selectPricelistsLoading = (state) => state.pricelists.isLoading
export const selectPricelistsError = (state) => state.pricelists.error
export const selectPricelistFilters = (state) => state.pricelists.filters
export const selectPricelistCurrentPage = (state) => state.pricelists.currentPage

export default pricelistSlice.reducer
