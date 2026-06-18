import React, { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Sparkles, IndianRupee, Leaf, Zap, Calendar, Target, Lightbulb, BarChart3 } from 'lucide-react';

type CropKey = 'wheat' | 'soybean' | 'gram' | 'paddy' | 'maize' | 'mustard' | 'onion' | 'tomato';

interface CropEco {
  key: CropKey;
  nameHi: string;
  nameEn: string;
  season: string;
  yieldQtlPerHa: number; // average q/ha
  pricePerQtl: number;   // ₹ avg MSP/market
  costPerHa: number;     // ₹ avg input cost/ha
  emoji: string;
  tipsHi: string[];
  tipsEn: string[];
}

const CROPS: CropEco[] = [
  { key: 'wheat', nameHi: 'गेहूँ', nameEn: 'Wheat', season: 'Rabi', yieldQtlPerHa: 45, pricePerQtl: 2425, costPerHa: 32000, emoji: '🌾',
    tipsHi: ['DBW-303 / GW-322 जैसी उन्नत किस्म चुनें', 'बीज दर 100 किग्रा/हे., 20 सेमी कतार दूरी', 'सिंचाई: ताज मूल, गाँठ, फूल व दाना अवस्था पर'],
    tipsEn: ['Pick high-yield varieties: DBW-303 / GW-322', 'Seed rate 100 kg/ha, row spacing 20 cm', 'Irrigate at CRI, tillering, flowering & grain-fill'] },
  { key: 'soybean', nameHi: 'सोयाबीन', nameEn: 'Soybean', season: 'Kharif', yieldQtlPerHa: 14, pricePerQtl: 4892, costPerHa: 22000, emoji: '🫘',
    tipsHi: ['JS-2034 / NRC-150 छोटी अवधि की किस्में लगाएँ', 'BBF / रिज-फरो विधि से बुवाई करें', 'राइज़ोबियम + PSB बीज उपचार जरूर करें'],
    tipsEn: ['Use short-duration JS-2034 / NRC-150', 'Sow on BBF / ridge-furrow for water mgmt', 'Treat seed with Rhizobium + PSB'] },
  { key: 'gram', nameHi: 'चना', nameEn: 'Chickpea', season: 'Rabi', yieldQtlPerHa: 18, pricePerQtl: 5650, costPerHa: 18000, emoji: '🫛',
    tipsHi: ['JG-14 / RVG-202 उन्नत किस्म', 'फूल अवस्था पर हल्की सिंचाई से 20% उपज बढ़ती है', 'फली छेदक हेतु NPV/HaNPV का छिड़काव'],
    tipsEn: ['Improved JG-14 / RVG-202', 'One irrigation at flowering raises yield ~20%', 'Spray NPV for pod borer'] },
  { key: 'paddy', nameHi: 'धान', nameEn: 'Paddy', season: 'Kharif', yieldQtlPerHa: 50, pricePerQtl: 2300, costPerHa: 38000, emoji: '🌾',
    tipsHi: ['SRI / DSR विधि से 25% पानी की बचत', 'पुसा बासमती-1718 का बाजार भाव अधिक', 'पीला तना छेदक हेतु फेरोमोन ट्रैप'],
    tipsEn: ['SRI / DSR saves 25% water', 'Pusa Basmati-1718 fetches premium', 'Pheromone traps for yellow stem borer'] },
  { key: 'maize', nameHi: 'मक्का', nameEn: 'Maize', season: 'Kharif', yieldQtlPerHa: 55, pricePerQtl: 2225, costPerHa: 28000, emoji: '🌽',
    tipsHi: ['हाइब्रिड बीज (NK-6240, P-3401) से उपज दोगुनी', 'फॉल आर्मीवर्म हेतु इमामेक्टिन 5% SG @ 0.4 ग्रा/ली', 'अंतरफसल: मक्का+अरहर लाभ बढ़ाए'],
    tipsEn: ['Hybrid seed doubles yield (NK-6240, P-3401)', 'Emamectin 5% SG @ 0.4 g/L for fall armyworm', 'Intercrop maize+pigeon pea boosts profit'] },
  { key: 'mustard', nameHi: 'सरसों', nameEn: 'Mustard', season: 'Rabi', yieldQtlPerHa: 16, pricePerQtl: 5950, costPerHa: 16000, emoji: '🌱',
    tipsHi: ['पूसा डबल जीरो / RH-725 तेल अधिक देती है', 'सल्फर 20 किग्रा/हे. डालने से तेल% बढ़ता है', 'मधुमक्खी पालन से 15% अधिक परागण'],
    tipsEn: ['Pusa Double Zero / RH-725 give higher oil', 'Apply 20 kg/ha sulphur for higher oil %', 'Bee-keeping raises pollination by 15%'] },
  { key: 'onion', nameHi: 'प्याज़', nameEn: 'Onion', season: 'Horticulture', yieldQtlPerHa: 250, pricePerQtl: 1800, costPerHa: 95000, emoji: '🧅',
    tipsHi: ['भीमा शक्ति / N-53 भंडारण योग्य किस्म', 'ड्रिप + मल्चिंग से 30% पानी बचाएँ', 'भंडार-गृह से ऑफ-सीज़न में 2× भाव'],
    tipsEn: ['Bhima Shakti / N-53 store well', 'Drip + mulch saves 30% water', 'Off-season storage fetches 2× price'] },
  { key: 'tomato', nameHi: 'टमाटर', nameEn: 'Tomato', season: 'Horticulture', yieldQtlPerHa: 400, pricePerQtl: 1500, costPerHa: 120000, emoji: '🍅',
    tipsHi: ['स्टेकिंग व मल्चिंग से उपज 40% बढ़ती है', 'अर्का रक्षक F1 तीन रोगों से प्रतिरोधी', 'सीधे B2B (Ninjacart/DeHaat) से बेचें'],
    tipsEn: ['Staking + mulch raise yield by 40%', 'Arka Rakshak F1 resists 3 diseases', 'Sell direct via Ninjacart / DeHaat'] },
];

interface Update {
  dateHi: string;
  dateEn: string;
  tagHi: string;
  tagEn: string;
  titleHi: string;
  titleEn: string;
  descHi: string;
  descEn: string;
  impactHi: string;
  impactEn: string;
  icon: React.ReactNode;
}

const UPDATES: Update[] = [
  {
    dateHi: 'जून 2026', dateEn: 'June 2026',
    tagHi: 'MSP', tagEn: 'MSP',
    titleHi: 'खरीफ 2026-27 के लिए MSP में बढ़ोतरी',
    titleEn: 'Kharif 2026-27 MSP hiked',
    descHi: 'धान ₹2,300 → ₹2,400/क्विंटल, सोयाबीन ₹4,892 → ₹5,100/क्विंटल। तुअर ₹400 बढ़ी।',
    descEn: 'Paddy ₹2,300→₹2,400/q, Soybean ₹4,892→₹5,100/q. Tur up ₹400.',
    impactHi: 'प्रति हेक्टेयर ₹4,000-₹6,000 अतिरिक्त आय।',
    impactEn: '₹4,000-₹6,000 extra income per hectare.',
    icon: <IndianRupee className="w-5 h-5" />,
  },
  {
    dateHi: 'जून 2026', dateEn: 'June 2026',
    tagHi: 'योजना', tagEn: 'Scheme',
    titleHi: 'PM-PRANAM: जैविक खेती पर 50% सब्सिडी',
    titleEn: 'PM-PRANAM: 50% subsidy on organic inputs',
    descHi: 'गोबर खाद, जीवामृत, वर्मीकम्पोस्ट यूनिट पर 50% तक अनुदान। MP में 5 लाख किसानों को लक्ष्य।',
    descEn: 'Up to 50% subsidy on FYM, jeevamrit & vermicompost units. MP targets 5 lakh farmers.',
    impactHi: 'इनपुट लागत ₹8,000/हे. तक घटेगी।',
    impactEn: 'Input cost can drop by ₹8,000/ha.',
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    dateHi: 'मई 2026', dateEn: 'May 2026',
    tagHi: 'तकनीक', tagEn: 'Tech',
    titleHi: 'AI-आधारित नैनो यूरिया छिड़काव ड्रोन',
    titleEn: 'AI-guided nano-urea spray drones',
    descHi: 'IFFCO ड्रोन सेवा ₹300/एकड़ पर उपलब्ध। 90% कम पानी, 25% कम उर्वरक।',
    descEn: 'IFFCO drone service @ ₹300/acre. 90% less water, 25% less fertilizer.',
    impactHi: 'समय व लागत दोनों में 40% बचत।',
    impactEn: 'Saves 40% of both time and cost.',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    dateHi: 'मई 2026', dateEn: 'May 2026',
    tagHi: 'बाज़ार', tagEn: 'Market',
    titleHi: 'eNAM पर सीधी बिक्री – बिचौलिए हटे',
    titleEn: 'eNAM direct selling – no middlemen',
    descHi: 'MP की 80 मंडियाँ अब eNAM से जुड़ीं। ऑनलाइन बोली से 8-12% अधिक भाव।',
    descEn: '80 MP mandis on eNAM now. Online auctions give 8-12% higher rates.',
    impactHi: 'प्रति क्विंटल ₹150-₹400 अधिक।',
    impactEn: '₹150-₹400 extra per quintal.',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    dateHi: 'अप्रैल 2026', dateEn: 'April 2026',
    tagHi: 'बीमा', tagEn: 'Insurance',
    titleHi: 'PMFBY में रिमोट-सेंसिंग क्लेम सेटलमेंट',
    titleEn: 'PMFBY: remote-sensing claim settlement',
    descHi: 'सैटेलाइट डेटा से 14 दिन में क्लेम। प्रीमियम मात्र 1.5-2%।',
    descEn: 'Satellite-based claims settled in 14 days. Premium just 1.5-2%.',
    impactHi: 'क्षति पर तुरंत राहत मिलेगी।',
    impactEn: 'Instant relief on crop loss.',
    icon: <Sparkles className="w-5 h-5" />,
  },
];

const ProfitBoosterScreen: React.FC = () => {
  const { t, setCurrentScreen, language } = useApp();
  const [area, setArea] = useState<string>('1');
  const [unit, setUnit] = useState<'acre' | 'hectare' | 'bigha'>('acre');
  const [crop, setCrop] = useState<CropKey>('wheat');

  const selected = CROPS.find(c => c.key === crop)!;

  const calc = useMemo(() => {
    const a = parseFloat(area) || 0;
    const haFactor = unit === 'acre' ? 0.4047 : unit === 'bigha' ? 0.2529 : 1; // MP bigha ~0.2529 ha
    const ha = a * haFactor;
    const grossYield = selected.yieldQtlPerHa * ha;
    const grossRevenue = grossYield * selected.pricePerQtl;
    const totalCost = selected.costPerHa * ha;
    const netProfit = grossRevenue - totalCost;
    // Boost scenario: +20% yield via tips, +10% price via eNAM, -15% cost via subsidy
    const boostedYield = grossYield * 1.20;
    const boostedRevenue = boostedYield * selected.pricePerQtl * 1.10;
    const boostedCost = totalCost * 0.85;
    const boostedProfit = boostedRevenue - boostedCost;
    return {
      ha: ha.toFixed(2),
      grossYield: Math.round(grossYield),
      grossRevenue: Math.round(grossRevenue),
      totalCost: Math.round(totalCost),
      netProfit: Math.round(netProfit),
      boostedProfit: Math.round(boostedProfit),
      extra: Math.round(boostedProfit - netProfit),
    };
  }, [area, unit, selected]);

  const fmtINR = (n: number) => '₹' + n.toLocaleString('en-IN');

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              {t('मुनाफा बूस्टर', 'Profit Booster')}
            </h1>
            <p className="text-xs text-primary-foreground/80">
              {t('ताज़ा अपडेट व आपकी ज़मीन के लिए सुझाव', 'Latest updates & area-based suggestions')}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 -mt-3 space-y-4">
        {/* Personalized Calculator */}
        <div className="bg-card rounded-2xl p-4 shadow-md border border-border animate-fade-in-up">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t('आपके खेत के लिए अनुमान', 'Estimate for Your Land')}
          </h3>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-xs text-muted-foreground">{t('क्षेत्रफल', 'Area')}</label>
              <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t('इकाई', 'Unit')}</label>
              <Select value={unit} onValueChange={(v: any) => setUnit(v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="acre">{t('एकड़', 'Acre')}</SelectItem>
                  <SelectItem value="hectare">{t('हेक्टेयर', 'Hectare')}</SelectItem>
                  <SelectItem value="bigha">{t('बीघा (MP)', 'Bigha (MP)')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="text-xs text-muted-foreground">{t('फसल चुनें', 'Select Crop')}</label>
          <Select value={crop} onValueChange={(v: any) => setCrop(v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CROPS.map(c => (
                <SelectItem key={c.key} value={c.key}>
                  {c.emoji} {language === 'hi' ? c.nameHi : c.nameEn} ({c.season})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Results */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Stat label={t('कुल क्षेत्र', 'Total area')} value={`${calc.ha} ha`} />
            <Stat label={t('अनुमानित उपज', 'Est. yield')} value={`${calc.grossYield} q`} />
            <Stat label={t('आय', 'Revenue')} value={fmtINR(calc.grossRevenue)} tone="primary" />
            <Stat label={t('लागत', 'Cost')} value={fmtINR(calc.totalCost)} tone="warning" />
          </div>

          <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-border">
            <p className="text-xs text-muted-foreground">{t('मौजूदा शुद्ध मुनाफा', 'Current net profit')}</p>
            <p className="text-lg font-bold text-foreground">{fmtINR(calc.netProfit)}</p>
          </div>

          <div className="mt-2 p-3 rounded-xl bg-success/10 border border-success/30">
            <p className="text-xs text-success flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {t('बूस्टर सुझावों के साथ संभावित मुनाफा', 'Potential profit with booster tips')}
            </p>
            <p className="text-xl font-extrabold text-success">{fmtINR(calc.boostedProfit)}</p>
            <p className="text-[11px] text-success/80 mt-0.5">
              +{fmtINR(calc.extra)} {t('अतिरिक्त (अनुमानित)', 'extra (estimated)')}
            </p>
          </div>
        </div>

        {/* Crop-specific Tips */}
        <div className="bg-card rounded-2xl p-4 shadow-md border border-border animate-fade-in-up">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            {selected.emoji} {t(`${selected.nameHi} – मुनाफा बढ़ाने के टिप्स`, `${selected.nameEn} – Profit-boosting tips`)}
          </h3>
          <ul className="space-y-2">
            {(language === 'hi' ? selected.tipsHi : selected.tipsEn).map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Latest Updates Feed */}
        <div className="animate-fade-in-up">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 px-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t('ताज़ा अपडेट्स – किसान लाभ', 'Latest Updates – Farmer Benefits')}
          </h3>
          <div className="space-y-3">
            {UPDATES.map((u, idx) => (
              <div key={idx} className="bg-card rounded-2xl p-4 shadow-md border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    {u.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{language === 'hi' ? u.tagHi : u.tagEn}</Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {language === 'hi' ? u.dateHi : u.dateEn}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-foreground">{language === 'hi' ? u.titleHi : u.titleEn}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{language === 'hi' ? u.descHi : u.descEn}</p>
                    <div className="mt-2 p-2 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-[11px] text-success font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {language === 'hi' ? u.impactHi : u.impactEn}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-warning/10 rounded-xl p-3 border border-warning/30">
          <p className="text-[11px] text-warning text-center">
            {t(
              '⚠️ अनुमान सांकेतिक हैं। वास्तविक मुनाफा मौसम, बाज़ार व प्रबंधन पर निर्भर है।',
              '⚠️ Estimates are indicative. Actual profit depends on weather, market & management.'
            )}
          </p>
        </div>
      </main>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; tone?: 'primary' | 'warning' }> = ({ label, value, tone }) => (
  <div className={`p-2.5 rounded-lg border ${
    tone === 'primary' ? 'bg-primary/5 border-primary/20' :
    tone === 'warning' ? 'bg-warning/5 border-warning/20' :
    'bg-muted/30 border-border'
  }`}>
    <p className="text-[10px] text-muted-foreground">{label}</p>
    <p className={`text-sm font-bold ${tone === 'primary' ? 'text-primary' : tone === 'warning' ? 'text-warning' : 'text-foreground'}`}>{value}</p>
  </div>
);

export default ProfitBoosterScreen;
