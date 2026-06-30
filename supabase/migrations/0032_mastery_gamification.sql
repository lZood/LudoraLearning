-- =============================================================================
-- 0032_mastery_gamification — GAMIFICACIÓN LIGADA AL DOMINIO (Master Plan §3.2
-- fila 0032, §6 F5). El XP se parte en Esfuerzo (lo paga complete_lesson, 0023)
-- + Encantamiento (lo paga ESTA migración por cruces de banda reales). Esmeraldas
-- (= user_gamification.coins) solo compran cosméticos/protección: nada de pay-to-learn.
--
-- ADITIVO y RETROCOMPATIBLE: nada del esquema actual cambia; todo IF NOT EXISTS /
-- OR REPLACE. NO redefine grant_progress_for ni ninguna RPC existente. El XP de
-- Encantamiento se suma DIRECTO a user_gamification.xp_total de forma IDEMPOTENTE
-- por el ledger concept_mastery_grants (PK por banda => sin doble-pago). La racha
-- (consumir Antorcha de Respaldo al saltar 1 día) la cablea el orquestador aparte;
-- aquí solo se añade el contador streak_freezes y su compra.
--
-- DEGRADACIÓN ELEGANTE: con user_concept_mastery vacío, apply_lesson_attempts (0031)
-- devuelve 0 cruces => grant_mastery_rewards es no-op y solo se paga XP de Esfuerzo.
--
-- Orquestación canónica (la cablea el orquestador en /api/lessons/complete, §3.5):
--   1) apply_lesson_attempts  -> {enchantments:[{conceptId,conceptSlug,bandBefore,
--                                  bandAfter,thetaAfter,crossedUp}], applied}
--   2) grant_mastery_rewards(user, enchantments)  -> XP de Encantamiento + Contratos
--   3) complete_lesson        -> XP de Esfuerzo
--   4) unlock_next_units      -> gating
-- =============================================================================

-- ── 0) Antorcha de Respaldo (streak-freeze): contador en el estado del alumno ──
-- Consumo de la Antorcha al saltar 1 día lo hace el orquestador (tweak quirúrgico
-- de la racha); aquí solo se declara el contador y su compra (sumidero de Esmeraldas).
ALTER TABLE public.user_gamification ADD COLUMN IF NOT EXISTS streak_freezes INT NOT NULL DEFAULT 0;

-- =============================================================================
-- 1) concept_mastery_grants — LEDGER IDEMPOTENTE de XP de Encantamiento.
--    Una fila por (usuario, concepto, banda alcanzada): garantiza que cada cruce
--    de banda se pague UNA sola vez (patrón lesson_xp_grants de 0023). A prueba de
--    reset: persiste aunque el alumno toque otras tablas; solo service_role escribe.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.concept_mastery_grants (
  user_id    UUID NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  band       TEXT NOT NULL CHECK (band IN ('aprendiendo','competente','dominado')),
  xp         INT  NOT NULL DEFAULT 0,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, concept_id, band)
);
ALTER TABLE public.concept_mastery_grants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.concept_mastery_grants FROM anon, authenticated;
GRANT SELECT ON public.concept_mastery_grants TO authenticated;   -- lectura propia (vía policy)
GRANT ALL    ON public.concept_mastery_grants TO service_role;
DROP POLICY IF EXISTS "cmg self read" ON public.concept_mastery_grants;
CREATE POLICY "cmg self read" ON public.concept_mastery_grants
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- =============================================================================
-- 2) quest_templates + daily_quests — CONTRATOS DEL ALDEANO (metas diarias).
--    Plantillas = catálogo legible; daily_quests = instancia diaria por usuario.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.quest_templates (
  key          TEXT PRIMARY KEY,
  label        TEXT NOT NULL,
  description  TEXT,
  target       INT  NOT NULL DEFAULT 1,
  reward_xp    INT  NOT NULL DEFAULT 0,
  reward_coins INT  NOT NULL DEFAULT 0,
  mc_icon      TEXT,                       -- clave de bloque/ícono Minecraft (biblia)
  sort         INT  NOT NULL DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT true
);

-- Seed de Contratos del Aldeano (idempotente; tunear recompensas no rompe rachas ya
-- otorgadas porque daily_quests congela target/reward al generarse).
INSERT INTO public.quest_templates (key, label, description, target, reward_xp, reward_coins, mc_icon, sort) VALUES
  ('extrae_mineral_nuevo', 'Extrae mineral nuevo', 'Aprende conceptos nuevos hasta subir de Encantamiento.', 3, 15, 10, 'emerald_ore', 1),
  ('refuerza_mina',        'Refuerza la mina',     'Repara bloques desgastados haciendo repasos.',           5, 10, 10, 'pickaxe',     2),
  ('forja_racha',          'Forja tu racha',       'Mantén tus antorchas encendidas hoy.',                   1, 10,  5, 'torch',       3)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label, description = EXCLUDED.description, target = EXCLUDED.target,
  reward_xp = EXCLUDED.reward_xp, reward_coins = EXCLUDED.reward_coins,
  mc_icon = EXCLUDED.mc_icon, sort = EXCLUDED.sort;

CREATE TABLE IF NOT EXISTS public.daily_quests (
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quest_key    TEXT NOT NULL REFERENCES public.quest_templates(key) ON DELETE CASCADE,
  day          DATE NOT NULL DEFAULT current_date,
  progress     INT  NOT NULL DEFAULT 0,
  target       INT  NOT NULL DEFAULT 1,    -- congelado del template al generarse
  reward_xp    INT  NOT NULL DEFAULT 0,    -- congelado del template al generarse
  reward_coins INT  NOT NULL DEFAULT 0,    -- congelado del template al generarse
  claimed      BOOLEAN NOT NULL DEFAULT false,
  claimed_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, quest_key, day)
);
CREATE INDEX IF NOT EXISTS daily_quests_user_day_idx ON public.daily_quests(user_id, day);

ALTER TABLE public.quest_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests    ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.quest_templates TO authenticated, anon;
GRANT SELECT ON public.daily_quests    TO authenticated;
GRANT ALL    ON public.quest_templates, public.daily_quests TO service_role;
DROP POLICY IF EXISTS "quest_templates read" ON public.quest_templates;
CREATE POLICY "quest_templates read" ON public.quest_templates FOR SELECT USING (true);
DROP POLICY IF EXISTS "daily_quests self read" ON public.daily_quests;
CREATE POLICY "daily_quests self read" ON public.daily_quests
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- =============================================================================
-- 3) Cosméticos nuevos (sumideros de Esmeraldas ligados a la temática propia).
--    Solo se insertan si el tipo encaja con el esquema de cosmetic_catalog (TEXT
--    libre); reusan el patrón de 0019. price_coins > 0 = comprable en /api/shop/buy.
-- =============================================================================
INSERT INTO public.cosmetic_catalog (id, type, name, value, price_coins, required_league_tier, sort) VALUES
  ('tool_skin_pico_encantado', 'tool_skin',     'Pico Encantado',     'enchanted_pickaxe', 400, NULL, 30),
  ('tool_skin_hacha_rubi',     'tool_skin',     'Hacha de Rubí',      'ruby_axe',          400, NULL, 31),
  ('mascot_outfit_lia_minera', 'mascot_outfit', 'Lía Minera',         'lia_miner',         600, NULL, 32),
  ('mascot_outfit_sam_apicultor','mascot_outfit','Sam Apicultor Real','sam_beekeeper',     600, NULL, 33)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4) v_user_enchantments — vista de conveniencia: el dominio por concepto leído
--    como "Encantamiento" (banda + % + nivel I–V derivado de theta). Sin DB nueva;
--    la consume EnchantTable. Hereda RLS de user_concept_mastery (security_invoker).
-- =============================================================================
CREATE OR REPLACE VIEW public.v_user_enchantments
  WITH (security_invoker = true) AS
  SELECT m.user_id,
         m.concept_id,
         c.slug          AS concept_slug,
         c.label         AS concept_label,
         c.skill         AS skill,
         m.theta,
         m.band,
         public._mc_mastery_pct(m.theta)                         AS mastery_pct,
         GREATEST(1, LEAST(5, floor((m.theta - 1) / 1.0)::int + 1)) AS enchant_level,  -- I–V
         m.attempts,
         m.next_review_at
    FROM public.user_concept_mastery m
    JOIN public.concepts c ON c.id = m.concept_id;
GRANT SELECT ON public.v_user_enchantments TO authenticated, service_role;

-- =============================================================================
-- 5) _mc_add_enchant_xp — helper INTERNO: suma XP/Esmeraldas de forma directa e
--    idempotente-por-llamante (NO toca racha/last_active_date; eso lo lleva el
--    orquestador). Refleja la maestría en xp_total, activity_log y leaderboard
--    semanal (capado a 1500 como grant_progress_for). NO redefine grant_progress_for.
-- =============================================================================
CREATE OR REPLACE FUNCTION public._mc_add_enchant_xp(
  p_user UUID, p_xp INT, p_coins INT, p_source TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  g          public.user_gamification;
  wk         DATE := date_trunc('week', current_date)::date;
  cur_points INT;
  add_points INT;
  weekly_cap CONSTANT INT := 1500;
BEGIN
  IF p_user IS NULL THEN RAISE EXCEPTION 'no user'; END IF;
  IF COALESCE(p_xp, 0) = 0 AND COALESCE(p_coins, 0) = 0 THEN RETURN; END IF;

  INSERT INTO public.user_gamification (user_id, current_league_id)
    VALUES (p_user, (SELECT id FROM public.leagues WHERE tier_order = 1 LIMIT 1))
    ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO g FROM public.user_gamification WHERE user_id = p_user FOR UPDATE;

  UPDATE public.user_gamification SET
    xp_total     = xp_total + GREATEST(p_xp, 0),
    coins        = coins + GREATEST(p_coins, 0),
    level_number = GREATEST(1, floor((xp_total + GREATEST(p_xp, 0)) / 100.0)::int + 1),
    updated_at   = now()
  WHERE user_id = p_user
  RETURNING * INTO g;

  IF COALESCE(p_xp, 0) <> 0 THEN
    INSERT INTO public.activity_log (user_id, xp_earned, source) VALUES (p_user, p_xp, p_source);
  END IF;
  IF COALESCE(p_coins, 0) <> 0 THEN
    INSERT INTO public.coin_transactions (user_id, amount, reason) VALUES (p_user, p_coins, p_source);
  END IF;

  -- Leaderboard semanal con el mismo tope que grant_progress_for (la maestría
  -- también cuenta para ligas/Cofre, pero respeta el cap anti-inflado).
  IF COALESCE(p_xp, 0) > 0 THEN
    INSERT INTO public.leaderboard_entries (user_id, league_id, week_start, points)
      VALUES (p_user, g.current_league_id, wk, 0)
      ON CONFLICT (user_id, week_start) DO NOTHING;
    SELECT points INTO cur_points FROM public.leaderboard_entries
      WHERE user_id = p_user AND week_start = wk FOR UPDATE;
    add_points := LEAST(GREATEST(p_xp, 0), GREATEST(weekly_cap - COALESCE(cur_points, 0), 0));
    IF add_points > 0 THEN
      UPDATE public.leaderboard_entries
         SET points = points + add_points, league_id = COALESCE(league_id, g.current_league_id)
       WHERE user_id = p_user AND week_start = wk;
    END IF;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public._mc_add_enchant_xp(UUID, INT, INT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._mc_add_enchant_xp(UUID, INT, INT, TEXT) TO service_role;

-- =============================================================================
-- 6) roll_daily_quests — genera/asegura los Contratos del día (idempotente).
--    Inserta una fila por plantilla activa para current_date, congelando
--    target/reward. Devuelve los contratos de hoy. Autenticado (solo lo suyo) o
--    service_role (lo invoca grant_mastery_rewards / la API de quests).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.roll_daily_quests(p_user UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_out JSONB;
BEGIN
  IF p_user IS NULL THEN RAISE EXCEPTION 'no user'; END IF;
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user THEN RAISE EXCEPTION 'forbidden'; END IF;

  INSERT INTO public.daily_quests (user_id, quest_key, day, progress, target, reward_xp, reward_coins)
  SELECT p_user, t.key, current_date, 0, t.target, t.reward_xp, t.reward_coins
    FROM public.quest_templates t
   WHERE t.active
  ON CONFLICT (user_id, quest_key, day) DO NOTHING;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'questKey',    q.quest_key,
           'label',       t.label,
           'description', t.description,
           'mcIcon',      t.mc_icon,
           'progress',    q.progress,
           'target',      q.target,
           'rewardXp',    q.reward_xp,
           'rewardCoins', q.reward_coins,
           'claimed',     q.claimed,
           'done',        q.progress >= q.target
         ) ORDER BY t.sort), '[]'::jsonb)
    INTO v_out
    FROM public.daily_quests q
    JOIN public.quest_templates t ON t.key = q.quest_key
   WHERE q.user_id = p_user AND q.day = current_date;

  RETURN COALESCE(v_out, '[]'::jsonb);
END;
$$;
REVOKE ALL ON FUNCTION public.roll_daily_quests(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.roll_daily_quests(UUID) TO authenticated, service_role;

-- =============================================================================
-- 7) bump_daily_quest — avanza el progreso de un Contrato (no supera target).
--    Asegura el contrato del día primero. service_role-only: lo invoca el
--    orquestador (refuerza_mina por repasos, forja_racha por racha) y
--    grant_mastery_rewards (extrae_mineral_nuevo por cruces de banda).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.bump_daily_quest(
  p_user UUID, p_quest_key TEXT, p_amount INT DEFAULT 1)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_user IS NULL OR p_quest_key IS NULL THEN RETURN; END IF;
  IF COALESCE(p_amount, 0) <= 0 THEN RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.quest_templates WHERE key = p_quest_key AND active) THEN RETURN; END IF;

  -- Asegura la instancia del día (congela target/reward del template).
  INSERT INTO public.daily_quests (user_id, quest_key, day, progress, target, reward_xp, reward_coins)
  SELECT p_user, t.key, current_date, 0, t.target, t.reward_xp, t.reward_coins
    FROM public.quest_templates t WHERE t.key = p_quest_key AND t.active
  ON CONFLICT (user_id, quest_key, day) DO NOTHING;

  UPDATE public.daily_quests
     SET progress = LEAST(target, progress + p_amount)
   WHERE user_id = p_user AND quest_key = p_quest_key AND day = current_date;
END;
$$;
REVOKE ALL ON FUNCTION public.bump_daily_quest(UUID, TEXT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_daily_quest(UUID, TEXT, INT) TO service_role;

-- =============================================================================
-- 8) claim_daily_chest — reclama la recompensa de un Contrato cumplido (Cofre del
--    Día). IDEMPOTENTE: solo paga si progress>=target y aún no reclamado; el flag
--    claimed (con FOR UPDATE) evita doble-pago. La recompensa es FIJA del row (no
--    la decide el cliente) y el progreso solo lo mueve el servidor => safe.
--    service_role-only (lo invoca POST /api/quests tras validar sesión).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.claim_daily_chest(p_user UUID, p_quest_key TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  q public.daily_quests;
BEGIN
  IF p_user IS NULL OR p_quest_key IS NULL THEN RAISE EXCEPTION 'bad args'; END IF;

  SELECT * INTO q FROM public.daily_quests
   WHERE user_id = p_user AND quest_key = p_quest_key AND day = current_date
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'not_found');
  END IF;
  IF q.claimed THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'already_claimed');
  END IF;
  IF q.progress < q.target THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'incomplete',
                              'progress', q.progress, 'target', q.target);
  END IF;

  UPDATE public.daily_quests SET claimed = true, claimed_at = now()
   WHERE user_id = p_user AND quest_key = p_quest_key AND day = current_date;

  PERFORM public._mc_add_enchant_xp(p_user, q.reward_xp, q.reward_coins, 'contrato_aldeano');

  RETURN jsonb_build_object('claimed', true, 'rewardXp', q.reward_xp, 'rewardCoins', q.reward_coins);
END;
$$;
REVOKE ALL ON FUNCTION public.claim_daily_chest(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_daily_chest(UUID, TEXT) TO service_role;

-- =============================================================================
-- 9) grant_mastery_rewards — paga XP de ENCANTAMIENTO por los cruces de banda del
--    lote (Plan §3.5 paso 2). Recibe los eventos `enchantments` de
--    apply_lesson_attempts. Por cada evento crossedUp=true:
--      · INSERT en concept_mastery_grants ON CONFLICT DO NOTHING (ledger idempotente);
--      · si insertó (1ª vez para esa banda), suma el XP de la banda vía
--        _mc_add_enchant_xp (directo a xp_total; NO usa grant_progress_for).
--    Además avanza el Contrato 'extrae_mineral_nuevo' por cada cruce nuevo.
--    Devuelve {masteryXp, paid:[{conceptId,conceptSlug,band,xp}], enchantUps}.
--    service_role-only: lo cablea el orquestador en /api/lessons/complete.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.grant_mastery_rewards(p_user UUID, p_events JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ev            JSONB;
  v_raw_concept TEXT;
  v_concept_id  UUID;
  v_slug        TEXT;
  v_band        TEXT;
  v_xp          INT;
  v_rows        INT;
  v_total_xp    INT := 0;
  v_new_bands   INT := 0;   -- cruces realmente pagados (para el Contrato)
  v_paid        JSONB := '[]'::jsonb;
BEGIN
  IF p_user IS NULL THEN RAISE EXCEPTION 'no user'; END IF;
  IF p_events IS NULL OR jsonb_typeof(p_events) <> 'array' THEN
    RETURN jsonb_build_object('masteryXp', 0, 'paid', '[]'::jsonb, 'enchantUps', 0);
  END IF;

  FOR ev IN SELECT jsonb_array_elements(p_events) LOOP
    -- Solo cruces hacia arriba (banda nueva ganada).
    IF NOT COALESCE((ev->>'crossedUp')::boolean, false) THEN CONTINUE; END IF;

    v_band := ev->>'bandAfter';
    IF v_band IS NULL OR v_band NOT IN ('aprendiendo','competente','dominado') THEN CONTINUE; END IF;

    -- conceptId viene como uuid (texto) desde apply_lesson_attempts; tolera slug.
    v_raw_concept := COALESCE(ev->>'conceptId', ev->>'conceptSlug');
    v_concept_id  := NULL; v_slug := ev->>'conceptSlug';
    IF v_raw_concept IS NOT NULL THEN
      BEGIN
        SELECT id, slug INTO v_concept_id, v_slug FROM public.concepts WHERE id = v_raw_concept::uuid;
      EXCEPTION WHEN others THEN
        v_concept_id := NULL;
      END;
      IF v_concept_id IS NULL THEN
        SELECT id, slug INTO v_concept_id, v_slug FROM public.concepts WHERE slug = v_raw_concept;
      END IF;
    END IF;
    IF v_concept_id IS NULL THEN CONTINUE; END IF;

    -- XP de Encantamiento por banda alcanzada (grande, por maestría real).
    v_xp := CASE v_band WHEN 'dominado' THEN 30 WHEN 'competente' THEN 15 ELSE 5 END;

    -- Ledger idempotente: paga SOLO la 1ª vez que se alcanza esta banda.
    INSERT INTO public.concept_mastery_grants (user_id, concept_id, band, xp)
      VALUES (p_user, v_concept_id, v_band, v_xp)
      ON CONFLICT (user_id, concept_id, band) DO NOTHING;
    GET DIAGNOSTICS v_rows = ROW_COUNT;

    IF v_rows > 0 THEN
      PERFORM public._mc_add_enchant_xp(p_user, v_xp, 0, 'encantamiento');
      v_total_xp  := v_total_xp + v_xp;
      v_new_bands := v_new_bands + 1;
      v_paid := v_paid || jsonb_build_object(
        'conceptId', v_concept_id, 'conceptSlug', v_slug, 'band', v_band, 'xp', v_xp);
    END IF;
  END LOOP;

  -- Contrato del Aldeano: "Extrae mineral nuevo" avanza por cada banda nueva ganada.
  IF v_new_bands > 0 THEN
    PERFORM public.bump_daily_quest(p_user, 'extrae_mineral_nuevo', v_new_bands);
  END IF;

  RETURN jsonb_build_object('masteryXp', v_total_xp, 'paid', v_paid, 'enchantUps', v_new_bands);
END;
$$;
REVOKE ALL ON FUNCTION public.grant_mastery_rewards(UUID, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_mastery_rewards(UUID, JSONB) TO service_role;

-- =============================================================================
-- 10) buy_streak_freeze — compra una Antorcha de Respaldo (sumidero de Esmeraldas).
--     Cuesta 200 Esmeraldas, máximo 2 (patrón buy_shield de 0021). user_id
--     explícito + service_role-only: lo invoca POST /api/shop/buy tras validar sesión.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.buy_streak_freeze(p_user UUID)
RETURNS public.user_gamification LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  g            public.user_gamification;
  cost         CONSTANT INTEGER := 200;
  max_freezes  CONSTANT INTEGER := 2;
BEGIN
  IF p_user IS NULL THEN RAISE EXCEPTION 'no user'; END IF;

  INSERT INTO public.user_gamification (user_id, current_league_id)
    VALUES (p_user, (SELECT id FROM public.leagues WHERE tier_order = 1 LIMIT 1))
    ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO g FROM public.user_gamification WHERE user_id = p_user FOR UPDATE;

  IF COALESCE(g.streak_freezes, 0) >= max_freezes THEN RAISE EXCEPTION 'freeze_max'; END IF;
  IF g.coins < cost THEN RAISE EXCEPTION 'insufficient_coins'; END IF;

  UPDATE public.user_gamification
     SET coins = coins - cost, streak_freezes = COALESCE(streak_freezes, 0) + 1, updated_at = now()
   WHERE user_id = p_user RETURNING * INTO g;
  INSERT INTO public.coin_transactions (user_id, amount, reason) VALUES (p_user, -cost, 'streak_freeze');

  RETURN g;
END;
$$;
REVOKE ALL ON FUNCTION public.buy_streak_freeze(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.buy_streak_freeze(UUID) TO service_role;

-- =============================================================================
-- DOWN: (additive-only; revertir solo en entornos no productivos)
-- DROP FUNCTION IF EXISTS public.buy_streak_freeze(UUID);
-- DROP FUNCTION IF EXISTS public.grant_mastery_rewards(UUID, JSONB);
-- DROP FUNCTION IF EXISTS public.claim_daily_chest(UUID, TEXT);
-- DROP FUNCTION IF EXISTS public.bump_daily_quest(UUID, TEXT, INT);
-- DROP FUNCTION IF EXISTS public.roll_daily_quests(UUID);
-- DROP FUNCTION IF EXISTS public._mc_add_enchant_xp(UUID, INT, INT, TEXT);
-- DROP VIEW IF EXISTS public.v_user_enchantments;
-- DELETE FROM public.cosmetic_catalog WHERE id IN
--   ('tool_skin_pico_encantado','tool_skin_hacha_rubi','mascot_outfit_lia_minera','mascot_outfit_sam_apicultor');
-- DROP TABLE IF EXISTS public.daily_quests;
-- DROP TABLE IF EXISTS public.quest_templates;
-- DROP TABLE IF EXISTS public.concept_mastery_grants;
-- ALTER TABLE public.user_gamification DROP COLUMN IF EXISTS streak_freezes;
-- =============================================================================
