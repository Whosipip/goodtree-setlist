ALTER TABLE public.roster_people
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS roles text[] NOT NULL DEFAULT '{}';