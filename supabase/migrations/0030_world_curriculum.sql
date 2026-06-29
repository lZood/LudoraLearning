-- =============================================================================
-- 0030_world_curriculum — RUTA / MUNDO Minecraft (Master Plan §3.2 fila 0030,
-- §5.1, §5.2). Da soporte de datos al WorldMap (biomas/estructuras) y al gating
-- adaptativo de la ruta, SIN romper prod:
--   · levels  ADD biome_key/theme_key/world_order/danger/map_color  → derivan de
--     `band` vía la biblia (src/lib/minecraft/biomes.ts). Decorativo + ordenación.
--   · units   ADD structure_key/kind/est_minutes → estructura del mundo
--     (casa/granja/mina/…); kind='keystone' = última unidad del bioma (Cofre del
--     Bioma → abre el siguiente).
--   · user_progress ADD unlocked_at/mastery_pct/stars/tested_out → estado de ruta
--     por alumno (estrellas de encantamiento, dominio de la unidad, atajo del mapa).
--   · unit_prerequisites → árbol de prerrequisitos de ruta con umbral de dominio.
--     Por defecto NO se define ninguno => la ruta se comporta lineal (orden actual).
--   · unlock_next_units(p_user) → desbloqueo de unidades server-side (lo orquesta
--     /api/lessons/complete). Salvaguarda: NUNCA re-bloquea in_progress/completed.
--
-- ADITIVO y RETROCOMPATIBLE: columnas IF NOT EXISTS con DEFAULT no destructivo;
-- sin filas en unit_prerequisites => fallback lineal == comportamiento de hoy.
-- =============================================================================

-- 1) MUNDO en `levels` = BIOMA (deriva de band; lo siembra seed-world-map.mjs).
ALTER TABLE public.levels
  ADD COLUMN IF NOT EXISTS biome_key   TEXT,
  ADD COLUMN IF NOT EXISTS theme_key   TEXT DEFAULT 'overworld',
  ADD COLUMN IF NOT EXISTS world_order INTEGER,
  ADD COLUMN IF NOT EXISTS danger      INTEGER,
  ADD COLUMN IF NOT EXISTS map_color   TEXT;

-- 2) ESTRUCTURA en `units` (casa/granja/mina/…); kind='keystone' = cierre de bioma.
ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS structure_key TEXT,
  ADD COLUMN IF NOT EXISTS kind          TEXT DEFAULT 'standard' CHECK (kind IN ('standard','keystone')),
  ADD COLUMN IF NOT EXISTS est_minutes   INTEGER;

-- 3) Estado de RUTA por alumno (estrellas, dominio de unidad, atajo del mapa).
ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS unlocked_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mastery_pct  INTEGER  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stars        SMALLINT DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  ADD COLUMN IF NOT EXISTS tested_out   BOOLEAN  DEFAULT false;

-- 4) Prerrequisitos de ruta entre unidades (árbol espiral). Por defecto VACÍO =>
--    la ruta cae al orden lineal de hoy (cero regresión). min_mastery_pct = umbral
--    de dominio del prereq para abrir la unidad dependiente.
CREATE TABLE IF NOT EXISTS public.unit_prerequisites (
  unit_id          UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  requires_unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  min_mastery_pct  INTEGER NOT NULL DEFAULT 60,
  PRIMARY KEY (unit_id, requires_unit_id)
);
CREATE INDEX IF NOT EXISTS unit_prerequisites_requires_idx
  ON public.unit_prerequisites(requires_unit_id);

-- ── RLS (patrón 0006/0028: catálogo legible por autenticados, CRUD admin) ─────
ALTER TABLE public.unit_prerequisites ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.unit_prerequisites TO authenticated;
GRANT ALL    ON public.unit_prerequisites TO service_role;
DROP POLICY IF EXISTS "unit_prerequisites readable" ON public.unit_prerequisites;
CREATE POLICY "unit_prerequisites readable" ON public.unit_prerequisites
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "unit_prerequisites admin" ON public.unit_prerequisites;
CREATE POLICY "unit_prerequisites admin" ON public.unit_prerequisites
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5) unlock_next_units — desbloquea las unidades cuyos prerrequisitos cumplen el
--    umbral de dominio. SECURITY DEFINER, service_role-only (la invoca el handler
--    /api/lessons/complete tras validar la sesión). Devuelve nº de desbloqueos.
--
--    Reglas (Plan §5.2, §5.3):
--      · SALVAGUARDA: jamás toca unidades ya in_progress/completed (no re-bloquea).
--      · Con prereqs definidos: abre solo si TODOS cumplen min_mastery_pct (o el
--        prereq ya está completed).
--      · Sin prereqs: fallback LINEAL == hoy (abre si la unidad inmediatamente
--        anterior en orden global está completada, o si es la primera).
--    "Desbloquear" = pasar status 'locked' → 'in_progress' + sellar unlocked_at.
CREATE OR REPLACE FUNCTION public.unlock_next_units(p_user UUID)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_unlocked    INTEGER := 0;
  r             RECORD;
  v_ok          BOOLEAN;
  v_prereqs     INTEGER;
  v_prev_status TEXT;
BEGIN
  IF p_user IS NULL THEN RAISE EXCEPTION 'no user'; END IF;

  -- Recorre todas las unidades del mundo en orden global (bioma, luego unidad).
  FOR r IN
    SELECT u.id AS unit_id, l.order_index AS level_order, u.order_index AS unit_order,
           COALESCE(up.status, 'locked') AS cur_status
      FROM public.units u
      JOIN public.levels l ON l.id = u.level_id
      LEFT JOIN public.user_progress up
        ON up.unit_id = u.id AND up.user_id = p_user
     ORDER BY l.order_index, u.order_index
  LOOP
    -- Salvaguarda: nunca re-bloquear ni re-evaluar lo ya iniciado/completado.
    IF r.cur_status IN ('in_progress', 'completed') THEN
      CONTINUE;
    END IF;

    -- ¿Tiene prerrequisitos explícitos de ruta?
    SELECT count(*) INTO v_prereqs
      FROM public.unit_prerequisites pr WHERE pr.unit_id = r.unit_id;

    IF v_prereqs > 0 THEN
      -- Abre solo si TODOS los prereqs cumplen el umbral (o ya están completados).
      SELECT bool_and(
               COALESCE(p.status, 'locked') = 'completed'
               OR COALESCE(p.mastery_pct, 0) >= pr.min_mastery_pct
             )
        INTO v_ok
        FROM public.unit_prerequisites pr
        LEFT JOIN public.user_progress p
          ON p.unit_id = pr.requires_unit_id AND p.user_id = p_user
       WHERE pr.unit_id = r.unit_id;
      v_ok := COALESCE(v_ok, false);
    ELSE
      -- Fallback lineal (== hoy): la unidad inmediatamente anterior debe estar
      -- completada; si no hay anterior, es la primera unidad => se abre.
      SELECT COALESCE(p3.status, 'locked')
        INTO v_prev_status
        FROM public.units u3
        JOIN public.levels l3 ON l3.id = u3.level_id
        LEFT JOIN public.user_progress p3
          ON p3.unit_id = u3.id AND p3.user_id = p_user
       WHERE (l3.order_index, u3.order_index) < (r.level_order, r.unit_order)
       ORDER BY l3.order_index DESC, u3.order_index DESC
       LIMIT 1;
      v_ok := (NOT FOUND) OR (v_prev_status = 'completed');
    END IF;

    IF v_ok THEN
      INSERT INTO public.user_progress (user_id, unit_id, status, unlocked_at)
        VALUES (p_user, r.unit_id, 'in_progress', now())
      ON CONFLICT (user_id, unit_id) DO UPDATE
        SET status      = 'in_progress',
            unlocked_at = COALESCE(public.user_progress.unlocked_at, now())
        WHERE public.user_progress.status = 'locked';
      v_unlocked := v_unlocked + 1;
    END IF;
  END LOOP;

  RETURN v_unlocked;
END;
$$;
REVOKE ALL ON FUNCTION public.unlock_next_units(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_next_units(UUID) TO service_role;

-- =============================================================================
-- DOWN: (additive-only; revertir solo en entornos no productivos)
-- DROP FUNCTION IF EXISTS public.unlock_next_units(UUID);
-- DROP TABLE IF EXISTS public.unit_prerequisites;
-- ALTER TABLE public.user_progress
--   DROP COLUMN IF EXISTS unlocked_at,
--   DROP COLUMN IF EXISTS mastery_pct,
--   DROP COLUMN IF EXISTS stars,
--   DROP COLUMN IF EXISTS tested_out;
-- ALTER TABLE public.units
--   DROP COLUMN IF EXISTS structure_key,
--   DROP COLUMN IF EXISTS kind,
--   DROP COLUMN IF EXISTS est_minutes;
-- ALTER TABLE public.levels
--   DROP COLUMN IF EXISTS biome_key,
--   DROP COLUMN IF EXISTS theme_key,
--   DROP COLUMN IF EXISTS world_order,
--   DROP COLUMN IF EXISTS danger,
--   DROP COLUMN IF EXISTS map_color;
-- =============================================================================
