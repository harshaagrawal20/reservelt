import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { confirmPayment } from '../services/stripe.service';
import { SuccessHandshake } from '../components/HandshakeAnimation';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    const confirmPaymentWithBackend = async () => {
      if (!sessionId || !bookingId) {
        setError('Missing payment information');
        setIsConfirming(false);
        return;
      }

      try {
        const result = await confirmPayment(bookingId, { sessionId });
        
        if (result.success) {
          setBookingData(result.booking);
        } else {
          setError(result.message || 'Payment confirmation failed');
        }
      } catch (err) {
        setError(err.message || 'Payment confirmation failed');
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPaymentWithBackend();
  }, [sessionId, bookingId]);

  if (isConfirming) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EEEEDC' }}>
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: '#CF365F' }}></div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#67747D' }}>
              Confirming Payment...
            </h2>
            <p style={{ color: '#A1B5C1' }}>
              Please wait while we process your payment
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EEEEDC' }}>
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#CF365F' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#CF365F' }}>
              Payment Error
            </h2>
            <p className="mb-6" style={{ color: '#67747D' }}>
              {error}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: '#CF365F' }}
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EEEEDC' }}>
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-lg w-full mx-4">
        <div className="text-center">
          <SuccessHandshake 
            width={160}
            height={160}
            className="mb-6"
          />
          
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#67747D' }}>
            Payment Successful! 🎉
          </h1>
          
          <p className="text-lg mb-6" style={{ color: '#A1B5C1' }}>
            Your rental has been confirmed. The owner will contact you soon with pickup details.
          </p>

          {bookingData && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold mb-4" style={{ color: '#67747D' }}>
                Booking Details:
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: '#A1B5C1' }}>Booking ID:</span>
                  <span className="font-mono text-sm" style={{ color: '#67747D' }}>
                    {bookingData._id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#A1B5C1' }}>Amount Paid:</span>
                  <span className="font-semibold" style={{ color: '#CF365F' }}>
                    ${bookingData.totalPrice?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#A1B5C1' }}>Status:</span>
                  <span className="px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#F9ACA7', color: '#67747D' }}>
                    {bookingData.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/dashboard"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: '#CF365F' }}
            >
              View My Bookings
            </Link>
            <Link
              to="/products"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2"
              style={{ borderColor: '#A1B5C1', color: '#67747D' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
