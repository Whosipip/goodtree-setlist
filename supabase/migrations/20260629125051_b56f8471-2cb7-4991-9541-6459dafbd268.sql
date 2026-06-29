DROP POLICY IF EXISTS "Authenticated can view people" ON public.roster_people;
CREATE POLICY "Anyone can view people" ON public.roster_people FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.roster_people TO anon;

DROP POLICY IF EXISTS "Authenticated can view team members" ON public.team_members;
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.team_members TO anon;