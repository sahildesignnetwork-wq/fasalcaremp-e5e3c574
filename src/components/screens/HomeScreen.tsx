import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, BookOpen, Settings, Info, Home, Newspaper, LogIn, LogOut, Shield, Calendar, ExternalLink, CloudSun, Store, Calculator, ShoppingCart, Landmark, Sprout, TrendingUp, Banknote } from 'lucide-react';
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
      <header className="relative bg-gradient-primary px-4 pt-6 pb-12 rounded-b-[2rem] shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" />
        <div className="relative flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden bg-primary-foreground/15 ring-1 ring-primary-foreground/30 backdrop-blur-sm">
              <img src={ieheLogo} alt="IEHE Bhopal Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground leading-none">Fasal Care</h1>
              <p className="text-[10px] text-primary-foreground/75 mt-0.5">Dept. of Agriculture · IEHE Bhopal</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {user ? (
              <button onClick={handleLogout} aria-label="Logout" className="w-9 h-9 bg-primary-foreground/15 hover:bg-primary-foreground/25 rounded-full flex items-center justify-center transition-colors">
                <LogOut className="w-4 h-4 text-primary-foreground" />
              </button>
            ) : (
              <button onClick={() => setCurrentScreen('login')} aria-label="Login" className="w-9 h-9 bg-primary-foreground/15 hover:bg-primary-foreground/25 rounded-full flex items-center justify-center transition-colors">
                <LogIn className="w-4 h-4 text-primary-foreground" />
              </button>
            )}
            <button aria-label="Settings" className="w-9 h-9 bg-primary-foreground/15 hover:bg-primary-foreground/25 rounded-full flex items-center justify-center transition-colors">
              <Settings className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        <div className="relative mt-2">
          <p className="text-primary-foreground/90 text-[13px] font-hindi">
            {t('नमस्ते किसान भाई 🙏', 'Namaste, farmer 🙏')}
          </p>
          <h2 className="text-xl font-bold text-primary-foreground mt-1 leading-snug">
            {t('आज क्या करना है?', 'What would you like to do today?')}
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 -mt-6 pb-4">
        {/* Hero CTA — Scan Disease (bento featured) */}
        <button
          onClick={() => setCurrentScreen('cropSelect')}
          className="relative w-full overflow-hidden rounded-3xl bg-gradient-primary p-5 text-left shadow-lg shadow-primary/20 mb-3 animate-fade-in-up active:scale-[0.98] transition-transform"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-primary-foreground/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm shrink-0">
              <Camera className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-foreground/80">AI Scan</span>
                <span className="w-1 h-1 rounded-full bg-primary-foreground/60" />
                <span className="text-[10px] text-primary-foreground/80">Gemini</span>
              </div>
              <p className="font-bold text-lg text-primary-foreground mt-0.5 font-hindi">{t('रोग पहचानें', 'Detect Disease')}</p>
              <p className="text-xs text-primary-foreground/80 font-hindi">{t('पत्ते की फोटो खींचें — तुरंत इलाज पाएँ', 'Snap a leaf — get treatment instantly')}</p>
            </div>
          </div>
        </button>

        {/* Bento row 1: Crop Guide (wide) + Weather (tall on right) */}
        <div className="grid grid-cols-3 gap-3 mb-3 animate-fade-in-up delay-100">
          <button
            onClick={() => setCurrentScreen('pop')}
            className="col-span-2 row-span-2 rounded-3xl bg-gradient-to-br from-accent/15 via-accent/10 to-card border border-accent/25 p-4 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between min-h-[140px]"
          >
            <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-bold text-base text-foreground font-hindi leading-tight">{t('फसल मार्गदर्शिका', 'Crop Guide')}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-hindi">{t('बुवाई से कटाई तक — सब कुछ', 'From sowing to harvest')}</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentScreen('weather')}
            className="rounded-3xl bg-gradient-to-br from-primary/12 to-primary/5 border border-primary/15 p-3 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
          >
            <CloudSun className="w-7 h-7 text-primary" />
            <div>
              <p className="font-bold text-sm text-foreground font-hindi leading-tight">{t('मौसम', 'Weather')}</p>
              <p className="text-[10px] text-muted-foreground">{t('7 दिन', '7-day')}</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentScreen('mandi')}
            className="rounded-3xl bg-gradient-to-br from-accent/12 to-accent/5 border border-accent/15 p-3 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
          >
            <Store className="w-7 h-7 text-accent" />
            <div>
              <p className="font-bold text-sm text-foreground font-hindi leading-tight">{t('मंडी भाव', 'Mandi')}</p>
              <p className="text-[10px] text-muted-foreground">{t('आज के भाव', 'Live prices')}</p>
            </div>
          </button>
        </div>

        {/* Bento row 2: Profit (big highlight) + Finance */}
        <div className="grid grid-cols-2 gap-3 mb-3 animate-fade-in-up delay-100">
          <button
            onClick={() => setCurrentScreen('profitBooster')}
            className="rounded-3xl bg-gradient-to-br from-success/15 to-primary/10 border border-success/25 p-4 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col gap-3 min-h-[120px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <span className="text-[9px] font-bold bg-success/20 text-success px-1.5 py-0.5 rounded-full">HOT</span>
            </div>
            <div>
              <p className="font-bold text-sm text-foreground font-hindi leading-tight">{t('मुनाफा बूस्टर', 'Profit Booster')}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-hindi line-clamp-2">{t('क्षेत्रफल अनुसार लाभ', 'Area-based earnings')}</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentScreen('finance')}
            className="rounded-3xl bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/25 p-4 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col gap-3 min-h-[120px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-accent" />
              </div>
              <span className="text-[9px] font-bold bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full">NEW</span>
            </div>
            <div>
              <p className="font-bold text-sm text-foreground font-hindi leading-tight">{t('फाइनेंस व KCC', 'Finance & KCC')}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-hindi line-clamp-2">{t('लोन व EMI कैलकुलेटर', 'Loans & EMI calculator')}</p>
            </div>
          </button>
        </div>

        {/* Bento row 3: Calculator + Shop + Schemes + Varieties (compact 2x2 grid) */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-in-up delay-100">
          <MiniTile onClick={() => setCurrentScreen('calculator')} icon={<Calculator className="w-5 h-5 text-success" />} bg="bg-success/15" title={t('कैलकुलेटर', 'Calculator')} subtitle={t('खाद/दवा', 'Dose')} />
          <MiniTile onClick={() => setCurrentScreen('shop')} icon={<ShoppingCart className="w-5 h-5 text-primary" />} bg="bg-primary/10" title={t('कृषि बाज़ार', 'Agri Bazaar')} subtitle={t('दाम तुलना', 'Compare')} />
          <MiniTile onClick={() => setCurrentScreen('schemes')} icon={<Landmark className="w-5 h-5 text-accent" />} bg="bg-accent/15" title={t('योजनाएँ', 'Schemes')} subtitle={t('सब्सिडी', 'Subsidies')} />
          <MiniTile onClick={() => setCurrentScreen('varieties')} icon={<Sprout className="w-5 h-5 text-success" />} bg="bg-success/15" title={t('किस्में', 'Varieties')} subtitle={t('चुनें', 'Choose')} />
        </div>

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-6 animate-fade-in-up delay-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground flex items-center gap-2 font-hindi">
                <Newspaper className="w-5 h-5 text-primary" />
                {t('ताज़ा कृषि समाचार', 'Latest Agri News')}
              </h3>
              <button onClick={() => setCurrentScreen('news')} className="text-xs text-primary font-semibold flex items-center gap-0.5">
                {t('सभी', 'All')} <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {featuredNews.map(item => (
                <button key={item.id} onClick={() => setCurrentScreen('news')} className="w-full text-left bg-card rounded-2xl p-2.5 border border-border shadow-sm hover:shadow-md transition-all flex gap-3 items-start active:scale-[0.99]">
                  {item.image_url && <img src={item.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0 py-0.5">
                    <h4 className="text-sm font-semibold text-foreground line-clamp-2 font-hindi leading-snug">{language === 'hi' ? (item.title_hi || item.title) : item.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      {item.category && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-hindi">{language === 'hi' ? (CATEGORY_HI[item.category] || item.category) : item.category}</Badge>}
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
        <div className="space-y-3 animate-fade-in-up delay-200">
          {/* How It Works */}
          <div className="rounded-2xl bg-gradient-surface p-4 border border-border">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 font-hindi">
              <Info className="w-4 h-4 text-primary" />
              {t('यह कैसे काम करता है?', 'How It Works')}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Step number={1} text={t('फसल चुनें', 'Select crop')} />
              <Step number={2} text={t('फोटो खींचें', 'Capture leaf')} />
              <Step number={3} text={t('AI पहचान', 'AI detects')} />
              <Step number={4} text={t('उपचार पाएँ', 'Get advice')} />
            </div>
          </div>

          {/* Sliding Disclaimer */}
          <div className="bg-warning/10 rounded-2xl px-3 py-2 border border-warning/30 overflow-hidden">
            <p className="text-xs text-warning animate-marquee whitespace-nowrap font-hindi">
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
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs shrink-0">
      {number}
    </div>
    <p className="text-xs text-foreground font-hindi leading-tight">{text}</p>
  </div>
);

const MiniTile: React.FC<{ onClick: () => void; icon: React.ReactNode; bg: string; title: string; subtitle: string }> = ({ onClick, icon, bg, title, subtitle }) => (
  <button
    onClick={onClick}
    className="rounded-2xl bg-card border border-border p-3 text-left shadow-sm hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.97] flex items-center gap-2.5"
  >
    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-sm text-foreground font-hindi leading-tight truncate">{title}</p>
      <p className="text-[10px] text-muted-foreground font-hindi truncate">{subtitle}</p>
    </div>
  </button>
);

export default HomeScreen;
