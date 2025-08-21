// App.jsx
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'

// Import your components
import Home from './components/Home'
import SignInPage from './components/auth/SignInPage'
import SignUpPage from './components/auth/SignUpPage'
import AdminLoginPage from './components/auth/AdminLoginPage'
import AdminRoute from './components/auth/AdminRoute'
import Dashboard from './components/Dashboard'
import Products from './components/Products'
import BrowseProducts from './components/BrowseProducts'
import Orders from './components/Orders'
import BookingDetails from './components/BookingDetails'
import Customers from './components/Customers'
import Reports from './components/Reports'
import Settings from './components/Settings'
import ClerkUserSync from './components/ClerkUserSync'
import RentalOrderForm from './components/RentalOrderForm'
import PickupOrder from './components/PickupOrder'
import ReturnOrder from './components/ReturnOrder'
import ProductInventory from './components/ProductInventory'
import ProductConfiguration from './components/ProductConfiguration'
import ProductCatalog from './components/ProductCatalog'
import ProductDetails from './components/ProductDetails'
import QuoteOrder from './components/QuoteOrder'
import DeliveryManagement from './components/DeliveryManagement'
import CustomerPortal from './components/CustomerPortal'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminDashboardRedux from './components/admin/AdminDashboardRedux'
import AdminUserManagement from './components/admin/AdminUserManagement'
import AdminProductManagement from './components/admin/AdminProductManagement'
import AdminProductManagementRedux from './components/admin/AdminProductManagementRedux'
import AdminOrderManagementRedux from './components/admin/AdminOrderManagementRedux'
import AdminReports from './components/admin/AdminReports'
import Notifications from './components/Notifications'
import PaymentPage from './components/PaymentPage'
import Payment from './pages/Payment'
import PaymentStatus from './pages/PaymentStatus'
import PaymentSuccessPage from './components/PaymentSuccessPage'
import AnimationDemo from './pages/AnimationDemo'

// Import Redux hooks
import { useAuth, useNotifications } from './hooks/useRedux'
import { getUnreadCount } from './app/features/notificationSlice'

// Import Tutorial System
import TutorialProvider from './components/Tutorial/TutorialProvider'

// Router Config
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/sign-in/*',
    element: <SignInPage />
  },
  {
    path: '/sign-up/*',
    element: <SignUpPage />
  },
  {
    path: '/admin-login',
    element: <AdminLoginPage />
  },
  {
    path: '/dashboard',
    element: (
      <SignedIn>
        <Dashboard />
      </SignedIn>
    )
  },
      {
        path: 'products',
        element: (
          <SignedIn>
            <Products />
          </SignedIn>
        )
      },
      {
        path: 'browse-products',
        element: (
          <SignedIn>
            <BrowseProducts />
          </SignedIn>
        )
      },
      {
        path: 'orders',
        element: (
          <SignedIn>
            <Orders />
          </SignedIn>
        )
      },
      {
        path: 'orders/new',
        element: (
          <SignedIn>
            <RentalOrderForm />
          </SignedIn>
        )
      },
      {
        path: 'orders/:orderId',
        element: (
          <SignedIn>
            <BookingDetails />
      </SignedIn>
    )
  },
  {
    path: '/pickup',
    element: (
      <SignedIn>
        <PickupOrder />
      </SignedIn>
    )
  },
  {
    path: '/pickup/:pickupId',
    element: (
      <SignedIn>
        <PickupOrder />
      </SignedIn>
    )
  },
  {
    path: '/return',
    element: (
      <SignedIn>
        <ReturnOrder />
      </SignedIn>
    )
  },
  {
    path: '/return/:returnId',
    element: (
      <SignedIn>
        <ReturnOrder />
      </SignedIn>
    )
  },
  {
    path: '/inventory',
    element: (
      <SignedIn>
        <ProductInventory />
      </SignedIn>
    )
  },
  {
    path: '/products/configure',
    element: (
      <SignedIn>
        <ProductConfiguration />
      </SignedIn>
    )
  },
  {
    path: '/products/configure/:productId',
    element: (
      <SignedIn>
        <ProductConfiguration />
      </SignedIn>
    )
  },
  {
    path: '/catalog',
    element: (
      <SignedIn>
        <ProductCatalog />
      </SignedIn>
    )
  },
  {
    path: '/products/:productId',
    element: (
      <SignedIn>
        <ProductDetails />
      </SignedIn>
    )
  },
  {
    path: '/quote',
    element: (
      <SignedIn>
        <QuoteOrder />
      </SignedIn>
    )
  },
  {
    path: '/quote/:quoteId',
    element: (
      <SignedIn>
        <QuoteOrder />
      </SignedIn>
    )
  },
  {
    path: '/delivery',
    element: (
      <SignedIn>
        <DeliveryManagement />
      </SignedIn>
    )
  },
  {
    path: '/customer-portal',
    element: (
      <SignedIn>
        <CustomerPortal />
      </SignedIn>
    )
  },
  {
    path: '/customers',
    element: (
      <SignedIn>
        <Customers />
      </SignedIn>
    )
  },
  {
    path: '/reports',
    element: (
      <SignedIn>
        <Reports />
      </SignedIn>
    )
  },
  {
    path: '/settings',
    element: (
      <SignedIn>
        <Settings />
      </SignedIn>
    )
  },
  {
    path: '/notifications',
    element: (
      <SignedIn>
        <Notifications />
      </SignedIn>
    )
  },
  {
    path: '/payment',
    element: (
      <SignedIn>
        <Payment />
      </SignedIn>
    )
  },
  {
    path: '/payment-status',
    element: (
      <SignedIn>
        <PaymentStatus />
      </SignedIn>
    )
  },
  {
    path: '/payment-page',
    element: (
      <SignedIn>
        <PaymentPage />
      </SignedIn>
    )
  },
  {
    path: '/payment-success',
    element: (
      <SignedIn>
        <PaymentSuccessPage />
      </SignedIn>
    )
  },
  {
    path: '/animations-demo',
    element: (
      <SignedIn>
        <AnimationDemo />
      </SignedIn>
    )
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminDashboardRedux />
      </AdminRoute>
    )
  },
  {
    path: '/admin/users',
    element: (
      <AdminRoute>
        <AdminUserManagement />
      </AdminRoute>
    )
  },
  {
    path: '/admin/products',
    element: (
      <AdminRoute>
        <AdminProductManagementRedux />
      </AdminRoute>
    )
  },
  {
    path: '/admin/orders',
    element: (
      <AdminRoute>
        <AdminOrderManagementRedux />
      </AdminRoute>
    )
  },
  {
    path: '/admin/reports',
    element: (
      <AdminRoute>
        <AdminReports />
      </AdminRoute>
    )
  },
  {
    path: '/protected',
    element: (
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    )
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
])

function App() {
  const { user } = useUser()
  const { dispatch } = useNotifications()
  const [lastUnreadCount, setLastUnreadCount] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Monitor notifications in real-time
  useEffect(() => {
    if (user?.id) {
      // Check for new notifications every 15 seconds
      const interval = setInterval(async () => {
        try {
          const result = await dispatch(getUnreadCount(user.id)).unwrap()
          if (result > lastUnreadCount && lastUnreadCount > 0) {
            // New notification received
            setToastMessage(`You have ${result - lastUnreadCount} new notification${result - lastUnreadCount > 1 ? 's' : ''}!`)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 4000) // Hide after 4 seconds
          }
          setLastUnreadCount(result)
        } catch (error) {
          console.error('Failed to check for new notifications:', error)
        }
      }, 15000) // Check every 15 seconds

      return () => clearInterval(interval)
    }
  }, [user?.id, dispatch, lastUnreadCount])

  return (
    <>
      <ClerkUserSync />
      <TutorialProvider>
        <div className="min-h-screen bg-gray-50">
          <RouterProvider router={router} />
          
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                <span>{toastMessage}</span>
              </div>
            </div>
          )}
        </div>
      </TutorialProvider>
    </>
  )
}

export default App
