-- Endurecimiento de seguridad (hallazgos de la revisión automática).

-- 1) Solo maestros/admin pueden crear/poseer grupos. Antes la policy solo exigía
--    teacher_id = auth.uid(), así que CUALQUIER alumno podía insertar un grupo con su
--    propio uid, volverse "maestro" vía is_teacher_of y leer datos de otros alumnos.
DROP POLICY IF EXISTS "group owner manage" ON public.groups;
CREATE POLICY "group owner manage" ON public.groups FOR ALL
  USING (teacher_id = auth.uid() AND public.current_app_role() IN ('teacher', 'admin'))
  WITH CHECK (teacher_id = auth.uid() AND public.current_app_role() IN ('teacher', 'admin'));

-- 2) Faltaba la policy UPDATE en evaluations: el UPDATE del resultado detallado
--    (category_levels, ai_oracle_verdict, evaluation_history, status) afectaba 0 filas
--    y nunca se persistía. Se permite al dueño actualizar su propia evaluación.
DROP POLICY IF EXISTS "Users can update own evaluations." ON public.evaluations;
CREATE POLICY "Users can update own evaluations." ON public.evaluations FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3) Ata audio_path al dueño en evaluation_results (defensa contra IDOR de audios):
--    un alumno ya no puede guardar en su propia fila una ruta que apunte a la carpeta
--    de otro alumno (la firma con service_role en el portal maestro la habría expuesto).
DROP POLICY IF EXISTS "Users can insert own results." ON public.evaluation_results;
CREATE POLICY "Users can insert own results." ON public.evaluation_results FOR INSERT
  WITH CHECK (auth.uid() = user_id AND (audio_path IS NULL OR audio_path LIKE auth.uid()::text || '/%'));
