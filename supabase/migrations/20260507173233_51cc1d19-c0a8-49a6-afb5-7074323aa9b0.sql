-- Drop the old single-row function (replaced by batch version)
DROP FUNCTION IF EXISTS public.get_credential_issuer_info(uuid);

-- Batch function: returns all credentials of the current student with issuer info
CREATE OR REPLACE FUNCTION public.get_my_credentials_with_issuer()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  credential_type text,
  issued_date timestamptz,
  expiry_date timestamptz,
  verification_status text,
  certificate_file_url text,
  issuer_name text,
  issuer_id uuid,
  issuer_institute_name text,
  issuer_full_name text,
  issuer_email text,
  issuer_appar_id text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.title,
    c.description,
    c.credential_type,
    c.issued_date,
    c.expiry_date,
    c.verification_status,
    c.certificate_file_url,
    c.issuer_name,
    c.issuer_id,
    p.institute_name AS issuer_institute_name,
    p.full_name      AS issuer_full_name,
    u.email::text    AS issuer_email,
    p.appar_id       AS issuer_appar_id
  FROM public.credentials c
  LEFT JOIN public.profiles p ON p.user_id = c.issuer_id
  LEFT JOIN auth.users u      ON u.id = c.issuer_id
  WHERE c.user_id = auth.uid()
  ORDER BY c.issued_date DESC;
$$;

-- Restrict to authenticated users only (no anon execute)
REVOKE ALL ON FUNCTION public.get_my_credentials_with_issuer() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_credentials_with_issuer() TO authenticated;