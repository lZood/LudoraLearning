-- =============================================================================
-- 0005_pronunciation — Fase 3: scoring de pronunciación (provider-agnóstico) +
-- RPC seguro para que el alumno guarde su propio score. Feedback dual lo escribe
-- el endpoint server-side (service_role) en feedback_sessions.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.pronunciation_scores (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_result_id UUID REFERENCES public.evaluation_results(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transcript           TEXT,
  reference_text       TEXT,
  overall_score        NUMERIC(5,2),
  accuracy_score       NUMERIC(5,2),
  fluency_score        NUMERIC(5,2),
  completeness_score   NUMERIC(5,2),
  prosody_score        NUMERIC(5,2),
  words                JSONB,
  provider             TEXT NOT NULL DEFAULT 'gemini',
  provider_raw         JSONB,
  confidence           NUMERIC,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pronunciation_user_idx   ON public.pronunciation_scores(user_id);
CREATE INDEX IF NOT EXISTS pronunciation_result_idx ON public.pronunciation_scores(evaluation_result_id);

ALTER TABLE public.pronunciation_scores ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.pronunciation_scores TO authenticated;
GRANT ALL    ON public.pronunciation_scores TO service_role;

DROP POLICY IF EXISTS "pron student read" ON public.pronunciation_scores;
DROP POLICY IF EXISTS "pron teacher read" ON public.pronunciation_scores;
DROP POLICY IF EXISTS "pron admin"        ON public.pronunciation_scores;
CREATE POLICY "pron student read" ON public.pronunciation_scores FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "pron teacher read" ON public.pronunciation_scores FOR SELECT USING (public.is_teacher_of(user_id));
CREATE POLICY "pron admin"        ON public.pronunciation_scores FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
-- INSERT directo: solo service_role (bypassa RLS) o vía RPC SECURITY DEFINER de abajo.

-- El alumno guarda el score de SU propio reactivo (valida pertenencia).
CREATE OR REPLACE FUNCTION public.save_pronunciation_score(
  p_result_id UUID,
  p_transcript TEXT,
  p_overall NUMERIC,
  p_accuracy NUMERIC,
  p_fluency NUMERIC,
  p_reference TEXT,
  p_raw JSONB
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user UUID; v_id UUID;
BEGIN
  SELECT user_id INTO v_user FROM public.evaluation_results WHERE id = p_result_id;
  IF v_user IS NULL OR v_user <> auth.uid() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  INSERT INTO public.pronunciation_scores
    (evaluation_result_id, user_id, transcript, overall_score, accuracy_score, fluency_score, reference_text, provider, provider_raw)
  VALUES (p_result_id, v_user, p_transcript, p_overall, p_accuracy, p_fluency, p_reference, 'gemini', p_raw)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.save_pronunciation_score(UUID,TEXT,NUMERIC,NUMERIC,NUMERIC,TEXT,JSONB) TO authenticated;
