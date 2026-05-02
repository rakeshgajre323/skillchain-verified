-- =========================================
-- 1. Credentials: enforce institute role in RLS
-- =========================================
DROP POLICY IF EXISTS "Issuers can insert credentials" ON public.credentials;
CREATE POLICY "Issuers can insert credentials"
ON public.credentials FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = issuer_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'institute'::public.user_role
      AND p.status = 'active'::public.user_status
  )
);

DROP POLICY IF EXISTS "Issuers can update credentials they issued" ON public.credentials;
CREATE POLICY "Issuers can update credentials they issued"
ON public.credentials FOR UPDATE
TO authenticated
USING (
  auth.uid() = issuer_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'institute'::public.user_role
      AND p.status = 'active'::public.user_status
  )
)
WITH CHECK (
  auth.uid() = issuer_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'institute'::public.user_role
      AND p.status = 'active'::public.user_status
  )
);

-- =========================================
-- 2. Profiles: prevent privilege escalation
-- =========================================
-- Force INSERTs from clients to be student-only (handle_new_user trigger uses
-- SECURITY DEFINER and bypasses RLS, so it can still set institute/company).
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'student'::public.user_role
  AND status = 'pending'::public.user_status
);

-- Prevent users from changing their role or status via UPDATE.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid())
  AND status = (SELECT p.status FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- =========================================
-- 3. Admin analytics RPCs: role check inside function
-- =========================================
CREATE OR REPLACE FUNCTION public.get_admin_counts()
RETURNS TABLE(total_users bigint, total_certs bigint, verified_certs bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role IN ('institute'::public.user_role, 'company'::public.user_role)
      AND status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.credentials),
    (SELECT count(*) FROM public.credentials WHERE verification_status = 'verified');
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_growth()
RETURNS TABLE(month text, users bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role IN ('institute'::public.user_role, 'company'::public.user_role)
      AND status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    to_char(date_trunc('month', created_at), 'Mon') AS month,
    count(*) AS users
  FROM public.profiles
  WHERE created_at >= date_trunc('month', now()) - interval '7 months'
  GROUP BY date_trunc('month', created_at)
  ORDER BY date_trunc('month', created_at);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_cert_issuance()
RETURNS TABLE(month text, issued bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role IN ('institute'::public.user_role, 'company'::public.user_role)
      AND status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    to_char(date_trunc('month', issued_date), 'Mon') AS month,
    count(*) AS issued
  FROM public.credentials
  WHERE issued_date >= date_trunc('month', now()) - interval '7 months'
  GROUP BY date_trunc('month', issued_date)
  ORDER BY date_trunc('month', issued_date);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_status_distribution()
RETURNS TABLE(name text, value bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role IN ('institute'::public.user_role, 'company'::public.user_role)
      AND status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    verification_status AS name,
    count(*) AS value
  FROM public.credentials
  GROUP BY verification_status;
END;
$function$;

-- Revoke from anon; keep authenticated (in-function check enforces role).
REVOKE EXECUTE ON FUNCTION public.get_admin_counts() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_growth() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_cert_issuance() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_status_distribution() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_growth() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cert_issuance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_status_distribution() TO authenticated;

-- =========================================
-- 4. otp_codes: scope SELECT to authenticated only
-- =========================================
DROP POLICY IF EXISTS "Users can view their own OTP" ON public.otp_codes;
CREATE POLICY "Users can view their own OTP"
ON public.otp_codes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- =========================================
-- 5. Storage: prevent listing of public institution-logos bucket
-- =========================================
-- Direct file URLs continue to work because the bucket is public, but a broad
-- SELECT policy on storage.objects allowed listing all files. Restrict listing
-- to institute users only; anonymous viewers can still load known URLs.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND cmd = 'SELECT'
      AND qual ILIKE '%institution-logos%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Institute users can list institution logos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'institution-logos'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'institute'::public.user_role
  )
);
