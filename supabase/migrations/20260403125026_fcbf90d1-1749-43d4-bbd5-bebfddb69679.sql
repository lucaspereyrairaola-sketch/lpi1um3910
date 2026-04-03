
-- Remove the overly permissive public SELECT policy
DROP POLICY IF EXISTS "journalist_select_public_info" ON public.journalist_profiles;

-- Create a public view that excludes sensitive financial data
CREATE OR REPLACE VIEW public.journalist_profiles_public AS
SELECT id, user_id, bio, specialization, total_reads, created_at, updated_at
FROM public.journalist_profiles;

-- Grant access to the view
GRANT SELECT ON public.journalist_profiles_public TO anon, authenticated;
