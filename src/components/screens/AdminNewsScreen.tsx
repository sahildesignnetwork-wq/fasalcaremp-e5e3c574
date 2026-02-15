import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Shield } from 'lucide-react';
import { AgriNews } from '@/types';

const CATEGORIES = ['Government Scheme', 'Market Price', 'Weather', 'Technology', 'Organic Farming', 'Pest Alert'];

interface NewsForm {
  title: string;
  summary: string;
  content: string;
  image_url: string;
  source: string;
  category: string;
}

const emptyForm: NewsForm = { title: '', summary: '', content: '', image_url: '', source: '', category: '' };

const AdminNewsScreen: React.FC = () => {
  const { t, setCurrentScreen } = useApp();
  const [news, setNews] = useState<AgriNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [editing, setEditing] = useState<string | null>(null); // null = list, 'new' = create, uuid = edit
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setChecking(false);
      return;
    }
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
    setIsAdmin(!!(data && data.length > 0));
    setChecking(false);
    if (data && data.length > 0) fetchNews();
  };

  const fetchNews = async () => {
    setLoading(true);
    const { data } = await supabase.from('agri_news').select('*').order('created_at', { ascending: false });
    if (data) setNews(data as AgriNews[]);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError(t('शीर्षक और सामग्री आवश्यक हैं', 'Title and content are required'));
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      content: form.content.trim(),
      image_url: form.image_url.trim() || null,
      source: form.source.trim() || null,
      category: form.category || null,
      published_at: new Date().toISOString(),
    };

    if (editing === 'new') {
      const { error } = await supabase.from('agri_news').insert(payload);
      if (error) setError(error.message);
      else { setEditing(null); fetchNews(); }
    } else {
      const { error } = await supabase.from('agri_news').update(payload).eq('id', editing!);
      if (error) setError(error.message);
      else { setEditing(null); fetchNews(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('क्या आप वाकई हटाना चाहते हैं?', 'Are you sure you want to delete?'))) return;
    await supabase.from('agri_news').delete().eq('id', id);
    fetchNews();
  };

  const startEdit = (item: AgriNews) => {
    setForm({
      title: item.title,
      summary: item.summary || '',
      content: item.content,
      image_url: item.image_url || '',
      source: item.source || '',
      category: item.category || '',
    });
    setEditing(item.id);
    setError('');
  };

  if (checking) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Skeleton className="h-8 w-48" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">{t('पहुंच अस्वीकृत', 'Access Denied')}</h2>
        <p className="text-muted-foreground mb-4">{t('केवल एडमिन इस पेज को देख सकते हैं', 'Only admins can access this page')}</p>
        <Button onClick={() => setCurrentScreen('home')}>{t('होम पर जाएं', 'Go Home')}</Button>
      </div>
    );
  }

  // Editor form
  if (editing) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="iconSm" onClick={() => { setEditing(null); setError(''); }} className="text-primary-foreground">
              <X className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-primary-foreground">
              {editing === 'new' ? t('नया समाचार', 'New Article') : t('संपादित करें', 'Edit Article')}
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('शीर्षक', 'Title')} *</label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('सारांश', 'Summary')}</label>
            <Textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('सामग्री', 'Content')} *</label>
            <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('छवि URL', 'Image URL')}</label>
            <Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('स्रोत', 'Source')}</label>
            <Input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('श्रेणी', 'Category')}</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">{t('चुनें', 'Select')}</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="w-4 h-4" /> {saving ? '...' : t('सहेजें', 'Save')}
          </Button>
        </main>
      </div>
    );
  }

  // News list for admin
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="iconSm" onClick={() => setCurrentScreen('home')} className="text-primary-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-primary-foreground">{t('समाचार प्रबंधन', 'News Management')}</h1>
          </div>
          <Button size="sm" onClick={() => { setForm(emptyForm); setEditing('new'); setError(''); }} className="bg-primary-foreground/20 text-primary-foreground">
            <Plus className="w-4 h-4" /> {t('नया', 'New')}
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : news.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">{t('कोई समाचार नहीं', 'No news articles')}</p>
        ) : (
          news.map(item => (
            <div key={item.id} className="bg-card rounded-xl p-4 border border-border shadow-sm flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm line-clamp-1">{item.title}</h3>
                {item.category && <Badge variant="secondary" className="text-xs mt-1">{item.category}</Badge>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(item.created_at).toLocaleDateString('hi-IN')}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="iconSm" onClick={() => startEdit(item)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="iconSm" onClick={() => handleDelete(item.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default AdminNewsScreen;
