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

// Auth Async Thunks
export const createUser = createAsyncThunk(
  'auth/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      return data.user
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getAllUsers = createAsyncThunk(
  'auth/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await makeApiCall('/users')
      return data.users
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getUserById = createAsyncThunk(
  'auth/getUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/users/id/${userId}`)
      return data.user
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getUserByClerkId = createAsyncThunk(
  'auth/getUserByClerkId',
  async (clerkId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/users/clerk/${clerkId}`)
      return data.user
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ clerkId, userData }, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/users/clerk/${clerkId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      })
      return data.user
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async (clerkId, { rejectWithValue }) => {
    try {
      const data = await makeApiCall(`/users/clerk/${clerkId}`, {
        method: 'DELETE',
      })
      localStorage.removeItem('token')
      return data.user
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  user: null,
  users: [],
  clerkId: "",
  email: "",
  username: "",
  firstName: "",
  lastName: "",
  photo: "",
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: localStorage.getItem('token') || null,
}

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearUser: (state) => {
      state.user = null
      state.clerkId = ""
      state.email = ""
      state.username = ""
      state.firstName = ""
      state.lastName = ""
      state.photo = ""
      state.isAuthenticated = false
      state.token = null
      localStorage.removeItem('token')
    },
    setUserFromClerk: (state, action) => {
      const { clerkId, email, username, firstName, lastName, photo } = action.payload
      state.clerkId = clerkId || ""
      state.email = email || ""
      state.username = username || ""
      state.firstName = firstName || ""
      state.lastName = lastName || ""
      state.photo = photo || ""
      state.isAuthenticated = true
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload
    },
    setToken: (state, action) => {
      state.token = action.payload
      if (action.payload) {
        localStorage.setItem('token', action.payload)
      } else {
        localStorage.removeItem('token')
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create User
      .addCase(createUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.clerkId = action.payload.clerkId || ""
        state.email = action.payload.email || ""
        state.username = action.payload.username || ""
        state.firstName = action.payload.firstName || ""
        state.lastName = action.payload.lastName || ""
        state.photo = action.payload.photo || ""
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload
        state.error = null
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get User by ID
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.clerkId = action.payload.clerkId || ""
        state.email = action.payload.email || ""
        state.username = action.payload.username || ""
        state.firstName = action.payload.firstName || ""
        state.lastName = action.payload.lastName || ""
        state.photo = action.payload.photo || ""
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get User by Clerk ID
      .addCase(getUserByClerkId.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserByClerkId.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.clerkId = action.payload.clerkId || ""
        state.email = action.payload.email || ""
        state.username = action.payload.username || ""
        state.firstName = action.payload.firstName || ""
        state.lastName = action.payload.lastName || ""
        state.photo = action.payload.photo || ""
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(getUserByClerkId.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.clerkId = action.payload.clerkId || ""
        state.email = action.payload.email || ""
        state.username = action.payload.username || ""
        state.firstName = action.payload.firstName || ""
        state.lastName = action.payload.lastName || ""
        state.photo = action.payload.photo || ""
        state.error = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.clerkId = ""
        state.email = ""
        state.username = ""
        state.firstName = ""
        state.lastName = ""
        state.photo = ""
        state.isAuthenticated = false
        state.token = null
        state.error = null
        localStorage.removeItem('token')
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

// Export actions
export const { 
  clearError, 
  clearUser, 
  setUserFromClerk, 
  setLoading, 
  setAuthenticated,
  setToken 
} = authSlice.actions

// Export selectors
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectUsers = (state) => state.auth.users
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsLoading = (state) => state.auth.isLoading
export const selectError = (state) => state.auth.error
export const selectToken = (state) => state.auth.token

export default authSlice.reducer
