import { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise, createPaymentIntent, confirmPayment } from '../services/stripe.service';

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#67747D',
      fontFamily: '"Inter", sans-serif',
      '::placeholder': {
        color: '#A1B5C1',
      },
      padding: '12px',
    },
    invalid: {
      color: '#CF365F',
    },
  },
  hidePostalCode: false,
};

// Payment Form Component
const PaymentForm = ({ booking, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    const initializePayment = async () => {
      try {
        const paymentData = await createPaymentIntent(booking._id, 'card');
        setClientSecret(paymentData.clientSecret);
        setPaymentIntentId(paymentData.paymentIntentId);
      } catch (err) {
        setError(err.message);
        onPaymentError?.(err.message);
      }
    };

    if (booking?._id) {
      initializePayment();
    }
  }, [booking?._id, onPaymentError]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError('');

    const card = elements.getElement(CardElement);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: card,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        onPaymentError?.(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        const confirmResult = await confirmPayment(booking._id, {
          paymentIntentId: paymentIntent.id,
        });

        if (confirmResult.success) {
          onPaymentSuccess?.(confirmResult);
        } else {
          setError(confirmResult.message || 'Payment confirmation failed');
          onPaymentError?.(confirmResult.message || 'Payment confirmation failed');
        }
      }
    } catch (err) {
      setError(err.message);
      onPaymentError?.(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border" style={{ borderColor: '#A1B5C1' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#67747D' }}>
          Payment Details
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#67747D' }}>
              Card Information
            </label>
            <div className="border rounded-lg p-3" style={{ borderColor: '#A1B5C1' }}>
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#CF365F', color: 'white' }}>
              {error}
            </div>
          )}

          <div className="border-t pt-4" style={{ borderColor: '#A1B5C1' }}>
            <div className="flex justify-between items-center mb-2">
              <span style={{ color: '#67747D' }}>Subtotal:</span>
              <span style={{ color: '#67747D' }}>${booking?.totalPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span style={{ color: '#67747D' }}>Platform Fee:</span>
              <span style={{ color: '#67747D' }}>${booking?.platformFee?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center font-semibold text-lg border-t pt-2" style={{ borderColor: '#A1B5C1', color: '#67747D' }}>
              <span>Total:</span>
              <span>${booking?.totalPrice?.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
              isProcessing
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg transform hover:scale-105'
            }`}
            style={{ backgroundColor: '#CF365F' }}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay $${booking?.totalPrice?.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

// Main Payment Component
const StripePayment = ({ booking, onPaymentSuccess, onPaymentError }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        booking={booking}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default StripePayment;
