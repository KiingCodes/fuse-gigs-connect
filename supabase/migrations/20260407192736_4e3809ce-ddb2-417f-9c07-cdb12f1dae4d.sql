
-- Add availability time fields to hustles
ALTER TABLE public.hustles ADD COLUMN IF NOT EXISTS available_from TIME WITHOUT TIME ZONE DEFAULT NULL;
ALTER TABLE public.hustles ADD COLUMN IF NOT EXISTS available_to TIME WITHOUT TIME ZONE DEFAULT NULL;

-- Create community_messages table for public community chat
CREATE TABLE public.community_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT,
  media_url TEXT,
  message_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view community messages" ON public.community_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can send community messages" ON public.community_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own community messages" ON public.community_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for community messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hustle_id UUID REFERENCES public.hustles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  stock_quantity INTEGER DEFAULT NULL,
  media_url TEXT,
  category TEXT DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true OR auth.uid() = user_id);

CREATE POLICY "Users can create products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON public.products
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON public.products
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
