import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Leaf, Search, Sparkles, AlertCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AnalyzingScreen: React.FC = () => {
  const {
    t,
    setCurrentScreen,
    capturedImage,
    capturedImages,
    selectedCrop,
    setDiseaseResult,
    setAdvisory,
    language
  } = useApp();
  const { toast } = useToast();
  const [status, setStatus] = useState<'scanning' | 'identifying' | 'consensus' | 'preparing'>('scanning');
  const [error, setError] = useState<string | null>(null);
  const [consensusInfo, setConsensusInfo] = useState<{ agree: number; total: number } | null>(null);


  useEffect(() => {
    const analyzeImage = async () => {
      if (!capturedImage || !selectedCrop) {
        setCurrentScreen('camera');
        return;
      }

      try {
        // Update status through the stages
        setTimeout(() => setStatus('identifying'), 1000);
        setTimeout(() => setStatus('preparing'), 2500);

        console.log('Sending image to AI for analysis...');
        
        // Call the edge function
        const { data, error: functionError } = await supabase.functions.invoke('detect-disease', {
          body: {
            imageBase64: capturedImage,
            cropName: selectedCrop.nameEn,
            cropNameHi: selectedCrop.nameHi,
          }
        });

        if (functionError) {
          console.error('Edge function error:', functionError);
          throw new Error(functionError.message || 'Analysis failed');
        }

        console.log('AI Response:', data);

        // Check if disease was detected
        if (!data.detected) {
          // No disease detected or unable to analyze
          setError(data.message || t(
            'रोग का पता नहीं लगाया जा सका। कृपया स्पष्ट फोटो से पुनः प्रयास करें।',
            'Could not detect disease. Please try again with a clearer photo.'
          ));
          return;
        }

        // Disease detected - set results
        const result = {
          id: `analysis-${Date.now()}`,
          diseaseNameHi: data.diseaseNameHi || 'अज्ञात रोग',
          diseaseNameEn: data.diseaseNameEn || 'Unknown Disease',
          confidence: data.confidence || 75,
          severity: data.severity || 'medium',
          imageUrl: capturedImage,
        };

        const advisory = {
          causeHi: data.causeHi || 'कारण की जानकारी उपलब्ध नहीं',
          causeEn: data.causeEn || 'Cause information not available',
          preventionHi: data.preventionHi || ['उचित देखभाल करें'],
          preventionEn: data.preventionEn || ['Take proper care'],
          organicTreatmentHi: data.organicTreatmentHi || ['जैविक उपचार उपलब्ध नहीं'],
          organicTreatmentEn: data.organicTreatmentEn || ['Organic treatment not available'],
          chemicalTreatmentHi: data.chemicalTreatmentHi,
          chemicalTreatmentEn: data.chemicalTreatmentEn,
        };

        setDiseaseResult(result);
        setAdvisory(advisory);
        setCurrentScreen('result');
        
      } catch (err) {
        console.error('Analysis failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        // Show specific error messages
        if (errorMessage.includes('busy') || errorMessage.includes('429')) {
          setError(t(
            'सेवा व्यस्त है। कृपया कुछ समय बाद पुनः प्रयास करें।',
            'Service is busy. Please try again in a moment.'
          ));
        } else if (errorMessage.includes('credits') || errorMessage.includes('402')) {
          setError(t(
            'सेवा अस्थायी रूप से अनुपलब्ध है।',
            'Service temporarily unavailable.'
          ));
        } else {
          setError(t(
            'विश्लेषण विफल। कृपया पुनः प्रयास करें।',
            'Analysis failed. Please try again.'
          ));
        }
      }
    };

    analyzeImage();
  }, [capturedImage, selectedCrop, setCurrentScreen, setDiseaseResult, setAdvisory, t, language]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6">
        <div className="bg-card rounded-3xl p-8 shadow-lg max-w-sm w-full text-center animate-fade-in-scale">
          <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-error" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3">
            {t('विश्लेषण असफल', 'Analysis Failed')}
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => setCurrentScreen('camera')}
            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            {t('पुनः प्रयास करें', 'Try Again')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6">
      {/* Animated Scanner */}
      <div className="relative mb-8">
        <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-glow relative">
          {capturedImage && (
            <img 
              src={capturedImage} 
              alt="Analyzing" 
              className="w-full h-full object-cover"
            />
          )}
          {/* Scanning overlay */}
          <div className="absolute inset-0 bg-primary/30">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary-foreground animate-shimmer" />
          </div>
        </div>
        
        {/* Rotating scanner ring */}
        <div className="absolute -inset-4 border-4 border-primary-foreground/30 rounded-[2rem] animate-rotate-scan" 
             style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
        
        {/* Corner markers */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-primary-foreground rounded-tl-xl" />
        <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-primary-foreground rounded-tr-xl" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-primary-foreground rounded-bl-xl" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-primary-foreground rounded-br-xl" />
      </div>

      {/* Status Text */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-accent animate-bounce-gentle" />
          <h2 className="text-2xl font-bold text-primary-foreground">
            {t('AI विश्लेषण', 'AI Analysis')}
          </h2>
          <Sparkles className="w-6 h-6 text-accent animate-bounce-gentle delay-200" />
        </div>
        <p className="text-primary-foreground/80 mb-6">
          {t('आपकी फसल की जांच हो रही है...', 'Analyzing your crop...')}
        </p>

        {/* Progress Steps */}
        <div className="space-y-3 text-left max-w-xs mx-auto">
          <ProgressStep 
            icon={<Search className="w-4 h-4" />}
            text={t('छवि को स्कैन किया जा रहा है', 'Scanning image')}
            active={status === 'scanning'}
            completed={status !== 'scanning'}
          />
          <ProgressStep 
            icon={<Leaf className="w-4 h-4" />}
            text={t('रोग पहचान चल रही है', 'Identifying disease')}
            active={status === 'identifying'}
            completed={status === 'preparing'}
          />
          <ProgressStep 
            icon={<Sparkles className="w-4 h-4" />}
            text={t('सलाह तैयार हो रही है', 'Preparing advisory')}
            active={status === 'preparing'}
          />
        </div>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-12 flex gap-2">
        <div className="w-3 h-3 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

interface ProgressStepProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  completed?: boolean;
}

const ProgressStep: React.FC<ProgressStepProps> = ({ 
  icon, 
  text, 
  active,
  completed 
}) => (
  <div className={`flex items-center gap-3 transition-opacity ${active ? 'opacity-100' : completed ? 'opacity-70' : 'opacity-40'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
      active ? 'bg-accent text-accent-foreground' : 
      completed ? 'bg-success text-success-foreground' : 
      'bg-primary-foreground/20 text-primary-foreground'
    }`}>
      {icon}
    </div>
    <span className="text-primary-foreground text-sm">{text}</span>
    {active && <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />}
    {completed && <span className="text-success">✓</span>}
  </div>
);

export default AnalyzingScreen;
