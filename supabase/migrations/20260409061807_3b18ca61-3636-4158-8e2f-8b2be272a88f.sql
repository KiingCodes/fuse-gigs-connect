
CREATE TABLE public.guarantors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hustler_id UUID NOT NULL,
  guarantor_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hustler_id, guarantor_id)
);

ALTER TABLE public.guarantors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved guarantors"
  ON public.guarantors FOR SELECT
  USING (status = 'approved' OR auth.uid() = hustler_id OR auth.uid() = guarantor_id);

CREATE POLICY "Authenticated users can request guarantors"
  ON public.guarantors FOR INSERT
  WITH CHECK (auth.uid() = hustler_id);

CREATE POLICY "Guarantors can update their endorsements"
  ON public.guarantors FOR UPDATE
  USING (auth.uid() = guarantor_id);

CREATE POLICY "Guarantors can remove endorsements"
  ON public.guarantors FOR DELETE
  USING (auth.uid() = guarantor_id);

CREATE POLICY "Hustlers can delete their own requests"
  ON public.guarantors FOR DELETE
  USING (auth.uid() = hustler_id);

CREATE TRIGGER update_guarantors_updated_at
  BEFORE UPDATE ON public.guarantors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
