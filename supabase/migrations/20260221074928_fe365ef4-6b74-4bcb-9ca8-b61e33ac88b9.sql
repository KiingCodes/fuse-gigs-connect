
-- Fix permissive INSERT policy on hustle_views - require authentication
DROP POLICY "Anyone can insert views" ON public.hustle_views;
CREATE POLICY "Authenticated users can insert views" ON public.hustle_views FOR INSERT WITH CHECK (auth.role() = 'authenticated');
