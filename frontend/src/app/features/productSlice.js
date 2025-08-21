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

// Product Async Thunks
export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/products?${queryString}` : '/products'
      const data = await makeApiCall(url)
      return data.products || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getMyProducts = createAsyncThunk(
  'products/getMyProducts',
  async ({ clerkId, ...params }, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/products/my/${clerkId}?${queryString}` : `/products/my/${clerkId}`
      const data = await makeApiCall(url)
      return data.products || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getBrowseProducts = createAsyncThunk(
  'products/getBrowseProducts', 
  async ({ clerkId, ...params }, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = queryString ? `/products/browse/${clerkId}?${queryString}` : `/products/browse/${clerkId}`
      const data = await makeApiCall(url)
      return data.products || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getProductById = createAsyncThunk(
  'products/getProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/products/${productId}`)
      return data.product || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      })
      return data.product || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      })
      return data.product || data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await makeApiCall(`/products/${productId}`, {
        method: 'DELETE',
      })
      return productId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  products: [],
  myProducts: [],
  browseProducts: [],
  selectedProduct: null,
  isLoading: false,
  myProductsLoading: false,
  browseProductsLoading: false,
  error: null,
  myProductsError: null,
  browseProductsError: null,
  totalProducts: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {
    category: '',
    priceRange: { min: 0, max: 1000 },
    availability: '',
    search: '',
  }
}

// Product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        priceRange: { min: 0, max: 1000 },
        availability: '',
        search: '',
      }
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Products
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload
        state.error = null
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get My Products
      .addCase(getMyProducts.pending, (state) => {
        state.myProductsLoading = true
        state.myProductsError = null
      })
      .addCase(getMyProducts.fulfilled, (state, action) => {
        state.myProductsLoading = false
        state.myProducts = action.payload
        state.myProductsError = null
      })
      .addCase(getMyProducts.rejected, (state, action) => {
        state.myProductsLoading = false
        state.myProductsError = action.payload
      })

      // Get Browse Products
      .addCase(getBrowseProducts.pending, (state) => {
        state.browseProductsLoading = true
        state.browseProductsError = null
      })
      .addCase(getBrowseProducts.fulfilled, (state, action) => {
        state.browseProductsLoading = false
        state.browseProducts = action.payload
        state.browseProductsError = null
      })
      .addCase(getBrowseProducts.rejected, (state, action) => {
        state.browseProductsLoading = false
        state.browseProductsError = action.payload
      })

      // Get Product by ID
      .addCase(getProductById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedProduct = action.payload
        state.error = null
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.products.push(action.payload)
        state.myProducts.push(action.payload)
        state.error = null
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.products.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
        const myIndex = state.myProducts.findIndex(p => p._id === action.payload._id)
        if (myIndex !== -1) {
          state.myProducts[myIndex] = action.payload
        }
        if (state.selectedProduct && state.selectedProduct._id === action.payload._id) {
          state.selectedProduct = action.payload
        }
        state.error = null
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = state.products.filter(p => p._id !== action.payload && p.id !== action.payload)
        state.myProducts = state.myProducts.filter(p => p._id !== action.payload && p.id !== action.payload)
        if (state.selectedProduct && (state.selectedProduct._id === action.payload || state.selectedProduct.id === action.payload)) {
          state.selectedProduct = null
        }
        state.error = null
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

// Export actions and async thunks
export const { 
  clearError, 
  clearSelectedProduct, 
  setFilters, 
  clearFilters,
  setCurrentPage 
} = productSlice.actions

// Note: getProducts, getMyProducts, getBrowseProducts, getProductById, 
// createProduct, updateProduct, deleteProduct are already exported above 
// when defined with createAsyncThunk

// Export selectors
export const selectProducts = (state) => state.products.products
export const selectMyProducts = (state) => state.products.myProducts
export const selectBrowseProducts = (state) => state.products.browseProducts
export const selectSelectedProduct = (state) => state.products.selectedProduct
export const selectProductsLoading = (state) => state.products.isLoading
export const selectMyProductsLoading = (state) => state.products.myProductsLoading
export const selectBrowseProductsLoading = (state) => state.products.browseProductsLoading
export const selectProductsError = (state) => state.products.error
export const selectMyProductsError = (state) => state.products.myProductsError
export const selectBrowseProductsError = (state) => state.products.browseProductsError
export const selectProductFilters = (state) => state.products.filters
export const selectCurrentPage = (state) => state.products.currentPage
export const selectTotalPages = (state) => state.products.totalPages

export default productSlice.reducer
