import { useState, useEffect } from 'react';
import { DealClosedHandshake } from '../components/HandshakeAnimation';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully", 
  actionText = "Continue",
  onAction,
  autoClose = false,
  autoCloseDelay = 3000,
  showAnimation = true,
  children
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
    
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const handleAction = () => {
    onAction?.();
    handleClose();
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        <div className="text-center space-y-6">
          {/* Animation */}
          {showAnimation && (
            <div className="flex justify-center">
              <DealClosedHandshake 
                width={120} 
                height={120} 
                showText={false}
                speed={1.5}
              />
            </div>
          )}
          
          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: '#67747D' }}>
              {title}
            </h2>
            
            <p className="text-lg leading-relaxed" style={{ color: '#A1B5C1' }}>
              {message}
            </p>
            
            {children && (
              <div className="mt-4">
                {children}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {onAction && (
              <button
                onClick={handleAction}
                className="flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                style={{ backgroundColor: '#CF365F' }}
              >
                {actionText}
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 border-2"
              style={{ borderColor: '#A1B5C1', color: '#67747D' }}
            >
              {onAction ? 'Close' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Preset success modals for different scenarios
export const PaymentSuccessModal = ({ isOpen, onClose, amount, bookingId }) => (
  <SuccessModal
    isOpen={isOpen}
    onClose={onClose}
    title="Payment Successful! 🎉"
    message={`Your payment of $${amount?.toFixed(2)} has been processed successfully.`}
    actionText="View Booking"
    autoClose={false}
  >
    <div className="p-4 rounded-xl" style={{ backgroundColor: '#EEEEDC' }}>
      <p className="text-sm font-medium" style={{ color: '#67747D' }}>
        Booking ID: <span className="font-mono">{bookingId}</span>
      </p>
    </div>
  </SuccessModal>
);

export const BookingApprovedModal = ({ isOpen, onClose, productName }) => (
  <SuccessModal
    isOpen={isOpen}
    onClose={onClose}
    title="Request Approved! ✅"
    message={`Your rental request for "${productName}" has been approved. Please proceed with payment.`}
    actionText="Pay Now"
    autoClose={false}
  />
);

export const RentalCompletedModal = ({ isOpen, onClose, productName }) => (
  <SuccessModal
    isOpen={isOpen}
    onClose={onClose}
    title="Rental Completed! 🎊"
    message={`Thank you for renting "${productName}". We hope you had a great experience!`}
    actionText="Leave Review"
    autoClose={true}
    autoCloseDelay={5000}
  />
);

export default SuccessModal;
