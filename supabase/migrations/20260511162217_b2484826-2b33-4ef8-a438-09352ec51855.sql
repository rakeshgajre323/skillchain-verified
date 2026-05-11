CREATE POLICY "Students can read their issued certificate files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificates'
  AND EXISTS (
    SELECT 1 FROM public.credentials c
    WHERE c.certificate_file_url = storage.objects.name
      AND c.user_id = auth.uid()
  )
);