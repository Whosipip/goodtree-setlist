ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_role_check;

ALTER TABLE public.team_members
ADD CONSTRAINT team_members_role_check
CHECK (char_length(trim(role)) > 0);