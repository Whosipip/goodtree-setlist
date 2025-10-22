-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Update songs table with new columns
ALTER TABLE public.songs
ADD COLUMN category TEXT DEFAULT 'Praise',
ADD COLUMN song_number INTEGER,
ADD COLUMN last_used TIMESTAMP WITH TIME ZONE,
ADD COLUMN usage_count INTEGER DEFAULT 0;

-- Create index for song search and sorting
CREATE INDEX idx_songs_category ON public.songs(category);
CREATE INDEX idx_songs_usage_count ON public.songs(usage_count DESC);
CREATE INDEX idx_songs_last_used ON public.songs(last_used DESC);
CREATE INDEX idx_songs_title ON public.songs(title);

-- Update songs RLS policies to require admin role
DROP POLICY IF EXISTS "Authenticated users can create songs" ON public.songs;
DROP POLICY IF EXISTS "Authenticated users can update songs" ON public.songs;
DROP POLICY IF EXISTS "Authenticated users can delete songs" ON public.songs;

CREATE POLICY "Admins can create songs"
ON public.songs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update songs"
ON public.songs
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete songs"
ON public.songs
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  service_date DATE NOT NULL,
  service_time TIME,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services"
ON public.services
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage services"
ON public.services
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for services updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create setlists table (junction between services and songs)
CREATE TABLE public.setlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.setlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view setlists"
ON public.setlists
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage setlists"
ON public.setlists
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for setlist ordering
CREATE INDEX idx_setlists_service_position ON public.setlists(service_id, position);

-- Create team_alerts table
CREATE TABLE public.team_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  message TEXT NOT NULL,
  alert_type TEXT DEFAULT 'info' CHECK (alert_type IN ('info', 'warning', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.team_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active alerts"
ON public.team_alerts
FOR SELECT
USING (expires_at IS NULL OR expires_at > now());

CREATE POLICY "Admins can manage alerts"
ON public.team_alerts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Function to automatically assign admin role to specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign admin role only to Tiffanyobad@gtis.edu.ph
  IF NEW.email = 'Tiffanyobad@gtis.edu.ph' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to automatically assign roles on user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Update existing songs to have song numbers (sequential)
WITH numbered_songs AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as num
  FROM public.songs
)
UPDATE public.songs
SET song_number = numbered_songs.num
FROM numbered_songs
WHERE songs.id = numbered_songs.id;