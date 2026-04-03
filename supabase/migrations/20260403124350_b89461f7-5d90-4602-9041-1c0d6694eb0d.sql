
CREATE TABLE public.reading_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  last_read TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_id)
);

ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reading_history_select_own" ON public.reading_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reading_history_insert_own" ON public.reading_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reading_history_update_own" ON public.reading_history
  FOR UPDATE USING (auth.uid() = user_id);
