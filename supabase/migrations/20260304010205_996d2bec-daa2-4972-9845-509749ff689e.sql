
-- Add 20 new hustle categories
INSERT INTO public.hustle_categories (name, icon, description) VALUES
('Pet Care', '🐾', 'Pet grooming, sitting, walking'),
('Photography', '📸', 'Event, portrait & product photography'),
('DJ & Music', '🎧', 'DJs, live musicians, sound services'),
('Catering', '🍲', 'Food preparation and catering services'),
('Tutoring', '📚', 'Academic and skills tutoring'),
('Fitness & Wellness', '💪', 'Personal training, yoga, wellness'),
('Automotive', '🚗', 'Car wash, repairs, detailing'),
('Electrical', '⚡', 'Electrical installations and repairs'),
('Plumbing', '🔧', 'Plumbing services and maintenance'),
('Beauty & Nails', '💅', 'Nail art, beauty treatments'),
('Tailoring', '🧵', 'Alterations, custom clothing'),
('Moving & Delivery', '🚚', 'Moving, courier, delivery services'),
('Graphic Design', '🎨', 'Logos, branding, digital design'),
('Social Media', '📱', 'Social media management & marketing'),
('Event Planning', '🎉', 'Event coordination and decor'),
('Tech Support', '💻', 'Computer repairs, IT support'),
('Childcare', '👶', 'Babysitting and childminding'),
('Gardening', '🌱', 'Garden maintenance and landscaping'),
('Security', '🛡️', 'Security services and installations'),
('Translation', '🌍', 'Language translation services')
ON CONFLICT DO NOTHING;

-- Create bookings table for smart booking calendar
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hustle_id UUID NOT NULL REFERENCES public.hustles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  hustler_id UUID NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  total_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Hustlers can view their bookings" ON public.bookings FOR SELECT USING (auth.uid() = hustler_id);
CREATE POLICY "Customers can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Hustlers can update booking status" ON public.bookings FOR UPDATE USING (auth.uid() = hustler_id);
CREATE POLICY "Customers can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = customer_id AND status = 'pending');
CREATE POLICY "Customers can cancel own bookings" ON public.bookings FOR DELETE USING (auth.uid() = customer_id AND status = 'pending');

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bookings and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
