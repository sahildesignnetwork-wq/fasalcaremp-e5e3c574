import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Leaf, Sprout } from 'lucide-react';

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
          <div className="w-32 h-32 bg-primary-foreground/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-glow">
            <Leaf className="w-20 h-20 text-primary-foreground animate-bounce-gentle" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <Sprout className="w-7 h-7 text-accent-foreground" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-primary-foreground mb-2 tracking-wide">
          Fasal Doctor
        </h1>
        <p className="text-lg text-primary-foreground/90 mb-1">
          फसल डॉक्टर
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
              Made by students of
            </p>
            <p className="text-base font-semibold text-primary-foreground text-center">
              B.Sc. Agriculture
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
