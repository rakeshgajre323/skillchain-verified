CREATE OR REPLACE FUNCTION public.admin_get_user_detail(_user_id uuid)
RETURNS TABLE(
  user_id uuid, full_name text, email text, phone text, appar_id text,
  institute_name text, company_name text, website text, address text,
  role user_role, status user_status, avatar_url text,
  created_at timestamptz, last_sign_in_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
  SELECT p.user_id, p.full_name, u.email::text, p.phone, p.appar_id,
         p.institute_name, p.company_name, p.website, p.address,
         p.role, p.status, p.avatar_url, p.created_at, u.last_sign_in_at
  FROM public.profiles p JOIN auth.users u ON u.id = p.user_id
  WHERE p.user_id = _user_id;
END $$;

CREATE OR REPLACE FUNCTION public.admin_get_user_credentials(_user_id uuid)
RETURNS TABLE(
  id uuid, title text, description text, credential_type text,
  issuer_name text, issued_date timestamptz, expiry_date timestamptz,
  verification_status text, certificate_file_url text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
  SELECT c.id, c.title, c.description, c.credential_type,
         c.issuer_name, c.issued_date, c.expiry_date,
         c.verification_status, c.certificate_file_url
  FROM public.credentials c
  WHERE c.user_id = _user_id
  ORDER BY c.issued_date DESC;
END $$;