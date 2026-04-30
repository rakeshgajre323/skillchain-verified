-- Table
CREATE TABLE public.institution_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_institution_logos_active_order
  ON public.institution_logos (is_active, display_order);

ALTER TABLE public.institution_logos ENABLE ROW LEVEL SECURITY;

-- Public can read active logos
CREATE POLICY "Anyone can view active institution logos"
  ON public.institution_logos
  FOR SELECT
  USING (is_active = true);

-- Institute users can manage logos
CREATE POLICY "Institute users can insert logos"
  ON public.institution_logos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'institute'
    )
  );

CREATE POLICY "Institute users can view all logos"
  ON public.institution_logos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'institute'
    )
  );

CREATE POLICY "Institute users can update logos"
  ON public.institution_logos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'institute'
    )
  );

CREATE POLICY "Institute users can delete logos"
  ON public.institution_logos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'institute'
    )
  );

CREATE TRIGGER trg_institution_logos_updated_at
  BEFORE UPDATE ON public.institution_logos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('institution-logos', 'institution-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view institution logo files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'institution-logos');

CREATE POLICY "Institute users can upload institution logo files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'institution-logos' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'institute'
    )
  );

CREATE POLICY "Institute users can update institution logo files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'institution-logos' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'institute'
    )
  );

CREATE POLICY "Institute users can delete institution logo files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'institution-logos' AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'institute'
    )
  );