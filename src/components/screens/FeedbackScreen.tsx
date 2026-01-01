import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ThumbsUp, ThumbsDown, Home, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FeedbackScreen: React.FC = () => {
  const { t, setCurrentScreen, diseaseResult, language } = useApp();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (type: 'helpful' | 'not_helpful') => {
    setFeedback(type);
  };

  const handleSubmit = () => {
    if (feedback) {
      // Here you would send feedback to your backend
      console.log('Feedback submitted:', { feedback, diseaseId: diseaseResult?.id });
      setSubmitted(true);
      toast({
        title: t('धन्यवाद!', 'Thank you!'),
        description: t('आपकी प्रतिक्रिया दर्ज की गई', 'Your feedback has been recorded'),
      });
    }
  };

  const handleGoHome = () => {
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('advisory')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">
              {t('प्रतिक्रिया', 'Feedback')}
            </h1>
            <p className="text-sm text-primary-foreground/80">
              {t('हमें अपनी राय बताएं', 'Share your experience')}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        {submitted ? (
          // Success State
          <div className="text-center animate-fade-in-scale">
            <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-14 h-14 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t('धन्यवाद!', 'Thank You!')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t(
                'आपकी प्रतिक्रिया से हम बेहतर बनेंगे',
                'Your feedback helps us improve'
              )}
            </p>
            <Button
              variant="default"
              size="xl"
              onClick={handleGoHome}
              className="gap-3"
            >
              <Home className="w-5 h-5" />
              {t('होम पर जाएं', 'Go to Home')}
            </Button>
          </div>
        ) : (
          // Feedback Form
          <div className="w-full max-w-md animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('क्या यह सलाह उपयोगी थी?', 'Was this advice helpful?')}
              </h2>
              <p className="text-muted-foreground">
                {t(
                  'आपकी प्रतिक्रिया से हम बेहतर बनेंगे',
                  'Your feedback helps us improve'
                )}
              </p>
            </div>

            {/* Feedback Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => handleFeedback('helpful')}
                className={`flex-1 py-8 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  feedback === 'helpful'
                    ? 'border-success bg-success/10 scale-105'
                    : 'border-border bg-card hover:border-success/50'
                }`}
              >
                <ThumbsUp className={`w-12 h-12 ${feedback === 'helpful' ? 'text-success' : 'text-muted-foreground'}`} />
                <span className={`text-lg font-semibold ${feedback === 'helpful' ? 'text-success' : 'text-foreground'}`}>
                  {t('हाँ', 'Yes')}
                </span>
              </button>

              <button
                onClick={() => handleFeedback('not_helpful')}
                className={`flex-1 py-8 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  feedback === 'not_helpful'
                    ? 'border-error bg-error/10 scale-105'
                    : 'border-border bg-card hover:border-error/50'
                }`}
              >
                <ThumbsDown className={`w-12 h-12 ${feedback === 'not_helpful' ? 'text-error' : 'text-muted-foreground'}`} />
                <span className={`text-lg font-semibold ${feedback === 'not_helpful' ? 'text-error' : 'text-foreground'}`}>
                  {t('नहीं', 'No')}
                </span>
              </button>
            </div>

            {/* Submit Button */}
            <Button
              variant="default"
              size="xl"
              onClick={handleSubmit}
              disabled={!feedback}
              className="w-full"
            >
              {t('प्रतिक्रिया भेजें', 'Submit Feedback')}
            </Button>

            {/* Skip Option */}
            <Button
              variant="ghost"
              size="lg"
              onClick={handleGoHome}
              className="w-full mt-4"
            >
              {t('छोड़ें', 'Skip')}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedbackScreen;
