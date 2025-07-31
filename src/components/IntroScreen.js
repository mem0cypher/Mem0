import React, { useState, useEffect } from 'react';
import './IntroScreen.css';

const IntroScreen = ({ onIntroComplete }) => {
  const [animationState, setAnimationState] = useState('fadeIn');
  
  useEffect(() => {
    // Fade in for 1 second (faster)
    const fadeInTimer = setTimeout(() => {
      setAnimationState('visible');
    }, 1000);
    
    // Stay visible for 0.5 seconds (faster)
    const visibleTimer = setTimeout(() => {
      setAnimationState('fadeOut');
    }, 1500);
    
    // Fade out for 1 second, then call onIntroComplete (faster)
    const fadeOutTimer = setTimeout(() => {
      onIntroComplete();
    }, 2500);
    
    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(visibleTimer);
      clearTimeout(fadeOutTimer);
    };
  }, [onIntroComplete]);
  
  // Add a pointer-events: none style to ensure clicks pass through to elements underneath
  return (
    <div className={`intro-screen ${animationState}`}>
      <div className="intro-content">
        <div className="intro-text">MEM0</div>
      </div>
    </div>
  );
};

export default IntroScreen; 