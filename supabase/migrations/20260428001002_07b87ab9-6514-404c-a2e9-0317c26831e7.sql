-- Create team_members table for service team rosters
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL,
  category text NOT NULL CHECK (category IN ('Highschool', 'Elementary')),
  role text NOT NULL CHECK (role IN ('Songleader', 'Backup Singer', 'Guitarist', 'Bassist', 'Pianist', 'Drummer')),
  position integer NOT NULL DEFAULT 1,
  name text NOT NULL DEFAULT '',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members"
ON public.team_members FOR SELECT USING (true);

CREATE POLICY "Admins can manage team members"
ON public.team_members FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_team_members_service ON public.team_members(service_id);

CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();