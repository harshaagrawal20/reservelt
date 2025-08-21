import React, { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const AvailabilityCalendar = ({ 
  productId, 
  selectedStartDate, 
  selectedEndDate, 
  onDateRangeSelect,
  onAvailabilityCheck 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [unavailablePeriods, setUnavailablePeriods] = useState([])
  const [loading, setLoading] = useState(false)
  const [hoveredDate, setHoveredDate] = useState(null)
  const [selectingRange, setSelectingRange] = useState(false)
  const [tempStartDate, setTempStartDate] = useState(null)
  const [productStatus, setProductStatus] = useState(null)

  useEffect(() => {
    if (productId) {
      fetchCalendarData()
      fetchProductStatus()
    }
  }, [productId, currentMonth])

  const fetchCalendarData = async () => {
    setLoading(true)
    try {
      const startMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0) // 2 months view
      
      const response = await fetch(
        `${API_BASE_URL}/bookings/availability/calendar/${productId}?startMonth=${startMonth.toISOString()}&endMonth=${endMonth.toISOString()}`
      )
      const data = await response.json()
      
      if (data.success) {
        setUnavailablePeriods(data.unavailablePeriods || [])
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/booking-status/${productId}`)
      const data = await response.json()
      
      if (data.success) {
        setProductStatus(data)
      }
    } catch (error) {
      console.error('Error fetching product status:', error)
    }
  }

  const isDateUnavailable = (date) => {
    const dateStr = date.toDateString()
    return unavailablePeriods.some(period => {
      const start = new Date(period.startDate)
      const end = new Date(period.endDate)
      return date >= start && date <= end
    })
  }

  const getDateStatus = (date) => {
    const period = unavailablePeriods.find(period => {
      const start = new Date(period.startDate)
      const end = new Date(period.endDate)
      return date >= start && date <= end
    })
    
    if (!period) return 'available'
    
    // Return different status based on booking status
    if (period.status === 'confirmed' || period.status === 'in_rental') {
      return 'rented'
    } else if (period.status === 'accepted' || period.status === 'pending_payment') {
      return 'booked'
    }
    
    return 'unavailable'
  }

  const isDateInPast = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isDateSelected = (date) => {
    if (!selectedStartDate && !selectedEndDate) return false
    
    const start = selectedStartDate ? new Date(selectedStartDate) : null
    const end = selectedEndDate ? new Date(selectedEndDate) : null
    
    if (start && end) {
      return date >= start && date <= end
    } else if (start) {
      return date.toDateString() === start.toDateString()
    }
    return false
  }

  const isDateInTempRange = (date) => {
    if (!tempStartDate || !hoveredDate) return false
    
    const start = new Date(Math.min(tempStartDate, hoveredDate))
    const end = new Date(Math.max(tempStartDate, hoveredDate))
    
    return date >= start && date <= end
  }

  const isRangeAvailable = (startDate, endDate) => {
    if (!startDate || !endDate) return true
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Check if any date in the range is unavailable
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (isDateUnavailable(new Date(d)) || isDateInPast(new Date(d))) {
        return false
      }
    }
    return true
  }

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    if (isDateUnavailable(date) || isDateInPast(date)) {
      return // Don't allow selection of unavailable or past dates
    }
    
    if (!selectingRange) {
      // Start new selection
      setTempStartDate(date.getTime())
      setSelectingRange(true)
      onDateRangeSelect(dateStr, null)
    } else {
      // Complete selection
      const startTime = Math.min(tempStartDate, date.getTime())
      const endTime = Math.max(tempStartDate, date.getTime())
      const start = new Date(startTime).toISOString().split('T')[0]
      const end = new Date(endTime).toISOString().split('T')[0]
      
      if (isRangeAvailable(start, end)) {
        onDateRangeSelect(start, end)
        if (onAvailabilityCheck) {
          onAvailabilityCheck(start, end)
        }
      } else {
        alert('Selected date range contains unavailable dates. Please select a different range.')
      }
      
      setSelectingRange(false)
      setTempStartDate(null)
      setHoveredDate(null)
    }
  }

  const handleDateHover = (date) => {
    if (selectingRange) {
      setHoveredDate(date.getTime())
    }
  }

  const handleClearSelection = () => {
    setSelectingRange(false)
    setTempStartDate(null)
    setHoveredDate(null)
    onDateRangeSelect(null, null)
  }

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }

  const renderCalendar = (monthOffset = 0) => {
    const renderMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1)
    const monthName = renderMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const firstDay = renderMonth.getDay()
    const daysInMonth = new Date(renderMonth.getFullYear(), renderMonth.getMonth() + 1, 0).getDate()
    
    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(renderMonth.getFullYear(), renderMonth.getMonth(), day)
      const dateStatus = getDateStatus(date)
      const isPast = isDateInPast(date)
      const isSelected = isDateSelected(date)
      const isInTempRange = isDateInTempRange(date)
      const isUnavailable = dateStatus !== 'available'
      const isDisabled = isUnavailable || isPast
      
      let cellClasses = "h-10 w-10 flex items-center justify-center text-sm cursor-pointer transition-colors rounded-lg "
      let tooltipText = ''
      
      if (isPast) {
        cellClasses += "bg-gray-100 text-gray-400 cursor-not-allowed "
        tooltipText = 'Past date'
      } else if (isSelected) {
        cellClasses += "bg-purple-600 text-white "
        tooltipText = 'Selected'
      } else if (isInTempRange) {
        cellClasses += "bg-purple-200 text-purple-800 "
        tooltipText = 'Selecting range'
      } else if (dateStatus === 'rented') {
        cellClasses += "bg-red-500 text-white cursor-not-allowed "
        tooltipText = 'Currently rented/sold'
      } else if (dateStatus === 'booked') {
        cellClasses += "bg-orange-400 text-white cursor-not-allowed "
        tooltipText = 'Booking confirmed'
      } else if (dateStatus === 'unavailable') {
        cellClasses += "bg-red-100 text-red-400 cursor-not-allowed "
        tooltipText = 'Not available'
      } else {
        cellClasses += "hover:bg-purple-100 text-gray-700 "
        tooltipText = 'Available'
      }
      
      days.push(
        <div
          key={day}
          className={cellClasses}
          onClick={() => !isDisabled && handleDateClick(date)}
          onMouseEnter={() => !isDisabled && handleDateHover(date)}
          title={tooltipText}
        >
          {day}
        </div>
      )
    }
    
    return (
      <div className="bg-white rounded-lg border border-purple-200 p-4">
        <h3 className="text-lg font-semibold text-midnight-800 mb-4 text-center">
          {monthName}
        </h3>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Status Banner */}
      {productStatus && (
        <div className={`p-4 rounded-lg border-l-4 ${
          productStatus.currentStatus === 'available' 
            ? 'bg-green-50 border-green-400' 
            : productStatus.currentStatus === 'rented'
            ? 'bg-red-50 border-red-400'
            : 'bg-yellow-50 border-yellow-400'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${
                productStatus.currentStatus === 'available' 
                  ? 'text-green-800' 
                  : productStatus.currentStatus === 'rented'
                  ? 'text-red-800'
                  : 'text-yellow-800'
              }`}>
                {productStatus.currentStatus === 'available' && '✅ Available Now'}
                {productStatus.currentStatus === 'rented' && '🔴 Currently Rented'}
                {productStatus.currentStatus === 'preparing' && '⏰ Preparing for Rental'}
              </h3>
              <p className={`text-sm ${
                productStatus.currentStatus === 'available' 
                  ? 'text-green-700' 
                  : productStatus.currentStatus === 'rented'
                  ? 'text-red-700'
                  : 'text-yellow-700'
              }`}>
                {productStatus.statusMessage}
              </p>
              {productStatus.nextAvailableDate && productStatus.currentStatus !== 'available' && (
                <p className="text-sm text-gray-600 mt-1">
                  Next available: {new Date(productStatus.nextAvailableDate).toLocaleDateString()}
                </p>
              )}
            </div>
            {productStatus.currentBooking && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">Current Renter</p>
                <p className="text-sm text-gray-600">
                  {productStatus.currentBooking.renter?.firstName} {productStatus.currentBooking.renter?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  Until {new Date(productStatus.currentBooking.endDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-midnight-800">Availability Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
          >
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
          >
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-600 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-200 rounded"></div>
          <span>Selecting Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Rented/Sold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>Past</span>
        </div>
      </div>

      {/* Selection Status */}
      {selectingRange && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-800 font-medium">
                Selecting date range... Click on the end date to complete selection.
              </span>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading calendar...</span>
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderCalendar(0)}
          {renderCalendar(1)}
        </div>
      )}

      {/* Selected Range Display */}
      {selectedStartDate && selectedEndDate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-medium">
              Selected: {new Date(selectedStartDate).toLocaleDateString()} - {new Date(selectedEndDate).toLocaleDateString()}
            </span>
            <button
              onClick={handleClearSelection}
              className="ml-auto text-green-600 hover:text-green-800 text-sm underline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">How to select dates:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click on a start date to begin selection</li>
          <li>• Click on an end date to complete your selection</li>
          <li>• Hover over dates to preview your selection</li>
          <li>• Red dates are unavailable or in the past</li>
          <li>• Only continuous available periods can be selected</li>
        </ul>
      </div>
    </div>
  )
}

export default AvailabilityCalendar
