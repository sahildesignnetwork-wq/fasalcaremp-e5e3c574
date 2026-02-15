import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { t, setCurrentScreen } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMessage(t('पुष्टि ईमेल भेजा गया। कृपया अपना ईमेल जाँचें।', 'Confirmation email sent. Please check your email.'));
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setCurrentScreen('home');
      }
    } catch (err: any) {
      setError(err.message || t('कुछ गलत हो गया', 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="iconSm" onClick={() => setCurrentScreen('home')} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-primary-foreground">
            {isSignup ? t('खाता बनाएं', 'Sign Up') : t('लॉगिन', 'Login')}
          </h1>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t('नाम', 'Name')}</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('अपना नाम दर्ज करें', 'Enter your name')} required />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('ईमेल', 'Email')}</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('ईमेल दर्ज करें', 'Enter email')} required />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('पासवर्ड', 'Password')}</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('पासवर्ड दर्ज करें', 'Enter password')} required minLength={6} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-primary">{message}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : isSignup ? <><UserPlus className="w-4 h-4" /> {t('खाता बनाएं', 'Sign Up')}</> : <><LogIn className="w-4 h-4" /> {t('लॉगिन', 'Login')}</>}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? t('पहले से खाता है?', 'Already have an account?') : t('खाता नहीं है?', "Don't have an account?")}
            <button type="button" onClick={() => { setIsSignup(!isSignup); setError(''); setMessage(''); }} className="text-primary ml-1 font-medium">
              {isSignup ? t('लॉगिन', 'Login') : t('खाता बनाएं', 'Sign Up')}
            </button>
          </p>
        </form>
      </main>
    </div>
  );
};

export default LoginScreen;
