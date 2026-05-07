-- Mark all pending users as active and default new users to active (skip OTP step)
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'active'::public.user_status;
UPDATE public.profiles SET status = 'active'::public.user_status WHERE status = 'pending'::public.user_status;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, role, full_name, phone, appar_id,
    institute_name, company_name, website, address, status
  )
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role),
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'appar_id',
    NEW.raw_user_meta_data ->> 'institute_name',
    NEW.raw_user_meta_data ->> 'company_name',
    NEW.raw_user_meta_data ->> 'website',
    NEW.raw_user_meta_data ->> 'address',
    'active'::public.user_status
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;