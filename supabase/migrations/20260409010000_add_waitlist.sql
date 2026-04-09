CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public signup)
CREATE POLICY "waitlist_insert_public" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Only service role can read
CREATE POLICY "waitlist_select_service" ON public.waitlist
  FOR SELECT USING (false);
