import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, BookOpen, Settings, Info, Home, Newspaper, LogIn, LogOut, Shield, Calendar, ExternalLink, CloudSun, Store, Calculator, ShoppingCart, Landmark, Sprout } from 'lucide-react';
import ieheLogo from '@/assets/iehe-logo.jpg';
import { AgriNews } from '@/types';

const CATEGORY_HI: Record<string, string> = {
  'Government Scheme': 'सरकारी योजना',
  'Market Price': 'बाजार भाव',
  'Weather': 'मौसम',
  'Technology': 'तकनीक',
  'Organic Farming': 'जैविक खेती',
  'Pest Alert': 'कीट चेतावनी',
};

const HomeScreen: React.FC = () => {
  const { t, setCurrentScreen, language } = useApp();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [featuredNews, setFeaturedNews] = useState<AgriNews[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
      else setIsAdmin(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
    });
    fetchFeaturedNews();
    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin');
    setIsAdmin(!!(data && data.length > 0));
  };

  const fetchFeaturedNews = async () => {
    const { data } = await supabase.from('agri_news').select('*').order('published_at', { ascending: false }).limit(3);
    if (data) setFeaturedNews(data as AgriNews[]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-primary p-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary-foreground/30 ring-2 ring-primary-foreground/10">
              <img src={ieheLogo} alt="IEHE Bhopal Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">Fasal Care</h1>
              <p className="text-xs text-primary-foreground/80">Department of Agriculture, IEHE Bhopal</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {user ? (
              <button onClick={handleLogout} className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-primary-foreground" />
              </button>
            ) : (
              <button onClick={() => setCurrentScreen('login')} className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <LogIn className="w-5 h-5 text-primary-foreground" />
              </button>
            )}
            <button className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>
        
        <p className="text-primary-foreground/90 text-center">
          {t('AI-संचालित फसल रोग पहचान', 'AI-Powered Crop Disease Detection')}
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 -mt-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Scan Disease */}
          <Button
            variant="default"
            className="h-auto py-8 flex-col gap-3 shadow-lg animate-fade-in-up"
            onClick={() => setCurrentScreen('cropSelect')}
          >
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
              <Camera className="w-9 h-9 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{t('रोग पहचानें', 'Detect Disease')}</p>
              <p className="text-xs opacity-80">{t('फोटो खींचें', 'Take Photo')}</p>
            </div>
          </Button>

          {/* Package of Practices */}
          <Button
            variant="accent"
            className="h-auto py-8 flex-col gap-3 shadow-lg animate-fade-in-up delay-100"
            onClick={() => setCurrentScreen('pop')}
          >
            <div className="w-16 h-16 bg-accent-foreground/20 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-9 h-9 text-accent-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">{t('फसल मार्गदर्शिका', 'Crop Guide')}</p>
              <p className="text-xs opacity-80">{t('खेती के तरीके', 'Farming Practices')}</p>
            </div>
          </Button>
        </div>

        {/* Weather + Mandi quick row */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in-up delay-100">
          <button
            onClick={() => setCurrentScreen('weather')}
            className="bg-card rounded-2xl p-4 shadow-md border border-border flex items-center gap-3 text-left active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <CloudSun className="w-7 h-7 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground">{t('मौसम', 'Weather')}</p>
              <p className="text-[11px] text-muted-foreground">{t('7-दिन पूर्वानुमान', '7-day forecast')}</p>
            </div>
          </button>
          <button
            onClick={() => setCurrentScreen('mandi')}
            className="bg-card rounded-2xl p-4 shadow-md border border-border flex items-center gap-3 text-left active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store className="w-7 h-7 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground">{t('मंडी भाव', 'Mandi Prices')}</p>
              <p className="text-[11px] text-muted-foreground">{t('आज के ताज़ा भाव', 'Latest prices today')}</p>
            </div>
          </button>
        </div>

        {/* Calculator + Shop row */}
        <div className="grid grid-cols-1 gap-3 mb-6 animate-fade-in-up delay-100">
          <button
            onClick={() => setCurrentScreen('calculator')}
            className="w-full bg-card rounded-2xl p-4 shadow-md border border-border flex items-center gap-3 text-left active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-success/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calculator className="w-7 h-7 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{t('खाद/दवा कैलकुलेटर', 'Fertilizer/Spray Calculator')}</p>
              <p className="text-[11px] text-muted-foreground">{t('अपने खेत के हिसाब से सही मात्रा निकालें', 'Get exact dose for your land')}</p>
            </div>
          </button>
          <button
            onClick={() => setCurrentScreen('shop')}
            className="w-full bg-card rounded-2xl p-4 shadow-md border border-border flex items-center gap-3 text-left active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{t('कृषि बाज़ार – दाम तुलना', 'Agri Bazaar – Price Compare')}</p>
              <p className="text-[11px] text-muted-foreground">{t('दवा/खाद का सबसे अच्छा भाव खोजें', 'Best price across local & online stores')}</p>
            </div>
          </button>
          <button
            onClick={() => setCurrentScreen('schemes')}
            className="w-full bg-card rounded-2xl p-4 shadow-md border border-border flex items-center gap-3 text-left active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-accent/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <Landmark className="w-7 h-7 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{t('सरकारी योजनाएँ व संपर्क', 'Govt. Schemes & Contacts')}</p>
              <p className="text-[11px] text-muted-foreground">{t('सब्सिडी, अनुदान व अधिकारी हेल्पलाइन', 'Subsidies, grants & official helplines')}</p>
            </div>
          </button>
          <button
            onClick={() => setCurrentScreen('varieties')}
            className="w-full bg-card rounded-2xl p-4 shadow-md border border-border flex items-center gap-3 text-left active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-success/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sprout className="w-7 h-7 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{t('फसल किस्में', 'Crop Varieties')}</p>
              <p className="text-[11px] text-muted-foreground">{t('कौन सी किस्म उगाएँ – उपज, अवधि व क्षेत्र', 'Which variety to grow – yield, duration & region')}</p>
            </div>
          </button>
        </div>

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-6 animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                {t('ताज़ा कृषि समाचार', 'Latest Agri News')}
              </h3>
              <button onClick={() => setCurrentScreen('news')} className="text-xs text-primary font-medium">
                {t('सभी देखें', 'View All')} →
              </button>
            </div>
            <div className="space-y-3">
              {featuredNews.map(item => (
                <button key={item.id} onClick={() => setCurrentScreen('news')} className="w-full text-left bg-card rounded-xl p-3 border border-border shadow-sm flex gap-3 items-start">
                  {item.image_url && <img src={item.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2">{language === 'hi' ? (item.title_hi || item.title) : item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {item.category && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{language === 'hi' ? (CATEGORY_HI[item.category] || item.category) : item.category}</Badge>}
                      {item.published_at && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(item.published_at).toLocaleDateString('hi-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="space-y-4 animate-fade-in-up delay-200">
          {/* How It Works */}
          <div className="bg-card rounded-2xl p-4 shadow-md border border-border">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              {t('यह कैसे काम करता है?', 'How It Works?')}
            </h3>
            <div className="space-y-3">
              <Step number={1} text={t('फसल का चयन करें', 'Select your crop')} />
              <Step number={2} text={t('पत्ते की फोटो खींचें', 'Capture leaf photo')} />
              <Step number={3} text={t('AI से रोग पहचान', 'AI detects disease')} />
              <Step number={4} text={t('उपचार सलाह प्राप्त करें', 'Get treatment advice')} />
            </div>
          </div>

          {/* Sliding Disclaimer */}
          <div className="bg-warning/10 rounded-2xl p-3 border border-warning/30 overflow-hidden">
            <p className="text-sm text-warning animate-marquee whitespace-nowrap">
              {t(
                '⚠️ अस्वीकरण: यह ऐप केवल सलाह हेतु है। कृपया अंतिम निर्णय के लिए कृषि विशेषज्ञ से परामर्श करें। ⚠️',
                '⚠️ Disclaimer: This app is for advisory purposes only. Please consult agricultural experts for final decisions. ⚠️'
              )}
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border p-2 pb-4">
        <div className="flex justify-around">
          <Button variant="navActive" size="sm" className="flex-1 max-w-[80px]">
            <Home className="w-5 h-5" />
            <span className="text-xs">{t('होम', 'Home')}</span>
          </Button>
          <Button 
            variant="nav" 
            size="sm" 
            className="flex-1 max-w-[80px]"
            onClick={() => setCurrentScreen('cropSelect')}
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs">{t('स्कैन', 'Scan')}</span>
          </Button>
          <Button 
            variant="nav" 
            size="sm" 
            className="flex-1 max-w-[80px]"
            onClick={() => setCurrentScreen('news')}
          >
            <Newspaper className="w-5 h-5" />
            <span className="text-xs">{t('समाचार', 'News')}</span>
          </Button>
          <Button 
            variant="nav" 
            size="sm" 
            className="flex-1 max-w-[80px]"
            onClick={() => setCurrentScreen('pop')}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">{t('गाइड', 'Guide')}</span>
          </Button>
          {isAdmin && (
            <Button 
              variant="nav" 
              size="sm" 
              className="flex-1 max-w-[80px]"
              onClick={() => setCurrentScreen('adminNews')}
            >
              <Shield className="w-5 h-5" />
              <span className="text-xs">Admin</span>
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
};

const Step: React.FC<{ number: number; text: string }> = ({ number, text }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
      {number}
    </div>
    <p className="text-sm text-foreground">{text}</p>
  </div>
);

export default HomeScreen;
