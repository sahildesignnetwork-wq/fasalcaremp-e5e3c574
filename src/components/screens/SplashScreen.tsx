import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import openingLogo from '@/assets/fasal-care-opening.png.asset.json';
const SplashScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [showCredit, setShowCredit] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const assetOrigin = window.location.hostname === 'localhost'
    ? 'https://id-preview--9d495198-fbf3-46a0-ae42-abbe8f170ce7.lovable.app'
    : window.location.origin;
  const openingLogoUrl = new URL(openingLogo.url, assetOrigin).toString();

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
      className={`relative min-h-screen overflow-hidden bg-gradient-hero flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <img
        src={openingLogoUrl}
        alt="Fasal Care crop health logo"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-background/10" />

      {/* Student Credit Animation */}
      {showCredit && (
        <div className="absolute bottom-20 z-10 animate-credit-fade">
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
      <div className="absolute bottom-8 z-10 flex gap-2">
        <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default SplashScreen;
