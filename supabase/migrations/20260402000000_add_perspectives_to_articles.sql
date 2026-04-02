-- Agrega columna perspectives a articles para guardar las perspectivas generadas por IA
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS perspectives JSONB DEFAULT NULL;
