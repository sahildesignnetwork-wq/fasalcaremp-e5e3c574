import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { crops, seasonLabels, getCropsBySeason } from '@/data/crops';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Crop, CropSeason } from '@/types';

const CropSelectScreen: React.FC = () => {
  const { t, setCurrentScreen, setSelectedCrop, language } = useApp();
  const [expandedSeason, setExpandedSeason] = useState<CropSeason>('kharif');

  const handleCropSelect = (crop: Crop) => {
    setSelectedCrop(crop);
    setCurrentScreen('camera');
  };

  const toggleSeason = (season: CropSeason) => {
    setExpandedSeason(expandedSeason === season ? season : season);
  };

  const seasons: CropSeason[] = ['kharif', 'rabi', 'horticulture'];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 rounded-b-3xl shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-4">
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
              {t('फसल चुनें', 'Select Crop')}
            </h1>
            <p className="text-sm text-primary-foreground/80">
              {t('अपनी फसल का प्रकार चुनें', 'Choose your crop type')}
            </p>
          </div>
        </div>
      </header>

      {/* Crop Seasons */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {seasons.map((season) => {
            const seasonData = seasonLabels[season];
            const seasonCrops = getCropsBySeason(season);
            const isExpanded = expandedSeason === season;

            return (
              <div 
                key={season} 
                className="bg-card rounded-2xl shadow-md border border-border overflow-hidden animate-fade-in-up"
              >
                {/* Season Header */}
                <button
                  onClick={() => toggleSeason(season)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{seasonData.icon}</span>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">
                        {language === 'hi' ? seasonData.hi : seasonData.en}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {seasonCrops.length} {t('फसलें', 'crops')}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {/* Crops Grid */}
                {isExpanded && (
                  <div className="p-4 pt-0 grid grid-cols-3 gap-3">
                    {seasonCrops.map((crop) => (
                      <button
                        key={crop.id}
                        onClick={() => handleCropSelect(crop)}
                        className="bg-muted hover:bg-primary/10 rounded-xl p-3 flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 hover:border-primary border-2 border-transparent"
                      >
                        <span className="text-3xl">{crop.icon}</span>
                        <span className="text-xs font-medium text-center text-foreground leading-tight">
                          {language === 'hi' ? crop.nameHi : crop.nameEn}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default CropSelectScreen;
