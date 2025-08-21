import { useState } from 'react';
import { createPaymentIntent } from '../services/stripe.service';

const CheckoutPayment = ({ booking, onPaymentInitiated, onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckoutPayment = async () => {
    setIsLoading(true);
    
    try {
      const response = await createPaymentIntent(booking._id, 'checkout');
      
      if (response.success && response.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = response.checkoutUrl;
        onPaymentInitiated?.(response);
      } else {
        throw new Error(response.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border" style={{ borderColor: '#A1B5C1' }}>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#67747D' }}>
            Complete Your Payment
          </h3>
          <p className="text-lg" style={{ color: '#A1B5C1' }}>
            Secure payment powered by Stripe
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium" style={{ color: '#67747D' }}>
              Product:
            </span>
            <span style={{ color: '#67747D' }}>
              {booking?.productId?.title || 'Rental Item'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium" style={{ color: '#67747D' }}>
              Duration:
            </span>
            <span style={{ color: '#67747D' }}>
              {booking?.startDate && booking?.endDate ? 
                `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}` :
                'N/A'
              }
            </span>
          </div>
          
          <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: '#A1B5C1' }}>
            <span className="font-bold text-lg" style={{ color: '#67747D' }}>
              Total Amount:
            </span>
            <span className="font-bold text-lg" style={{ color: '#CF365F' }}>
              ${booking?.totalPrice?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>

        <button
          onClick={handleCheckoutPayment}
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all duration-300 ${
            isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:shadow-lg transform hover:scale-105'
          }`}
          style={{ backgroundColor: '#CF365F' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Redirecting to Stripe...
            </div>
          ) : (
            'Pay with Stripe Checkout'
          )}
        </button>

        <div className="text-center text-sm" style={{ color: '#A1B5C1' }}>
          <p>🔒 Your payment information is secure and encrypted</p>
          <p>Powered by Stripe • Cards accepted worldwide</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;
