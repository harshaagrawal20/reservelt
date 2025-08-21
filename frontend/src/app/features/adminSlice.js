import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Async thunks for admin operations

// Fetch admin dashboard stats
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const [usersRes, ordersRes, productsRes, paymentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/bookings`),
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/payments`)
      ])

      const [usersData, ordersData, productsData, paymentsData] = await Promise.all([
        usersRes.json(),
        ordersRes.json(),
        productsRes.json(),
        paymentsRes.json()
      ])

      if (!usersData.success || !ordersData.success || !productsData.success) {
        throw new Error('Failed to fetch admin data')
      }

      const users = usersData.users || []
      const orders = ordersData.bookings || []
      const products = productsData.products || []
      const payments = paymentsData.payments || []

      // Calculate stats
      const activeUsers = users.filter(user => user.isActive !== false).length
      const pendingOrders = orders.filter(order => order.status === 'pending').length
      const activeRentals = orders.filter(order => order.status === 'active').length
      const completedOrders = orders.filter(order => order.status === 'completed')
      const overduedReturns = orders.filter(order => {
        if (order.status !== 'active') return false
        const returnDate = new Date(order.returnDate)
        return returnDate < new Date()
      }).length
      
      const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
      const lowStockItems = products.filter(product => (product.quantity || 0) < 5).length

      // Recent activity
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)

      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)

      // Revenue trends (last 12 months)
      const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
        const month = new Date()
        month.setMonth(month.getMonth() - (11 - i))
        const monthStr = month.toISOString().substring(0, 7)
        
        const monthRevenue = completedOrders
          .filter(order => order.createdAt.substring(0, 7) === monthStr)
          .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
          
        return {
          month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue
        }
      })

      // Orders by status
      const ordersByStatus = {
        pending: pendingOrders,
        active: activeRentals,
        completed: completedOrders.length,
        cancelled: orders.filter(order => order.status === 'cancelled').length
      }

      return {
        stats: {
          totalUsers: users.length,
          activeUsers,
          totalOrders: orders.length,
          pendingOrders,
          activeRentals,
          completedOrders: completedOrders.length,
          totalRevenue,
          totalProducts: products.length,
          lowStockItems,
          overduedReturns
        },
        recentActivity: {
          recentOrders,
          recentUsers
        },
        charts: {
          revenueByMonth,
          ordersByStatus,
          userGrowth: users.length,
          productCategories: products.reduce((acc, product) => {
            const category = product.category || 'Other'
            acc[category] = (acc[category] || 0) + 1
            return acc
          }, {})
        }
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch all users for admin management
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const [usersRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/bookings`)
      ])

      const [usersData, ordersData] = await Promise.all([
        usersRes.json(),
        ordersRes.json()
      ])

      if (!usersData.success) {
        throw new Error(usersData.message || 'Failed to fetch users')
      }

      const users = usersData.users || []
      const orders = ordersData.success ? (ordersData.bookings || []) : []

      // Enhance users with order statistics
      const enhancedUsers = users.map(user => {
        const userOrders = orders.filter(order => 
          order.renterId === user._id || 
          order.renterClerkId === user.clerkId ||
          order.userId === user._id
        )
        const completedOrders = userOrders.filter(order => order.status === 'completed')
        const totalSpent = completedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)

        return {
          ...user,
          id: user._id,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
          totalOrders: userOrders.length,
          totalSpent,
          joinDate: new Date(user.createdAt).toLocaleDateString(),
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
          status: user.isActive !== false ? 'active' : 'inactive',
          phone: user.phone || 'N/A'
        }
      })

      return enhancedUsers
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch all products for admin management
export const fetchAllProducts = createAsyncThunk(
  'admin/fetchAllProducts',
  async (_, { rejectWithValue }) => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/bookings`)
      ])

      const [productsData, ordersData] = await Promise.all([
        productsRes.json(),
        ordersRes.json()
      ])

      if (!productsData.success) {
        throw new Error(productsData.message || 'Failed to fetch products')
      }

      const products = productsData.products || []
      const orders = ordersData.success ? (ordersData.bookings || []) : []

      // Enhance products with rental statistics
      const enhancedProducts = products.map(product => {
        const productOrders = orders.filter(order => order.productId === product._id)
        const completedRentals = productOrders.filter(order => order.status === 'completed')
        const activeRentals = productOrders.filter(order => order.status === 'active')
        const totalRevenue = completedRentals.reduce((sum, order) => sum + (order.totalPrice || 0), 0)

        return {
          ...product,
          id: product._id,
          totalRentals: productOrders.length,
          activeRentals: activeRentals.length,
          totalRevenue,
          availability: product.quantity > 0 ? 'Available' : 'Out of Stock',
          lastRented: productOrders.length > 0 
            ? new Date(Math.max(...productOrders.map(o => new Date(o.createdAt)))).toLocaleDateString()
            : 'Never'
        }
      })

      return enhancedProducts
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch all orders for admin management
export const fetchAllOrders = createAsyncThunk(
  'admin/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/bookings`),
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/products`)
      ])

      const [ordersData, usersData, productsData] = await Promise.all([
        ordersRes.json(),
        usersRes.json(),
        productsRes.json()
      ])

      if (!ordersData.success) {
        throw new Error(ordersData.message || 'Failed to fetch orders')
      }

      const orders = ordersData.bookings || []
      const users = usersData.success ? (usersData.users || []) : []
      const products = productsData.success ? (productsData.products || []) : []

      // Enhance orders with user and product details
      const enhancedOrders = orders.map(order => {
        const user = users.find(u => u._id === order.renterId || u.clerkId === order.renterClerkId || u._id === order.userId)
        const product = products.find(p => p._id === order.productId)

        return {
          ...order,
          id: order._id,
          customerName: user 
            ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username)
            : 'Unknown Customer',
          customerEmail: user?.email || 'N/A',
          productName: product?.name || 'Unknown Product',
          productImage: product?.images?.[0] || '',
          orderDate: new Date(order.createdAt).toLocaleDateString(),
          returnDate: order.returnDate ? new Date(order.returnDate).toLocaleDateString() : 'N/A',
          duration: order.rentalDuration || 'N/A',
          isOverdue: order.status === 'active' && order.returnDate && new Date(order.returnDate) < new Date()
        }
      })

      return enhancedOrders
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// User management actions
export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update user status')
      }

      return { userId, isActive }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete user')
      }

      return userId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Product management actions
export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update product')
      }

      return data.product
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete product')
      }

      return productId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Order management actions
export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update order status')
      }

      return { orderId, status }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  // Dashboard data
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeRentals: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockItems: 0,
    overduedReturns: 0
  },
  recentActivity: {
    recentOrders: [],
    recentUsers: []
  },
  charts: {
    revenueByMonth: [],
    ordersByStatus: {},
    userGrowth: 0,
    productCategories: {}
  },
  
  // Management data
  users: [],
  products: [],
  orders: [],
  
  // UI state
  loading: {
    stats: false,
    users: false,
    products: false,
    orders: false
  },
  error: {
    stats: null,
    users: null,
    products: null,
    orders: null
  },
  
  // Filters and search
  filters: {
    users: {
      search: '',
      role: 'all',
      status: 'all'
    },
    products: {
      search: '',
      category: 'all',
      status: 'all'
    },
    orders: {
      search: '',
      status: 'all',
      dateRange: 'all'
    }
  }
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Filter actions
    setUserFilter: (state, action) => {
      state.filters.users = { ...state.filters.users, ...action.payload }
    },
    setProductFilter: (state, action) => {
      state.filters.products = { ...state.filters.products, ...action.payload }
    },
    setOrderFilter: (state, action) => {
      state.filters.orders = { ...state.filters.orders, ...action.payload }
    },
    
    // Clear error actions
    clearError: (state, action) => {
      const { section } = action.payload
      if (section) {
        state.error[section] = null
      } else {
        state.error = { stats: null, users: null, products: null, orders: null }
      }
    }
  },
  extraReducers: (builder) => {
    // Admin stats
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading.stats = true
        state.error.stats = null
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading.stats = false
        state.stats = action.payload.stats
        state.recentActivity = action.payload.recentActivity
        state.charts = action.payload.charts
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading.stats = false
        state.error.stats = action.payload
      })

    // Users management
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading.users = true
        state.error.users = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading.users = false
        state.users = action.payload
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading.users = false
        state.error.users = action.payload
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const { userId, isActive } = action.payload
        const user = state.users.find(u => u.id === userId)
        if (user) {
          user.status = isActive ? 'active' : 'inactive'
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload)
      })

    // Products management
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading.products = true
        state.error.products = null
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading.products = false
        state.products = action.payload
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading.products = false
        state.error.products = action.payload
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload
        const index = state.products.findIndex(p => p.id === updatedProduct._id)
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...updatedProduct }
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(product => product.id !== action.payload)
      })

    // Orders management
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading.orders = true
        state.error.orders = null
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading.orders = false
        state.orders = action.payload
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading.orders = false
        state.error.orders = action.payload
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status } = action.payload
        const order = state.orders.find(o => o.id === orderId)
        if (order) {
          order.status = status
        }
      })
  }
})

export const { setUserFilter, setProductFilter, setOrderFilter, clearError } = adminSlice.actions

// Selectors
export const selectAdminStats = (state) => state.admin.stats
export const selectAdminCharts = (state) => state.admin.charts
export const selectRecentActivity = (state) => state.admin.recentActivity
export const selectAllUsers = (state) => state.admin.users
export const selectAllProducts = (state) => state.admin.products
export const selectAllOrders = (state) => state.admin.orders
export const selectAdminLoading = (state) => state.admin.loading
export const selectAdminError = (state) => state.admin.error
export const selectAdminFilters = (state) => state.admin.filters

// Filtered selectors
export const selectFilteredUsers = (state) => {
  const users = state.admin.users
  const filters = state.admin.filters.users
  
  return users.filter(user => {
    const matchesSearch = filters.search === '' || 
      user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.username?.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesRole = filters.role === 'all' || user.role === filters.role
    const matchesStatus = filters.status === 'all' || user.status === filters.status
    
    return matchesSearch && matchesRole && matchesStatus
  })
}

export const selectFilteredProducts = (state) => {
  const products = state.admin.products
  const filters = state.admin.filters.products
  
  return products.filter(product => {
    const matchesSearch = filters.search === '' || 
      product.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.description?.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesCategory = filters.category === 'all' || product.category === filters.category
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'available' && product.quantity > 0) ||
      (filters.status === 'out-of-stock' && product.quantity === 0)
    
    return matchesSearch && matchesCategory && matchesStatus
  })
}

export const selectFilteredOrders = (state) => {
  const orders = state.admin.orders
  const filters = state.admin.filters.orders
  
  return orders.filter(order => {
    const matchesSearch = filters.search === '' || 
      order.customerName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.productName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.id?.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || order.status === filters.status
    
    // Date range filtering can be added here
    
    return matchesSearch && matchesStatus
  })
}

export default adminSlice.reducer
