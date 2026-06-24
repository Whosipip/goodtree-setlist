DROP POLICY IF EXISTS "Authenticated users can view people" ON public.roster_people;
DROP POLICY IF EXISTS "Authenticated users can view team members" ON public.team_members;

CREATE POLICY "Anyone can view people" ON public.roster_people FOR SELECT USING (true);
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);

GRANT SELECT ON public.roster_people TO anon;
GRANT SELECT ON public.team_members TO anon;