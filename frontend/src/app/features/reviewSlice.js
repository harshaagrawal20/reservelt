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

// Review Async Thunks
export const getReviews = createAsyncThunk(
  'reviews/getReviews',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/reviews?${queryString}` : '/reviews'
      const data = await makeApiCall(url)
      return data.reviews || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getReviewById = createAsyncThunk(
  'reviews/getReviewById',
  async (reviewId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/reviews/${reviewId}`)
      return data.review || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      })
      return data.review || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(reviewData),
      })
      return data.review || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      await makeApiCall(`/reviews/${reviewId}`, {
        method: 'DELETE',
      })
      return reviewId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getProductReviews = createAsyncThunk(
  'reviews/getProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/reviews/product/${productId}`)
      return data.reviews || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getUserReviews = createAsyncThunk(
  'reviews/getUserReviews',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/reviews/user/${userId}`)
      return data.reviews || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const approveReview = createAsyncThunk(
  'reviews/approveReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/reviews/${reviewId}/approve`, {
        method: 'PATCH',
      })
      return data.review || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const rejectReview = createAsyncThunk(
  'reviews/rejectReview',
  async ({ reviewId, reason }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/reviews/${reviewId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      })
      return data.review || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const reportReview = createAsyncThunk(
  'reviews/reportReview',
  async ({ reviewId, reason }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/reviews/${reviewId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      return data.review || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const likeReview = createAsyncThunk(
  'reviews/likeReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/reviews/${reviewId}/like`, {
        method: 'POST',
      })
      return data.review || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const unlikeReview = createAsyncThunk(
  'reviews/unlikeReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/reviews/${reviewId}/unlike`, {
        method: 'DELETE',
      })
      return data.review || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  reviews: [],
  productReviews: [],
  userReviews: [],
  selectedReview: null,
  isLoading: false,
  error: null,
  totalReviews: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {
    rating: '',
    status: '',
    verified: '',
    search: '',
    dateRange: { start: '', end: '' },
  },
  stats: {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  }
}

// Review slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedReview: (state) => {
      state.selectedReview = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        rating: '',
        status: '',
        verified: '',
        search: '',
        dateRange: { start: '', end: '' },
      }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    clearProductReviews: (state) => {
      state.productReviews = []
    },
    clearUserReviews: (state) => {
      state.userReviews = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Reviews
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false
        state.reviews = action.payload
        state.error = null
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Review by ID
      .addCase(getReviewById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getReviewById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedReview = action.payload
        state.error = null
      })
      .addCase(getReviewById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Review
      .addCase(createReview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false
        state.reviews.unshift(action.payload)
        state.productReviews.unshift(action.payload)
        state.error = null
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.isLoading = false
        const updateReviewInArray = (array) => {
          const index = array.findIndex(r => r._id === action.payload._id)
          if (index !== -1) {
            array[index] = action.payload
          }
        }
        updateReviewInArray(state.reviews)
        updateReviewInArray(state.productReviews)
        updateReviewInArray(state.userReviews)
        
        if (state.selectedReview && state.selectedReview._id === action.payload._id) {
          state.selectedReview = action.payload
        }
        state.error = null
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isLoading = false
        state.reviews = state.reviews.filter(r => r._id !== action.payload)
        state.productReviews = state.productReviews.filter(r => r._id !== action.payload)
        state.userReviews = state.userReviews.filter(r => r._id !== action.payload)
        
        if (state.selectedReview && state.selectedReview._id === action.payload) {
          state.selectedReview = null
        }
        state.error = null
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Product Reviews
      .addCase(getProductReviews.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.isLoading = false
        state.productReviews = action.payload
        state.error = null
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get User Reviews
      .addCase(getUserReviews.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserReviews.fulfilled, (state, action) => {
        state.isLoading = false
        state.userReviews = action.payload
        state.error = null
      })
      .addCase(getUserReviews.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Approve Review
      .addCase(approveReview.fulfilled, (state, action) => {
        const updateReviewInArray = (array) => {
          const index = array.findIndex(r => r._id === action.payload._id)
          if (index !== -1) {
            array[index] = action.payload
          }
        }
        updateReviewInArray(state.reviews)
        updateReviewInArray(state.productReviews)
        updateReviewInArray(state.userReviews)
        
        if (state.selectedReview && state.selectedReview._id === action.payload._id) {
          state.selectedReview = action.payload
        }
      })

      // Reject Review
      .addCase(rejectReview.fulfilled, (state, action) => {
        const updateReviewInArray = (array) => {
          const index = array.findIndex(r => r._id === action.payload._id)
          if (index !== -1) {
            array[index] = action.payload
          }
        }
        updateReviewInArray(state.reviews)
        updateReviewInArray(state.productReviews)
        updateReviewInArray(state.userReviews)
        
        if (state.selectedReview && state.selectedReview._id === action.payload._id) {
          state.selectedReview = action.payload
        }
      })

      // Like/Unlike Review
      .addCase(likeReview.fulfilled, (state, action) => {
        const updateReviewInArray = (array) => {
          const index = array.findIndex(r => r._id === action.payload._id)
          if (index !== -1) {
            array[index] = action.payload
          }
        }
        updateReviewInArray(state.reviews)
        updateReviewInArray(state.productReviews)
        updateReviewInArray(state.userReviews)
        
        if (state.selectedReview && state.selectedReview._id === action.payload._id) {
          state.selectedReview = action.payload
        }
      })
      .addCase(unlikeReview.fulfilled, (state, action) => {
        const updateReviewInArray = (array) => {
          const index = array.findIndex(r => r._id === action.payload._id)
          if (index !== -1) {
            array[index] = action.payload
          }
        }
        updateReviewInArray(state.reviews)
        updateReviewInArray(state.productReviews)
        updateReviewInArray(state.userReviews)
        
        if (state.selectedReview && state.selectedReview._id === action.payload._id) {
          state.selectedReview = action.payload
        }
      })
  },
})

// Export actions
export const { 
  clearError, 
  clearSelectedReview, 
  setFilters, 
  clearFilters,
  setCurrentPage,
  clearProductReviews,
  clearUserReviews
} = reviewSlice.actions

// Export selectors
export const selectReviews = (state) => state.reviews.reviews
export const selectProductReviews = (state) => state.reviews.productReviews
export const selectUserReviews = (state) => state.reviews.userReviews
export const selectSelectedReview = (state) => state.reviews.selectedReview
export const selectReviewsLoading = (state) => state.reviews.isLoading
export const selectReviewsError = (state) => state.reviews.error
export const selectReviewFilters = (state) => state.reviews.filters
export const selectReviewCurrentPage = (state) => state.reviews.currentPage
export const selectReviewStats = (state) => state.reviews.stats

export default reviewSlice.reducer
