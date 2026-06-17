import React, { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Sprout, Droplets, Calendar, TrendingUp, Shield, Info } from 'lucide-react';

type Season = 'kharif' | 'rabi' | 'horticulture' | 'all';

interface Variety {
  nameHi: string;
  nameEn: string;
  duration: string; // days
  yield: string; // q/ha
  seedRate: string;
  spacing?: string;
  features: { hi: string; en: string };
  resistance?: { hi: string; en: string };
  bestFor: { hi: string; en: string }; // districts/agro-climatic zone
}

interface CropVarieties {
  cropHi: string;
  cropEn: string;
  icon: string;
  season: Exclude<Season, 'all'>;
  varieties: Variety[];
}

const DATA: CropVarieties[] = [
  {
    cropHi: 'गेहूं', cropEn: 'Wheat', icon: '🌾', season: 'rabi',
    varieties: [
      { nameHi: 'HI-1544 (पूर्णिमा)', nameEn: 'HI-1544 (Purnima)', duration: '120-125', yield: '55-60', seedRate: '100 kg/ha', spacing: '22.5 cm',
        features: { hi: 'समय पर बुवाई, सिंचित क्षेत्र, चपाती गुणवत्ता उत्तम', en: 'Timely sown, irrigated, excellent chapati quality' },
        resistance: { hi: 'रतुआ रोग सहनशील', en: 'Tolerant to rusts' },
        bestFor: { hi: 'मालवा, निमाड़, भोपाल संभाग', en: 'Malwa, Nimar, Bhopal zone' } },
      { nameHi: 'GW-322', nameEn: 'GW-322', duration: '115-120', yield: '50-55', seedRate: '100 kg/ha',
        features: { hi: 'सिंचित, समय पर बुवाई, MP की सबसे लोकप्रिय किस्म', en: 'Irrigated, timely sown, most popular MP variety' },
        resistance: { hi: 'काला व भूरा रतुआ रोधी', en: 'Resistant to black & brown rust' },
        bestFor: { hi: 'पूरे मध्य प्रदेश', en: 'All MP zones' } },
      { nameHi: 'HI-8759 (पूसा तेजस)', nameEn: 'HI-8759 (Pusa Tejas)', duration: '117', yield: '57-65', seedRate: '125 kg/ha',
        features: { hi: 'ड्यूरम गेहूं, अधिक प्रोटीन (12%), उच्च सरस', en: 'Durum, high protein (12%), high sedimentation' },
        resistance: { hi: 'तीनों रतुआ रोधी', en: 'Resistant to all 3 rusts' },
        bestFor: { hi: 'मालवा पठार, इंदौर-उज्जैन', en: 'Malwa plateau, Indore-Ujjain' } },
      { nameHi: 'JW-3288', nameEn: 'JW-3288', duration: '110-115', yield: '40-45', seedRate: '125 kg/ha',
        features: { hi: 'असिंचित/सीमित सिंचाई, सूखा सहनशील', en: 'Rainfed/limited irrigation, drought tolerant' },
        bestFor: { hi: 'बुंदेलखंड, सतना, रीवा', en: 'Bundelkhand, Satna, Rewa' } },
      { nameHi: 'HD-2967', nameEn: 'HD-2967', duration: '143-150', yield: '55-60', seedRate: '100 kg/ha',
        features: { hi: 'देर से बुवाई के लिए उपयुक्त, उच्च उपज', en: 'Suitable for late sowing, high yielding' },
        resistance: { hi: 'पीला रतुआ रोधी', en: 'Resistant to yellow rust' },
        bestFor: { hi: 'ग्वालियर, चंबल संभाग', en: 'Gwalior, Chambal zone' } },
    ],
  },
  {
    cropHi: 'सोयाबीन', cropEn: 'Soybean', icon: '🫘', season: 'kharif',
    varieties: [
      { nameHi: 'JS-9560', nameEn: 'JS-9560', duration: '82-88', yield: '25-28', seedRate: '70-75 kg/ha', spacing: '45 × 5 cm',
        features: { hi: 'जल्दी पकने वाली, कम वर्षा में भी अच्छी', en: 'Early maturing, good even in low rainfall' },
        resistance: { hi: 'पीला मोज़ेक मध्यम सहनशील', en: 'Moderately tolerant to YMV' },
        bestFor: { hi: 'पूरे MP, विशेषकर मालवा', en: 'All MP, especially Malwa' } },
      { nameHi: 'JS-2034', nameEn: 'JS-2034', duration: '86-88', yield: '24-26', seedRate: '70 kg/ha',
        features: { hi: 'जल्दी पकने वाली, सूखा सहनशील', en: 'Early maturing, drought tolerant' },
        bestFor: { hi: 'सीहोर, विदिशा, राजगढ़', en: 'Sehore, Vidisha, Rajgarh' } },
      { nameHi: 'JS-2069', nameEn: 'JS-2069', duration: '90-95', yield: '26-30', seedRate: '75 kg/ha',
        features: { hi: 'मध्यम अवधि, अच्छी उत्पादकता', en: 'Medium duration, high productivity' },
        resistance: { hi: 'गर्डल बीटल सहनशील', en: 'Tolerant to girdle beetle' },
        bestFor: { hi: 'इंदौर, उज्जैन, धार', en: 'Indore, Ujjain, Dhar' } },
      { nameHi: 'NRC-86 (अमृता)', nameEn: 'NRC-86 (Amrita)', duration: '90-95', yield: '28-32', seedRate: '70 kg/ha',
        features: { hi: 'अधिक तेल मात्रा (21%), उच्च उपज', en: 'High oil content (21%), high yield' },
        bestFor: { hi: 'भोपाल, सीहोर', en: 'Bhopal, Sehore' } },
      { nameHi: 'RVS-2001-4', nameEn: 'RVS-2001-4', duration: '93-96', yield: '25-30', seedRate: '75 kg/ha',
        features: { hi: 'अधिक फली, मजबूत तना', en: 'More pods, strong stem' },
        resistance: { hi: 'रोग व कीट सहनशील', en: 'Disease & pest tolerant' },
        bestFor: { hi: 'ग्वालियर, मुरैना', en: 'Gwalior, Morena' } },
    ],
  },
  {
    cropHi: 'चना', cropEn: 'Chickpea (Chana)', icon: '🟡', season: 'rabi',
    varieties: [
      { nameHi: 'JG-11', nameEn: 'JG-11', duration: '110-115', yield: '18-22', seedRate: '75-80 kg/ha',
        features: { hi: 'देशी चना, सूखा सहनशील', en: 'Desi chana, drought tolerant' },
        resistance: { hi: 'उकठा रोग रोधी', en: 'Wilt resistant' },
        bestFor: { hi: 'पूरे MP में', en: 'All over MP' } },
      { nameHi: 'JAKI-9218', nameEn: 'JAKI-9218', duration: '110-120', yield: '20-25', seedRate: '80 kg/ha',
        features: { hi: 'बड़े दाने, मशीन कटाई योग्य', en: 'Bold seeds, machine harvestable' },
        resistance: { hi: 'उकठा व जड़ सड़न रोधी', en: 'Wilt & root-rot resistant' },
        bestFor: { hi: 'मालवा-निमाड़', en: 'Malwa-Nimar' } },
      { nameHi: 'JG-16', nameEn: 'JG-16', duration: '105-110', yield: '18-22', seedRate: '80 kg/ha',
        features: { hi: 'जल्दी पकने वाली, मध्यम दाने', en: 'Early maturing, medium seeds' },
        bestFor: { hi: 'बुंदेलखंड, सागर', en: 'Bundelkhand, Sagar' } },
      { nameHi: 'काबुली चना – JGK-1', nameEn: 'Kabuli – JGK-1', duration: '110-115', yield: '15-20', seedRate: '100 kg/ha',
        features: { hi: 'बड़े सफेद दाने, बाजार में अच्छा भाव', en: 'Large white seeds, good market price' },
        bestFor: { hi: 'इंदौर, उज्जैन, शाजापुर', en: 'Indore, Ujjain, Shajapur' } },
    ],
  },
  {
    cropHi: 'धान', cropEn: 'Paddy (Rice)', icon: '🌾', season: 'kharif',
    varieties: [
      { nameHi: 'पूसा बासमती-1121', nameEn: 'Pusa Basmati-1121', duration: '140-145', yield: '45-50', seedRate: '15-20 kg/ha',
        features: { hi: 'लंबा दाना (8 mm), उच्च निर्यात मूल्य', en: 'Extra-long grain (8mm), high export value' },
        bestFor: { hi: 'बालाघाट, सिवनी, जबलपुर', en: 'Balaghat, Seoni, Jabalpur' } },
      { nameHi: 'MTU-1010', nameEn: 'MTU-1010', duration: '115-120', yield: '50-55', seedRate: '20-25 kg/ha',
        features: { hi: 'मध्यम पतला दाना, सिंचित क्षेत्र', en: 'Medium slender grain, irrigated' },
        resistance: { hi: 'ब्लास्ट रोग सहनशील', en: 'Tolerant to blast' },
        bestFor: { hi: 'महाकौशल, मंडला, डिंडोरी', en: 'Mahakaushal, Mandla, Dindori' } },
      { nameHi: 'JR-201', nameEn: 'JR-201', duration: '95-100', yield: '35-40', seedRate: '40 kg/ha',
        features: { hi: 'जल्दी पकने वाली, असिंचित', en: 'Early maturing, upland' },
        bestFor: { hi: 'छिंदवाड़ा, बैतूल', en: 'Chhindwara, Betul' } },
      { nameHi: 'क्रांति', nameEn: 'Kranti', duration: '120-125', yield: '40-45', seedRate: '25 kg/ha',
        features: { hi: 'मध्यम अवधि, अच्छी गुणवत्ता', en: 'Medium duration, good quality' },
        bestFor: { hi: 'रीवा, सतना, शहडोल', en: 'Rewa, Satna, Shahdol' } },
      { nameHi: 'चिन्नौर (सुगंधित)', nameEn: 'Chinnor (Aromatic)', duration: '135-140', yield: '25-30', seedRate: '25 kg/ha',
        features: { hi: 'पारंपरिक MP सुगंधित किस्म, GI टैग', en: 'Traditional MP aromatic, GI-tagged' },
        bestFor: { hi: 'बालाघाट', en: 'Balaghat' } },
    ],
  },
  {
    cropHi: 'मक्का', cropEn: 'Maize', icon: '🌽', season: 'kharif',
    varieties: [
      { nameHi: 'DKC-9108', nameEn: 'DKC-9108', duration: '100-110', yield: '70-80', seedRate: '20 kg/ha', spacing: '60 × 20 cm',
        features: { hi: 'हाइब्रिड, बड़े भुट्टे, उच्च उपज', en: 'Hybrid, large cobs, high yield' },
        bestFor: { hi: 'छिंदवाड़ा, बैतूल, खंडवा', en: 'Chhindwara, Betul, Khandwa' } },
      { nameHi: 'पायनियर 3522', nameEn: 'Pioneer 3522', duration: '95-105', yield: '65-75', seedRate: '20 kg/ha',
        features: { hi: 'सूखा सहनशील हाइब्रिड', en: 'Drought tolerant hybrid' },
        bestFor: { hi: 'झाबुआ, अलीराजपुर', en: 'Jhabua, Alirajpur' } },
      { nameHi: 'JM-216', nameEn: 'JM-216', duration: '85-90', yield: '45-55', seedRate: '20 kg/ha',
        features: { hi: 'जल्दी पकने वाली कम्पोजिट', en: 'Early maturing composite' },
        bestFor: { hi: 'आदिवासी क्षेत्र', en: 'Tribal belt' } },
      { nameHi: 'विवेक QPM-9', nameEn: 'Vivek QPM-9', duration: '85-90', yield: '40-50', seedRate: '20 kg/ha',
        features: { hi: 'प्रोटीन-समृद्ध मक्का (QPM), पोषण', en: 'Quality Protein Maize, nutritional' },
        bestFor: { hi: 'पहाड़ी क्षेत्र', en: 'Hilly areas' } },
    ],
  },
  {
    cropHi: 'सरसों', cropEn: 'Mustard', icon: '🌼', season: 'rabi',
    varieties: [
      { nameHi: 'पूसा बोल्ड', nameEn: 'Pusa Bold', duration: '125-130', yield: '18-22', seedRate: '5 kg/ha',
        features: { hi: 'बड़े दाने, 40% तेल', en: 'Bold seeds, 40% oil' },
        bestFor: { hi: 'भिंड, मुरैना, ग्वालियर', en: 'Bhind, Morena, Gwalior' } },
      { nameHi: 'RH-749', nameEn: 'RH-749', duration: '135-140', yield: '20-25', seedRate: '4-5 kg/ha',
        features: { hi: 'सिंचित, अधिक तेल मात्रा', en: 'Irrigated, high oil content' },
        resistance: { hi: 'अल्टरनेरिया झुलसा सहनशील', en: 'Tolerant to alternaria blight' },
        bestFor: { hi: 'चंबल संभाग', en: 'Chambal zone' } },
      { nameHi: 'JM-3 (पीली सरसों)', nameEn: 'JM-3 (Yellow Mustard)', duration: '110-115', yield: '12-15', seedRate: '5 kg/ha',
        features: { hi: 'पीली सरसों, जल्दी पकती है', en: 'Yellow mustard, early maturing' },
        bestFor: { hi: 'सतना, रीवा, पन्ना', en: 'Satna, Rewa, Panna' } },
    ],
  },
  {
    cropHi: 'कपास', cropEn: 'Cotton', icon: '☁️', season: 'kharif',
    varieties: [
      { nameHi: 'RCH-659 BG-II', nameEn: 'RCH-659 BG-II', duration: '160-180', yield: '20-25 (कपास)', seedRate: '1.5 kg/ha', spacing: '90 × 60 cm',
        features: { hi: 'Bt हाइब्रिड, लंबे रेशे', en: 'Bt hybrid, long staple' },
        resistance: { hi: 'बॉलवर्म रोधी', en: 'Bollworm resistant' },
        bestFor: { hi: 'खरगोन, खंडवा, बड़वानी (निमाड़)', en: 'Khargone, Khandwa, Barwani (Nimar)' } },
      { nameHi: 'अंकुर-651 BG-II', nameEn: 'Ankur-651 BG-II', duration: '160-170', yield: '22-28', seedRate: '1.5 kg/ha',
        features: { hi: 'Bt हाइब्रिड, अधिक उपज', en: 'Bt hybrid, high yielding' },
        bestFor: { hi: 'निमाड़ क्षेत्र', en: 'Nimar region' } },
      { nameHi: 'JK-4 (देशी)', nameEn: 'JK-4 (Desi)', duration: '150-160', yield: '12-15', seedRate: '5 kg/ha',
        features: { hi: 'देशी कपास, असिंचित', en: 'Desi cotton, rainfed' },
        bestFor: { hi: 'बुंदेलखंड', en: 'Bundelkhand' } },
    ],
  },
  {
    cropHi: 'टमाटर', cropEn: 'Tomato', icon: '🍅', season: 'horticulture',
    varieties: [
      { nameHi: 'पूसा रुबी', nameEn: 'Pusa Ruby', duration: '60-70', yield: '300-400', seedRate: '400 g/ha', spacing: '60 × 45 cm',
        features: { hi: 'अनिश्चित प्रकार, लाल चमकीले फल', en: 'Indeterminate, bright red fruits' },
        bestFor: { hi: 'पूरे MP में', en: 'All over MP' } },
      { nameHi: 'अर्का रक्षक (F1)', nameEn: 'Arka Rakshak (F1)', duration: '70-80', yield: '450-500', seedRate: '200 g/ha',
        features: { hi: 'ट्रिपल रोग रोधी हाइब्रिड', en: 'Triple disease resistant hybrid' },
        resistance: { hi: 'ToLCV, बैक्टीरियल विल्ट, अर्ली ब्लाइट', en: 'ToLCV, bacterial wilt, early blight' },
        bestFor: { hi: 'सब्जी पट्टी', en: 'Vegetable belts' } },
      { nameHi: 'काशी अमन', nameEn: 'Kashi Aman', duration: '70-75', yield: '350-400', seedRate: '250 g/ha',
        features: { hi: 'लंबी दूरी परिवहन योग्य', en: 'Long-distance transport friendly' },
        bestFor: { hi: 'मंडी भेजने वाले किसान', en: 'Market-oriented growers' } },
    ],
  },
  {
    cropHi: 'प्याज', cropEn: 'Onion', icon: '🧅', season: 'horticulture',
    varieties: [
      { nameHi: 'भीमा सुपर', nameEn: 'Bhima Super', duration: '110-120', yield: '300-350', seedRate: '8-10 kg/ha',
        features: { hi: 'खरीफ + रबी दोनों, लाल कंद', en: 'Both Kharif & Rabi, red bulbs' },
        bestFor: { hi: 'खरगोन, इंदौर, धार', en: 'Khargone, Indore, Dhar' } },
      { nameHi: 'N-53', nameEn: 'N-53', duration: '120-130', yield: '200-250', seedRate: '10 kg/ha',
        features: { hi: 'खरीफ, हल्के लाल कंद', en: 'Kharif, light red bulbs' },
        bestFor: { hi: 'निमाड़ क्षेत्र', en: 'Nimar region' } },
      { nameHi: 'एग्रीफाउंड लाइट रेड', nameEn: 'Agrifound Light Red', duration: '110-120', yield: '300-350', seedRate: '10 kg/ha',
        features: { hi: 'अच्छी भंडारण क्षमता (5-6 माह)', en: 'Good storage (5-6 months)' },
        bestFor: { hi: 'भंडारण व निर्यात', en: 'Storage & export' } },
    ],
  },
  {
    cropHi: 'लहसुन', cropEn: 'Garlic', icon: '🧄', season: 'horticulture',
    varieties: [
      { nameHi: 'G-282 (यमुना सफेद-2)', nameEn: 'G-282 (Yamuna Safed-2)', duration: '150-160', yield: '150-175', seedRate: '500 kg/ha',
        features: { hi: 'बड़ी सफेद कलियाँ, MP में लोकप्रिय', en: 'Large white cloves, popular in MP' },
        bestFor: { hi: 'मंदसौर, नीमच, रतलाम', en: 'Mandsaur, Neemuch, Ratlam' } },
      { nameHi: 'G-323 (यमुना सफेद-3)', nameEn: 'G-323 (Yamuna Safed-3)', duration: '150-160', yield: '175-200', seedRate: '500 kg/ha',
        features: { hi: 'अधिक उपज, निर्यात गुणवत्ता', en: 'Higher yield, export quality' },
        bestFor: { hi: 'मालवा पठार', en: 'Malwa plateau' } },
    ],
  },
];

const SEASON_LABEL: Record<Exclude<Season, 'all'>, { hi: string; en: string; color: string }> = {
  kharif: { hi: 'खरीफ', en: 'Kharif', color: 'bg-success/15 text-success' },
  rabi: { hi: 'रबी', en: 'Rabi', color: 'bg-primary/15 text-primary' },
  horticulture: { hi: 'उद्यानिकी', en: 'Horticulture', color: 'bg-accent/15 text-accent' },
};

const VarietiesScreen: React.FC = () => {
  const { t, setCurrentScreen, language } = useApp();
  const [season, setSeason] = useState<Season>('all');
  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return DATA.filter(c => {
      if (season !== 'all' && c.season !== season) return false;
      if (query) {
        const q = query.toLowerCase();
        return c.cropHi.toLowerCase().includes(q) || c.cropEn.toLowerCase().includes(q)
          || c.varieties.some(v => v.nameHi.toLowerCase().includes(q) || v.nameEn.toLowerCase().includes(q));
      }
      return true;
    });
  }, [season, query]);

  const seasons: Season[] = ['all', 'kharif', 'rabi', 'horticulture'];
  const seasonLabel = (s: Season) => s === 'all'
    ? t('सभी', 'All')
    : t(SEASON_LABEL[s].hi, SEASON_LABEL[s].en);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
              <Sprout className="w-6 h-6" />
              {t('फसल किस्में (Varieties)', 'Crop Varieties')}
            </h1>
            <p className="text-xs text-primary-foreground/80">
              {t('MP के लिए अनुशंसित किस्में – उपज, अवधि व क्षेत्र अनुसार चुनें', 'MP-recommended varieties – choose by yield, duration & region')}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('फसल या किस्म खोजें...', 'Search crop or variety...')}
            className="pl-9 bg-primary-foreground/95 border-0"
          />
        </div>
      </header>

      <main className="flex-1 p-4 -mt-2">
        {/* Season chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
          {seasons.map(s => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                season === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'
              }`}
            >
              {seasonLabel(s)}
            </button>
          ))}
        </div>

        {/* Info banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 flex gap-2">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            {t(
              'सही किस्म चुनने से उपज 20-30% तक बढ़ सकती है। अपने जिले/क्षेत्र, सिंचाई व मिट्टी के अनुसार चयन करें।',
              'Choosing the right variety can boost yield by 20-30%. Pick as per your district, irrigation & soil.'
            )}
          </p>
        </div>

        {/* Crop list */}
        <div className="space-y-3">
          {filtered.map((crop, idx) => {
            const seasonInfo = SEASON_LABEL[crop.season];
            const isOpen = openIdx === idx;
            return (
              <div key={crop.cropEn} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center gap-3 text-left active:bg-muted/40"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                    {crop.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">
                      {language === 'hi' ? crop.cropHi : crop.cropEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {crop.varieties.length} {t('किस्में उपलब्ध', 'varieties available')}
                    </p>
                  </div>
                  <Badge className={`${seasonInfo.color} border-0`}>
                    {t(seasonInfo.hi, seasonInfo.en)}
                  </Badge>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 space-y-3 animate-fade-in-up">
                    {crop.varieties.map(v => (
                      <div key={v.nameEn} className="bg-muted/30 border border-border rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-foreground text-sm">
                            {language === 'hi' ? v.nameHi : v.nameEn}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <Stat icon={<Calendar className="w-3.5 h-3.5" />} label={t('अवधि', 'Duration')} value={`${v.duration} ${t('दिन', 'days')}`} />
                          <Stat icon={<TrendingUp className="w-3.5 h-3.5" />} label={t('उपज', 'Yield')} value={`${v.yield} q/ha`} />
                          <Stat icon={<Sprout className="w-3.5 h-3.5" />} label={t('बीज दर', 'Seed rate')} value={v.seedRate} />
                          {v.spacing && <Stat icon={<Droplets className="w-3.5 h-3.5" />} label={t('दूरी', 'Spacing')} value={v.spacing} />}
                        </div>

                        <div className="space-y-1.5">
                          <Row label={t('विशेषता', 'Features')} value={language === 'hi' ? v.features.hi : v.features.en} />
                          {v.resistance && (
                            <Row icon={<Shield className="w-3 h-3 text-success" />} label={t('रोग सहनशीलता', 'Resistance')} value={language === 'hi' ? v.resistance.hi : v.resistance.en} />
                          )}
                          <Row label={t('उपयुक्त क्षेत्र', 'Best for')} value={language === 'hi' ? v.bestFor.hi : v.bestFor.en} highlight />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {t('कोई किस्म नहीं मिली', 'No varieties found')}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-warning/10 border border-warning/30 rounded-xl p-3 text-xs text-warning">
          {t(
            '⚠️ डेटा संदर्भ हेतु है। बुवाई से पहले निकटतम KVK / कृषि विज्ञान केंद्र से प्रमाणित बीज व पुष्टि अवश्य लें।',
            '⚠️ Data is for reference. Always verify and procure certified seed from your nearest KVK before sowing.'
          )}
        </div>

        <Button variant="outline" className="w-full mt-4" onClick={() => setCurrentScreen('home')}>
          {t('होम पर वापस', 'Back to Home')}
        </Button>
      </main>
    </div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-card rounded-lg px-2 py-1.5 border border-border">
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">{icon}{label}</div>
    <p className="text-xs font-semibold text-foreground">{value}</p>
  </div>
);

const Row: React.FC<{ label: string; value: string; icon?: React.ReactNode; highlight?: boolean }> = ({ label, value, icon, highlight }) => (
  <div className="text-xs">
    <span className="text-muted-foreground inline-flex items-center gap-1">{icon}{label}: </span>
    <span className={highlight ? 'text-primary font-medium' : 'text-foreground'}>{value}</span>
  </div>
);

export default VarietiesScreen;
