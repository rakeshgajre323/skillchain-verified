-- Free up the appar_id from the stale duplicate profile
UPDATE public.profiles
SET appar_id = NULL
WHERE user_id = 'cd5f4568-4787-4496-b256-8d56851348f1'
  AND appar_id = '11223344';

-- Assign appar_id to the active profile
UPDATE public.profiles
SET appar_id = '11223344'
WHERE user_id = '1b4c3544-e734-4855-b61f-4cef4bc3f999';

-- Re-route the existing credential
UPDATE public.credentials
SET user_id = '1b4c3544-e734-4855-b61f-4cef4bc3f999'
WHERE id = 'f38a21f0-4910-4b58-b6f2-9073448fa69c';