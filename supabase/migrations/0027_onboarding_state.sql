-- Onboarding guiado (product tour): marca si el alumno ya completó o saltó la guía
-- de bienvenida del dashboard, para mostrarla UNA sola vez.
--
-- Flag NO sensible: a diferencia de english_level / has_completed_evaluation
-- (blindadas server-side por el trigger de 0018_protect_placement_columns), aquí es
-- correcto y más simple que el propio usuario lo marque vía la política RLS de UPDATE
-- existente sobre public.users (auth.uid() = id). Por eso NO se añade trigger de protección.
-- El trigger set_updated_at (0001) se dispara solo en el UPDATE.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN NOT NULL DEFAULT false;
