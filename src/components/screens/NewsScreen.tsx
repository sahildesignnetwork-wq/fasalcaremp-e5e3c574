import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Newspaper, Calendar, ExternalLink } from 'lucide-react';
import { AgriNews } from '@/types';

const NEWS_PER_PAGE = 10;
const CATEGORIES = ['Government Scheme', 'Market Price', 'Weather', 'Technology', 'Organic Farming', 'Pest Alert'];

const NewsScreen: React.FC = () => {
  const { t, setCurrentScreen } = useApp();
  const [news, setNews] = useState<AgriNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, [search, category, page]);

  const fetchNews = async () => {
    setLoading(true);
    let query = supabase
      .from('agri_news')
      .select('*')
      .order('published_at', { ascending: false })
      .range(page * NEWS_PER_PAGE, (page + 1) * NEWS_PER_PAGE - 1);

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (!error && data) {
      setNews(data as AgriNews[]);
      setHasMore(data.length === NEWS_PER_PAGE);
    }
    setLoading(false);
  };

  const openDetail = (id: string) => {
    setSelectedNewsId(id);
  };

  if (selectedNewsId) {
    return <NewsDetailView newsId={selectedNewsId} onBack={() => setSelectedNewsId(null)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="iconSm" onClick={() => setCurrentScreen('home')} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            {t('कृषि समाचार', 'Agriculture News')}
          </h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder={t('समाचार खोजें...', 'Search news...')}
            className="pl-10 bg-card"
          />
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <button
            onClick={() => { setCategory(''); setPage(0); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!category ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {t('सभी', 'All')}
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-md border border-border">
                <Skeleton className="w-full h-40" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{t('कोई समाचार नहीं मिला', 'No news found')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map(item => (
              <button key={item.id} onClick={() => openDetail(item.id)} className="w-full text-left bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:shadow-lg transition-shadow">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
                    {item.source && <span className="text-xs text-muted-foreground flex items-center gap-1"><ExternalLink className="w-3 h-3" />{item.source}</span>}
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2">{item.title}</h3>
                  {item.summary && <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>}
                  {item.published_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.published_at).toLocaleDateString('hi-IN')}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && (news.length > 0 || page > 0) && (
          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              {t('पिछला', 'Previous')}
            </Button>
            <span className="text-sm text-muted-foreground self-center">{t('पृष्ठ', 'Page')} {page + 1}</span>
            <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => setPage(p => p + 1)}>
              {t('अगला', 'Next')}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

const NewsDetailView: React.FC<{ newsId: string; onBack: () => void }> = ({ newsId, onBack }) => {
  const { t } = useApp();
  const [article, setArticle] = useState<AgriNews | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('agri_news').select('*').eq('id', newsId).single();
      if (data) setArticle(data as AgriNews);
      setLoading(false);
    };
    fetch();
  }, [newsId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('समाचार नहीं मिला', 'News not found')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {article.image_url && (
        <div className="relative">
          <img src={article.image_url} alt={article.title} className="w-full h-56 object-cover" />
          <Button variant="ghost" size="iconSm" onClick={onBack} className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      )}
      {!article.image_url && (
        <header className="bg-gradient-primary p-4 pt-6 pb-6 rounded-b-3xl">
          <Button variant="ghost" size="iconSm" onClick={onBack} className="text-primary-foreground mb-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </header>
      )}
      <main className="flex-1 p-4 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {article.category && <Badge>{article.category}</Badge>}
          {article.source && <span className="text-xs text-muted-foreground flex items-center gap-1"><ExternalLink className="w-3 h-3" />{article.source}</span>}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{article.title}</h1>
        {article.published_at && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(article.published_at).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
          {article.content}
        </div>
      </main>
    </div>
  );
};

export default NewsScreen;
