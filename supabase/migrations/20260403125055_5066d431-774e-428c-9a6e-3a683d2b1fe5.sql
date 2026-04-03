
CREATE POLICY "journalist_select_authenticated" ON public.journalist_profiles
  FOR SELECT TO authenticated USING (true);
