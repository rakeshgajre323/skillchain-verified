-- Replace broad public SELECT with a per-object policy that still allows
-- direct-URL access but blocks bucket-wide listing/enumeration.
DROP POLICY IF EXISTS "Certificate files are publicly viewable" ON storage.objects;

-- Owners (institutes) can list/read their own files
CREATE POLICY "Institutes can read their own certificate files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificates'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public bucket setting still allows direct-URL access to individual files
-- via the public CDN endpoint, but no SELECT policy means clients cannot
-- enumerate the bucket via the API. This is the recommended pattern.