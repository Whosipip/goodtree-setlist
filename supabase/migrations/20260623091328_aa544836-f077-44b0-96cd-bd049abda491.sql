DROP POLICY IF EXISTS "Anyone can view people" ON public.roster_people;
CREATE POLICY "Authenticated users can view people" ON public.roster_people FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;
CREATE POLICY "Authenticated users can view team members" ON public.team_members FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

REVOKE SELECT ON public.roster_people FROM anon;
REVOKE SELECT ON public.team_members FROM anon;