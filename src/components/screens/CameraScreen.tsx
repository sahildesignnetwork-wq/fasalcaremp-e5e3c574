import React, { useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Image, CheckCircle, RotateCcw, Trash2, Plus } from 'lucide-react';

const MAX_SHOTS = 3;

const CameraScreen: React.FC = () => {
  const { t, setCurrentScreen, selectedCrop, setCapturedImage, setCapturedImages, language } = useApp();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [shots, setShots] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      setShots((prev) => (prev.length < MAX_SHOTS ? [...prev, data] : prev));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const removeShot = (idx: number) => {
    setShots((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAnalyze = () => {
    if (shots.length === 0) return;
    setCapturedImages(shots);
    setCapturedImage(shots[0]);
    setCurrentScreen('analyzing');
  };

  const handleBack = () => {
    setShots([]);
    setCurrentScreen('cropSelect');
  };

  const canAddMore = shots.length < MAX_SHOTS;
  const hasAtLeastOne = shots.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <span className="text-xl">{selectedCrop?.icon}</span>
            <span className="text-primary-foreground font-medium">
              {language === 'hi' ? selectedCrop?.nameHi : selectedCrop?.nameEn}
            </span>
          </div>
          <div className="w-10" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold text-primary-foreground">
            {t('फोटो अपलोड करें', 'Upload Photo')}
          </h1>
          <p className="text-sm text-primary-foreground/85 mt-1">
            {t(
              'बेहतर सटीकता के लिए 3 फोटो सुझाए जाते हैं',
              'For better accuracy, 3 photos are recommended'
            )}
          </p>
        </div>
      </header>

      {/* Shot slots */}
      <main className="flex-1 p-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: MAX_SHOTS }).map((_, idx) => {
            const img = shots[idx];
            return (
              <div
                key={idx}
                className="aspect-square rounded-2xl border-2 border-dashed border-border bg-card overflow-hidden relative flex items-center justify-center"
              >
                {img ? (
                  <>
                    <img src={img} alt={`Shot ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeShot(idx)}
                      className="absolute top-1 right-1 bg-background/90 rounded-full p-1 shadow"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {idx + 1}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Camera className="w-6 h-6 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('फोटो', 'Photo')} {idx + 1}
                      {idx > 0 && (
                        <span className="block text-[10px] opacity-70">
                          {t('वैकल्पिक', 'optional')}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Guidance */}
        <div className="mt-6 bg-accent/20 rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground mb-2">
            💡 {t('बेहतर परिणाम के लिए', 'For best results')}:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>{t('कम से कम 1 फोटो जरूरी, 3 फोटो से सटीकता बढ़ती है', 'At least 1 photo required — 3 photos improve accuracy')}</li>
            <li>{t('पास से पत्ता, फिर मध्यम, फिर पूरा पौधा', 'Close-up leaf, then mid, then whole plant')}</li>
            <li>{t('दिन के उजाले में स्पष्ट फोकस', 'Daylight and sharp focus')}</li>
            <li>{t('प्रभावित हिस्से को फ्रेम में रखें', 'Keep the affected area in frame')}</li>
          </ul>
        </div>
      </main>

      {/* Footer actions */}
      <footer className="p-4 pb-8 space-y-3 bg-background border-t border-border">
        {canAddMore && (
          <>
            <Button
              variant="hero"
              size="xl"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full gap-3"
            >
              {shots.length === 0 ? <Camera className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              {shots.length === 0
                ? t('फोटो लें', 'Take Photo')
                : t(`एक और फोटो जोड़ें (${shots.length}/${MAX_SHOTS})`, `Add another photo (${shots.length}/${MAX_SHOTS})`)}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => galleryInputRef.current?.click()}
              className="w-full gap-3"
            >
              <Image className="w-5 h-5" />
              {t('गैलरी से चुनें', 'Choose from Gallery')}
            </Button>
          </>
        )}

        {hasAtLeastOne && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShots([])}
              className="gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              {t('रीसेट', 'Reset')}
            </Button>
            <Button
              variant="hero"
              size="xl"
              onClick={handleAnalyze}
              className="flex-1 gap-2"
            >
              <CheckCircle className="w-6 h-6" />
              {shots.length === MAX_SHOTS
                ? t('AI कंसेंसस जांच', 'AI Consensus Check')
                : t(`जांच करें (${shots.length} फोटो)`, `Analyze (${shots.length} photo${shots.length > 1 ? 's' : ''})`)}
            </Button>
          </div>
        )}

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </footer>
    </div>
  );
};

export default CameraScreen;
