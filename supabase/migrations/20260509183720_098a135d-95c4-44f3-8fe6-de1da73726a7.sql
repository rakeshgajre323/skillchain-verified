-- Simple site-wide visitor counter
CREATE TABLE IF NOT EXISTS public.site_stats (
  id integer PRIMARY KEY DEFAULT 1,
  visitor_count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_stats_singleton CHECK (id = 1)
);

INSERT INTO public.site_stats (id, visitor_count)
VALUES (1, 3955908)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_stats_public_read" ON public.site_stats;
CREATE POLICY "site_stats_public_read" ON public.site_stats
  FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE public.site_stats
  SET visitor_count = visitor_count + 1,
      updated_at = now()
  WHERE id = 1
  RETURNING visitor_count INTO new_count;
  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_visitor_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_visitor_count() TO anon, authenticated;