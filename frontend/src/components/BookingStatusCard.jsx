import { BookingConfirmedHandshake, RentalApprovedHandshake } from '../components/HandshakeAnimation';

const BookingStatusCard = ({ 
  status, 
  booking, 
  onAccept, 
  onReject, 
  onPayment, 
  isLoading = false 
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'requested':
        return {
          bgColor: '#F9ACA7',
          textColor: '#67747D',
          icon: '⏳',
          title: 'Pending Approval',
          showActions: true
        };
      case 'accepted':
      case 'pending_payment':
        return {
          bgColor: '#A1B5C1',
          textColor: '#67747D',
          icon: '💳',
          title: 'Payment Required',
          showPayment: true
        };
      case 'confirmed':
        return {
          bgColor: '#CF365F',
          textColor: 'white',
          icon: '✅',
          title: 'Confirmed',
          showAnimation: true
        };
      case 'completed':
        return {
          bgColor: '#67747D',
          textColor: 'white',
          icon: '🎉',
          title: 'Completed',
          showAnimation: true
        };
      default:
        return {
          bgColor: '#EEEEDC',
          textColor: '#67747D',
          icon: '❓',
          title: 'Unknown Status'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border" style={{ borderColor: '#A1B5C1' }}>
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: config.bgColor, color: config.textColor }}
            >
              {config.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: '#67747D' }}>
                {config.title}
              </h3>
              <p className="text-sm" style={{ color: '#A1B5C1' }}>
                Booking ID: {booking?._id?.slice(-6) || 'N/A'}
              </p>
            </div>
          </div>
          
          {config.showAnimation && (
            <div className="ml-4">
              {status === 'confirmed' ? (
                <BookingConfirmedHandshake width={80} height={80} showText={false} />
              ) : (
                <RentalApprovedHandshake width={80} height={80} showText={false} />
              )}
            </div>
          )}
        </div>

        {/* Booking Details */}
        {booking && (
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl" style={{ backgroundColor: '#EEEEDC' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#67747D' }}>Amount:</p>
              <p className="text-lg font-bold" style={{ color: '#CF365F' }}>
                ${booking.totalPrice?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#67747D' }}>Duration:</p>
              <p className="text-sm" style={{ color: '#67747D' }}>
                {booking.startDate && booking.endDate
                  ? `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {config.showActions && (
          <div className="flex space-x-3">
            <button
              onClick={onAccept}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50"
              style={{ backgroundColor: '#CF365F' }}
            >
              {isLoading ? 'Processing...' : 'Accept'}
            </button>
            <button
              onClick={onReject}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 border-2 disabled:opacity-50"
              style={{ borderColor: '#A1B5C1', color: '#67747D' }}
            >
              Reject
            </button>
          </div>
        )}

        {config.showPayment && (
          <button
            onClick={onPayment}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50"
            style={{ backgroundColor: '#CF365F' }}
          >
            {isLoading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingStatusCard;
