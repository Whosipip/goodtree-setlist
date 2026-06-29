DROP POLICY "Anyone can view people" ON public.roster_people;
CREATE POLICY "Authenticated can view people" ON public.roster_people FOR SELECT TO authenticated USING (true);

DROP POLICY "Anyone can view team members" ON public.team_members;
CREATE POLICY "Authenticated can view team members" ON public.team_members FOR SELECT TO authenticated USING (true);