
DROP POLICY IF EXISTS "Users can delete their own OTP" ON public.otp_codes;
CREATE POLICY "Users can delete their own OTP"
ON public.otp_codes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DO $$ BEGIN
  CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected', 'issued');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.credential_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  issuer_id uuid NOT NULL,
  title text NOT NULL,
  credential_type text NOT NULL DEFAULT 'certificate',
  description text,
  student_full_name text NOT NULL,
  student_email text NOT NULL,
  student_appar_id text NOT NULL,
  student_roll_number text NOT NULL,
  student_phone text NOT NULL,
  status public.request_status NOT NULL DEFAULT 'pending',
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credential_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own requests" ON public.credential_requests;
CREATE POLICY "Students can view their own requests"
ON public.credential_requests FOR SELECT
TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can create their own requests" ON public.credential_requests;
CREATE POLICY "Students can create their own requests"
ON public.credential_requests FOR INSERT
TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can cancel their pending requests" ON public.credential_requests;
CREATE POLICY "Students can cancel their pending requests"
ON public.credential_requests FOR DELETE
TO authenticated USING (auth.uid() = student_id AND status = 'pending');

DROP POLICY IF EXISTS "Issuers can view requests sent to them" ON public.credential_requests;
CREATE POLICY "Issuers can view requests sent to them"
ON public.credential_requests FOR SELECT
TO authenticated USING (auth.uid() = issuer_id);

DROP POLICY IF EXISTS "Issuers can update requests sent to them" ON public.credential_requests;
CREATE POLICY "Issuers can update requests sent to them"
ON public.credential_requests FOR UPDATE
TO authenticated USING (auth.uid() = issuer_id);

DROP TRIGGER IF EXISTS credential_requests_updated_at ON public.credential_requests;
CREATE TRIGGER credential_requests_updated_at
BEFORE UPDATE ON public.credential_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_cred_requests_issuer ON public.credential_requests(issuer_id, status);
CREATE INDEX IF NOT EXISTS idx_cred_requests_student ON public.credential_requests(student_id, status);
