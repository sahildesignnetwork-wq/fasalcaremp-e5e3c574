import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { crops, seasonLabels, getCropsBySeason } from '@/data/crops';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { Crop, CropSeason } from '@/types';

const PopScreen: React.FC = () => {
  const { t, setCurrentScreen, language } = useApp();
  const [selectedSeason, setSelectedSeason] = useState<CropSeason>('kharif');

  const seasons: CropSeason[] = ['kharif', 'rabi', 'horticulture'];

  const handleCropSelect = (crop: Crop) => {
    // In a real app, this would navigate to crop-specific PoP detail
    console.log('Selected crop for PoP:', crop.id);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-accent p-4 pt-6 rounded-b-3xl shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('home')}
            className="text-accent-foreground hover:bg-accent-foreground/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-accent-foreground">
              {t('पैकेज ऑफ प्रैक्टिसेज', 'Package of Practices')}
            </h1>
            <p className="text-sm text-accent-foreground/80">
              {t('फसल उत्पादन मार्गदर्शिका', 'Crop Production Guide')}
            </p>
          </div>
        </div>

        {/* Season Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {seasons.map((season) => {
            const seasonData = seasonLabels[season];
            return (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`py-2 px-4 rounded-full flex items-center gap-2 whitespace-nowrap transition-all ${
                  selectedSeason === season
                    ? 'bg-accent-foreground text-accent'
                    : 'bg-accent-foreground/20 text-accent-foreground'
                }`}
              >
                <span>{seasonData.icon}</span>
                <span className="font-medium text-sm">
                  {language === 'hi' ? seasonData.hi : seasonData.en}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 gap-3">
          {getCropsBySeason(selectedSeason).map((crop, index) => (
            <button
              key={crop.id}
              onClick={() => handleCropSelect(crop)}
              className="bg-card rounded-2xl p-4 shadow-md border border-border flex items-center gap-4 hover:border-accent hover:shadow-lg transition-all active:scale-[0.98] animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center text-3xl">
                {crop.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground text-lg">
                  {language === 'hi' ? crop.nameHi : crop.nameEn}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('खेती मार्गदर्शिका देखें', 'View farming guide')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-accent/10 rounded-2xl p-4 border border-accent/30">
          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-1">
                {t('पैकेज ऑफ प्रैक्टिसेज क्या है?', 'What is Package of Practices?')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(
                  'यह फसल उत्पादन के लिए ICAR और राज्य कृषि विभाग द्वारा अनुशंसित वैज्ञानिक मार्गदर्शिका है जिसमें भूमि तैयारी से लेकर कटाई तक की जानकारी होती है।',
                  'This is a scientific guide recommended by ICAR and State Agriculture Department for crop production, covering land preparation to harvesting.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Sections Preview */}
        <div className="mt-6">
          <h3 className="font-semibold text-foreground mb-3">
            {t('मार्गदर्शिका में शामिल', 'Included in Guide')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { hi: 'भूमि तैयारी', en: 'Land Preparation', icon: '🚜' },
              { hi: 'बीज चयन', en: 'Seed Selection', icon: '🌱' },
              { hi: 'बुवाई विधि', en: 'Sowing Method', icon: '👨‍🌾' },
              { hi: 'खाद प्रबंधन', en: 'Fertilizer Schedule', icon: '🧪' },
              { hi: 'सिंचाई', en: 'Irrigation', icon: '💧' },
              { hi: 'खरपतवार', en: 'Weed Management', icon: '🌿' },
              { hi: 'रोग प्रबंधन', en: 'Disease Management', icon: '🔬' },
              { hi: 'कटाई', en: 'Harvesting', icon: '🌾' },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-3 border border-border flex items-center gap-2"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-foreground">
                  {language === 'hi' ? item.hi : item.en}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PopScreen;
