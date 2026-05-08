-- Enforce that every student's Appar ID is unique across the platform.
-- We use a partial unique index limited to student profiles, on a trimmed,
-- non-empty appar_id, so it doesn't affect institutes/companies and ignores
-- empty strings or whitespace-only values.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_student_appar_id_unique
  ON public.profiles (appar_id)
  WHERE role = 'student'::public.user_role
    AND appar_id IS NOT NULL
    AND length(trim(appar_id)) > 0;
