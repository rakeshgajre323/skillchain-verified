CREATE TABLE IF NOT EXISTS public.otp_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  event_type text NOT NULL,
  outcome text NOT NULL,
  attempts integer,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_audit_log_user_created
  ON public.otp_audit_log (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_otp_audit_log_created
  ON public.otp_audit_log (created_at DESC);

ALTER TABLE public.otp_audit_log ENABLE ROW LEVEL SECURITY;

-- Only active institute/company users can read logs (for support/debugging).
CREATE POLICY "Staff can view OTP audit log"
  ON public.otp_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role IN ('institute'::public.user_role, 'company'::public.user_role)
        AND p.status = 'active'::public.user_status
    )
  );

-- No INSERT/UPDATE/DELETE policies — service role bypasses RLS, clients cannot write.
