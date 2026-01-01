import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Languages, Leaf } from 'lucide-react';

const LanguageScreen: React.FC = () => {
  const { setLanguage, setCurrentScreen } = useApp();

  const handleLanguageSelect = (lang: 'hi' | 'en') => {
    setLanguage(lang);
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col items-center mb-12">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <Leaf className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Fasal Doctor</h1>
        <p className="text-muted-foreground">फसल डॉक्टर</p>
      </div>

      {/* Language Selection */}
      <div className="w-full max-w-sm animate-fade-in-up delay-200">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Languages className="w-5 h-5 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            अपनी भाषा चुनें / Choose your language
          </p>
        </div>

        <div className="space-y-4">
          {/* Hindi Option */}
          <Button
            variant="outline"
            size="xl"
            onClick={() => handleLanguageSelect('hi')}
            className="w-full justify-start gap-4 h-20 text-left hover:border-primary hover:bg-primary/5"
          >
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-2xl">
              अ
            </div>
            <div>
              <p className="text-xl font-semibold">हिंदी</p>
              <p className="text-sm text-muted-foreground">Hindi (Recommended)</p>
            </div>
          </Button>

          {/* English Option */}
          <Button
            variant="outline"
            size="xl"
            onClick={() => handleLanguageSelect('en')}
            className="w-full justify-start gap-4 h-20 text-left hover:border-primary hover:bg-primary/5"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl font-semibold text-primary">
              A
            </div>
            <div>
              <p className="text-xl font-semibold">English</p>
              <p className="text-sm text-muted-foreground">अंग्रेज़ी</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-muted-foreground text-center px-6">
        आप बाद में भी भाषा बदल सकते हैं
        <br />
        You can change language later
      </p>
    </div>
  );
};

export default LanguageScreen;
