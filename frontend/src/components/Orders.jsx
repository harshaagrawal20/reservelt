import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Navbar from './Navbar'
import { useUser } from '@clerk/clerk-react'
import { getBookings } from '../app/features/bookingSlice'

const Orders = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { bookings, isLoading, error } = useSelector(state => state.bookings)
  
  const [userBookings, setUserBookings] = useState([])

  useEffect(() => {
    if (user?.id) {
      // Fetch all bookings and filter for current user on frontend
      dispatch(getBookings({ 
        clerkId: user.id,
        page: 1,
        limit: 100 
      }))
    }
  }, [user?.id, dispatch])

  useEffect(() => {
    // Filter bookings to show only those where user is renter or owner
    if (bookings && user?.id) {
      const filteredBookings = bookings.filter(booking => 
        booking.renterClerkId === user.id || booking.ownerClerkId === user.id
      )
      setUserBookings(filteredBookings)
    }
  }, [bookings, user?.id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-3xl font-bold text-midnight-800 mb-4 sm:mb-0">Orders Management</h1>
            {/* <button
              onClick={() => navigate('/orders/new')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Rental Order</span>
            </button> */}
          </div>
          {isLoading && <div className="text-navy-600">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-navy-600 border-b">
                    <th className="py-2 pr-4">Booking ID</th>
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Dates</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No orders found. Start by browsing products or listing your own items for rent.
                      </td>
                    </tr>
                  ) : (
                    userBookings.map(booking => (
                      <tr 
                        key={booking._id} 
                        className="border-b hover:bg-purple-50 cursor-pointer"
                        onClick={() => navigate(`/orders/${booking._id}`)}
                      >
                        <td className="py-2 pr-4 font-mono">{booking._id.slice(-6)}</td>
                        <td className="py-2 pr-4">{booking.productId?.title || 'N/A'}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.renterClerkId === user.id 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {booking.renterClerkId === user.id ? 'Renter' : 'Owner'}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 pr-4">₹{booking.totalPrice}</td>
                        <td className="py-2 pr-4 capitalize">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'paid' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'requested' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Orders
