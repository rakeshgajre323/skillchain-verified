CREATE POLICY "Admins can read certificates"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'certificates' AND public.has_role(auth.uid(), 'admin'));