import { Link } from 'react-router-dom';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EEEEDC' }}>
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#A1B5C1' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#67747D' }}>
            Payment Cancelled
          </h1>
          
          <p className="text-lg mb-6" style={{ color: '#A1B5C1' }}>
            Your payment was cancelled. No charges were made to your account.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm" style={{ color: '#67747D' }}>
              💡 Your rental request is still pending. You can complete the payment anytime from your dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/dashboard"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: '#CF365F' }}
            >
              Go to Dashboard
            </Link>
            <Link
              to="/products"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2"
              style={{ borderColor: '#A1B5C1', color: '#67747D' }}
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
