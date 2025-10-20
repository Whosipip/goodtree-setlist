-- Create songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT,
  lyrics TEXT,
  service_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Create policies for songs
-- Anyone can view songs (public access)
CREATE POLICY "Anyone can view songs" 
ON public.songs 
FOR SELECT 
USING (true);

-- Only authenticated users can insert songs
CREATE POLICY "Authenticated users can create songs" 
ON public.songs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update songs
CREATE POLICY "Authenticated users can update songs" 
ON public.songs 
FOR UPDATE 
TO authenticated
USING (true);

-- Only authenticated users can delete songs
CREATE POLICY "Authenticated users can delete songs" 
ON public.songs 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON public.songs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();