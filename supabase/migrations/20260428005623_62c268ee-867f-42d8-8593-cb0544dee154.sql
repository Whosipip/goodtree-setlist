-- Master list of people that can be assigned to slots
CREATE TABLE public.roster_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.roster_people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view people"
  ON public.roster_people FOR SELECT USING (true);

CREATE POLICY "Admins manage people"
  ON public.roster_people FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Saved presets of team lineups
CREATE TABLE public.team_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  data jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.team_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view presets"
  ON public.team_presets FOR SELECT USING (true);

CREATE POLICY "Admins manage presets"
  ON public.team_presets FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));