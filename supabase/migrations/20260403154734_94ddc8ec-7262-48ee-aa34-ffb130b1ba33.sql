-- Drop the overly permissive policy that exposes total_earnings to all authenticated users
DROP POLICY IF EXISTS "journalist_select_authenticated" ON public.journalist_profiles;