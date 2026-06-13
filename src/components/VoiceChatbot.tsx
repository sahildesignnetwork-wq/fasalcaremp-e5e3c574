import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X, Volume2, MessageCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type Msg = { role: 'user' | 'assistant'; content: string };

const VoiceChatbot: React.FC = () => {
  const { language, t } = useApp();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, transcript, thinking]);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch {}
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale;
    u.rate = 1;
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang === locale) || voices.find(v => v.lang.startsWith(language));
    if (match) u.voice = match;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const sendToAI = async (userText: string) => {
    const newMessages: Msg[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setThinking(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-chat', {
        body: { messages: newMessages, language },
      });
      if (error) throw error;
      const reply = (data as any)?.reply || t('क्षमा करें, कुछ गलत हुआ।', 'Sorry, something went wrong.');
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      speak(reply);
    } catch (e: any) {
      toast({ title: t('त्रुटि', 'Error'), description: String(e.message || e), variant: 'destructive' });
    } finally {
      setThinking(false);
    }
  };

  const startListening = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({
        title: t('समर्थित नहीं', 'Not supported'),
        description: t('आपका ब्राउज़र वॉइस इनपुट समर्थन नहीं करता।', 'Your browser does not support voice input.'),
        variant: 'destructive',
      });
      return;
    }
    stopSpeaking();
    const rec = new SR();
    rec.lang = locale;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onstart = () => { setListening(true); setTranscript(''); };
    rec.onresult = (e: any) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      const finalText = (rec._final || '').trim();
      // use latest transcript via closure on state
    };
    // Capture final result reliably
    rec.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      setTranscript(final || interim);
      if (final) {
        rec.stop();
        setTimeout(() => {
          setTranscript('');
          sendToAI(final.trim());
        }, 100);
      }
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label={t('वॉइस सहायक खोलें', 'Open voice assistant')}
        >
          <MessageCircle className="w-7 h-7 text-primary-foreground" />
        </button>
      )}

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md bg-card rounded-t-3xl shadow-2xl flex flex-col animate-fade-in-up"
            style={{ height: '75vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-primary rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground text-sm">
                    {t('फसल सहायक', 'Fasal Assistant')}
                  </h3>
                  <p className="text-[10px] text-primary-foreground/80">
                    {t('बोलकर पूछें', 'Ask by voice')}
                  </p>
                </div>
              </div>
              <button onClick={() => { stopListening(); stopSpeaking(); setOpen(false); }} className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <X className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm mt-8 px-4">
                  <Mic className="w-12 h-12 mx-auto mb-3 text-primary opacity-50" />
                  <p>{t('माइक बटन दबाएँ और अपना सवाल पूछें', 'Tap the mic and ask your question')}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {t('जैसे: "टमाटर में पीले धब्बे क्यों होते हैं?"', 'e.g., "Why do tomato leaves turn yellow?"')}
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {transcript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-primary/60 text-primary-foreground italic">
                    {transcript}
                  </div>
                </div>
              )}
              {thinking && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3 py-2 bg-muted flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">{t('सोच रहा हूँ...', 'Thinking...')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-border flex items-center justify-center gap-3">
              {speaking && (
                <Button variant="outline" size="sm" onClick={stopSpeaking}>
                  <Volume2 className="w-4 h-4 mr-1 animate-pulse" />
                  {t('रोकें', 'Stop')}
                </Button>
              )}
              <button
                onClick={listening ? stopListening : startListening}
                disabled={thinking}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  listening ? 'bg-destructive animate-pulse' : 'bg-gradient-primary'
                } ${thinking ? 'opacity-50' : 'active:scale-95'}`}
              >
                {listening ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-primary-foreground" />}
              </button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground pb-2">
              {listening
                ? t('सुन रहा हूँ...', 'Listening...')
                : t('माइक दबाकर बोलें', 'Tap mic to speak')}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceChatbot;
