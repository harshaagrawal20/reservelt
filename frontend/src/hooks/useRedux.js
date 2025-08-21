import { useDispatch, useSelector } from 'react-redux'

// Custom hook for typed dispatch
export const useAppDispatch = () => useDispatch()

// Custom hook for typed selector
export const useAppSelector = useSelector

// Auth hooks
export const useAuth = () => {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)
  
  return {
    user: auth.user,
    users: auth.users,
    selectedUser: auth.selectedUser,
    isLoading: auth.isLoading,
    error: auth.error,
    isAuthenticated: !!auth.user,
    ...auth,
    dispatch
  }
}

// Products hooks
export const useProducts = () => {
  const dispatch = useAppDispatch()
  const products = useAppSelector((state) => state.products)
  
  return {
    ...products,
    dispatch
  }
}

// Bookings hooks
export const useBookings = () => {
  const dispatch = useAppDispatch()
  const bookings = useAppSelector((state) => state.bookings)
  
  return {
    ...bookings,
    dispatch
  }
}

// Orders hooks
export const useOrders = () => {
  const dispatch = useAppDispatch()
  const orders = useAppSelector((state) => state.orders)
  
  return {
    ...orders,
    dispatch
  }
}

// Customers hooks
export const useCustomers = () => {
  const dispatch = useAppDispatch()
  const customers = useAppSelector((state) => state.customers)
  
  return {
    ...customers,
    dispatch
  }
}

// Reports hooks
export const useReports = () => {
  const dispatch = useAppDispatch()
  const reports = useAppSelector((state) => state.reports)
  
  return {
    ...reports,
    dispatch
  }
}

// Notifications hooks
export const useNotifications = () => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector((state) => state.notifications)
  
  return {
    ...notifications,
    dispatch
  }
}

// Payments hooks
export const usePayments = () => {
  const dispatch = useAppDispatch()
  const payments = useAppSelector((state) => state.payments)
  
  return {
    ...payments,
    dispatch
  }
}

// Invoices hooks
export const useInvoices = () => {
  const dispatch = useAppDispatch()
  const invoices = useAppSelector((state) => state.invoices)
  
  return {
    ...invoices,
    dispatch
  }
}

// Pricelists hooks
export const usePricelists = () => {
  const dispatch = useAppDispatch()
  const pricelists = useAppSelector((state) => state.pricelists)
  
  return {
    ...pricelists,
    dispatch
  }
}

// Reviews hooks
export const useReviews = () => {
  const dispatch = useAppDispatch()
  const reviews = useAppSelector((state) => state.reviews)
  
  return {
    ...reviews,
    dispatch
  }
}

// UI hooks
export const useUI = () => {
  const dispatch = useAppDispatch()
  const ui = useAppSelector((state) => state.ui)
  
  return {
    ...ui,
    dispatch
  }
}
