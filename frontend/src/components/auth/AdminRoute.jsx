import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Shield, AlertCircle } from 'lucide-react'

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAdminAccess = () => {
      // Check if admin session exists in localStorage
      const adminSession = localStorage.getItem('adminSession')
      
      if (!adminSession) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const session = JSON.parse(adminSession)
        const now = new Date().getTime()
        
        // Check if session is still valid (24 hours)
        if (session.expiry && now > session.expiry) {
          localStorage.removeItem('adminSession')
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // Verify the session is for an admin user
        if (session.role === 'admin' && session.email) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Invalid admin session:', error)
        localStorage.removeItem('adminSession')
        setIsAdmin(false)
      }
      
      setLoading(false)
    }

    checkAdminAccess()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Redirect to admin login if not authenticated
  if (isAdmin === false) {
    return <Navigate to="/admin-login" replace />
  }

  // Show admin content if verified
  if (isAdmin === true) {
    return children
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Shield className="h-8 w-8 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    </div>
  )
}

export default AdminRoute
