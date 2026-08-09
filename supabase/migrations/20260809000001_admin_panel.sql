-- Create public.users table mirroring auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create verified_businesses table
CREATE TABLE IF NOT EXISTS public.verified_businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  subscription_expiry timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Trigger to automatically create a public.user when auth.user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, admin)
  VALUES (new.id, new.email, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to prevent errors on rerun
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_businesses ENABLE ROW LEVEL SECURITY;

-- Create a SECURITY DEFINER function to prevent infinite recursion in RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  is_admin_flag boolean;
BEGIN
  SELECT admin INTO is_admin_flag FROM public.users WHERE id = auth.uid();
  RETURN COALESCE(is_admin_flag, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for public.users
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING ( public.is_admin() );

CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING ( public.is_admin() );

-- Policies for verified_businesses
CREATE POLICY "Public can view approved businesses"
  ON public.verified_businesses FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view their own businesses"
  ON public.verified_businesses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own businesses"
  ON public.verified_businesses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all businesses"
  ON public.verified_businesses FOR SELECT
  USING ( public.is_admin() );

CREATE POLICY "Admins can update businesses"
  ON public.verified_businesses FOR UPDATE
  USING ( public.is_admin() );

-- Add Admin policy to noise_logs so admins can delete any log
CREATE POLICY "Admins can delete any noise_logs"
  ON noise_logs FOR DELETE
  USING ( public.is_admin() );
