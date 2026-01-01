import React, { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Leaf, Search, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AnalyzingScreen: React.FC = () => {
  const { 
    t, 
    setCurrentScreen, 
    capturedImage, 
    selectedCrop, 
    setDiseaseResult, 
    setAdvisory,
    language 
  } = useApp();
  const { toast } = useToast();

  useEffect(() => {
    const analyzeImage = async () => {
      if (!capturedImage) {
        setCurrentScreen('camera');
        return;
      }

      try {
        // Simulate API call delay for demo
        // In production, this would call the actual OpenAI API via edge function
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mock result for demo (replace with actual API call)
        const mockResult = {
          id: 'demo-1',
          diseaseNameHi: 'पत्ती झुलसा रोग',
          diseaseNameEn: 'Leaf Blight Disease',
          confidence: 87,
          severity: 'medium' as const,
          imageUrl: capturedImage,
        };

        const mockAdvisory = {
          causeHi: 'यह रोग फफूंद (फंगस) के कारण होता है जो नम और गर्म मौसम में फैलता है।',
          causeEn: 'This disease is caused by fungus that spreads in humid and warm weather conditions.',
          preventionHi: [
            'बीज उपचार करें',
            'फसल चक्र अपनाएं',
            'प्रभावित पौधों को हटाएं',
            'खेत में जल निकासी सुनिश्चित करें',
          ],
          preventionEn: [
            'Treat seeds before sowing',
            'Follow crop rotation',
            'Remove affected plants',
            'Ensure proper drainage in field',
          ],
          organicTreatmentHi: [
            'नीम तेल का छिड़काव करें (5ml/लीटर पानी)',
            'ट्राइकोडर्मा का उपयोग करें',
            'जैविक खाद का उपयोग करें',
          ],
          organicTreatmentEn: [
            'Spray neem oil (5ml/liter water)',
            'Use Trichoderma',
            'Apply organic manure',
          ],
          chemicalTreatmentHi: [
            {
              name: 'मैंकोज़ेब 75% WP',
              dosage: '2.5 ग्राम/लीटर पानी',
              interval: '10-15 दिन के अंतराल पर',
            },
            {
              name: 'कार्बेन्डाजिम 50% WP',
              dosage: '1 ग्राम/लीटर पानी',
              interval: '15 दिन के अंतराल पर',
            },
          ],
          chemicalTreatmentEn: [
            {
              name: 'Mancozeb 75% WP',
              dosage: '2.5 gm/liter water',
              interval: 'At 10-15 days interval',
            },
            {
              name: 'Carbendazim 50% WP',
              dosage: '1 gm/liter water',
              interval: 'At 15 days interval',
            },
          ],
        };

        setDiseaseResult(mockResult);
        setAdvisory(mockAdvisory);
        setCurrentScreen('result');
      } catch (error) {
        console.error('Analysis failed:', error);
        toast({
          title: t('विश्लेषण विफल', 'Analysis Failed'),
          description: t(
            'कृपया दोबारा प्रयास करें',
            'Please try again'
          ),
          variant: 'destructive',
        });
        setCurrentScreen('camera');
      }
    };

    analyzeImage();
  }, [capturedImage, setCurrentScreen, setDiseaseResult, setAdvisory, t, toast]);

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
            active
          />
          <ProgressStep 
            icon={<Leaf className="w-4 h-4" />}
            text={t('रोग पहचान चल रही है', 'Identifying disease')}
          />
          <ProgressStep 
            icon={<Sparkles className="w-4 h-4" />}
            text={t('सलाह तैयार हो रही है', 'Preparing advisory')}
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

const ProgressStep: React.FC<{ icon: React.ReactNode; text: string; active?: boolean }> = ({ 
  icon, 
  text, 
  active 
}) => (
  <div className={`flex items-center gap-3 ${active ? 'opacity-100' : 'opacity-50'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
      active ? 'bg-accent text-accent-foreground' : 'bg-primary-foreground/20 text-primary-foreground'
    }`}>
      {icon}
    </div>
    <span className="text-primary-foreground text-sm">{text}</span>
    {active && <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />}
  </div>
);

export default AnalyzingScreen;
