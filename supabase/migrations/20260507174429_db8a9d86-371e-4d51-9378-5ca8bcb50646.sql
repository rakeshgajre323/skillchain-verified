
-- 1. OTP audit log: restrict to own rows
DROP POLICY IF EXISTS "Staff can view OTP audit log" ON public.otp_audit_log;
CREATE POLICY "Users can view their own OTP audit log"
ON public.otp_audit_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. credential_requests: require active student role on insert
DROP POLICY IF EXISTS "Students can create their own requests" ON public.credential_requests;
CREATE POLICY "Students can create their own requests"
ON public.credential_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'student'::public.user_role
      AND p.status = 'active'::public.user_status
  )
);

-- 3. institution_logos table: require active institute
DROP POLICY IF EXISTS "Institute users can insert logos" ON public.institution_logos;
DROP POLICY IF EXISTS "Institute users can update logos" ON public.institution_logos;
DROP POLICY IF EXISTS "Institute users can delete logos" ON public.institution_logos;
DROP POLICY IF EXISTS "Institute users can view all logos" ON public.institution_logos;

CREATE POLICY "Active institute users can insert logos"
ON public.institution_logos FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.user_id = auth.uid()
    AND p.role = 'institute'::public.user_role
    AND p.status = 'active'::public.user_status
));

CREATE POLICY "Active institute users can update logos"
ON public.institution_logos FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.user_id = auth.uid()
    AND p.role = 'institute'::public.user_role
    AND p.status = 'active'::public.user_status
));

CREATE POLICY "Active institute users can delete logos"
ON public.institution_logos FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.user_id = auth.uid()
    AND p.role = 'institute'::public.user_role
    AND p.status = 'active'::public.user_status
));

CREATE POLICY "Active institute users can view all logos"
ON public.institution_logos FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.user_id = auth.uid()
    AND p.role = 'institute'::public.user_role
    AND p.status = 'active'::public.user_status
));

-- 4. institution-logos storage bucket: require active institute
DROP POLICY IF EXISTS "Institute users can upload institution logo files" ON storage.objects;
DROP POLICY IF EXISTS "Institute users can update institution logo files" ON storage.objects;
DROP POLICY IF EXISTS "Institute users can delete institution logo files" ON storage.objects;
DROP POLICY IF EXISTS "Institute users can list institution logos" ON storage.objects;

CREATE POLICY "Active institute users can upload institution logo files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'institution-logos'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'institute'::public.user_role
      AND p.status = 'active'::public.user_status
  )
);

CREATE POLICY "Active institute users can update institution logo files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'institution-logos'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'institute'::public.user_role
      AND p.status = 'active'::public.user_status
  )
);

CREATE POLICY "Active institute users can delete institution logo files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'institution-logos'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'institute'::public.user_role
      AND p.status = 'active'::public.user_status
  )
);

CREATE POLICY "Active institute users can list institution logo files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'institution-logos'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'institute'::public.user_role
      AND p.status = 'active'::public.user_status
  )
);
