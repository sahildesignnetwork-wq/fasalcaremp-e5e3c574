import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Languages, Leaf, Bot, Users } from 'lucide-react';

const LanguageScreen: React.FC = () => {
  const { setLanguage, setCurrentScreen } = useApp();

  const handleLanguageSelect = (lang: 'hi' | 'en') => {
    setLanguage(lang);
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <Leaf className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Fasal Doctor</h1>
        <p className="text-muted-foreground mb-2">फसल डॉक्टर</p>
        <div className="bg-accent/20 px-4 py-1.5 rounded-full">
          <p className="text-sm font-semibold text-accent">IEHE BHOPAL</p>
        </div>
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

      {/* AI Acknowledgement */}
      <div className="w-full max-w-sm mt-8 animate-fade-in-up delay-300">
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-primary" />
            <p className="font-semibold text-foreground text-sm">Powered by AI</p>
          </div>
          <p className="text-xs text-muted-foreground">
            This app uses advanced AI (Gemini) for crop disease detection. Results are for advisory purposes only.
          </p>
        </div>
      </div>

      {/* Sliding Disclaimer */}
      <div className="w-full max-w-sm mt-4 overflow-hidden">
        <div className="bg-warning/10 rounded-lg py-2 px-1">
          <p className="text-xs text-warning animate-marquee whitespace-nowrap">
            ⚠️ अस्वीकरण: यह ऐप केवल सलाह हेतु है। कृपया अंतिम निर्णय के लिए कृषि विशेषज्ञ से परामर्श करें। 
            | Disclaimer: This app is for advisory purposes only. Please consult agricultural experts for final decisions. ⚠️
          </p>
        </div>
      </div>

      {/* Credits */}
      <div className="absolute bottom-6 left-0 right-0 px-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground text-center">
            Made by Sahil Raghuwanshi, Aniket Tiwari and other students of B.Sc Agriculture
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-center opacity-70">
          आप बाद में भी भाषा बदल सकते हैं | You can change language later
        </p>
      </div>
    </div>
  );
};

export default LanguageScreen;
