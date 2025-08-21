import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { useNotifications } from '../hooks/useRedux'
import { getUnreadCount } from '../app/features/notificationSlice'
import TutorialHelp from './Tutorial/TutorialHelp'

const Navbar = () => {
  const { user } = useUser()
  const location = useLocation()
  const navigate = useNavigate()
  const [hoveredItem, setHoveredItem] = useState(null)
  const { unreadCount, dispatch } = useNotifications()

  // Load unread count on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(getUnreadCount(user.id))
      
      // Update unread count every 30 seconds
      const interval = setInterval(() => {
        dispatch(getUnreadCount(user.id))
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [user?.id, dispatch])

  const handleMouseEnter = (e) => {
    const element = e.currentTarget
    element.style.transform = 'translateY(-2px) scale(1.02)'
  }

  const handleMouseLeave = (e) => {
    const element = e.currentTarget
    element.style.transform = 'translateY(0) scale(1)'
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'My Products', href: '/products', icon: 'products' },
    { name: 'Browse Products', href: '/browse-products', icon: 'browse' },
    { name: 'Orders', href: '/orders', icon: 'orders' },
    { name: 'Notifications', href: '/notifications', icon: 'notifications' },
    { name: 'Settings', href: '/settings', icon: 'settings' }
  ]

  const getIcon = (iconName) => {
    const icons = {
      dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 01-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
      products: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      browse: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      orders: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      customers: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      reports: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      notifications: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      admin: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
    return icons[iconName] || icons.dashboard
  }

  const isActivePage = (href) => {
    return location.pathname === href
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-emerald-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-3 transition-all duration-300 hover-lift cursor-pointer"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center space-x-2">
                <img 
                  src="/thu umage.png" 
                  alt="Company Logo"
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    // Fallback to existing image.png if thu umage.png doesn't exist
                    e.target.src = "/image.png"
                  }}
                />
                <span className="text-xl font-bold text-gray-800 transition-colors duration-300 hover:text-emerald-600"></span>
              </div>
            </Link>
            
            {/* Navigation Menu - Desktop (icons with tooltips) */}
            <div className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                const isActive = isActivePage(item.href)
                const isNotifications = item.icon === 'notifications'
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    title={item.name}
                    aria-label={item.name}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-300 magnetic-btn cursor-pointer hover-lift ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                    } ${isNotifications ? 'notification-bell' : ''}`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {getIcon(item.icon)}
                    {isNotifications && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-6">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white/90 text-sm transition-all duration-300 hover:shadow-md focus:shadow-lg"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              
              <button 
                className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 text-sm flex items-center space-x-1 magnetic-btn cursor-pointer hover-lift shadow-md hover:shadow-lg"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => navigate('/products?new=1')}
                title="New Rental"
                aria-label="New Rental"
              >
                <svg className="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <TutorialHelp className="hidden md:flex" />
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-800 transition-colors duration-300 hover:text-emerald-600">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin'}
                </div>
                <div className="text-xs text-gray-600">
                  {user?.primaryEmailAddress?.emailAddress || 'admin@rental.com'}
                </div>
              </div>
              <div className="flex items-center user-profile">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopoverCard: "bg-white shadow-lg border border-purple-200 rounded-lg",
                      userButtonPopoverActions: "text-navy-700"
                    }
                  }}
                />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="p-2 text-navy-600 hover:bg-purple-100 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu (labels retained) */}
        <div className="md:hidden border-t border-purple-200 py-2">
          <div className="grid grid-cols-3 gap-2">
            {navigation.slice(0, 6).map((item) => {
              const isActive = isActivePage(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-500 text-white'
                      : 'text-navy-700 hover:bg-purple-100'
                  }`}
                >
                  {getIcon(item.icon)}
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
