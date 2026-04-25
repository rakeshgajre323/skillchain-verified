
-- 1) Restrict public SELECT on credentials (remove PII exposure)
DROP POLICY IF EXISTS "Public can verify credentials" ON public.credentials;

-- 2) Add public verification function exposing only non-sensitive fields
CREATE OR REPLACE FUNCTION public.verify_credential(_credential_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  credential_type text,
  issuer_name text,
  student_full_name text,
  issued_date timestamptz,
  expiry_date timestamptz,
  verification_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, title, credential_type, issuer_name, student_full_name,
         issued_date, expiry_date, verification_status
  FROM public.credentials
  WHERE id = _credential_id
$$;

GRANT EXECUTE ON FUNCTION public.verify_credential(uuid) TO anon, authenticated;

-- 3) Add INSERT policy on otp_codes (users can only create their own)
CREATE POLICY "Users can insert their own OTP"
ON public.otp_codes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4) Make certificates bucket private
UPDATE storage.buckets SET public = false WHERE id = 'certificates';

-- 5) Storage policies: only owners (issuer or referenced student via path) can read; uploaders can write to their own folder
DROP POLICY IF EXISTS "Certificates: owner read" ON storage.objects;
DROP POLICY IF EXISTS "Certificates: owner insert" ON storage.objects;
DROP POLICY IF EXISTS "Certificates: owner update" ON storage.objects;
DROP POLICY IF EXISTS "Certificates: owner delete" ON storage.objects;

CREATE POLICY "Certificates: owner read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Certificates: owner insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Certificates: owner update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Certificates: owner delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
