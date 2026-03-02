
-- Boost packages (predefined tiers)
CREATE TABLE public.boost_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  duration_days integer NOT NULL,
  price_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'ZAR',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.boost_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active boost packages"
ON public.boost_packages FOR SELECT
USING (is_active = true);

-- Seed the 3 tiers
INSERT INTO public.boost_packages (name, duration_days, price_cents, currency, description) VALUES
  ('1 Day Boost', 1, 1900, 'ZAR', 'Boost your listing for 24 hours'),
  ('3 Day Boost', 3, 4900, 'ZAR', 'Boost your listing for 3 days'),
  ('7 Day Boost', 7, 7900, 'ZAR', 'Boost your listing for 7 days');

-- Active boosts on hustles
CREATE TABLE public.hustle_boosts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hustle_id uuid NOT NULL REFERENCES public.hustles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  package_id uuid NOT NULL REFERENCES public.boost_packages(id),
  status text NOT NULL DEFAULT 'pending', -- pending, active, expired, cancelled, refunded
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'ZAR',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hustle_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boosts"
ON public.hustle_boosts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create boosts"
ON public.hustle_boosts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all boosts"
ON public.hustle_boosts FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any boost"
ON public.hustle_boosts FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Public read for active boosts (so we can show boost badges)
CREATE POLICY "Anyone can see active boosts"
ON public.hustle_boosts FOR SELECT
USING (status = 'active' AND ends_at > now());

-- Boost analytics
CREATE TABLE public.boost_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  boost_id uuid NOT NULL REFERENCES public.hustle_boosts(id) ON DELETE CASCADE,
  hustle_id uuid NOT NULL REFERENCES public.hustles(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'view', 'click', 'inquiry'
  viewer_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.boost_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Boost owners can view analytics"
ON public.boost_analytics FOR SELECT
USING (EXISTS (
  SELECT 1 FROM hustle_boosts hb
  WHERE hb.id = boost_analytics.boost_id AND hb.user_id = auth.uid()
));

CREATE POLICY "Admins can view all boost analytics"
ON public.boost_analytics FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert analytics"
ON public.boost_analytics FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Trigger for updated_at on hustle_boosts
CREATE TRIGGER update_hustle_boosts_updated_at
BEFORE UPDATE ON public.hustle_boosts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
