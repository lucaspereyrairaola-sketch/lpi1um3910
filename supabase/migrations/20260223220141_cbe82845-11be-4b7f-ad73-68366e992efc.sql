
-- Add missing preference columns to reader_profiles
ALTER TABLE public.reader_profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS regions text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS tone text NOT NULL DEFAULT 'neutral',
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{"es"}'::text[],
  ADD COLUMN IF NOT EXISTS notify_breaking boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_digest boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_comments boolean NOT NULL DEFAULT false;
