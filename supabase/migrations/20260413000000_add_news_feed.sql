-- news_feed: tabla para artículos ingresados automáticamente vía RSS
-- No requiere journalist_id (es contenido externo)

CREATE TABLE IF NOT EXISTS public.news_feed (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT        NOT NULL,
  summary       TEXT        DEFAULT '',
  body          TEXT        DEFAULT '',
  source_url    TEXT        NOT NULL UNIQUE,
  source_name   TEXT        NOT NULL,
  source_id     TEXT        NOT NULL,
  tags          TEXT[]      DEFAULT '{}',
  published_at  TIMESTAMPTZ DEFAULT now(),
  perspectives  JSONB,
  status        TEXT        DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'done', 'error')),
  error_msg     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_feed_source_url ON public.news_feed(source_url);
CREATE INDEX IF NOT EXISTS idx_news_feed_status     ON public.news_feed(status);
CREATE INDEX IF NOT EXISTS idx_news_feed_published  ON public.news_feed(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_feed_tags       ON public.news_feed USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_feed_source_id  ON public.news_feed(source_id);

-- RLS
ALTER TABLE public.news_feed ENABLE ROW LEVEL SECURITY;

-- Lectores: solo artículos con perspectivas generadas
CREATE POLICY "news_feed_select_done"
  ON public.news_feed FOR SELECT
  USING (status = 'done');

-- Service role: acceso total (bypassa RLS con service key)
CREATE POLICY "news_feed_service_insert"
  ON public.news_feed FOR INSERT
  WITH CHECK (true);

CREATE POLICY "news_feed_service_update"
  ON public.news_feed FOR UPDATE
  USING (true);
