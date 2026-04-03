-- Migration: Voto de perspectiva (Feature 1)
CREATE TABLE IF NOT EXISTS public.perspective_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  perspective_id TEXT NOT NULL,
  vote SMALLINT NOT NULL CHECK (vote IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, article_id, perspective_id)
);
ALTER TABLE public.perspective_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perspective_votes_policy" ON public.perspective_votes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Migration: Poll de perspectiva (Feature 2)
CREATE TABLE IF NOT EXISTS public.perspective_polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  chosen_perspective TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, article_id)
);
ALTER TABLE public.perspective_polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perspective_polls_policy" ON public.perspective_polls FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
