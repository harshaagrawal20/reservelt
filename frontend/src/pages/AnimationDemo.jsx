import { useState } from 'react';
import HandshakeAnimation, { 
  SuccessHandshake, 
  BookingConfirmedHandshake, 
  RentalApprovedHandshake, 
  DealClosedHandshake 
} from '../components/HandshakeAnimation';
import LottieAnimation from '../components/LottieAnimation';
import BookingStatusCard from '../components/BookingStatusCard';
import SuccessModal, { 
  PaymentSuccessModal, 
  BookingApprovedModal, 
  RentalCompletedModal 
} from '../components/SuccessModal';
import handshakeAnimation from '../../public/Handshake Loop.json';

const AnimationDemo = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  const mockBooking = {
    _id: '675a1b2c3d4e5f6789abcdef',
    totalPrice: 1200,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: '#EEEEDC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#67747D' }}>
            Handshake Animations Demo
          </h1>
          <p className="text-xl" style={{ color: '#A1B5C1' }}>
            Interactive animations for your rental platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Animations */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#67747D' }}>
              Basic Handshake Animations
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <HandshakeAnimation width={120} height={120} />
                <p className="mt-2 font-medium" style={{ color: '#67747D' }}>Default</p>
              </div>
              
              <div className="text-center">
                <LottieAnimation 
                  animationData={handshakeAnimation}
                  width={120}
                  height={120}
                  speed={2}
                />
                <p className="mt-2 font-medium" style={{ color: '#67747D' }}>Fast (2x)</p>
              </div>
              
              <div className="text-center">
                <LottieAnimation 
                  animationData={handshakeAnimation}
                  width={120}
                  height={120}
                  speed={0.5}
                />
                <p className="mt-2 font-medium" style={{ color: '#67747D' }}>Slow (0.5x)</p>
              </div>
              
              <div className="text-center">
                <LottieAnimation 
                  animationData={handshakeAnimation}
                  width={120}
                  height={120}
                  loop={false}
                />
                <p className="mt-2 font-medium" style={{ color: '#67747D' }}>No Loop</p>
              </div>
            </div>
          </div>

          {/* Preset Animations */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#67747D' }}>
              Preset Animations
            </h2>
            
            <div className="space-y-6">
              <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: '#F9ACA7' }}>
                <SuccessHandshake showText={true} />
              </div>
              
              <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: '#A1B5C1' }}>
                <BookingConfirmedHandshake showText={true} />
              </div>
              
              <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: '#EEEEDC' }}>
                <RentalApprovedHandshake showText={true} />
              </div>
              
              <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: '#CF365F' }}>
                <DealClosedHandshake showText={true} textStyle={{ color: 'white' }} />
              </div>
            </div>
          </div>

          {/* Booking Status Cards */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#67747D' }}>
              Booking Status Cards
            </h2>
            
            <div className="space-y-4">
              <BookingStatusCard 
                status="requested" 
                booking={mockBooking}
                onAccept={() => alert('Accepted!')}
                onReject={() => alert('Rejected!')}
              />
              
              <BookingStatusCard 
                status="confirmed" 
                booking={mockBooking}
              />
              
              <BookingStatusCard 
                status="completed" 
                booking={mockBooking}
              />
            </div>
          </div>

          {/* Modal Triggers */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#67747D' }}>
              Success Modals
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: '#CF365F' }}
              >
                Show Payment Success Modal
              </button>
              
              <button
                onClick={() => setShowApprovedModal(true)}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: '#A1B5C1' }}
              >
                Show Booking Approved Modal
              </button>
              
              <button
                onClick={() => setShowCompletedModal(true)}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: '#67747D' }}
              >
                Show Rental Completed Modal
              </button>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#67747D' }}>
            Usage Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border-2 border-dashed" style={{ borderColor: '#A1B5C1' }}>
              <h3 className="font-bold mb-2" style={{ color: '#67747D' }}>Payment Success</h3>
              <p className="text-sm mb-4" style={{ color: '#A1B5C1' }}>Show when payment is completed</p>
              <div className="text-center">
                <SuccessHandshake width={80} height={80} showText={false} />
              </div>
            </div>
            
            <div className="p-6 rounded-2xl border-2 border-dashed" style={{ borderColor: '#A1B5C1' }}>
              <h3 className="font-bold mb-2" style={{ color: '#67747D' }}>Request Approved</h3>
              <p className="text-sm mb-4" style={{ color: '#A1B5C1' }}>Show when owner approves rental</p>
              <div className="text-center">
                <RentalApprovedHandshake width={80} height={80} showText={false} />
              </div>
            </div>
            
            <div className="p-6 rounded-2xl border-2 border-dashed" style={{ borderColor: '#A1B5C1' }}>
              <h3 className="font-bold mb-2" style={{ color: '#67747D' }}>Deal Completed</h3>
              <p className="text-sm mb-4" style={{ color: '#A1B5C1' }}>Show when rental is finished</p>
              <div className="text-center">
                <DealClosedHandshake width={80} height={80} showText={false} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PaymentSuccessModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={1200}
        bookingId="abc123"
      />
      
      <BookingApprovedModal
        isOpen={showApprovedModal}
        onClose={() => setShowApprovedModal(false)}
        productName="CAT Excavator 320"
      />
      
      <RentalCompletedModal
        isOpen={showCompletedModal}
        onClose={() => setShowCompletedModal(false)}
        productName="CAT Excavator 320"
      />
    </div>
  );
};

export default AnimationDemo;
