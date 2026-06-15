import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, MapPin, Loader2, Search, RefreshCw, Store } from 'lucide-react';
import { MP_DISTRICTS } from '@/lib/mpDistricts';
import { supabase } from '@/integrations/supabase/client';

interface PriceRow {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
}

// Popular MP commodities for quick filter
const POPULAR_COMMODITIES = [
  { hi: 'सोयाबीन', en: 'Soyabean' },
  { hi: 'गेहूं', en: 'Wheat' },
  { hi: 'चना', en: 'Bengal Gram(Gram)(Whole)' },
  { hi: 'मक्का', en: 'Maize' },
  { hi: 'सरसों', en: 'Mustard' },
  { hi: 'प्याज', en: 'Onion' },
  { hi: 'आलू', en: 'Potato' },
  { hi: 'टमाटर', en: 'Tomato' },
  { hi: 'लहसुन', en: 'Garlic' },
  { hi: 'धान', en: 'Paddy(Dhan)(Common)' },
];

const MandiScreen: React.FC = () => {
  const { t, setCurrentScreen, language } = useApp();
  const [district, setDistrict] = useState<string>('');
  const [commodity, setCommodity] = useState<string>('');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDistricts, setShowDistricts] = useState(false);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = { limit: '100' };
      if (district) params.district = district;
      if (commodity) params.commodity = commodity;
      const qs = new URLSearchParams(params).toString();
      const { data, error: fnErr } = await supabase.functions.invoke(`mandi-prices?${qs}`, { method: 'GET' });
      if (fnErr) throw fnErr;
      setRows(data?.records || []);
    } catch (e: any) {
      setError(t('मंडी डेटा प्राप्त नहीं हो सका। बाद में पुनः प्रयास करें।', 'Could not load mandi data. Try again later.'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrices(); /* eslint-disable-next-line */ }, [district, commodity]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r =>
      r.commodity?.toLowerCase().includes(q) ||
      r.market?.toLowerCase().includes(q) ||
      r.district?.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">{t('मंडी भाव', 'Mandi Prices')}</h1>
            <p className="text-xs text-primary-foreground/80">{t('मध्य प्रदेश • AGMARKNET', 'Madhya Pradesh • AGMARKNET')}</p>
          </div>
          <button onClick={fetchPrices} className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <RefreshCw className={`w-5 h-5 text-primary-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowDistricts(true)}
            className="flex items-center gap-1 bg-primary-foreground/15 px-3 py-1.5 rounded-full text-primary-foreground text-xs"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{district || t('सभी जिले', 'All Districts')}</span>
          </button>
          {commodity && (
            <button
              onClick={() => setCommodity('')}
              className="bg-primary-foreground/15 px-3 py-1.5 rounded-full text-primary-foreground text-xs"
            >
              {commodity} ✕
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 -mt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('फसल, मंडी या जिला खोजें...', 'Search crop, mandi, district...')}
            className="pl-9"
          />
        </div>

        {/* Quick commodity chips */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 pb-1">
            {POPULAR_COMMODITIES.map(c => (
              <button
                key={c.en}
                onClick={() => setCommodity(commodity === c.en ? '' : c.en)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs border ${
                  commodity === c.en ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'
                }`}
              >
                {language === 'hi' ? c.hi : c.en}
              </button>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 text-xs text-foreground">
          💡 {t(
            'सही समय पर सही मंडी चुनकर बेहतर भाव पाएं। पास की मंडी में भाव कम हो तो अन्य मंडी देखें।',
            'Choose the right mandi at the right time for better rates. If nearby mandi is low, check other mandis.'
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">{t('भाव लोड हो रहे हैं...', 'Loading prices...')}</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 text-center">
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button onClick={fetchPrices} size="sm">{t('फिर कोशिश करें', 'Retry')}</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t('कोई भाव नहीं मिला। अलग जिला/फसल चुनें।', 'No prices found. Try a different district/crop.')}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{filtered.length} {t('रिकॉर्ड', 'records')}</p>
            {filtered.map((r, i) => <PriceCard key={i} row={r} language={language} t={t} />)}
            <p className="text-[10px] text-center text-muted-foreground pt-2">
              {t('स्रोत: data.gov.in (AGMARKNET) • भाव ₹/क्विंटल में', 'Source: data.gov.in (AGMARKNET) • Prices in ₹/quintal')}
            </p>
          </div>
        )}
      </main>

      {/* District sheet */}
      {showDistricts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowDistricts(false)}>
          <div className="bg-card w-full max-h-[80vh] rounded-t-3xl p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-3 text-center">{t('जिला चुनें', 'Choose district')}</h3>
            <button
              onClick={() => { setDistrict(''); setShowDistricts(false); }}
              className={`w-full mb-2 rounded-xl p-3 text-sm border ${!district ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border'}`}
            >
              {t('सभी जिले', 'All Districts')}
            </button>
            <div className="grid grid-cols-2 gap-2">
              {MP_DISTRICTS.map(d => (
                <button
                  key={d.id}
                  onClick={() => { setDistrict(d.nameEn); setShowDistricts(false); }}
                  className={`rounded-xl p-3 text-sm border text-left ${district === d.nameEn ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground'}`}
                >
                  {language === 'hi' ? d.nameHi : d.nameEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PriceCard: React.FC<{ row: PriceRow; language: string; t: (hi: string, en: string) => string }> = ({ row, language, t }) => {
  const spread = row.max_price - row.min_price;
  const trendIcon = spread > 200 ? TrendingUp : spread < 50 ? Minus : TrendingDown;
  const Trend = trendIcon;
  return (
    <div className="bg-card rounded-xl p-3 border border-border shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{row.commodity}</p>
          {row.variety && row.variety !== 'Other' && (
            <p className="text-[11px] text-muted-foreground truncate">{row.variety}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <Store className="w-3 h-3" />
            <span className="truncate">{row.market}, {row.district}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center justify-end gap-1">
            <Trend className="w-3.5 h-3.5 text-primary" />
            <p className="text-lg font-bold text-primary">₹{row.modal_price.toLocaleString('en-IN')}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            ₹{row.min_price.toLocaleString('en-IN')} – ₹{row.max_price.toLocaleString('en-IN')}
          </p>
          {row.arrival_date && <p className="text-[10px] text-muted-foreground mt-0.5">{row.arrival_date}</p>}
        </div>
      </div>
    </div>
  );
};

export default MandiScreen;
