-- Blinda la BANDA de nivel: un alumno NO puede sobrescribir su propio `english_level`
-- ni `has_completed_evaluation` con un UPDATE directo (anon key) a public.users.
-- Esto vuelve AUTORITATIVO el placement server-side: la banda solo la fija /api/placement/finalize
-- vía service_role (que no tiene auth.uid(), por lo que el trigger no revierte sus cambios).
-- Espejo de 0015_prevent_self_role_change: revierte silenciosamente el intento del propio usuario.
CREATE OR REPLACE FUNCTION public.prevent_self_placement_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() = OLD.id THEN
    IF NEW.english_level IS DISTINCT FROM OLD.english_level THEN
      NEW.english_level := OLD.english_level;
    END IF;
    IF NEW.has_completed_evaluation IS DISTINCT FROM OLD.has_completed_evaluation THEN
      NEW.has_completed_evaluation := OLD.has_completed_evaluation;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_placement_change ON public.users;
CREATE TRIGGER trg_prevent_self_placement_change
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_placement_change();
