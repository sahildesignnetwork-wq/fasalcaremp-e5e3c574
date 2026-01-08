import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Languages, Bot, Users } from 'lucide-react';
import ieheLogo from '@/assets/iehe-logo.jpg';
const LanguageScreen: React.FC = () => {
  const { setLanguage, setCurrentScreen } = useApp();

  const handleLanguageSelect = (lang: 'hi' | 'en') => {
    setLanguage(lang);
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pb-20">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col items-center mb-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2 shadow-lg overflow-hidden border-3 border-primary/30 ring-4 ring-primary/10">
          <img src={ieheLogo} alt="IEHE Bhopal Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-0.5">Fasal Care</h1>
        <p className="text-muted-foreground text-sm mb-1">फसल केयर</p>
        <div className="bg-accent/20 px-3 py-1 rounded-full">
          <p className="text-xs font-semibold text-accent">Department of Agriculture, IEHE Bhopal</p>
        </div>
      </div>

      {/* Language Selection */}
      <div className="w-full max-w-sm animate-fade-in-up delay-200">
        <div className="flex items-center gap-2 mb-3 justify-center">
          <Languages className="w-4 h-4 text-muted-foreground" />
          <p className="text-muted-foreground text-center text-sm">
            अपनी भाषा चुनें / Choose your language
          </p>
        </div>

        <div className="space-y-2">
          {/* Hindi Option */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleLanguageSelect('hi')}
            className="w-full justify-start gap-3 h-14 text-left hover:border-primary hover:bg-primary/5"
          >
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center text-xl">
              अ
            </div>
            <div>
              <p className="text-lg font-semibold">हिंदी</p>
              <p className="text-xs text-muted-foreground">Hindi (Recommended)</p>
            </div>
          </Button>

          {/* English Option */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleLanguageSelect('en')}
            className="w-full justify-start gap-3 h-14 text-left hover:border-primary hover:bg-primary/5"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl font-semibold text-primary">
              A
            </div>
            <div>
              <p className="text-lg font-semibold">English</p>
              <p className="text-xs text-muted-foreground">अंग्रेज़ी</p>
            </div>
          </Button>
        </div>
      </div>

      {/* AI Acknowledgement */}
      <div className="w-full max-w-sm mt-4 animate-fade-in-up delay-300">
        <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Bot className="w-4 h-4 text-primary" />
            <p className="font-semibold text-foreground text-xs">Powered by AI</p>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            This app uses advanced AI (Gemini) for crop disease detection. Results are for advisory purposes only.
          </p>
        </div>
      </div>

      {/* Sliding Disclaimer */}
      <div className="w-full max-w-sm mt-3 overflow-hidden">
        <div className="bg-warning/10 rounded-lg py-1.5 px-1">
          <p className="text-[10px] text-warning animate-marquee whitespace-nowrap">
            ⚠️ अस्वीकरण: यह ऐप केवल सलाह हेतु है। कृपया अंतिम निर्णय के लिए कृषि विशेषज्ञ से परामर्श करें। 
            | Disclaimer: This app is for advisory purposes only. Please consult agricultural experts for final decisions. ⚠️
          </p>
        </div>
      </div>

      {/* Credits */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Users className="w-3 h-3 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground text-center">
            Developed by Technology & Innovation Wing (Sahil Raghuwanshi) | Consultancy Core Team Lead - Aniket Tiwari | Dept. of Agriculture, IEHE Bhopal
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground text-center opacity-70">
          आप बाद में भी भाषा बदल सकते हैं | You can change language later
        </p>
      </div>
    </div>
  );
};

export default LanguageScreen;
