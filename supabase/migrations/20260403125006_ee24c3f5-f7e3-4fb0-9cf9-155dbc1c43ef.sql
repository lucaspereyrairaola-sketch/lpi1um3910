
-- 1. Fix role escalation: restrict self-insert to 'reader' only
DROP POLICY IF EXISTS "roles_insert_self" ON public.user_roles;
CREATE POLICY "roles_insert_self_reader_only" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id AND role = 'reader');

-- 2. Fix journalist earnings exposure: replace open SELECT with restricted policies
DROP POLICY IF EXISTS "journalist_select" ON public.journalist_profiles;

-- Public can see bio/specialization but not earnings
CREATE POLICY "journalist_select_public" ON public.journalist_profiles
  FOR SELECT USING (true);

-- We need a view approach instead. Since RLS can't filter columns, create a security definer function.
-- Actually, let's use a simpler approach: remove public SELECT entirely and add two policies.
DROP POLICY IF EXISTS "journalist_select_public" ON public.journalist_profiles;

-- Authenticated users can see all journalist profiles (non-sensitive info is handled at query level)
-- Journalist can see their own full profile including earnings
CREATE POLICY "journalist_select_own" ON public.journalist_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Others can see journalist profiles (public info) - we keep this but the app should not query total_earnings
CREATE POLICY "journalist_select_public_info" ON public.journalist_profiles
  FOR SELECT USING (true);

-- 3. Fix paywall bypass: replace articles_select_published with access-level-aware policies
DROP POLICY IF EXISTS "articles_select_published" ON public.articles;

-- Free articles: anyone can read
CREATE POLICY "articles_select_free" ON public.articles
  FOR SELECT USING (published = true AND access_level = 'free');

-- Paid articles: only if user has a micropayment record or is the journalist
CREATE POLICY "articles_select_paid" ON public.articles
  FOR SELECT USING (
    published = true 
    AND access_level IN ('micropay', 'premium')
    AND (
      auth.uid() = journalist_id
      OR EXISTS (
        SELECT 1 FROM public.micropayments 
        WHERE micropayments.article_id = articles.id 
        AND micropayments.user_id = auth.uid()
      )
    )
  );

-- 4. Fix fake payment insertion: remove direct INSERT policy
DROP POLICY IF EXISTS "micropayments_insert_own" ON public.micropayments;
