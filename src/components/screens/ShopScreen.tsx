import React, { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ExternalLink, Search, Store, MapPin, ShoppingCart, TrendingDown, Sparkles } from 'lucide-react';

type Category = 'all' | 'insecticide' | 'fungicide' | 'weedicide' | 'fertilizer';

interface VendorOffer {
  vendor: string;
  type: 'online' | 'local';
  price: number; // INR
  unit: string;
  url: string;
  location?: string;
  delivery?: string;
}

interface Product {
  id: string;
  nameHi: string;
  nameEn: string;
  category: Exclude<Category, 'all'>;
  ingredient: string;
  pack: string;
  usedFor: { hi: string; en: string };
  image: string;
  offers: VendorOffer[];
}

// Curated MP-relevant agri inputs with real online retailer search links.
// Prices are indicative MRP/typical retail (₹) – marked as estimates in UI.
const PRODUCTS: Product[] = [
  {
    id: 'imida-17.8',
    nameHi: 'इमिडाक्लोप्रिड 17.8% SL',
    nameEn: 'Imidacloprid 17.8% SL',
    category: 'insecticide',
    ingredient: 'Imidacloprid 17.8% SL',
    pack: '100 ml',
    usedFor: { hi: 'सोयाबीन/कपास – रस चूसक कीट', en: 'Soybean/Cotton – sucking pests' },
    image: '🧪',
    offers: [
      { vendor: 'BigHaat', type: 'online', price: 245, unit: '100 ml', url: 'https://www.bighaat.com/search?q=imidacloprid+17.8', delivery: '3-5 दिन' },
      { vendor: 'AgroStar', type: 'online', price: 259, unit: '100 ml', url: 'https://www.agrostar.in/search?q=imidacloprid', delivery: '2-4 दिन' },
      { vendor: 'DeHaat', type: 'online', price: 239, unit: '100 ml', url: 'https://agri-app.dehaat.com/search?q=imidacloprid', delivery: '2-3 दिन' },
      { vendor: 'IFFCO Bazar', type: 'online', price: 255, unit: '100 ml', url: 'https://www.iffcobazar.in/en/search?keyword=imidacloprid', delivery: '4-6 दिन' },
      { vendor: 'Local Krishi Seva Kendra', type: 'local', price: 230, unit: '100 ml', url: 'https://www.google.com/maps/search/krishi+seva+kendra+near+me', location: 'नज़दीकी दुकान', delivery: 'तुरंत' },
    ],
  },
  {
    id: 'chlorpyriphos-20',
    nameHi: 'क्लोरपायरीफॉस 20% EC',
    nameEn: 'Chlorpyriphos 20% EC',
    category: 'insecticide',
    ingredient: 'Chlorpyriphos 20% EC',
    pack: '1 लीटर',
    usedFor: { hi: 'दीमक, तना छेदक', en: 'Termites, stem borer' },
    image: '🐛',
    offers: [
      { vendor: 'BigHaat', type: 'online', price: 540, unit: '1 L', url: 'https://www.bighaat.com/search?q=chlorpyriphos+20', delivery: '3-5 दिन' },
      { vendor: 'AgroStar', type: 'online', price: 560, unit: '1 L', url: 'https://www.agrostar.in/search?q=chlorpyriphos', delivery: '2-4 दिन' },
      { vendor: 'DeHaat', type: 'online', price: 525, unit: '1 L', url: 'https://agri-app.dehaat.com/search?q=chlorpyriphos', delivery: '2-3 दिन' },
      { vendor: 'Local Krishi Seva Kendra', type: 'local', price: 510, unit: '1 L', url: 'https://www.google.com/maps/search/krishi+seva+kendra+near+me', location: 'नज़दीकी दुकान', delivery: 'तुरंत' },
    ],
  },
  {
    id: 'mancozeb-75',
    nameHi: 'मैनकोज़ेब 75% WP',
    nameEn: 'Mancozeb 75% WP',
    category: 'fungicide',
    ingredient: 'Mancozeb 75% WP',
    pack: '1 किग्रा',
    usedFor: { hi: 'सोयाबीन रस्ट, झुलसा रोग', en: 'Soybean rust, blight diseases' },
    image: '🍄',
    offers: [
      { vendor: 'BigHaat', type: 'online', price: 420, unit: '1 kg', url: 'https://www.bighaat.com/search?q=mancozeb+75', delivery: '3-5 दिन' },
      { vendor: 'AgroStar', type: 'online', price: 445, unit: '1 kg', url: 'https://www.agrostar.in/search?q=mancozeb', delivery: '2-4 दिन' },
      { vendor: 'IFFCO Bazar', type: 'online', price: 410, unit: '1 kg', url: 'https://www.iffcobazar.in/en/search?keyword=mancozeb', delivery: '4-6 दिन' },
      { vendor: 'DeHaat', type: 'online', price: 415, unit: '1 kg', url: 'https://agri-app.dehaat.com/search?q=mancozeb', delivery: '2-3 दिन' },
      { vendor: 'Local Krishi Seva Kendra', type: 'local', price: 395, unit: '1 kg', url: 'https://www.google.com/maps/search/krishi+seva+kendra+near+me', location: 'नज़दीकी दुकान', delivery: 'तुरंत' },
    ],
  },
  {
    id: 'propiconazole-25',
    nameHi: 'प्रोपिकोनाज़ोल 25% EC',
    nameEn: 'Propiconazole 25% EC',
    category: 'fungicide',
    ingredient: 'Propiconazole 25% EC',
    pack: '500 ml',
    usedFor: { hi: 'गेहूं/सोयाबीन रस्ट', en: 'Wheat/Soybean rust' },
    image: '🌾',
    offers: [
      { vendor: 'BigHaat', type: 'online', price: 720, unit: '500 ml', url: 'https://www.bighaat.com/search?q=propiconazole', delivery: '3-5 दिन' },
      { vendor: 'AgroStar', type: 'online', price: 745, unit: '500 ml', url: 'https://www.agrostar.in/search?q=propiconazole', delivery: '2-4 दिन' },
      { vendor: 'DeHaat', type: 'online', price: 699, unit: '500 ml', url: 'https://agri-app.dehaat.com/search?q=propiconazole', delivery: '2-3 दिन' },
      { vendor: 'Local Krishi Seva Kendra', type: 'local', price: 685, unit: '500 ml', url: 'https://www.google.com/maps/search/krishi+seva+kendra+near+me', location: 'नज़दीकी दुकान', delivery: 'तुरंत' },
    ],
  },
  {
    id: 'glyphosate-41',
    nameHi: 'ग्लाइफोसेट 41% SL',
    nameEn: 'Glyphosate 41% SL',
    category: 'weedicide',
    ingredient: 'Glyphosate 41% SL',
    pack: '1 लीटर',
    usedFor: { hi: 'खाली खेत में खरपतवार नियंत्रण', en: 'Non-crop weed control' },
    image: '🌿',
    offers: [
      { vendor: 'BigHaat', type: 'online', price: 410, unit: '1 L', url: 'https://www.bighaat.com/search?q=glyphosate', delivery: '3-5 दिन' },
      { vendor: 'AgroStar', type: 'online', price: 430, unit: '1 L', url: 'https://www.agrostar.in/search?q=glyphosate', delivery: '2-4 दिन' },
      { vendor: 'DeHaat', type: 'online', price: 399, unit: '1 L', url: 'https://agri-app.dehaat.com/search?q=glyphosate', delivery: '2-3 दिन' },
      { vendor: 'IFFCO Bazar', type: 'online', price: 415, unit: '1 L', url: 'https://www.iffcobazar.in/en/search?keyword=glyphosate', delivery: '4-6 दिन' },
      { vendor: 'Local Krishi Seva Kendra', type: 'local', price: 385, unit: '1 L', url: 'https://www.google.com/maps/search/krishi+seva+kendra+near+me', location: 'नज़दीकी दुकान', delivery: 'तुरंत' },
    ],
  },
  {
    id: 'pendimethalin-30',
    nameHi: 'पेंडीमिथालिन 30% EC',
    nameEn: 'Pendimethalin 30% EC',
    category: 'weedicide',
    ingredient: 'Pendimethalin 30% EC',
    pack: '1 लीटर',
    usedFor: { hi: 'सोयाबीन/गेहूं – चौड़ी पत्ती खरपतवार', en: 'Soybean/Wheat – broadleaf weeds' },
    image: '🌱',
    offers: [
      { vendor: 'BigHaat', type: 'online', price: 480, unit: '1 L', url: 'https://www.bighaat.com/search?q=pendimethalin', delivery: '3-5 दिन' },
      { vendor: 'AgroStar', type: 'online', price: 510, unit: '1 L', url: 'https://www.agrostar.in/search?q=pendimethalin', delivery: '2-4 दिन' },
      { vendor: 'DeHaat', type: 'online', price: 470, unit: '1 L', url: 'https://agri-app.dehaat.com/search?q=pendimethalin', delivery: '2-3 दिन' },
      { vendor: 'Local Krishi Seva Kendra', type: 'local', price: 455, unit: '1 L', url: 'https://www.google.com/maps/search/krishi+seva+kendra+near+me', location: 'नज़दीकी दुकान', delivery: 'तुरंत' },
    ],
  },
  {
    id: 'urea-45',
    nameHi: 'यूरिया (46% N)',
    nameEn: 'Urea (46% N)',
    category: 'fertilizer',
    ingredient: 'Urea 46% Nitrogen',
    pack: '45 किग्रा बैग',
    usedFor: { hi: 'सभी फसलें – नाइट्रोजन', en: 'All crops – Nitrogen' },
    image: '🧂',
    offers: [
      { vendor: 'IFFCO Bazar', type: 'online', price: 266, unit: '45 kg', url: 'https://www.iffcobazar.in/en/search?keyword=urea', delivery: '4-6 दिन' },
      { vendor: 'DeHaat', type: 'online', price: 270, unit: '45 kg', url: 'https://agri-app.dehaat.com/search?q=urea', delivery: '2-3 दिन' },
      { vendor: 'Local PACS / सोसायटी', type: 'local', price: 266, unit: '45 kg', url: 'https://www.google.com/maps/search/pacs+society+near+me', location: 'सहकारी समिति', delivery: 'तुरंत' },
    ],
  },
  {
    id: 'dap',
    nameHi: 'डीएपी (18-46-0)',
    nameEn: 'DAP (18-46-0)',
    category: 'fertilizer',
    ingredient: 'Di-Ammonium Phosphate',
    pack: '50 किग्रा बैग',
    usedFor: { hi: 'बुवाई के समय – फॉस्फोरस', en: 'At sowing – Phosphorus' },
    image: '🟤',
    offers: [
      { vendor: 'IFFCO Bazar', type: 'online', price: 1350, unit: '50 kg', url: 'https://www.iffcobazar.in/en/search?keyword=dap', delivery: '4-6 दिन' },
      { vendor: 'DeHaat', type: 'online', price: 1375, unit: '50 kg', url: 'https://agri-app.dehaat.com/search?q=dap', delivery: '2-3 दिन' },
      { vendor: 'AgroStar', type: 'online', price: 1390, unit: '50 kg', url: 'https://www.agrostar.in/search?q=dap', delivery: '2-4 दिन' },
      { vendor: 'Local PACS / सोसायटी', type: 'local', price: 1350, unit: '50 kg', url: 'https://www.google.com/maps/search/pacs+society+near+me', location: 'सहकारी समिति', delivery: 'तुरंत' },
    ],
  },
];

const CATEGORY_LABELS: Record<Category, { hi: string; en: string }> = {
  all: { hi: 'सभी', en: 'All' },
  insecticide: { hi: 'कीटनाशक', en: 'Insecticide' },
  fungicide: { hi: 'फफूंदनाशक', en: 'Fungicide' },
  weedicide: { hi: 'खरपतवारनाशी', en: 'Weedicide' },
  fertilizer: { hi: 'उर्वरक', en: 'Fertilizer' },
};

const ShopScreen: React.FC = () => {
  const { t, setCurrentScreen, language } = useApp();
  const [category, setCategory] = useState<Category>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (category !== 'all' && p.category !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          p.nameEn.toLowerCase().includes(q) ||
          p.nameHi.includes(query) ||
          p.ingredient.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [category, query]);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-8">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {t('कृषि बाज़ार', 'Agri Bazaar')}
            </h1>
            <p className="text-xs text-primary-foreground/80">
              {t('दवा/खाद का सबसे अच्छा भाव खोजें', 'Find the best price for inputs')}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('दवा का नाम खोजें...', 'Search by name...')}
            className="pl-9 bg-background"
          />
        </div>
      </header>

      <main className="flex-1 p-4 -mt-2">
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                category === c
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border'
              }`}
            >
              {language === 'hi' ? CATEGORY_LABELS[c].hi : CATEGORY_LABELS[c].en}
            </button>
          ))}
        </div>

        {/* Info banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 flex gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-foreground/80 leading-relaxed">
            {t(
              'भाव का तुलना करें – स्थानीय दुकान और ऑनलाइन विकल्प से। दाम बदल सकते हैं, खरीदने से पहले वेबसाइट पर देखें।',
              'Compare prices across local shops and online stores. Prices may vary – please verify on the seller site before buying.'
            )}
          </p>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t('कोई उत्पाद नहीं मिला', 'No products found')}
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((p) => {
            const sorted = [...p.offers].sort((a, b) => a.price - b.price);
            const best = sorted[0];
            return (
              <div key={p.id} className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
                {/* Product head */}
                <div className="p-4 flex gap-3 items-start border-b border-border">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0">
                    {p.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-base leading-tight">
                      {language === 'hi' ? p.nameHi : p.nameEn}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{p.ingredient} • {p.pack}</p>
                    <p className="text-xs text-foreground/70 mt-1">
                      {language === 'hi' ? p.usedFor.hi : p.usedFor.en}
                    </p>
                  </div>
                </div>

                {/* Best price highlight */}
                <div className="bg-success/10 px-4 py-2 flex items-center gap-2 border-b border-border">
                  <TrendingDown className="w-4 h-4 text-success" />
                  <p className="text-xs text-success font-medium">
                    {t('सबसे सस्ता:', 'Best price:')} ₹{best.price} – {best.vendor}
                  </p>
                </div>

                {/* Offers */}
                <ul className="divide-y divide-border">
                  {sorted.map((o, idx) => (
                    <li key={idx} className="p-3 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        o.type === 'local' ? 'bg-accent/15 text-accent' : 'bg-primary/10 text-primary'
                      }`}>
                        {o.type === 'local' ? <MapPin className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium text-foreground truncate">{o.vendor}</p>
                          {idx === 0 && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-success/15 text-success border-success/30">
                              {t('बेस्ट', 'Best')}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            {o.type === 'local' ? t('स्थानीय', 'Local') : t('ऑनलाइन', 'Online')}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          ₹{o.price} / {o.unit}{o.delivery ? ` • ${o.delivery}` : ''}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={idx === 0 ? 'default' : 'outline'}
                        onClick={() => window.open(o.url, '_blank', 'noopener,noreferrer')}
                        className="flex-shrink-0 text-xs h-8"
                      >
                        {t('खरीदें', 'Buy')}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-warning/10 rounded-xl p-3 border border-warning/30">
          <p className="text-[11px] text-warning leading-relaxed">
            {t(
              '⚠️ दिखाए गए दाम अनुमानित हैं और बदल सकते हैं। खरीदने से पहले विक्रेता की वेबसाइट/दुकान पर अंतिम भाव ज़रूर देखें। कीटनाशक खरीदते समय लाइसेंस प्राप्त विक्रेता से ही खरीदें।',
              '⚠️ Prices shown are indicative and may change. Always verify the final price on the seller site/shop before purchase. Buy pesticides only from licensed dealers.'
            )}
          </p>
        </div>
      </main>
    </div>
  );
};

export default ShopScreen;
