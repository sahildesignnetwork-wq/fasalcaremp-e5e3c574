import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ieheLogo from '@/assets/iehe-logo.jpg';
const SplashScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [showCredit, setShowCredit] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show credit animation after logo appears
    const creditTimer = setTimeout(() => {
      setShowCredit(true);
    }, 800);

    // Start fade out
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2800);

    // Navigate to language selection
    const navTimer = setTimeout(() => {
      setCurrentScreen('language');
    }, 3200);

    return () => {
      clearTimeout(creditTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [setCurrentScreen]);

  return (
    <div 
      className={`min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Logo Container */}
      <div className="animate-fade-in-scale flex flex-col items-center">
        {/* App Icon */}
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-glow overflow-hidden">
            <img src={ieheLogo} alt="IEHE Bhopal Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-primary-foreground mb-2 tracking-wide">
          Krishi Sarthi
        </h1>
        <p className="text-lg text-primary-foreground/90 mb-1">
          कृषि सारथी
        </p>
        
        {/* IEHE Bhopal Subtitle */}
        <p className="text-xs text-primary-foreground/60 tracking-widest uppercase">
          IEHE BHOPAL
        </p>
      </div>

      {/* Student Credit Animation */}
      {showCredit && (
        <div className="absolute bottom-20 animate-credit-fade">
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-primary-foreground/20">
            <p className="text-sm text-primary-foreground/90 text-center">
              Developed by
            </p>
            <p className="text-base font-semibold text-primary-foreground text-center">
              Department of Agriculture
            </p>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      <div className="absolute bottom-8 flex gap-2">
        <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default SplashScreen;
