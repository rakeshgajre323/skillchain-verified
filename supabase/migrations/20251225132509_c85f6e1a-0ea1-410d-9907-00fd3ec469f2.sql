-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('student', 'institute', 'company');

-- Create enum for user status
CREATE TYPE public.user_status AS ENUM ('pending', 'active', 'suspended');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role user_role NOT NULL,
  full_name TEXT,
  phone TEXT,
  appar_id TEXT,
  institute_name TEXT,
  company_name TEXT,
  website TEXT,
  address TEXT,
  status user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create OTP table for email verification
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- OTP policies
CREATE POLICY "Users can view their own OTP"
ON public.otp_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OTP"
ON public.otp_codes FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage OTP (for edge functions)
CREATE POLICY "Service can insert OTP"
ON public.otp_codes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service can update OTP"
ON public.otp_codes FOR UPDATE
USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_otp_user_id ON public.otp_codes(user_id);
CREATE INDEX idx_otp_expires_at ON public.otp_codes(expires_at);