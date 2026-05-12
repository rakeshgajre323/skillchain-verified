-- 1. Roles enum + table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'student', 'institute', 'company');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. has_role helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users see own roles; admins see all
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Provision admin account
DO $$
DECLARE
  v_uid uuid;
  v_email text := 'rakeshgajre@admin.local';
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = v_email;

  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      v_email, crypt('Rakesh@2026', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name','Site Administrator','role','institute'),
      false
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
    VALUES (gen_random_uuid(), v_uid, v_uid::text,
            jsonb_build_object('sub', v_uid::text, 'email', v_email), 'email', now(), now(), now());
  ELSE
    UPDATE auth.users
       SET encrypted_password = crypt('Rakesh@2026', gen_salt('bf')),
           email_confirmed_at = COALESCE(email_confirmed_at, now()),
           updated_at = now()
     WHERE id = v_uid;
  END IF;

  INSERT INTO public.profiles (user_id, role, full_name, status)
  VALUES (v_uid, 'institute'::public.user_role, 'Site Administrator', 'active'::public.user_status)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin')
  ON CONFLICT DO NOTHING;
END $$;

-- 4. Admin RPCs
CREATE OR REPLACE FUNCTION public.admin_get_overview()
RETURNS TABLE(total_users bigint, total_students bigint, total_institutes bigint, total_companies bigint, total_certs bigint, verified_certs bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.profiles WHERE role = 'student'),
    (SELECT count(*) FROM public.profiles WHERE role = 'institute'),
    (SELECT count(*) FROM public.profiles WHERE role = 'company'),
    (SELECT count(*) FROM public.credentials),
    (SELECT count(*) FROM public.credentials WHERE verification_status = 'verified');
END $$;

CREATE OR REPLACE FUNCTION public.admin_get_logged_in_students()
RETURNS TABLE(user_id uuid, full_name text, email text, appar_id text, phone text, last_sign_in_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
  SELECT p.user_id, p.full_name, u.email::text, p.appar_id, p.phone, u.last_sign_in_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE p.role = 'student'
    AND u.last_sign_in_at IS NOT NULL
    AND u.last_sign_in_at > now() - interval '15 minutes'
  ORDER BY u.last_sign_in_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_profiles(_role public.user_role)
RETURNS TABLE(user_id uuid, full_name text, email text, phone text, institute_name text, company_name text, website text, address text, appar_id text, status public.user_status, created_at timestamptz, last_sign_in_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
  SELECT p.user_id, p.full_name, u.email::text, p.phone, p.institute_name, p.company_name,
         p.website, p.address, p.appar_id, p.status, p.created_at, u.last_sign_in_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE p.role = _role
  ORDER BY p.created_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_credentials()
RETURNS TABLE(id uuid, title text, credential_type text, issuer_name text, student_full_name text, student_email text, verification_status text, issued_date timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
  SELECT c.id, c.title, c.credential_type, c.issuer_name, c.student_full_name, c.student_email, c.verification_status, c.issued_date
  FROM public.credentials c ORDER BY c.issued_date DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_update_user_status(_user_id uuid, _status public.user_status)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  UPDATE public.profiles SET status = _status, updated_at = now() WHERE user_id = _user_id;
END $$;

CREATE OR REPLACE FUNCTION public.admin_delete_credential(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  DELETE FROM public.credentials WHERE id = _id;
END $$;

-- Allow admin DELETE on credentials (RLS previously blocked all deletes)
DROP POLICY IF EXISTS "Admins can delete credentials" ON public.credentials;
CREATE POLICY "Admins can delete credentials" ON public.credentials
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));