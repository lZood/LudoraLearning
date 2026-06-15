-- =============================================================================
-- 0003_private_audio_bucket — Fase 1: audios de alumnos (MENORES) en bucket PRIVADO.
-- ROMPE el acceso por URL pública del código viejo => se aplica JUNTO con el deploy
-- del código nuevo (que sube a {uid}/... y lee vía URLs firmadas server-side).
-- =============================================================================

UPDATE storage.buckets SET public = false WHERE id = 'student_audios';

DROP POLICY IF EXISTS "student_audios public read"          ON storage.objects;
DROP POLICY IF EXISTS "student_audios authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "student_audios owner upload"         ON storage.objects;
DROP POLICY IF EXISTS "student_audios owner read"           ON storage.objects;

-- Subida: el usuario autenticado solo dentro de su propia carpeta {uid}/...
CREATE POLICY "student_audios owner upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'student_audios' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Lectura: el dueño de la carpeta. (El acceso del MAESTRO se añade en Fase 2 vía is_teacher_of.)
CREATE POLICY "student_audios owner read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'student_audios' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Nota: service_role bypassa RLS => la generación de URLs firmadas server-side funciona.
