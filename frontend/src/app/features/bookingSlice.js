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

// Booking Async Thunks
export const getBookings = createAsyncThunk(
  'bookings/getBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/bookings?${queryString}` : '/bookings'
      const data = await makeApiCall(url)
      return data.bookings || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getBookingById = createAsyncThunk(
  'bookings/getBookingById',
  async (bookingId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/bookings/${bookingId}`)
      return data.booking || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      })
      return data.booking || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createRentalRequest = createAsyncThunk(
  'bookings/createRentalRequest',
  async (rentalData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/bookings/rental-request', {
        method: 'POST',
        body: JSON.stringify(rentalData),
      })
      return data.booking || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async ({ bookingId, bookingData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify(bookingData),
      })
      return data.booking || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteBooking = createAsyncThunk(
  'bookings/deleteBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      await makeApiCall(`/bookings/${bookingId}`, {
        method: 'DELETE',
      })
      return bookingId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getUserBookings = createAsyncThunk(
  'bookings/getUserBookings',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/bookings/user/${userId}`)
      return data.bookings || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const acceptRentalRequest = createAsyncThunk(
  'bookings/acceptRentalRequest',
  async ({ bookingId, ownerClerkId }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/bookings/${bookingId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ ownerClerkId }),
      })
      return data.booking || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const rejectRentalRequest = createAsyncThunk(
  'bookings/rejectRentalRequest',
  async ({ bookingId, ownerClerkId, reason }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/bookings/${bookingId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ ownerClerkId, reason }),
      })
      return data.booking || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateBookingPaymentStatus = createAsyncThunk(
  'bookings/updateBookingPaymentStatus',
  async ({ bookingId, paymentStatus, paymentMethod, paymentData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/bookings/${bookingId}/payment`, {
        method: 'POST',
        body: JSON.stringify({ 
          paymentStatus, 
          paymentMethod, 
          paymentData 
        }),
      })
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  bookings: [],
  userBookings: [],
  selectedBooking: null,
  isLoading: false,
  error: null,
  totalBookings: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {
    status: '',
    dateRange: { start: '', end: '' },
    search: '',
  }
}

// Booking slice
const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        dateRange: { start: '', end: '' },
        search: '',
      }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Bookings
      .addCase(getBookings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.isLoading = false
        state.bookings = action.payload
        state.error = null
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Booking by ID
      .addCase(getBookingById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedBooking = action.payload
        state.error = null
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false
        state.bookings.push(action.payload)
        state.error = null
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Rental Request
      .addCase(createRentalRequest.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createRentalRequest.fulfilled, (state, action) => {
        state.isLoading = false
        state.bookings.push(action.payload)
        state.error = null
      })
      .addCase(createRentalRequest.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Booking
      .addCase(updateBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.bookings.findIndex(b => b._id === action.payload._id)
        if (index !== -1) {
          state.bookings[index] = action.payload
        }
        if (state.selectedBooking && state.selectedBooking._id === action.payload._id) {
          state.selectedBooking = action.payload
        }
        state.error = null
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Booking
      .addCase(deleteBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.isLoading = false
        state.bookings = state.bookings.filter(b => b._id !== action.payload)
        if (state.selectedBooking && state.selectedBooking._id === action.payload) {
          state.selectedBooking = null
        }
        state.error = null
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get User Bookings
      .addCase(getUserBookings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.isLoading = false
        state.userBookings = action.payload
        state.error = null
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Accept Rental Request
      .addCase(acceptRentalRequest.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(acceptRentalRequest.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.bookings.findIndex(b => b._id === action.payload._id)
        if (index !== -1) {
          state.bookings[index] = action.payload
        }
        const userIndex = state.userBookings.findIndex(b => b._id === action.payload._id)
        if (userIndex !== -1) {
          state.userBookings[userIndex] = action.payload
        }
        if (state.selectedBooking && state.selectedBooking._id === action.payload._id) {
          state.selectedBooking = action.payload
        }
        state.error = null
      })
      .addCase(acceptRentalRequest.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Reject Rental Request
      .addCase(rejectRentalRequest.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(rejectRentalRequest.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.bookings.findIndex(b => b._id === action.payload._id)
        if (index !== -1) {
          state.bookings[index] = action.payload
        }
        const userIndex = state.userBookings.findIndex(b => b._id === action.payload._id)
        if (userIndex !== -1) {
          state.userBookings[userIndex] = action.payload
        }
        if (state.selectedBooking && state.selectedBooking._id === action.payload._id) {
          state.selectedBooking = action.payload
        }
        state.error = null
      })
      .addCase(rejectRentalRequest.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Booking Payment Status
      .addCase(updateBookingPaymentStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateBookingPaymentStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const booking = action.payload.booking
        const index = state.bookings.findIndex(b => b._id === booking._id)
        if (index !== -1) {
          state.bookings[index] = booking
        }
        const userIndex = state.userBookings.findIndex(b => b._id === booking._id)
        if (userIndex !== -1) {
          state.userBookings[userIndex] = booking
        }
        if (state.selectedBooking && state.selectedBooking._id === booking._id) {
          state.selectedBooking = booking
        }
        state.error = null
      })
      .addCase(updateBookingPaymentStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

// Export actions
export const { 
  clearError, 
  clearSelectedBooking, 
  setFilters, 
  clearFilters,
  setCurrentPage 
} = bookingSlice.actions

// Export selectors
export const selectBookings = (state) => state.bookings.bookings
export const selectUserBookings = (state) => state.bookings.userBookings
export const selectSelectedBooking = (state) => state.bookings.selectedBooking
export const selectBookingsLoading = (state) => state.bookings.isLoading
export const selectBookingsError = (state) => state.bookings.error
export const selectBookingFilters = (state) => state.bookings.filters
export const selectBookingCurrentPage = (state) => state.bookings.currentPage

export default bookingSlice.reducer
