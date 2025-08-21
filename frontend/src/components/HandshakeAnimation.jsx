import LottieAnimation from './LottieAnimation';
import handshakeAnimation from '../../public/Handshake Loop.json';

const HandshakeAnimation = ({ 
  width = 200, 
  height = 200, 
  className = "", 
  loop = true, 
  autoplay = true,
  speed = 1,
  showText = false,
  text = "Deal Confirmed!",
  textStyle = {}
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <LottieAnimation
        animationData={handshakeAnimation}
        width={width}
        height={height}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
      />
      {showText && (
        <p 
          className="mt-4 text-lg font-semibold text-center"
          style={{ color: '#67747D', ...textStyle }}
        >
          {text}
        </p>
      )}
    </div>
  );
};

// Preset configurations for different use cases
export const SuccessHandshake = (props) => (
  <HandshakeAnimation
    width={150}
    height={150}
    showText={true}
    text="Payment Successful! 🎉"
    {...props}
  />
);

export const BookingConfirmedHandshake = (props) => (
  <HandshakeAnimation
    width={120}
    height={120}
    showText={true}
    text="Booking Confirmed!"
    {...props}
  />
);

export const RentalApprovedHandshake = (props) => (
  <HandshakeAnimation
    width={100}
    height={100}
    showText={true}
    text="Request Approved!"
    speed={0.8}
    {...props}
  />
);

export const DealClosedHandshake = (props) => (
  <HandshakeAnimation
    width={180}
    height={180}
    showText={true}
    text="Deal Completed!"
    speed={1.2}
    {...props}
  />
);

export default HandshakeAnimation;
