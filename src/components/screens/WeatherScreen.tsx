import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, Thermometer, AlertTriangle, Loader2, Sprout } from 'lucide-react';
import { MP_DISTRICTS, nearestDistrict, type MPDistrict } from '@/lib/mpDistricts';

interface CurrentWx {
  temperature: number;
  apparent: number;
  humidity: number;
  wind: number;
  precipitation: number;
  weatherCode: number;
  isDay: number;
}

interface DailyWx {
  date: string;
  tMax: number;
  tMin: number;
  rain: number;
  rainProb: number;
  code: number;
}

const WMO_HI: Record<number, string> = {
  0: 'साफ आसमान', 1: 'मुख्यतः साफ', 2: 'आंशिक बादल', 3: 'बादल',
  45: 'कोहरा', 48: 'जमा कोहरा',
  51: 'हल्की बूंदाबांदी', 53: 'बूंदाबांदी', 55: 'घनी बूंदाबांदी',
  61: 'हल्की बारिश', 63: 'बारिश', 65: 'तेज़ बारिश',
  71: 'हल्की बर्फ', 73: 'बर्फबारी', 75: 'घनी बर्फबारी',
  80: 'हल्की फुहार', 81: 'फुहार', 82: 'तेज़ फुहार',
  95: 'गरज के साथ बारिश', 96: 'ओलावृष्टि', 99: 'भारी ओलावृष्टि',
};
const WMO_EN: Record<number, string> = {
  0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Cloudy',
  45: 'Fog', 48: 'Rime fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Light showers', 81: 'Showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunder + hail', 99: 'Severe thunder + hail',
};

const iconFor = (code: number) => {
  if (code === 0 || code === 1) return Sun;
  if (code === 2 || code === 3) return Cloud;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 51 && code <= 99) return CloudRain;
  return Cloud;
};

const WeatherScreen: React.FC = () => {
  const { t, setCurrentScreen, language } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [district, setDistrict] = useState<MPDistrict | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [current, setCurrent] = useState<CurrentWx | null>(null);
  const [daily, setDaily] = useState<DailyWx[]>([]);
  const [usingGps, setUsingGps] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      pickDefault();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = nearestDistrict(pos.coords.latitude, pos.coords.longitude);
        setUsingGps(true);
        loadWeather(pos.coords.latitude, pos.coords.longitude, d);
      },
      () => pickDefault(),
      { timeout: 8000, maximumAge: 600000 }
    );
  };

  const pickDefault = () => {
    const def = MP_DISTRICTS.find(d => d.id === 'bhopal')!;
    setUsingGps(false);
    loadWeather(def.lat, def.lon, def);
  };

  const loadWeather = async (lat: number, lon: number, d: MPDistrict) => {
    try {
      setLoading(true);
      setDistrict(d);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('weather fetch failed');
      const data = await res.json();
      setCurrent({
        temperature: data.current.temperature_2m,
        apparent: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        precipitation: data.current.precipitation,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day,
      });
      const days: DailyWx[] = data.daily.time.map((date: string, i: number) => ({
        date,
        tMax: data.daily.temperature_2m_max[i],
        tMin: data.daily.temperature_2m_min[i],
        rain: data.daily.precipitation_sum[i],
        rainProb: data.daily.precipitation_probability_max[i] ?? 0,
        code: data.daily.weather_code[i],
      }));
      setDaily(days);
      setError(null);
    } catch (e: any) {
      setError(t('मौसम डेटा प्राप्त नहीं हो सका', 'Could not load weather'));
    } finally {
      setLoading(false);
    }
  };

  const selectDistrict = (d: MPDistrict) => {
    setShowPicker(false);
    setUsingGps(false);
    loadWeather(d.lat, d.lon, d);
  };

  const advisory = (): { hi: string; en: string; tone: 'good' | 'warn' | 'bad' } | null => {
    if (!current || daily.length === 0) return null;
    const todayRainProb = daily[0].rainProb;
    const next3Rain = daily.slice(0, 3).reduce((s, d) => s + d.rain, 0);
    if (current.weatherCode >= 95) return {
      hi: 'गरज के साथ बारिश की चेतावनी — आज छिड़काव/कटाई न करें। उपज ढककर रखें।',
      en: 'Thunderstorm warning — avoid spraying/harvesting today. Cover stored produce.',
      tone: 'bad',
    };
    if (todayRainProb >= 60 || next3Rain > 15) return {
      hi: 'अगले 3 दिन बारिश की संभावना — कीटनाशक/उर्वरक छिड़काव टालें, बीज/उर्वरक बचाएं।',
      en: 'Rain likely next 3 days — postpone pesticide/fertilizer spraying, protect inputs.',
      tone: 'warn',
    };
    if (current.temperature > 38) return {
      hi: 'अत्यधिक गर्मी — सुबह/शाम सिंचाई करें, मल्चिंग का प्रयोग करें।',
      en: 'Heat stress — irrigate early morning/evening, use mulching.',
      tone: 'warn',
    };
    return {
      hi: 'मौसम छिड़काव और खेती-कार्य के लिए अनुकूल है।',
      en: 'Conditions are favourable for spraying and field operations.',
      tone: 'good',
    };
  };

  const adv = advisory();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">{t('मौसम', 'Weather')}</h1>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 bg-primary-foreground/15 px-3 py-2 rounded-full text-primary-foreground text-sm"
        >
          <MapPin className="w-4 h-4" />
          <span>{district ? (language === 'hi' ? district.nameHi : district.nameEn) : t('स्थान चुनें', 'Choose location')}</span>
          {usingGps && <span className="text-[10px] opacity-80">• GPS</span>}
        </button>
      </header>

      <main className="flex-1 p-4 -mt-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">{t('मौसम जानकारी लोड हो रही है...', 'Loading weather...')}</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 text-center">
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button onClick={requestLocation} size="sm">{t('फिर कोशिश करें', 'Retry')}</Button>
          </div>
        ) : current && (
          <>
            {/* Current */}
            <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-5xl font-bold text-foreground">{Math.round(current.temperature)}°C</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'hi' ? WMO_HI[current.weatherCode] : WMO_EN[current.weatherCode]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('महसूस होता है', 'Feels like')} {Math.round(current.apparent)}°C
                  </p>
                </div>
                {(() => {
                  const Icon = iconFor(current.weatherCode);
                  return <Icon className="w-20 h-20 text-primary" />;
                })()}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-border">
                <Stat icon={Droplets} label={t('नमी', 'Humidity')} value={`${current.humidity}%`} />
                <Stat icon={Wind} label={t('हवा', 'Wind')} value={`${Math.round(current.wind)} km/h`} />
                <Stat icon={CloudRain} label={t('वर्षा', 'Rain')} value={`${current.precipitation} mm`} />
              </div>
            </div>

            {/* Farmer Advisory */}
            {adv && (
              <div className={`rounded-2xl p-4 border ${
                adv.tone === 'bad' ? 'bg-destructive/10 border-destructive/30' :
                adv.tone === 'warn' ? 'bg-warning/10 border-warning/30' :
                'bg-success/10 border-success/30'
              }`}>
                <div className="flex items-start gap-3">
                  {adv.tone === 'good' ? <Sprout className="w-5 h-5 text-success flex-shrink-0 mt-0.5" /> :
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${adv.tone === 'bad' ? 'text-destructive' : 'text-warning'}`} />}
                  <div>
                    <p className="text-xs font-semibold mb-1 uppercase tracking-wide opacity-70">{t('किसान सलाह', 'Farmer Advisory')}</p>
                    <p className="text-sm text-foreground">{language === 'hi' ? adv.hi : adv.en}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 7-day forecast */}
            <div className="bg-card rounded-2xl p-4 shadow-md border border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-primary" />
                {t('7-दिन का पूर्वानुमान', '7-Day Forecast')}
              </h3>
              <div className="space-y-1">
                {daily.map((d, i) => {
                  const Icon = iconFor(d.code);
                  const dateObj = new Date(d.date);
                  const label = i === 0 ? t('आज', 'Today') :
                    dateObj.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                  return (
                    <div key={d.date} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className="w-6 h-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'hi' ? WMO_HI[d.code] : WMO_EN[d.code]}
                            {d.rainProb > 30 && ` • ${d.rainProb}% ${t('वर्षा', 'rain')}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{Math.round(d.tMax)}°</p>
                        <p className="text-xs text-muted-foreground">{Math.round(d.tMin)}°</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-center text-muted-foreground">
              {t('स्रोत: Open-Meteo • IMD-संगत डेटा', 'Source: Open-Meteo • IMD-aligned data')}
            </p>
          </>
        )}
      </main>

      {/* District picker */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowPicker(false)}>
          <div className="bg-card w-full max-h-[80vh] rounded-t-3xl p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-3 text-center">{t('अपना जिला चुनें', 'Choose your district')}</h3>
            <button
              onClick={() => { setShowPicker(false); requestLocation(); }}
              className="w-full mb-3 bg-primary/10 text-primary rounded-xl p-3 text-sm font-medium flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" /> {t('GPS से स्थान खोजें', 'Detect via GPS')}
            </button>
            <div className="grid grid-cols-2 gap-2">
              {MP_DISTRICTS.map(d => (
                <button
                  key={d.id}
                  onClick={() => selectDistrict(d)}
                  className={`rounded-xl p-3 text-sm border text-left ${district?.id === d.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground'}`}
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

const Stat: React.FC<{ icon: any; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="text-center">
    <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
    <p className="text-[10px] text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold text-foreground">{value}</p>
  </div>
);

export default WeatherScreen;
