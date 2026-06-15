-- =============================================================================
-- 0002_questions_bank — Fase 1: banco de preguntas en BD (aditivo, no rompe prod)
-- Mueve questions.ts a BD. `is_correct` NUNCA se expone al cliente:
--   - question_options no tiene policy de SELECT para authenticated/anon.
--   - El cliente lee el examen vía RPC get_exam_questions() (sin is_correct).
--   - El grading se hace server-side (service_role) o vía RPC grade_choice().
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.skills (
  id                     TEXT PRIMARY KEY,
  name                   TEXT,
  category               TEXT,
  cefr_level             TEXT,
  prerequisite_skill_id  TEXT REFERENCES public.skills(id),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id                TEXT PRIMARY KEY,
  skill_id          TEXT REFERENCES public.skills(id),
  level             TEXT NOT NULL,
  category          TEXT NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('multiple-choice','image-choice','audio-listening','text-input','audio-record')),
  text              TEXT NOT NULL,
  audio_url         TEXT,
  grading_rubric    TEXT,
  expected_keywords TEXT[],
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  version           INTEGER NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS questions_level_idx    ON public.questions(level);
CREATE INDEX IF NOT EXISTS questions_category_idx ON public.questions(category);
CREATE INDEX IF NOT EXISTS questions_skill_idx    ON public.questions(skill_id);

CREATE TABLE IF NOT EXISTS public.question_options (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  text         TEXT NOT NULL,
  image_url    TEXT,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE,
  order_index  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS question_options_question_idx ON public.question_options(question_id);

-- FK opcional de evaluation_results.question_id -> questions.id (datos viejos pueden no cumplir; no forzar)
-- Se deja sin FK estricta para no romper inserts de IDs legados.

-- ── RLS + grants ─────────────────────────────────────────────────────────────
ALTER TABLE public.skills            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options  ENABLE ROW LEVEL SECURITY;

-- skills y questions: lectura para usuarios autenticados (sin datos sensibles).
DROP POLICY IF EXISTS "skills readable"    ON public.skills;
DROP POLICY IF EXISTS "questions readable" ON public.questions;
CREATE POLICY "skills readable"    ON public.skills    FOR SELECT TO authenticated USING (true);
CREATE POLICY "questions readable" ON public.questions FOR SELECT TO authenticated USING (is_active);

-- question_options: SIN policy de SELECT => authenticated/anon no pueden leerla (oculta is_correct).
-- service_role (bypassa RLS) y las funciones SECURITY DEFINER son las únicas que la leen.

GRANT SELECT ON public.skills, public.questions TO authenticated;
GRANT ALL    ON public.skills, public.questions, public.question_options TO service_role;
-- Admin/teacher gestionan el banco (CMS).
DROP POLICY IF EXISTS "admin manage skills"   ON public.skills;
DROP POLICY IF EXISTS "admin manage questions" ON public.questions;
DROP POLICY IF EXISTS "admin manage options"  ON public.question_options;
CREATE POLICY "admin manage skills"    ON public.skills           FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin manage questions" ON public.questions        FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin manage options"   ON public.question_options FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── RPCs ─────────────────────────────────────────────────────────────────────
-- Banco de examen para el cliente: SIN is_correct, SIN rubric/keywords (esos son server-side).
CREATE OR REPLACE FUNCTION public.get_exam_questions(p_level TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(jsonb_agg(q ORDER BY q->>'level', q->>'id'), '[]'::jsonb)
  FROM (
    SELECT jsonb_build_object(
      'id', qu.id,
      'skillId', qu.skill_id,
      'level', qu.level,
      'category', qu.category,
      'type', qu.type,
      'text', qu.text,
      'audioUrl', qu.audio_url,
      'options', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object('id', o.id, 'text', o.text, 'imageUrl', o.image_url) ORDER BY o.order_index), '[]'::jsonb)
        FROM public.question_options o WHERE o.question_id = qu.id
      )
    ) AS q
    FROM public.questions qu
    WHERE qu.is_active AND (p_level IS NULL OR qu.level = p_level)
  ) s;
$$;

-- Grading de opción (MC/image): devuelve si la opción elegida es correcta, sin exponer el resto.
CREATE OR REPLACE FUNCTION public.grade_choice(p_question_id TEXT, p_option_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_correct FROM public.question_options
                   WHERE id = p_option_id AND question_id = p_question_id), FALSE);
$$;

GRANT EXECUTE ON FUNCTION public.get_exam_questions(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grade_choice(TEXT, UUID) TO authenticated, service_role;
