
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS on user_roles: only admins can see roles, users can see own
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Allow admins to update verification_requests (approve/reject)
CREATE POLICY "Admins can update verification requests"
ON public.verification_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Allow admins to view all verification requests
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Allow admins to update profiles (set verification_level)
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));
