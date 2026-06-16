-- =============================================================================
-- 0012_skill_lessons — Rediseño de actividades estilo Duolingo:
-- las actividades pueden ser "lecciones por destreza" (type='lesson' + skill).
-- =============================================================================
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS skill TEXT;
-- Se relaja el CHECK de type para permitir 'lesson' (y mantener compat con tipos viejos).
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_type_check;
