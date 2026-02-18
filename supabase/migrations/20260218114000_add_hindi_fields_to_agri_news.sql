-- Add Hindi language fields and source_url to agri_news table
ALTER TABLE public.agri_news
  ADD COLUMN IF NOT EXISTS title_hi TEXT,
  ADD COLUMN IF NOT EXISTS summary_hi TEXT,
  ADD COLUMN IF NOT EXISTS content_hi TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT;
