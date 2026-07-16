
-- Restrict SECURITY DEFINER trigger functions from being callable via the API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Convert has_role() to SECURITY INVOKER. The user_roles table has a policy that lets
-- users read their own roles, so has_role(auth.uid(), ...) still works in RLS expressions,
-- and the function no longer bypasses RLS when called from the API.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;
