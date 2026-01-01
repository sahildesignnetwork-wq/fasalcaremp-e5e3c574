import React, { useRef, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Image, X, CheckCircle, RotateCcw } from 'lucide-react';

const CameraScreen: React.FC = () => {
  const { t, setCurrentScreen, selectedCrop, setCapturedImage, language } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      // Fallback to file input
      fileInputRef.current?.click();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (previewImage) {
      setCapturedImage(previewImage);
      setCurrentScreen('analyzing');
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
    startCamera();
  };

  const handleBack = () => {
    stopCamera();
    setPreviewImage(null);
    setCurrentScreen('cropSelect');
  };

  return (
    <div className="min-h-screen bg-foreground flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 pt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="bg-background/20 backdrop-blur-sm text-primary-foreground hover:bg-background/30"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="bg-background/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
          <span className="text-xl">{selectedCrop?.icon}</span>
          <span className="text-primary-foreground font-medium">
            {language === 'hi' ? selectedCrop?.nameHi : selectedCrop?.nameEn}
          </span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Camera/Preview Area */}
      <main className="flex-1 relative">
        {previewImage ? (
          // Preview captured image
          <div className="absolute inset-0 flex items-center justify-center bg-foreground">
            <img 
              src={previewImage} 
              alt="Captured" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : isCameraActive ? (
          // Camera view
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          // Start screen
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-hero">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-primary-foreground/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-14 h-14 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                {t('पत्ते की फोटो', 'Leaf Photo')}
              </h2>
              <p className="text-primary-foreground/80">
                {t('प्रभावित पत्ते की स्पष्ट फोटो खींचें', 'Take a clear photo of the affected leaf')}
              </p>
            </div>

            <div className="space-y-4 w-full max-w-xs">
              <Button
                variant="hero"
                size="xl"
                onClick={startCamera}
                className="w-full gap-3"
              >
                <Camera className="w-6 h-6" />
                {t('कैमरा खोलें', 'Open Camera')}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-3 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Image className="w-5 h-5" />
                {t('गैलरी से चुनें', 'Choose from Gallery')}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Camera overlay guide */}
        {isCameraActive && !previewImage && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-primary-foreground/50 rounded-3xl">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2">
                <p className="text-primary-foreground text-sm">
                  {t('पत्ते को फ्रेम में रखें', 'Keep leaf in frame')}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Controls */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 pb-8">
        {previewImage ? (
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRetake}
              className="bg-background/20 border-primary-foreground/30 text-primary-foreground hover:bg-background/30 gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              {t('दोबारा', 'Retake')}
            </Button>
            <Button
              variant="hero"
              size="xl"
              onClick={handleConfirm}
              className="gap-2 px-8"
            >
              <CheckCircle className="w-6 h-6" />
              {t('जांच करें', 'Analyze')}
            </Button>
          </div>
        ) : isCameraActive ? (
          <div className="flex justify-center">
            <Button
              variant="capture"
              onClick={capturePhoto}
              className="animate-pulse-glow"
            >
              <Camera className="w-10 h-10" />
            </Button>
          </div>
        ) : null}
      </footer>
    </div>
  );
};

export default CameraScreen;
