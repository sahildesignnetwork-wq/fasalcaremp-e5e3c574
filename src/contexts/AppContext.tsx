import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, Crop, DiseaseResult, Advisory, AppScreen } from '@/types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  selectedCrop: Crop | null;
  setSelectedCrop: (crop: Crop | null) => void;
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
  capturedImages: string[];
  setCapturedImages: (images: string[]) => void;
  diseaseResult: DiseaseResult | null;
  setDiseaseResult: (result: DiseaseResult | null) => void;
  advisory: Advisory | null;
  setAdvisory: (advisory: Advisory | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  t: (hi: string, en: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('hi');
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [diseaseResult, setDiseaseResult] = useState<DiseaseResult | null>(null);
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Regional MP languages (Malvi, Nimari, Bundeli, Bagheli, Gondi) fall back to Hindi script for shared vocabulary.
  const t = (hi: string, en: string) => (language === 'en' ? en : hi);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currentScreen,
        setCurrentScreen,
        selectedCrop,
        setSelectedCrop,
        capturedImage,
        capturedImage,
        setCapturedImage,
        capturedImages,
        setCapturedImages,
        diseaseResult,
        setDiseaseResult,
        advisory,
        setAdvisory,
        isAnalyzing,
        setIsAnalyzing,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
