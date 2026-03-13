
CREATE TABLE public.saved_hustles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hustle_id uuid NOT NULL REFERENCES public.hustles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, hustle_id)
);

ALTER TABLE public.saved_hustles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved hustles" ON public.saved_hustles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can save hustles" ON public.saved_hustles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave hustles" ON public.saved_hustles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
