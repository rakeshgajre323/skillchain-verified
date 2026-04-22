-- 1. Add student identity + file columns to credentials
ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS student_full_name text,
  ADD COLUMN IF NOT EXISTS student_appar_id text,
  ADD COLUMN IF NOT EXISTS student_phone text,
  ADD COLUMN IF NOT EXISTS student_roll_number text,
  ADD COLUMN IF NOT EXISTS student_email text,
  ADD COLUMN IF NOT EXISTS certificate_file_url text;

-- Backfill existing rows with placeholders so NOT NULL can be applied
UPDATE public.credentials
SET
  student_full_name  = COALESCE(student_full_name,  'Unknown'),
  student_appar_id   = COALESCE(student_appar_id,   'N/A'),
  student_phone      = COALESCE(student_phone,      'N/A'),
  student_roll_number= COALESCE(student_roll_number,'N/A')
WHERE
  student_full_name IS NULL
  OR student_appar_id IS NULL
  OR student_phone IS NULL
  OR student_roll_number IS NULL;

ALTER TABLE public.credentials
  ALTER COLUMN student_full_name   SET NOT NULL,
  ALTER COLUMN student_appar_id    SET NOT NULL,
  ALTER COLUMN student_phone       SET NOT NULL,
  ALTER COLUMN student_roll_number SET NOT NULL;

-- Helpful indexes for company lookups
CREATE INDEX IF NOT EXISTS idx_credentials_student_appar_id
  ON public.credentials (student_appar_id);
CREATE INDEX IF NOT EXISTS idx_credentials_student_email
  ON public.credentials (student_email);

-- 2. Public verification access — anyone can read a credential by id
DROP POLICY IF EXISTS "Public can verify credentials" ON public.credentials;
CREATE POLICY "Public can verify credentials"
ON public.credentials
FOR SELECT
TO anon, authenticated
USING (true);

-- Note: credentials are non-sensitive verification records by design;
-- the existing user/issuer policies remain in place for management UIs.

-- 3. Storage bucket for certificate files
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS — public read, institute-owner write
DROP POLICY IF EXISTS "Certificate files are publicly viewable" ON storage.objects;
CREATE POLICY "Certificate files are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Institutes can upload certificate files" ON storage.objects;
CREATE POLICY "Institutes can upload certificate files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Institutes can update their own certificate files" ON storage.objects;
CREATE POLICY "Institutes can update their own certificate files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Institutes can delete their own certificate files" ON storage.objects;
CREATE POLICY "Institutes can delete their own certificate files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);