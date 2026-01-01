import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Camera, BookOpen, Leaf, Settings, Info } from 'lucide-react';

const HomeScreen: React.FC = () => {
  const { t, setCurrentScreen } = useApp();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">Fasal Doctor</h1>
              <p className="text-xs text-primary-foreground/80">IEHE BHOPAL</p>
            </div>
          </div>
          <button className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
        
        <p className="text-primary-foreground/90 text-center">
          {t('AI-संचालित फसल रोग पहचान', 'AI-Powered Crop Disease Detection')}
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 -mt-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Scan Disease */}
          <Button
            variant="default"
            className="h-auto py-8 flex-col gap-3 shadow-lg animate-fade-in-up"
            onClick={() => setCurrentScreen('cropSelect')}
          >
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
              <Camera className="w-9 h-9 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{t('रोग पहचानें', 'Detect Disease')}</p>
              <p className="text-xs opacity-80">{t('फोटो खींचें', 'Take Photo')}</p>
            </div>
          </Button>

          {/* Package of Practices */}
          <Button
            variant="accent"
            className="h-auto py-8 flex-col gap-3 shadow-lg animate-fade-in-up delay-100"
            onClick={() => setCurrentScreen('pop')}
          >
            <div className="w-16 h-16 bg-accent-foreground/20 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-9 h-9 text-accent-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{t('फसल मार्गदर्शिका', 'Crop Guide')}</p>
              <p className="text-xs opacity-80">{t('खेती के तरीके', 'Farming Practices')}</p>
            </div>
          </Button>
        </div>

        {/* Info Cards */}
        <div className="space-y-4 animate-fade-in-up delay-200">
          {/* How It Works */}
          <div className="bg-card rounded-2xl p-4 shadow-md border border-border">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              {t('यह कैसे काम करता है?', 'How It Works?')}
            </h3>
            <div className="space-y-3">
              <Step number={1} text={t('फसल का चयन करें', 'Select your crop')} />
              <Step number={2} text={t('पत्ते की फोटो खींचें', 'Capture leaf photo')} />
              <Step number={3} text={t('AI से रोग पहचान', 'AI detects disease')} />
              <Step number={4} text={t('उपचार सलाह प्राप्त करें', 'Get treatment advice')} />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-accent/10 rounded-2xl p-4 border border-accent/30">
            <p className="text-sm text-muted-foreground text-center">
              {t(
                '⚠️ यह ऐप केवल सलाह हेतु है, अंतिम निर्णय कृषि विशेषज्ञ से परामर्श के बाद लें।',
                '⚠️ This app is for advisory purposes only. Please consult agricultural experts for final decisions.'
              )}
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border p-2 pb-4">
        <div className="flex justify-around">
          <Button variant="navActive" size="sm" className="flex-1 max-w-[80px]">
            <Leaf className="w-5 h-5" />
            <span className="text-xs">{t('होम', 'Home')}</span>
          </Button>
          <Button 
            variant="nav" 
            size="sm" 
            className="flex-1 max-w-[80px]"
            onClick={() => setCurrentScreen('cropSelect')}
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs">{t('स्कैन', 'Scan')}</span>
          </Button>
          <Button 
            variant="nav" 
            size="sm" 
            className="flex-1 max-w-[80px]"
            onClick={() => setCurrentScreen('pop')}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">{t('मार्गदर्शिका', 'Guide')}</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

const Step: React.FC<{ number: number; text: string }> = ({ number, text }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
      {number}
    </div>
    <p className="text-sm text-foreground">{text}</p>
  </div>
);

export default HomeScreen;
