-- 1. Helper function: resolve a student's user_id from email or APPAR ID
CREATE OR REPLACE FUNCTION public.find_student_user_id(_email text, _appar_id text)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
BEGIN
  -- Only allow active institute users to perform this lookup
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'institute'::public.user_role
      AND status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Try by email first (most reliable)
  IF _email IS NOT NULL AND length(trim(_email)) > 0 THEN
    SELECT u.id INTO v_user
    FROM auth.users u
    JOIN public.profiles p ON p.user_id = u.id
    WHERE lower(u.email) = lower(trim(_email))
      AND p.role = 'student'::public.user_role
    LIMIT 1;
    IF v_user IS NOT NULL THEN
      RETURN v_user;
    END IF;
  END IF;

  -- Then by APPAR ID
  IF _appar_id IS NOT NULL AND length(trim(_appar_id)) > 0 THEN
    SELECT p.user_id INTO v_user
    FROM public.profiles p
    WHERE p.appar_id = trim(_appar_id)
      AND p.role = 'student'::public.user_role
    LIMIT 1;
    IF v_user IS NOT NULL THEN
      RETURN v_user;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.find_student_user_id(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_student_user_id(text, text) TO authenticated;

-- 2. Re-link the existing mis-assigned certificate to the correct student (by email)
UPDATE public.credentials c
SET user_id = u.id
FROM auth.users u
WHERE lower(u.email) = lower(c.student_email)
  AND c.user_id = c.issuer_id  -- only fix rows where it fell back to issuer
  AND c.student_email IS NOT NULL;