-- Product inquiries
CREATE TABLE public.product_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  message TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers create inquiries" ON public.product_inquiries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers view own inquiries" ON public.product_inquiries
  FOR SELECT TO authenticated USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers view inquiries on their products" ON public.product_inquiries
  FOR SELECT TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Sellers update inquiries" ON public.product_inquiries
  FOR UPDATE TO authenticated USING (auth.uid() = seller_id);
CREATE TRIGGER trg_product_inquiries_updated BEFORE UPDATE ON public.product_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Saved searches
CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  query_text TEXT,
  category_id UUID,
  max_distance_km INTEGER,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved searches" ON public.saved_searches
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Hustle revisions (edit history)
CREATE TABLE public.hustle_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hustle_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT,
  description TEXT,
  price NUMERIC,
  location TEXT,
  category_id UUID,
  snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hustle_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view own revisions" ON public.hustle_revisions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated insert revisions" ON public.hustle_revisions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- App version tracking
CREATE TABLE public.app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  released_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view versions" ON public.app_versions
  FOR SELECT USING (true);
CREATE POLICY "Admins manage versions" ON public.app_versions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed first version
INSERT INTO public.app_versions (version, title, notes, is_current) VALUES
('1.0.0', 'Welcome to Fuse Gigs', 'Initial release with hustles, products, community chat, wallet, and more.', true);