
ALTER TABLE public.agri_news
  ADD COLUMN IF NOT EXISTS title_hi text,
  ADD COLUMN IF NOT EXISTS summary_hi text,
  ADD COLUMN IF NOT EXISTS content_hi text,
  ADD COLUMN IF NOT EXISTS source_url text;
