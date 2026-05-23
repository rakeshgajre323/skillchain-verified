
-- 1) otp_codes: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "Users can view their own OTP" ON public.otp_codes;
CREATE POLICY "Users can view their own OTP"
ON public.otp_codes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2) institution_logos: scope UPDATE/DELETE to creator
DROP POLICY IF EXISTS "Active institute users can update logos" ON public.institution_logos;
DROP POLICY IF EXISTS "Active institute users can delete logos" ON public.institution_logos;

CREATE POLICY "Institute owners can update their logos"
ON public.institution_logos
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'institute'::user_role
      AND p.status = 'active'::user_status
  )
)
WITH CHECK (
  created_by = auth.uid()
);

CREATE POLICY "Institute owners can delete their logos"
ON public.institution_logos
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'institute'::user_role
      AND p.status = 'active'::user_status
  )
);

-- 3) storage.objects: scope institution-logos update/delete + upload to caller's folder
DROP POLICY IF EXISTS "Active institute users can upload institution logo files" ON storage.objects;
DROP POLICY IF EXISTS "Active institute users can update institution logo files" ON storage.objects;
DROP POLICY IF EXISTS "Active institute users can delete institution logo files" ON storage.objects;

CREATE POLICY "Institute users can upload own institution logo files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'institution-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'institute'::user_role
      AND p.status = 'active'::user_status
  )
);

CREATE POLICY "Institute users can update own institution logo files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'institution-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Institute users can delete own institution logo files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'institution-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
