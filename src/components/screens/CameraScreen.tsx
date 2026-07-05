import React, { useRef, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Image, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';

const REQUIRED_SHOTS = 3;

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
      setShots((prev) => (prev.length < REQUIRED_SHOTS ? [...prev, data] : prev));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const removeShot = (idx: number) => {
    setShots((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = () => {
    if (shots.length === REQUIRED_SHOTS) {
      setCapturedImages(shots);
      setCapturedImage(shots[0]);
      setCurrentScreen('analyzing');
    }
  };

  const handleBack = () => {
    setShots([]);
    setCurrentScreen('cropSelect');
  };

  const remaining = REQUIRED_SHOTS - shots.length;
  const ready = shots.length === REQUIRED_SHOTS;

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
            {t('3 फोटो लें (सटीकता के लिए)', 'Take 3 Photos (for accuracy)')}
          </h1>
          <p className="text-sm text-primary-foreground/85 mt-1">
            {t(
              'एक ही पौधे के अलग-अलग कोण से 3 स्पष्ट फोटो',
              '3 clear shots of the same plant from different angles'
            )}
          </p>
        </div>
      </header>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: REQUIRED_SHOTS }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i < shots.length ? 'w-8 bg-primary' : 'w-4 bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Shot slots */}
      <main className="flex-1 p-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: REQUIRED_SHOTS }).map((_, idx) => {
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
            <li>{t('पास से पत्ता, फिर मध्यम, फिर पूरा पौधा', 'Close-up leaf, then mid, then whole plant')}</li>
            <li>{t('दिन के उजाले में स्पष्ट फोकस', 'Daylight and sharp focus')}</li>
            <li>{t('प्रभावित हिस्से को फ्रेम में रखें', 'Keep the affected area in frame')}</li>
          </ul>
        </div>
      </main>

      {/* Footer actions */}
      <footer className="p-4 pb-8 space-y-3 bg-background border-t border-border">
        {!ready ? (
          <>
            <Button
              variant="hero"
              size="xl"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full gap-3"
            >
              <Camera className="w-6 h-6" />
              {t(`फोटो ${shots.length + 1} लें`, `Take Photo ${shots.length + 1}`)}
              <span className="ml-1 text-sm opacity-80">
                ({remaining} {t('बाकी', 'left')})
              </span>
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
        ) : (
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
              onClick={handleConfirm}
              className="flex-1 gap-2"
            >
              <CheckCircle className="w-6 h-6" />
              {t('AI कंसेंसस जांच', 'AI Consensus Check')}
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
