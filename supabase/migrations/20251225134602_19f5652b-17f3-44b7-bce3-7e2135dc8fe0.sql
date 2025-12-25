-- Create credentials table
CREATE TABLE public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  issuer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  issuer_name TEXT NOT NULL,
  credential_type TEXT NOT NULL DEFAULT 'certificate',
  issued_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- Policies for credentials
CREATE POLICY "Users can view their own credentials"
ON public.credentials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view credentials they issued"
ON public.credentials FOR SELECT
USING (auth.uid() = issuer_id);

CREATE POLICY "Issuers can insert credentials"
ON public.credentials FOR INSERT
WITH CHECK (auth.uid() = issuer_id);

CREATE POLICY "Issuers can update credentials they issued"
ON public.credentials FOR UPDATE
USING (auth.uid() = issuer_id);

-- Create trigger for updated_at
CREATE TRIGGER update_credentials_updated_at
BEFORE UPDATE ON public.credentials
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_credentials_user_id ON public.credentials(user_id);
CREATE INDEX idx_credentials_issuer_id ON public.credentials(issuer_id);
CREATE INDEX idx_credentials_status ON public.credentials(verification_status);