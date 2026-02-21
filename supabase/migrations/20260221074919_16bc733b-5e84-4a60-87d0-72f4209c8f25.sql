
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- Create hustle categories
CREATE TABLE public.hustle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT
);

ALTER TABLE public.hustle_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.hustle_categories FOR SELECT USING (true);

-- Seed categories
INSERT INTO public.hustle_categories (name, description, icon) VALUES
  ('Home Services', 'Cleaning, repairs, gardening', 'Home'),
  ('Beauty & Wellness', 'Hair, nails, massage, fitness', 'Sparkles'),
  ('Food & Catering', 'Cooking, baking, meal prep', 'UtensilsCrossed'),
  ('Tech & Digital', 'Web design, social media, IT support', 'Monitor'),
  ('Education & Tutoring', 'Lessons, coaching, mentoring', 'GraduationCap'),
  ('Events & Entertainment', 'DJs, photography, event planning', 'PartyPopper'),
  ('Transport & Delivery', 'Moving, courier, logistics', 'Truck'),
  ('Fashion & Design', 'Tailoring, styling, crafts', 'Scissors'),
  ('Auto Services', 'Car wash, mechanics, detailing', 'Car'),
  ('Other', 'Everything else', 'MoreHorizontal');

-- Create hustles table
CREATE TABLE public.hustles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.hustle_categories(id),
  price NUMERIC,
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'negotiable')),
  location TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hustles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hustles" ON public.hustles FOR SELECT USING (is_active = true OR auth.uid() = user_id);
CREATE POLICY "Users can create hustles" ON public.hustles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hustles" ON public.hustles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hustles" ON public.hustles FOR DELETE USING (auth.uid() = user_id);

-- Create hustle media table
CREATE TABLE public.hustle_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hustle_id UUID REFERENCES public.hustles(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hustle_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hustle media" ON public.hustle_media FOR SELECT USING (true);
CREATE POLICY "Hustle owners can insert media" ON public.hustle_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.hustles WHERE id = hustle_id AND user_id = auth.uid())
);
CREATE POLICY "Hustle owners can update media" ON public.hustle_media FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.hustles WHERE id = hustle_id AND user_id = auth.uid())
);
CREATE POLICY "Hustle owners can delete media" ON public.hustle_media FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.hustles WHERE id = hustle_id AND user_id = auth.uid())
);

-- Create hustle views for analytics
CREATE TABLE public.hustle_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hustle_id UUID REFERENCES public.hustles(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hustle_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert views" ON public.hustle_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Hustle owners can see their views" ON public.hustle_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.hustles WHERE id = hustle_id AND user_id = auth.uid())
);

-- Create hustle inquiries
CREATE TABLE public.hustle_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hustle_id UUID REFERENCES public.hustles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hustle_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create inquiries" ON public.hustle_inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Hustle owners can view inquiries" ON public.hustle_inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.hustles WHERE id = hustle_id AND user_id = auth.uid())
  OR auth.uid() = user_id
);

-- Create storage bucket for hustle media
INSERT INTO storage.buckets (id, name, public) VALUES ('hustle-media', 'hustle-media', true);

CREATE POLICY "Anyone can view hustle media files" ON storage.objects FOR SELECT USING (bucket_id = 'hustle-media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hustle-media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own media" ON storage.objects FOR UPDATE USING (bucket_id = 'hustle-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE USING (bucket_id = 'hustle-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create avatar storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hustles_updated_at BEFORE UPDATE ON public.hustles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
