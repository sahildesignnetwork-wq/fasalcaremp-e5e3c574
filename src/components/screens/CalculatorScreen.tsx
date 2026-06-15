import React, { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calculator, Sprout, SprayCan, Info, Beaker, Droplets } from 'lucide-react';

type Mode = 'fertilizer' | 'pesticide';
type AreaUnit = 'hectare' | 'acre' | 'bigha';

// 1 hectare = 2.4711 acre. MP bigha ≈ 0.4 ha (पक्का) — varies by region.
const HA_PER_UNIT: Record<AreaUnit, number> = {
  hectare: 1,
  acre: 1 / 2.4711,
  bigha: 0.4,
};

interface Fertilizer {
  id: string;
  nameHi: string;
  nameEn: string;
  dosePerHa: number; // kg/ha standard
  noteHi: string;
  noteEn: string;
}

const FERTILIZERS: Fertilizer[] = [
  { id: 'urea', nameHi: 'यूरिया (46% N)', nameEn: 'Urea (46% N)', dosePerHa: 110, noteHi: 'टॉप-ड्रेसिंग में 2-3 बार बांटें', noteEn: 'Split into 2-3 top-dressings' },
  { id: 'dap', nameHi: 'डीएपी (18:46:0)', nameEn: 'DAP (18:46:0)', dosePerHa: 100, noteHi: 'बेसल खुराक — बुवाई के समय', noteEn: 'Basal dose at sowing' },
  { id: 'mop', nameHi: 'एमओपी (60% K)', nameEn: 'MOP (60% K)', dosePerHa: 50, noteHi: 'बेसल खुराक', noteEn: 'Basal dose' },
  { id: 'npk', nameHi: 'एनपीके 12:32:16', nameEn: 'NPK 12:32:16', dosePerHa: 125, noteHi: 'बेसल — संतुलित पोषण', noteEn: 'Basal — balanced nutrition' },
  { id: 'ssp', nameHi: 'एसएसपी (16% P)', nameEn: 'SSP (16% P)', dosePerHa: 200, noteHi: 'सल्फर भी देता है', noteEn: 'Also supplies sulphur' },
  { id: 'zinc', nameHi: 'जिंक सल्फेट (21%)', nameEn: 'Zinc Sulphate (21%)', dosePerHa: 25, noteHi: 'कमी होने पर ही', noteEn: 'Only if deficiency' },
  { id: 'gypsum', nameHi: 'जिप्सम', nameEn: 'Gypsum', dosePerHa: 250, noteHi: 'सोयाबीन/मूंगफली के लिए', noteEn: 'For soybean/groundnut' },
  { id: 'mop-organic', nameHi: 'वर्मीकम्पोस्ट', nameEn: 'Vermicompost', dosePerHa: 2500, noteHi: 'जैविक — बुवाई से पहले', noteEn: 'Organic — before sowing' },
];

interface Pesticide {
  id: string;
  nameHi: string;
  nameEn: string;
  unit: 'ml' | 'g';
  dosePerLitre: number; // ml or g per litre water
  targetHi: string;
  targetEn: string;
  category: 'insect' | 'fungus' | 'weed';
}

const PESTICIDES: Pesticide[] = [
  // Insecticides
  { id: 'imidacloprid', nameHi: 'इमिडाक्लोप्रिड 17.8% SL', nameEn: 'Imidacloprid 17.8% SL', unit: 'ml', dosePerLitre: 0.3, targetHi: 'चूसक कीट (एफिड, जैसिड)', targetEn: 'Sucking pests (aphid, jassid)', category: 'insect' },
  { id: 'chlorpyrifos', nameHi: 'क्लोरपाइरीफॉस 20% EC', nameEn: 'Chlorpyrifos 20% EC', unit: 'ml', dosePerLitre: 2.0, targetHi: 'सूंडी, दीमक', targetEn: 'Caterpillars, termites', category: 'insect' },
  { id: 'acetamiprid', nameHi: 'एसिटामिप्रिड 20% SP', nameEn: 'Acetamiprid 20% SP', unit: 'g', dosePerLitre: 0.2, targetHi: 'सफेद मक्खी, एफिड', targetEn: 'Whitefly, aphid', category: 'insect' },
  { id: 'profenofos', nameHi: 'प्रोफेनोफॉस 50% EC', nameEn: 'Profenofos 50% EC', unit: 'ml', dosePerLitre: 2.0, targetHi: 'इल्ली, थ्रिप्स', targetEn: 'Larvae, thrips', category: 'insect' },
  { id: 'emamectin', nameHi: 'इमामेक्टिन बेंजोएट 5% SG', nameEn: 'Emamectin Benzoate 5% SG', unit: 'g', dosePerLitre: 0.4, targetHi: 'फल छेदक, सूंडी', targetEn: 'Fruit borer, larvae', category: 'insect' },
  // Fungicides
  { id: 'mancozeb', nameHi: 'मैंकोज़ेब 75% WP', nameEn: 'Mancozeb 75% WP', unit: 'g', dosePerLitre: 2.5, targetHi: 'झुलसा, रस्ट, धब्बा रोग', targetEn: 'Blight, rust, leaf spot', category: 'fungus' },
  { id: 'carbendazim', nameHi: 'कार्बेन्डाजिम 50% WP', nameEn: 'Carbendazim 50% WP', unit: 'g', dosePerLitre: 1.0, targetHi: 'झुलसा, सड़न', targetEn: 'Blight, rot', category: 'fungus' },
  { id: 'tebuconazole', nameHi: 'टेबुकोनाजोल 25.9% EC', nameEn: 'Tebuconazole 25.9% EC', unit: 'ml', dosePerLitre: 1.0, targetHi: 'रस्ट, झुलसा (गेहूं/सोयाबीन)', targetEn: 'Rust, blight (wheat/soybean)', category: 'fungus' },
  { id: 'copper', nameHi: 'कॉपर ऑक्सीक्लोराइड 50%', nameEn: 'Copper Oxychloride 50%', unit: 'g', dosePerLitre: 3.0, targetHi: 'जीवाणु/फफूंद रोग', targetEn: 'Bacterial/fungal disease', category: 'fungus' },
  // Herbicides
  { id: 'glyphosate', nameHi: 'ग्लाइफोसेट 41% SL', nameEn: 'Glyphosate 41% SL', unit: 'ml', dosePerLitre: 5.0, targetHi: 'खरपतवार (नॉन-सेलेक्टिव)', targetEn: 'Weeds (non-selective)', category: 'weed' },
  { id: '24d', nameHi: '2,4-D सोडियम सॉल्ट 80%', nameEn: '2,4-D Sodium Salt 80%', unit: 'g', dosePerLitre: 1.5, targetHi: 'चौड़ी पत्ती खरपतवार', targetEn: 'Broadleaf weeds', category: 'weed' },
];

const SPRAY_VOLUME_PER_HA = 500; // L/ha standard knapsack foliar spray
const PUMP_OPTIONS = [15, 16, 20]; // L capacity

const CalculatorScreen: React.FC = () => {
  const { t, setCurrentScreen, language } = useApp();
  const [mode, setMode] = useState<Mode>('fertilizer');
  const [area, setArea] = useState<string>('1');
  const [unit, setUnit] = useState<AreaUnit>('acre');
  const [fertId, setFertId] = useState<string>('urea');
  const [pestId, setPestId] = useState<string>('imidacloprid');
  const [pumpSize, setPumpSize] = useState<number>(16);

  const areaHa = useMemo(() => {
    const n = parseFloat(area);
    if (!isFinite(n) || n <= 0) return 0;
    return n * HA_PER_UNIT[unit];
  }, [area, unit]);

  const fert = FERTILIZERS.find(f => f.id === fertId)!;
  const pest = PESTICIDES.find(p => p.id === pestId)!;

  const fertTotalKg = areaHa * fert.dosePerHa;
  const fertBags50 = fertTotalKg / 50;

  const sprayWaterL = areaHa * SPRAY_VOLUME_PER_HA;
  const productTotal = sprayWaterL * pest.dosePerLitre; // ml or g
  const productDisplay = pest.unit === 'ml'
    ? (productTotal >= 1000 ? `${(productTotal / 1000).toFixed(2)} L` : `${productTotal.toFixed(0)} ml`)
    : (productTotal >= 1000 ? `${(productTotal / 1000).toFixed(2)} kg` : `${productTotal.toFixed(0)} g`);
  const tankRefills = sprayWaterL > 0 ? Math.ceil(sprayWaterL / pumpSize) : 0;
  const productPerTank = pumpSize * pest.dosePerLitre;
  const productPerTankDisplay = pest.unit === 'ml'
    ? `${productPerTank.toFixed(1)} ml`
    : `${productPerTank.toFixed(1)} g`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">{t('कैलकुलेटर', 'Calculator')}</h1>
            <p className="text-xs text-primary-foreground/80">{t('खाद और दवा की सही मात्रा', 'Exact fertilizer & pesticide dose')}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 -mt-4 space-y-4">
        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2 bg-card rounded-2xl p-1.5 border border-border shadow-sm">
          <button
            onClick={() => setMode('fertilizer')}
            className={`py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
              mode === 'fertilizer' ? 'bg-primary text-primary-foreground shadow' : 'text-foreground'
            }`}
          >
            <Sprout className="w-4 h-4" /> {t('खाद', 'Fertilizer')}
          </button>
          <button
            onClick={() => setMode('pesticide')}
            className={`py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
              mode === 'pesticide' ? 'bg-primary text-primary-foreground shadow' : 'text-foreground'
            }`}
          >
            <SprayCan className="w-4 h-4" /> {t('कीटनाशक/दवा', 'Pesticide/Spray')}
          </button>
        </div>

        {/* Area input */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-3">
          <label className="text-sm font-semibold text-foreground">{t('आपकी ज़मीन का क्षेत्रफल', 'Your land area')}</label>
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={area}
              onChange={e => setArea(e.target.value)}
              className="flex-1 text-lg font-semibold"
              placeholder="0"
            />
            <div className="flex gap-1 bg-background rounded-lg p-1 border border-border">
              {(['acre', 'hectare', 'bigha'] as AreaUnit[]).map(u => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${unit === u ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}
                >
                  {u === 'acre' ? t('एकड़', 'Acre') : u === 'hectare' ? t('हे.', 'Ha') : t('बीघा', 'Bigha')}
                </button>
              ))}
            </div>
          </div>
          {areaHa > 0 && (
            <p className="text-xs text-muted-foreground">
              = {areaHa.toFixed(3)} {t('हेक्टेयर', 'hectare')}
            </p>
          )}
        </div>

        {mode === 'fertilizer' ? (
          <>
            {/* Fertilizer picker */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-3">
              <label className="text-sm font-semibold text-foreground">{t('खाद चुनें', 'Choose fertilizer')}</label>
              <div className="grid grid-cols-2 gap-2">
                {FERTILIZERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFertId(f.id)}
                    className={`rounded-xl p-3 text-xs text-left border ${fertId === f.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border'}`}
                  >
                    <p className="font-semibold leading-tight">{language === 'hi' ? f.nameHi : f.nameEn}</p>
                    <p className={`text-[10px] mt-0.5 ${fertId === f.id ? 'opacity-90' : 'text-muted-foreground'}`}>
                      {f.dosePerHa} kg/ha
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            {areaHa > 0 && (
              <div className="bg-gradient-primary rounded-2xl p-5 shadow-lg text-primary-foreground">
                <p className="text-xs opacity-80 uppercase tracking-wide mb-1">{t('कुल आवश्यक मात्रा', 'Total quantity needed')}</p>
                <p className="text-4xl font-bold">{fertTotalKg.toFixed(1)} <span className="text-xl">kg</span></p>
                <p className="text-sm opacity-90 mt-1">≈ {fertBags50.toFixed(2)} {t('बोरी (50 kg)', 'bags (50 kg)')}</p>
                <div className="border-t border-primary-foreground/20 mt-3 pt-3 text-xs opacity-90">
                  <p>📌 {language === 'hi' ? fert.noteHi : fert.noteEn}</p>
                </div>
              </div>
            )}

            <InfoBox t={t}>
              {t(
                'खाद को मिट्टी की जांच (Soil Health Card) के आधार पर ही दें। अधिक खाद = पैसा और पर्यावरण की बर्बादी।',
                'Apply fertilizer based on Soil Health Card. Excess = waste of money and harm to soil.'
              )}
            </InfoBox>
          </>
        ) : (
          <>
            {/* Pesticide picker */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-3">
              <label className="text-sm font-semibold text-foreground">{t('दवा चुनें', 'Choose product')}</label>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {PESTICIDES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPestId(p.id)}
                    className={`w-full rounded-xl p-3 text-left border flex items-start gap-2 ${pestId === p.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border'}`}
                  >
                    <span className="text-lg flex-shrink-0">
                      {p.category === 'insect' ? '🐛' : p.category === 'fungus' ? '🍄' : '🌿'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight">{language === 'hi' ? p.nameHi : p.nameEn}</p>
                      <p className={`text-[11px] mt-0.5 ${pestId === p.id ? 'opacity-90' : 'text-muted-foreground'}`}>
                        {p.dosePerLitre} {p.unit}/L • {language === 'hi' ? p.targetHi : p.targetEn}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pump size */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
              <label className="text-sm font-semibold text-foreground mb-2 block">{t('स्प्रे पंप का आकार', 'Sprayer tank size')}</label>
              <div className="flex gap-2">
                {PUMP_OPTIONS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPumpSize(p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${pumpSize === p ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border'}`}
                  >
                    {p} L
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            {areaHa > 0 && (
              <div className="space-y-3">
                <div className="bg-gradient-primary rounded-2xl p-5 shadow-lg text-primary-foreground">
                  <p className="text-xs opacity-80 uppercase tracking-wide mb-1">{t('कुल दवा चाहिए', 'Total product needed')}</p>
                  <p className="text-4xl font-bold">{productDisplay}</p>
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-primary-foreground/20">
                    <div>
                      <p className="text-[10px] opacity-80 uppercase">{t('कुल पानी', 'Total water')}</p>
                      <p className="text-lg font-semibold flex items-center gap-1">
                        <Droplets className="w-4 h-4" /> {sprayWaterL.toFixed(0)} L
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] opacity-80 uppercase">{t('पंप भरने की संख्या', 'Tank refills')}</p>
                      <p className="text-lg font-semibold flex items-center gap-1">
                        <Beaker className="w-4 h-4" /> {tankRefills}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">
                    {t('प्रति पंप मिलाएं', 'Mix per tank')}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {productPerTankDisplay} <span className="text-sm font-normal text-muted-foreground">+ {pumpSize} L {t('पानी', 'water')}</span>
                  </p>
                </div>
              </div>
            )}

            <InfoBox t={t}>
              {t(
                'सुरक्षा: मास्क, दस्ताने, फुल आस्तीन कपड़े पहनें। हवा के विपरीत छिड़काव न करें। बारिश से पहले 4 घंटे का अंतर रखें।',
                'Safety: Wear mask, gloves, full sleeves. Never spray against wind. Allow 4 hrs before rain.'
              )}
            </InfoBox>
            <InfoBox t={t}>
              {t(
                'मानक छिड़काव मात्रा: 500 लीटर पानी प्रति हेक्टेयर (नैपसैक पंप)। ट्रैक्टर स्प्रे के लिए राशि कम होगी।',
                'Standard spray volume: 500 L water/hectare (knapsack). Tractor spray uses less.'
              )}
            </InfoBox>
          </>
        )}

        <p className="text-[10px] text-center text-muted-foreground py-2">
          {t(
            'सलाह केवल मार्गदर्शन हेतु है। अंतिम निर्णय से पहले कृषि विशेषज्ञ या KVK से परामर्श करें।',
            'Guidance only. Consult agriculture expert / KVK before final decision.'
          )}
        </p>
      </main>
    </div>
  );
};

const InfoBox: React.FC<{ children: React.ReactNode; t: (hi: string, en: string) => string }> = ({ children }) => (
  <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 flex items-start gap-2">
    <Info className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
    <p className="text-xs text-foreground">{children}</p>
  </div>
);

export default CalculatorScreen;
