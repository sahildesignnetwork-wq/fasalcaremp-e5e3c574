import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, CheckCircle, ArrowRight, RefreshCw, ExternalLink } from 'lucide-react';

const ResultScreen: React.FC = () => {
  const { 
    t, 
    setCurrentScreen, 
    diseaseResult, 
    selectedCrop, 
    language,
    setCapturedImage 
  } = useApp();

  if (!diseaseResult) {
    setCurrentScreen('home');
    return null;
  }

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'low':
        return {
          label: t('कम', 'Low'),
          color: 'bg-severity-low',
          textColor: 'text-primary-foreground',
          icon: <CheckCircle className="w-5 h-5" />,
        };
      case 'medium':
        return {
          label: t('मध्यम', 'Medium'),
          color: 'bg-severity-medium',
          textColor: 'text-foreground',
          icon: <AlertTriangle className="w-5 h-5" />,
        };
      case 'high':
        return {
          label: t('गंभीर', 'Severe'),
          color: 'bg-severity-high',
          textColor: 'text-primary-foreground',
          icon: <AlertTriangle className="w-5 h-5" />,
        };
      default:
        return {
          label: t('अज्ञात', 'Unknown'),
          color: 'bg-muted',
          textColor: 'text-foreground',
          icon: null,
        };
    }
  };

  const severityConfig = getSeverityConfig(diseaseResult.severity);

  const handleRetry = () => {
    setCapturedImage(null);
    setCurrentScreen('camera');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('home')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">
              {t('जांच परिणाम', 'Analysis Result')}
            </h1>
            <p className="text-sm text-primary-foreground/80 flex items-center gap-2">
              <span>{selectedCrop?.icon}</span>
              <span>{language === 'hi' ? selectedCrop?.nameHi : selectedCrop?.nameEn}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 -mt-4">
        {/* Image Preview */}
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden mb-4 animate-fade-in-up">
          <div className="aspect-video relative">
            <img 
              src={diseaseResult.imageUrl} 
              alt="Analyzed crop" 
              className="w-full h-full object-cover"
            />
            {/* Confidence Badge */}
            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-foreground">
                {diseaseResult.confidence}% {t('विश्वसनीयता', 'Confidence')}
              </span>
            </div>
          </div>
        </div>

        {/* Disease Info Card */}
        <div className="bg-card rounded-2xl shadow-lg p-5 mb-4 animate-fade-in-up delay-100">
          {/* Disease Name */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">
              {t('पहचाना गया रोग', 'Detected Disease')}
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              {language === 'hi' ? diseaseResult.diseaseNameHi : diseaseResult.diseaseNameEn}
            </h2>
          </div>

          {/* Severity */}
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {t('गंभीरता स्तर:', 'Severity Level:')}
            </p>
            <div className={`${severityConfig.color} ${severityConfig.textColor} px-4 py-2 rounded-full flex items-center gap-2`}>
              {severityConfig.icon}
              <span className="font-semibold">{severityConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-fade-in-up delay-200">
          <Button
            variant="default"
            size="xl"
            className="w-full gap-3"
            onClick={() => setCurrentScreen('advisory')}
          >
            {t('उपचार सलाह देखें', 'View Treatment Advisory')}
            <ArrowRight className="w-5 h-5" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full gap-3"
            onClick={() => {
              const slug = (diseaseResult.diseaseNameEn || '')
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');
              const url = slug
                ? `https://plantix.net/en/library/plant-diseases/search/?q=${encodeURIComponent(diseaseResult.diseaseNameEn)}`
                : 'https://plantix.net/en/library/plant-diseases/';
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
          >
            <ExternalLink className="w-5 h-5" />
            {t('Plantix पर और जानें', 'Learn more on Plantix')}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3"
            onClick={handleRetry}
          >
            <RefreshCw className="w-5 h-5" />
            {t('दोबारा जांच करें', 'Analyze Again')}
          </Button>
        </div>

        {/* Confidence Meter */}
        <div className="mt-6 bg-card rounded-2xl p-4 shadow-md animate-fade-in-up delay-300">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">
              {t('AI विश्वसनीयता', 'AI Confidence')}
            </p>
            <p className="text-lg font-bold text-primary">{diseaseResult.confidence}%</p>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary rounded-full transition-all duration-1000"
              style={{ width: `${diseaseResult.confidence}%` }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultScreen;
