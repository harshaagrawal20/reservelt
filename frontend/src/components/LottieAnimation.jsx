import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

const LottieAnimation = ({ 
  animationData, 
  width = 200, 
  height = 200, 
  className = "", 
  loop = true, 
  autoplay = true,
  speed = 1,
  onComplete,
  onLoopComplete,
  direction = 1,
  segments,
  style = {}
}) => {
  const [animationRef, setAnimationRef] = useState(null);

  useEffect(() => {
    if (animationRef && speed !== 1) {
      animationRef.setSpeed(speed);
    }
  }, [animationRef, speed]);

  useEffect(() => {
    if (animationRef && direction !== 1) {
      animationRef.setDirection(direction);
    }
  }, [animationRef, direction]);

  const lottieRefCallback = (animationItem) => {
    setAnimationRef(animationItem);
  };

  const defaultStyle = {
    width,
    height,
    ...style
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        lottieRef={lottieRefCallback}
        animationData={animationData}
        style={defaultStyle}
        loop={loop}
        autoplay={autoplay}
        onComplete={onComplete}
        onLoopComplete={onLoopComplete}
        segments={segments}
      />
    </div>
  );
};

export default LottieAnimation;
