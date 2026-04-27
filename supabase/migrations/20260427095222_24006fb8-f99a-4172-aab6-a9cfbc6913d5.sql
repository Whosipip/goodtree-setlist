-- Add a per-song scheduled time inside a service's setlist
ALTER TABLE public.setlists ADD COLUMN IF NOT EXISTS song_time time without time zone;