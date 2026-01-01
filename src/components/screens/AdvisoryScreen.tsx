import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Leaf, 
  FlaskConical, 
  ShieldCheck, 
  AlertCircle, 
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

type TabType = 'organic' | 'chemical';

const AdvisoryScreen: React.FC = () => {
  const { 
    t, 
    setCurrentScreen, 
    advisory, 
    diseaseResult,
    language 
  } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('organic');
  const [expandedSections, setExpandedSections] = useState<string[]>(['cause', 'prevention']);

  if (!advisory || !diseaseResult) {
    setCurrentScreen('result');
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const isSectionExpanded = (section: string) => expandedSections.includes(section);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 rounded-b-3xl shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('result')}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">
              {t('उपचार सलाह', 'Treatment Advisory')}
            </h1>
            <p className="text-sm text-primary-foreground/80">
              {language === 'hi' ? diseaseResult.diseaseNameHi : diseaseResult.diseaseNameEn}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setActiveTab('organic')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
              activeTab === 'organic'
                ? 'bg-primary-foreground text-primary'
                : 'bg-primary-foreground/20 text-primary-foreground'
            }`}
          >
            <Leaf className="w-5 h-5" />
            {t('जैविक', 'Organic')}
          </button>
          <button
            onClick={() => setActiveTab('chemical')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
              activeTab === 'chemical'
                ? 'bg-primary-foreground text-primary'
                : 'bg-primary-foreground/20 text-primary-foreground'
            }`}
          >
            <FlaskConical className="w-5 h-5" />
            {t('रासायनिक', 'Chemical')}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {/* Cause Section */}
        <CollapsibleSection
          title={t('रोग का कारण', 'Cause of Disease')}
          icon={<AlertCircle className="w-5 h-5 text-accent" />}
          isExpanded={isSectionExpanded('cause')}
          onToggle={() => toggleSection('cause')}
        >
          <p className="text-foreground leading-relaxed">
            {language === 'hi' ? advisory.causeHi : advisory.causeEn}
          </p>
        </CollapsibleSection>

        {/* Prevention Section */}
        <CollapsibleSection
          title={t('रोकथाम के उपाय', 'Preventive Measures')}
          icon={<ShieldCheck className="w-5 h-5 text-primary" />}
          isExpanded={isSectionExpanded('prevention')}
          onToggle={() => toggleSection('prevention')}
        >
          <ul className="space-y-2">
            {(language === 'hi' ? advisory.preventionHi : advisory.preventionEn).map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* Treatment Section */}
        {activeTab === 'organic' ? (
          <CollapsibleSection
            title={t('जैविक उपचार', 'Organic Treatment')}
            icon={<Leaf className="w-5 h-5 text-success" />}
            isExpanded={isSectionExpanded('organic')}
            onToggle={() => toggleSection('organic')}
            defaultExpanded
          >
            <ul className="space-y-3">
              {(language === 'hi' ? advisory.organicTreatmentHi : advisory.organicTreatmentEn).map((item, index) => (
                <li key={index} className="bg-success/10 rounded-xl p-3 border border-success/20">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">🌿</span>
                    <span className="text-foreground">{item}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        ) : (
          <CollapsibleSection
            title={t('रासायनिक उपचार', 'Chemical Treatment')}
            icon={<FlaskConical className="w-5 h-5 text-accent" />}
            isExpanded={isSectionExpanded('chemical')}
            onToggle={() => toggleSection('chemical')}
            defaultExpanded
          >
            <div className="space-y-4">
              {(language === 'hi' ? advisory.chemicalTreatmentHi : advisory.chemicalTreatmentEn)?.map((item, index) => (
                <div key={index} className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                  <h4 className="font-semibold text-foreground mb-2">{item.name}</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium">{t('मात्रा:', 'Dosage:')}</span> {item.dosage}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">{t('अंतराल:', 'Interval:')}</span> {item.interval}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Disclaimer */}
        <div className="bg-warning/10 rounded-2xl p-4 border border-warning/30 mt-4">
          <p className="text-sm text-muted-foreground text-center">
            ⚠️ {t(
              'यह ऐप केवल सलाह हेतु है, अंतिम निर्णय कृषि विशेषज्ञ से परामर्श के बाद लें।',
              'This app is for advisory purposes only. Please consult agricultural experts for final decisions.'
            )}
          </p>
        </div>
      </main>

      {/* Fixed Bottom Action */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={() => setCurrentScreen('feedback')}
        >
          {t('प्रतिक्रिया दें', 'Give Feedback')}
        </Button>
      </footer>
    </div>
  );
};

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}) => (
  <div className="bg-card rounded-2xl shadow-md mb-4 overflow-hidden animate-fade-in-up">
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-semibold text-foreground">{title}</span>
      </div>
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
    {isExpanded && (
      <div className="px-4 pb-4 animate-accordion-down">
        {children}
      </div>
    )}
  </div>
);

export default AdvisoryScreen;
