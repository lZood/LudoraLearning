-- =============================================================================
-- 0029_content_v2_flags — Versionado de contenido de lección + feature-flags de
-- rollout (Master Plan §3.1, §3.2, §8). Habilita el método "ejemplos primero"
-- (lecciones v2) SIN romper prod:
--   · activities.content_version (SMALLINT DEFAULT 1) => ausente/1 = v1 = hoy.
--   · activities.content_v2 (JSONB) = staging shadow; el player de prod sigue
--     leyendo `content` hasta el cutover (0033). Rollback trivial: `content`
--     intacto + apagar la flag.
--   · app_config flags (kill-switch global + % de cohorte + paso present) que se
--     flipan en runtime SIN redeploy.
--   · is_v2_user(uid): bucketing determinista por usuario (hashtext % 100 < pct),
--     SECURITY DEFINER para poder leer app_config (REVOCADA a authenticated).
--
-- ADITIVO y RETROCOMPATIBLE: columnas IF NOT EXISTS con DEFAULT no destructivo;
-- flags arrancan OFF => comportamiento idéntico al actual.
-- =============================================================================

-- 1) Versionado de contenido en activities (denormalizado para no escanear JSONB).
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS content_version SMALLINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS content_v2      JSONB;

-- Índice parcial: solo indexa las filas ya promovidas a v2 (consultas de rollout/QA).
CREATE INDEX IF NOT EXISTS activities_content_v2_idx
  ON public.activities(id)
  WHERE content_version = 2;

-- 2) Feature-flags de rollout (app_config 0022: key TEXT PK, value TEXT NOT NULL).
--    Se insertan OFF; subir/bajar canary = UPDATE en runtime (sin push a main).
--    ON CONFLICT DO NOTHING: no piso un valor ya ajustado en el entorno.
INSERT INTO public.app_config (key, value) VALUES
  ('lessons_v2_enabled',   'false'),  -- kill-switch global (si false => nadie v2)
  ('lessons_v2_cohort_pct','0'),      -- 0–100: % de usuarios en cohorte v2
  ('present_step_enabled', 'false')   -- separa el riesgo del paso "TE MUESTRO"
ON CONFLICT (key) DO NOTHING;

-- 3) is_v2_user — ¿este usuario cae en la cohorte v2? Determinista y estable por
--    usuario. SECURITY DEFINER porque app_config está REVOCADA a authenticated
--    (RLS sin políticas); la función corre como owner y la lee de forma segura.
--    hashtext() puede ser negativo => se normaliza a [0,100).
CREATE OR REPLACE FUNCTION public.is_v2_user(p_uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enabled BOOLEAN;
  v_pct     INTEGER;
  v_bucket  INTEGER;
BEGIN
  IF p_uid IS NULL THEN RETURN false; END IF;

  -- Kill-switch global.
  SELECT (value = 'true') INTO v_enabled FROM public.app_config WHERE key = 'lessons_v2_enabled';
  IF NOT COALESCE(v_enabled, false) THEN RETURN false; END IF;

  -- Porcentaje de cohorte (0–100); valor ausente/no numérico => 0.
  SELECT COALESCE(NULLIF(value, '')::int, 0) INTO v_pct FROM public.app_config WHERE key = 'lessons_v2_cohort_pct';
  v_pct := COALESCE(v_pct, 0);
  IF v_pct <= 0   THEN RETURN false; END IF;
  IF v_pct >= 100 THEN RETURN true;  END IF;

  -- Bucketing determinista en [0,100): mismo usuario => mismo bucket siempre.
  v_bucket := ((hashtext(p_uid::text) % 100) + 100) % 100;
  RETURN v_bucket < v_pct;
END;
$$;

REVOKE ALL ON FUNCTION public.is_v2_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_v2_user(UUID) TO authenticated, service_role;

-- =============================================================================
-- DOWN: (las flags/columnas NO se revierten estando en prod; solo no-prod)
-- DROP FUNCTION IF EXISTS public.is_v2_user(UUID);
-- DELETE FROM public.app_config WHERE key IN ('lessons_v2_enabled','lessons_v2_cohort_pct','present_step_enabled');
-- DROP INDEX IF EXISTS public.activities_content_v2_idx;
-- ALTER TABLE public.activities DROP COLUMN IF EXISTS content_v2;
-- ALTER TABLE public.activities DROP COLUMN IF EXISTS content_version;
-- =============================================================================
