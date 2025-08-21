import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found in environment variables');
}

export const stripePromise = loadStripe(stripePublishableKey);

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Payment utilities
export const createPaymentIntent = async (bookingId, paymentMethod = 'card') => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentMethod }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment intent');
    }

    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmPayment = async (bookingId, paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to confirm payment');
    }

    return data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};
