-- Evita la escalada de privilegios: un usuario NO puede cambiarse su propio `role`
-- (p.ej. ascenderse a teacher/admin) mediante un UPDATE directo a public.users.
-- Admin/servicio (service_role sin auth.uid(), o un admin actuando sobre OTRA fila) sí pueden.
CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.id AND NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role; -- revierte silenciosamente el intento de auto-escalada
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_role_change ON public.users;
CREATE TRIGGER trg_prevent_self_role_change
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_change();
