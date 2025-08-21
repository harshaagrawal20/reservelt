import React from 'react'

const OrderTimeline = ({ booking }) => {
  const getTimelineEvents = () => {
    const events = []
    
    // Booking created
    events.push({
      id: 1,
      type: 'booking_created',
      title: 'Booking Created',
      description: 'Rental request submitted',
      timestamp: booking.createdAt,
      status: 'completed',
      icon: '📋'
    })
    
    // Payment events
    if (booking.paymentStatus === 'paid') {
      events.push({
        id: 2,
        type: 'payment_completed',
        title: 'Payment Completed',
        description: `₹${booking.totalPrice} paid successfully`,
        timestamp: booking.updatedAt, // Approximation
        status: 'completed',
        icon: '💰'
      })
    } else if (booking.paymentStatus === 'pending') {
      events.push({
        id: 2,
        type: 'payment_pending',
        title: 'Payment Pending',
        description: 'Waiting for payment completion',
        timestamp: null,
        status: 'pending',
        icon: '⏳'
      })
    }
    
    // Pickup/Delivery events
    if (booking.pickupStatus === 'completed' && booking.deliveryDate) {
      events.push({
        id: 3,
        type: 'pickup_completed',
        title: 'Item Picked Up',
        description: 'Product successfully delivered to renter',
        timestamp: booking.deliveryDate,
        status: 'completed',
        icon: '📦'
      })
    } else if (booking.pickupStatus === 'scheduled' && booking.pickupDate) {
      events.push({
        id: 3,
        type: 'pickup_scheduled',
        title: 'Pickup Scheduled',
        description: `Scheduled for ${new Date(booking.pickupDate).toLocaleDateString()}`,
        timestamp: booking.pickupDate,
        status: 'scheduled',
        icon: '📅'
      })
    } else if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
      events.push({
        id: 3,
        type: 'pickup_pending',
        title: 'Pickup Pending',
        description: 'Ready for pickup verification',
        timestamp: null,
        status: 'pending',
        icon: '📦'
      })
    }
    
    // Rental period
    if (booking.status === 'in_rental') {
      events.push({
        id: 4,
        type: 'rental_active',
        title: 'Rental Active',
        description: `Item in use until ${new Date(booking.endDate).toLocaleDateString()}`,
        timestamp: booking.startDate,
        status: 'active',
        icon: '🔄'
      })
    }
    
    // Return events
    if (booking.returnStatus === 'completed' && booking.returnDate) {
      events.push({
        id: 5,
        type: 'return_completed',
        title: 'Item Returned',
        description: 'Product successfully returned to owner',
        timestamp: booking.returnDate,
        status: 'completed',
        icon: '✅'
      })
    } else if (booking.returnStatus === 'late') {
      events.push({
        id: 5,
        type: 'return_late',
        title: 'Return Overdue',
        description: `Late fee: ₹${booking.lateFee || 0}`,
        timestamp: booking.endDate,
        status: 'overdue',
        icon: '⚠️'
      })
    } else if (booking.status === 'in_rental') {
      events.push({
        id: 5,
        type: 'return_scheduled',
        title: 'Return Due',
        description: `Expected return: ${new Date(booking.endDate).toLocaleDateString()}`,
        timestamp: booking.endDate,
        status: 'upcoming',
        icon: '🔄'
      })
    }
    
    // Completion
    if (booking.status === 'completed') {
      events.push({
        id: 6,
        type: 'booking_completed',
        title: 'Rental Completed',
        description: 'Booking successfully completed',
        timestamp: booking.returnDate || booking.updatedAt,
        status: 'completed',
        icon: '🎉'
      })
    }
    
    return events.sort((a, b) => {
      if (!a.timestamp && !b.timestamp) return 0
      if (!a.timestamp) return 1
      if (!b.timestamp) return -1
      return new Date(a.timestamp) - new Date(b.timestamp)
    })
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'active': return 'bg-blue-500'
      case 'scheduled': return 'bg-yellow-500'
      case 'pending': return 'bg-gray-400'
      case 'upcoming': return 'bg-orange-500'
      case 'overdue': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }
  
  const getStatusTextColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700'
      case 'active': return 'text-blue-700'
      case 'scheduled': return 'text-yellow-700'
      case 'pending': return 'text-gray-600'
      case 'upcoming': return 'text-orange-700'
      case 'overdue': return 'text-red-700'
      default: return 'text-gray-600'
    }
  }
  
  const events = getTimelineEvents()
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Timeline</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Timeline events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex items-start">
              {/* Timeline dot */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getStatusColor(event.status)} text-white text-lg`}>
                {event.icon}
              </div>
              
              {/* Event content */}
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                  {event.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-1 ${getStatusTextColor(event.status)}`}>
                  {event.description}
                </p>
                
                {/* Status badge */}
                <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                  event.status === 'completed' ? 'bg-green-100 text-green-800' :
                  event.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  event.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  event.status === 'pending' ? 'bg-gray-100 text-gray-600' :
                  event.status === 'upcoming' ? 'bg-orange-100 text-orange-800' :
                  event.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary stats */}
      <div className="mt-8 pt-6 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-gray-600">Days</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">₹{booking.totalPrice}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {booking.lateFee > 0 ? `₹${booking.lateFee}` : '₹0'}
            </div>
            <div className="text-sm text-gray-600">Late Fee</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-semibold ${
              booking.status === 'completed' ? 'text-green-600' :
              booking.status === 'in_rental' ? 'text-blue-600' :
              booking.status === 'confirmed' ? 'text-yellow-600' :
              'text-gray-600'
            }`}>
              {booking.status.replace('_', ' ').toUpperCase()}
            </div>
            <div className="text-sm text-gray-600">Status</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTimeline
