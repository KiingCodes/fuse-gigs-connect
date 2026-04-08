
-- Scam reports table
CREATE TABLE public.scam_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  reported_hustle_id UUID,
  report_type TEXT NOT NULL DEFAULT 'scam',
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.scam_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON public.scam_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can view all reports" ON public.scam_reports FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reports" ON public.scam_reports FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- User flags table
CREATE TABLE public.user_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL DEFAULT 'warning',
  reason TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  flagged_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage flags" ON public.user_flags FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own flags" ON public.user_flags FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Wallets table
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance_zar NUMERIC NOT NULL DEFAULT 0,
  balance_usd NUMERIC NOT NULL DEFAULT 0,
  balance_ngn NUMERIC NOT NULL DEFAULT 0,
  balance_kes NUMERIC NOT NULL DEFAULT 0,
  is_frozen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own wallet" ON public.wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wallets" ON public.wallets FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update wallets" ON public.wallets FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  status TEXT NOT NULL DEFAULT 'completed',
  description TEXT,
  recipient_id UUID,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create transactions" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.wallet_transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
