
-- Add latitude and longitude to hustles for geo-based discovery
ALTER TABLE public.hustles ADD COLUMN latitude double precision;
ALTER TABLE public.hustles ADD COLUMN longitude double precision;

-- Add latitude and longitude to profiles for provider location
ALTER TABLE public.profiles ADD COLUMN latitude double precision;
ALTER TABLE public.profiles ADD COLUMN longitude double precision;

-- Add availability status to hustles
ALTER TABLE public.hustles ADD COLUMN is_available_now boolean DEFAULT false;

-- Add response_time_minutes to profiles (average response time)
ALTER TABLE public.profiles ADD COLUMN response_time_minutes integer;

-- Create index for geo queries
CREATE INDEX idx_hustles_location ON public.hustles (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_hustles_available ON public.hustles (is_available_now) WHERE is_available_now = true;
