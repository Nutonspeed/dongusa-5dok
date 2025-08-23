-- Create helper function public.exec_sql(sql TEXT)
-- This function allows running raw SQL via supabase.rpc('exec_sql', { sql })
-- SECURITY: created as SECURITY DEFINER so service role can execute it
-- Note: This is intended for use in controlled admin/service-role contexts only.

CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Try to execute provided SQL and return success notice
  EXECUTE sql;
  result := jsonb_build_object('ok', true, 'message', 'executed');
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  result := jsonb_build_object('ok', false, 'message', SQLERRM);
  RETURN result;
END;
$$;

-- Grant execute to authenticated roles (service_role already has rights).
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO PUBLIC;
