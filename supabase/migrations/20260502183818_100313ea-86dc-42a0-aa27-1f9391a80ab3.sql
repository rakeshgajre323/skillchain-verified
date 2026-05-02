-- Revoke EXECUTE on handle_new_user from all client-facing roles.
-- The function only needs to run via the on_auth_user_created trigger,
-- which runs as the table owner regardless of caller privileges.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
-- service_role keeps its implicit privileges via Postgres ownership; no grant needed.