import { createSlice } from '@reduxjs/toolkit'

// Initial state for UI-related data
const initialState = {
  // Theme settings
  theme: 'light', // 'light' | 'dark' | 'system'
  
  // Layout settings
  sidebarOpen: true,
  sidebarCollapsed: false,
  
  // Loading states for global operations
  globalLoading: false,
  
  // Modals and dialogs
  modals: {
    createProduct: false,
    editProduct: false,
    deleteConfirm: false,
    createBooking: false,
    editBooking: false,
    createCustomer: false,
    editCustomer: false,
    createOrder: false,
    editOrder: false,
    paymentModal: false,
    invoiceModal: false,
    pricelistModal: false,
    reviewModal: false,
    settingsModal: false,
  },
  
  // Current active modal data
  activeModalData: null,
  
  // Notifications/Toasts
  notifications: [],
  
  // Search and filter states
  searchQuery: '',
  globalFilters: {},
  
  // View preferences
  viewMode: 'grid', // 'grid' | 'list' | 'table'
  itemsPerPage: 12,
  
  // Navigation
  currentPage: 'dashboard',
  breadcrumbs: [],
  
  // Mobile responsiveness
  isMobile: false,
  
  // Error handling
  globalError: null,
  
  // Loading overlay
  showLoadingOverlay: false,
  loadingMessage: '',
  
  // Confirmation dialogs
  confirmDialog: {
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  }
}

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload
    },
    
    // Global loading
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { modalName, data = null } = action.payload
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = true
        state.activeModalData = data
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false
        if (Object.values(state.modals).every(isOpen => !isOpen)) {
          state.activeModalData = null
        }
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modalName => {
        state.modals[modalName] = false
      })
      state.activeModalData = null
    },
    setActiveModalData: (state, action) => {
      state.activeModalData = action.payload
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...action.payload
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notif => notif.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    // Search and filter actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    clearSearchQuery: (state) => {
      state.searchQuery = ''
    },
    setGlobalFilters: (state, action) => {
      state.globalFilters = { ...state.globalFilters, ...action.payload }
    },
    clearGlobalFilters: (state) => {
      state.globalFilters = {}
    },
    
    // View preferences
    setViewMode: (state, action) => {
      state.viewMode = action.payload
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload
    },
    
    // Navigation actions
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload
    },
    addBreadcrumb: (state, action) => {
      state.breadcrumbs.push(action.payload)
    },
    removeBreadcrumb: (state, action) => {
      state.breadcrumbs = state.breadcrumbs.slice(0, action.payload)
    },
    
    // Mobile responsiveness
    setIsMobile: (state, action) => {
      state.isMobile = action.payload
    },
    
    // Error handling
    setGlobalError: (state, action) => {
      state.globalError = action.payload
    },
    clearGlobalError: (state) => {
      state.globalError = null
    },
    
    // Loading overlay
    showLoadingOverlay: (state, action) => {
      state.showLoadingOverlay = true
      state.loadingMessage = action.payload || 'Loading...'
    },
    hideLoadingOverlay: (state) => {
      state.showLoadingOverlay = false
      state.loadingMessage = ''
    },
    
    // Confirmation dialog
    showConfirmDialog: (state, action) => {
      state.confirmDialog = {
        open: true,
        ...action.payload
      }
    },
    hideConfirmDialog: (state) => {
      state.confirmDialog = {
        open: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
      }
    }
  }
})

// Export actions
export const {
  // Theme
  setTheme,
  toggleTheme,
  
  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  
  // Global loading
  setGlobalLoading,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  setActiveModalData,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Search and filters
  setSearchQuery,
  clearSearchQuery,
  setGlobalFilters,
  clearGlobalFilters,
  
  // View preferences
  setViewMode,
  setItemsPerPage,
  
  // Navigation
  setCurrentPage,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  
  // Mobile
  setIsMobile,
  
  // Error handling
  setGlobalError,
  clearGlobalError,
  
  // Loading overlay
  showLoadingOverlay,
  hideLoadingOverlay,
  
  // Confirmation dialog
  showConfirmDialog,
  hideConfirmDialog
} = uiSlice.actions

// Export selectors
export const selectTheme = (state) => state.ui.theme
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed
export const selectGlobalLoading = (state) => state.ui.globalLoading
export const selectModals = (state) => state.ui.modals
export const selectActiveModalData = (state) => state.ui.activeModalData
export const selectNotifications = (state) => state.ui.notifications
export const selectSearchQuery = (state) => state.ui.searchQuery
export const selectGlobalFilters = (state) => state.ui.globalFilters
export const selectViewMode = (state) => state.ui.viewMode
export const selectItemsPerPage = (state) => state.ui.itemsPerPage
export const selectCurrentPage = (state) => state.ui.currentPage
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs
export const selectIsMobile = (state) => state.ui.isMobile
export const selectGlobalError = (state) => state.ui.globalError
export const selectShowLoadingOverlay = (state) => state.ui.showLoadingOverlay
export const selectLoadingMessage = (state) => state.ui.loadingMessage
export const selectConfirmDialog = (state) => state.ui.confirmDialog

export default uiSlice.reducer
