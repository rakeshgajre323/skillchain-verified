CREATE OR REPLACE FUNCTION public.find_student_user_id(_email text, _appar_id text)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'institute'::public.user_role
      AND status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Primary match: APPAR ID (the canonical student identifier)
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

  -- Fallback: email
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

  RETURN NULL;
END;
$function$;