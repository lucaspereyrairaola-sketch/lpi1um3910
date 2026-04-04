-- Fix: Prevent users from self-escalating their subscription plan
-- Replace the update policy to ensure plan column cannot be changed by the user

DROP POLICY IF EXISTS "reader_update_own" ON public.reader_profiles;

CREATE POLICY "reader_update_own" ON public.reader_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND plan = (SELECT rp.plan FROM public.reader_profiles rp WHERE rp.user_id = auth.uid())
  );

-- Also restrict INSERT to enforce plan = 'free' on new profiles
DROP POLICY IF EXISTS "reader_insert_own" ON public.reader_profiles;

CREATE POLICY "reader_insert_own" ON public.reader_profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND plan = 'free'
  );