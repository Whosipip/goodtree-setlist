ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_role_check;

ALTER TABLE public.team_members
ADD CONSTRAINT team_members_role_check
CHECK (role = ANY (ARRAY[
  'Songleader'::text,
  'Backup Singer'::text,
  'Guitarist'::text,
  'Bassist'::text,
  'Pianist'::text,
  'Drummer'::text,
  'Media'::text,
  'Tambourine'::text
]));