-- Track product views (similar to hustle_views)
CREATE TABLE public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  viewer_id UUID,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert product views"
ON public.product_views FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view product view counts"
ON public.product_views FOR SELECT
USING (true);

CREATE INDEX idx_product_views_product ON public.product_views(product_id);
CREATE INDEX idx_hustle_views_hustle ON public.hustle_views(hustle_id);