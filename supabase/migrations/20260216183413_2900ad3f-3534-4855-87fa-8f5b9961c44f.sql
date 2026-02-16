
-- Create security definer functions for admin dashboard aggregation
-- These bypass RLS to provide aggregate counts (not raw data)

-- Monthly user growth (last 8 months)
CREATE OR REPLACE FUNCTION public.get_user_growth()
RETURNS TABLE(month text, users bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    to_char(date_trunc('month', created_at), 'Mon') AS month,
    count(*) AS users
  FROM public.profiles
  WHERE created_at >= date_trunc('month', now()) - interval '7 months'
  GROUP BY date_trunc('month', created_at)
  ORDER BY date_trunc('month', created_at)
$$;

-- Monthly certificate issuance (last 8 months)
CREATE OR REPLACE FUNCTION public.get_cert_issuance()
RETURNS TABLE(month text, issued bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    to_char(date_trunc('month', issued_date), 'Mon') AS month,
    count(*) AS issued
  FROM public.credentials
  WHERE issued_date >= date_trunc('month', now()) - interval '7 months'
  GROUP BY date_trunc('month', issued_date)
  ORDER BY date_trunc('month', issued_date)
$$;

-- Certificate status distribution
CREATE OR REPLACE FUNCTION public.get_status_distribution()
RETURNS TABLE(name text, value bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    verification_status AS name,
    count(*) AS value
  FROM public.credentials
  GROUP BY verification_status
$$;

-- Total counts for summary stats
CREATE OR REPLACE FUNCTION public.get_admin_counts()
RETURNS TABLE(total_users bigint, total_certs bigint, verified_certs bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.profiles) AS total_users,
    (SELECT count(*) FROM public.credentials) AS total_certs,
    (SELECT count(*) FROM public.credentials WHERE verification_status = 'verified') AS verified_certs
$$;
