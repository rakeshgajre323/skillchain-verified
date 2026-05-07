-- RPC: return minimal issuer info for a credential, only callable by the recipient student
CREATE OR REPLACE FUNCTION public.get_credential_issuer_info(_credential_id uuid)
RETURNS TABLE(
  issuer_id uuid,
  institute_name text,
  full_name text,
  email text,
  appar_id text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only the recipient student of the credential can call this
  IF NOT EXISTS (
    SELECT 1 FROM public.credentials c
    WHERE c.id = _credential_id AND c.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.user_id AS issuer_id,
    p.institute_name,
    p.full_name,
    u.email::text AS email,
    p.appar_id
  FROM public.credentials c
  JOIN public.profiles p ON p.user_id = c.issuer_id
  LEFT JOIN auth.users u ON u.id = c.issuer_id
  WHERE c.id = _credential_id
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_credential_issuer_info(uuid) TO authenticated;