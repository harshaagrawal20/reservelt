// Booking actions for interacting with the backend API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Helper function to handle API errors
const handleError = (error) => {
  console.error('API Error:', error)
  throw error
}

/**
 * Create a new booking
 * @param {Object} bookingData - The booking data
 * @returns {Promise<Object>} Created booking
 */
export async function createBooking(bookingData) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    })

    if (!response.ok) {
      throw new Error('Failed to create booking')
    }

    const data = await response.json()
    return data.booking
  } catch (error) {
    handleError(error)
  }
}

/**
 * Get all bookings for a user
 * @param {string} clerkId - The Clerk ID of the user
 * @returns {Promise<Array>} Array of bookings
 */
export async function getUserBookings(clerkId) {
  try {
    const params = new URLSearchParams({ clerkId })
    const response = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`)

    if (!response.ok) {
      throw new Error('Failed to fetch bookings')
    }

    const data = await response.json()
    return data.bookings
  } catch (error) {
    handleError(error)
  }
}

/**
 * Get a booking by ID
 * @param {string} bookingId - The ID of the booking to fetch
 * @returns {Promise<Object>} Booking object
 */
export async function getBookingById(bookingId) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`)

    if (!response.ok) {
      throw new Error('Booking not found')
    }

    const data = await response.json()
    return data.booking
  } catch (error) {
    handleError(error)
  }
}

/**
 * Initiate payment for a booking
 * @param {string} bookingId - The ID of the booking to pay for
 * @returns {Promise<Object>} Payment intent data
 */
export async function initiateBookingPayment(bookingId) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to initiate payment')
    }

    const data = await response.json()
    return data
  } catch (error) {
    handleError(error)
  }
}

/**
 * Confirm payment for a booking
 * @param {string} bookingId - The ID of the booking
 * @param {string} paymentIntentId - The Stripe payment intent ID
 * @returns {Promise<Object>} Updated booking and payment data
 */
export async function confirmBookingPayment(bookingId, paymentIntentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId }),
    })

    if (!response.ok) {
      throw new Error('Payment confirmation failed')
    }

    const data = await response.json()
    return data
  } catch (error) {
    handleError(error)
  }
}

/**
 * Cancel a booking
 * @param {string} bookingId - The ID of the booking to cancel
 * @param {string} reason - The reason for cancellation
 * @returns {Promise<Object>} Response data
 */
export async function cancelBooking(bookingId, reason = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      throw new Error('Failed to cancel booking')
    }

    return await response.json()
  } catch (error) {
    handleError(error)
  }
}