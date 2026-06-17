-- =============================================================================
-- 0020_ranking_engine — Motor del ranking semanal "Liga + Cofre de la Aldea".
--   Implementa TODAS las RPCs del contrato sobre el esquema de 0007 + 0019:
--     · grant_progress v2  : igual que 0007 PERO con tope semanal de 1500 puntos
--                            al leaderboard (xp_total/coins siguen subiendo enteros).
--     · get_leaderboard()  : ranking de la semana actual para la liga del que llama.
--     · get_village_chest(): meta cooperativa (Cofre de la Aldea) de su liga.
--     · purchase_cosmetic() : sumidero de monedas (tienda).
--     · equip_cosmetic()    : equipar un cosmético poseído.
--     · close_week()        : cierre semanal idempotente (ascensos/descensos,
--                            recompensas por tramo, cofre, siembra de la entrante).
--   Escrituras sensibles SOLO vía RPC SECURITY DEFINER (anti-fraude de XP/monedas).
--   close_week es service_role-only (lo dispara el cron).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- grant_progress v2 — CREATE OR REPLACE (NO rompe callers; misma firma que 0007).
--   Diferencia con 0007: el aporte de puntos al leaderboard de la SEMANA está
--   topado a 1500. xp_total y coins NO se topan (el ranking usa XP de aprender
--   como única "moneda", pero limita el farmeo dentro de la semana).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.grant_progress(p_xp INTEGER, p_coins INTEGER DEFAULT 0, p_source TEXT DEFAULT 'activity')
RETURNS public.user_gamification LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid          UUID    := auth.uid();
  g            public.user_gamification;
  wk           DATE    := date_trunc('week', current_date)::date;  -- lunes ISO
  new_streak   INTEGER;
  cur_points   INTEGER;  -- puntos ya acumulados esta semana
  add_points   INTEGER;  -- aporte real al leaderboard tras aplicar el tope de 1500
  weekly_cap   CONSTANT INTEGER := 1500;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'no auth'; END IF;

  -- Asegura fila de gamificación (idéntico a 0007).
  INSERT INTO public.user_gamification (user_id, current_league_id)
    VALUES (uid, (SELECT id FROM public.leagues WHERE tier_order = 1 LIMIT 1))
    ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO g FROM public.user_gamification WHERE user_id = uid FOR UPDATE;

  -- Racha (idéntico a 0007).
  IF g.last_active_date = current_date THEN
    new_streak := g.current_streak;
  ELSIF g.last_active_date = current_date - 1 THEN
    new_streak := g.current_streak + 1;
  ELSE
    new_streak := 1;
  END IF;

  -- xp_total / coins suben COMPLETOS (sin tope). Igual que 0007.
  UPDATE public.user_gamification SET
    xp_total         = xp_total + GREATEST(p_xp, 0),
    coins            = coins + GREATEST(p_coins, 0),
    level_number     = GREATEST(1, floor((xp_total + GREATEST(p_xp, 0)) / 100.0)::int + 1),
    current_streak   = new_streak,
    longest_streak   = GREATEST(longest_streak, new_streak),
    last_active_date = current_date,
    updated_at       = now()
  WHERE user_id = uid
  RETURNING * INTO g;

  -- Bitácora de actividad y de monedas (idéntico a 0007).
  IF p_xp <> 0 THEN
    INSERT INTO public.activity_log (user_id, xp_earned, source) VALUES (uid, p_xp, p_source);
  END IF;
  IF p_coins <> 0 THEN
    INSERT INTO public.coin_transactions (user_id, amount, reason) VALUES (uid, p_coins, p_source);
  END IF;

  -- ── Leaderboard semanal CON TOPE de 1500 puntos ────────────────────────────
  -- Lee/crea la entry de la semana (FOR UPDATE para serializar el tope).
  INSERT INTO public.leaderboard_entries (user_id, league_id, week_start, points)
    VALUES (uid, g.current_league_id, wk, 0)
    ON CONFLICT (user_id, week_start) DO NOTHING;

  SELECT points INTO cur_points
  FROM public.leaderboard_entries
  WHERE user_id = uid AND week_start = wk
  FOR UPDATE;

  -- Aporte real = lo que cabe hasta el tope (nunca negativo).
  add_points := LEAST(GREATEST(p_xp, 0), GREATEST(weekly_cap - COALESCE(cur_points, 0), 0));

  IF add_points > 0 THEN
    UPDATE public.leaderboard_entries
       SET points    = points + add_points,
           -- Mantén la league_id de la entry alineada con la liga actual del usuario.
           league_id = COALESCE(league_id, g.current_league_id)
     WHERE user_id = uid AND week_start = wk;
  END IF;

  RETURN g;
END;
$$;
GRANT EXECUTE ON FUNCTION public.grant_progress(INTEGER, INTEGER, TEXT) TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- get_leaderboard() — ranking de la semana actual para la liga del que llama.
--   Si el usuario no tiene entry esta semana, igual se resuelve su liga desde
--   current_league_id (o Madera por defecto) para que la UI pinte el ranking.
-- ─────────────────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.get_leaderboard();
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id             UUID,
  full_name           TEXT,
  points              INTEGER,
  rank                INTEGER,
  trend               TEXT,
  is_me               BOOLEAN,
  league_name         TEXT,
  league_color        TEXT,
  equipped_frame      TEXT,
  equipped_title      TEXT,
  equipped_name_color TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid     UUID := auth.uid();
  wk      DATE := date_trunc('week', current_date)::date;  -- lunes ISO
  lg_id   UUID;  -- liga objetivo a mostrar
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'no auth'; END IF;

  -- Liga del usuario: su current_league_id; si por algo es NULL, Madera (tier 1).
  SELECT COALESCE(g.current_league_id, (SELECT id FROM public.leagues WHERE tier_order = 1 LIMIT 1))
    INTO lg_id
    FROM public.user_gamification g
   WHERE g.user_id = uid;

  IF lg_id IS NULL THEN
    SELECT id INTO lg_id FROM public.leagues WHERE tier_order = 1 LIMIT 1;
  END IF;

  RETURN QUERY
  WITH ranked AS (
    SELECT
      le.user_id,
      le.points,
      le.trend,
      (row_number() OVER (ORDER BY le.points DESC, le.user_id))::int AS rnk
    FROM public.leaderboard_entries le
    WHERE le.week_start = wk
      AND le.league_id  = lg_id
  )
  SELECT
    r.user_id,
    COALESCE(NULLIF(split_part(u.full_name, ' ', 1), ''), 'Aventurero')::text AS full_name,
    r.points,
    r.rnk AS rank,
    COALESCE(r.trend, 'same')::text AS trend,
    (r.user_id = uid) AS is_me,
    l.name::text  AS league_name,
    l.color::text AS league_color,
    u.equipped_frame,
    u.equipped_title,
    u.equipped_name_color
  FROM ranked r
  JOIN public.users   u ON u.id = r.user_id
  CROSS JOIN LATERAL (SELECT lg.name, lg.color FROM public.leagues lg WHERE lg.id = lg_id) l
  ORDER BY r.points DESC, r.user_id
  LIMIT 60;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- get_village_chest() — Cofre de la Aldea (meta cooperativa de la liga del que llama).
--   current = SUM(points) de la liga esta semana; target desde cohort_goals si existe,
--   o calculado = GREATEST(500, members*150). reached = current >= target.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_village_chest()
RETURNS TABLE (
  current     INTEGER,
  target      INTEGER,
  reached     BOOLEAN,
  league_name TEXT,
  members     INTEGER
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid       UUID := auth.uid();
  wk        DATE := date_trunc('week', current_date)::date;  -- lunes ISO
  lg_id     UUID;
  lg_name   TEXT;
  cur_pts   INTEGER;
  mem_count INTEGER;
  tgt       INTEGER;
  goal_tgt  INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'no auth'; END IF;

  SELECT COALESCE(g.current_league_id, (SELECT id FROM public.leagues WHERE tier_order = 1 LIMIT 1))
    INTO lg_id
    FROM public.user_gamification g
   WHERE g.user_id = uid;
  IF lg_id IS NULL THEN
    SELECT id INTO lg_id FROM public.leagues WHERE tier_order = 1 LIMIT 1;
  END IF;

  SELECT name INTO lg_name FROM public.leagues WHERE id = lg_id;

  -- Suma de puntos y miembros activos de la liga esta semana.
  SELECT COALESCE(SUM(le.points), 0)::int, COUNT(*)::int
    INTO cur_pts, mem_count
    FROM public.leaderboard_entries le
   WHERE le.week_start = wk AND le.league_id = lg_id;

  -- Target: el de cohort_goals si existe; si no, fórmula por miembros.
  SELECT cg.target_points INTO goal_tgt
    FROM public.cohort_goals cg
   WHERE cg.league_id = lg_id AND cg.week_start = wk;

  tgt := COALESCE(goal_tgt, GREATEST(500, mem_count * 150));

  current     := cur_pts;
  target      := tgt;
  reached     := cur_pts >= tgt;
  league_name := lg_name;
  members     := mem_count;
  RETURN NEXT;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_village_chest() TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- purchase_cosmetic(p_id) — comprar un cosmético de la tienda (sumidero de monedas).
--   Valida: existe, comprable (price_coins>0), tier requerido, no duplicado y saldo.
--   Descuenta coins, inserta inventario (source 'shop') + coin_transactions.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.purchase_cosmetic(p_id TEXT)
RETURNS public.user_gamification LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid       UUID := auth.uid();
  g         public.user_gamification;
  c         public.cosmetic_catalog;
  user_tier INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'no auth'; END IF;

  SELECT * INTO c FROM public.cosmetic_catalog WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'cosmetic_not_found'; END IF;

  -- No comprable: price_coins <= 0 (esos sólo se ganan, p.ej. marcos de liga).
  IF COALESCE(c.price_coins, 0) <= 0 THEN
    RAISE EXCEPTION 'not_purchasable';
  END IF;

  -- ¿Ya lo posee?
  IF EXISTS (SELECT 1 FROM public.user_cosmetics WHERE user_id = uid AND cosmetic_id = p_id) THEN
    RAISE EXCEPTION 'already_owned';
  END IF;

  -- Bloquea la fila de gamificación para validar/descontar saldo de forma atómica.
  SELECT * INTO g FROM public.user_gamification WHERE user_id = uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'no_gamification_row'; END IF;

  -- Tier del usuario (orden de su liga actual); 0 si no tiene liga asignada.
  SELECT COALESCE(l.tier_order, 0) INTO user_tier
    FROM public.leagues l
   WHERE l.id = g.current_league_id;
  user_tier := COALESCE(user_tier, 0);

  -- Requisito de rango (si aplica).
  IF c.required_league_tier IS NOT NULL AND user_tier < c.required_league_tier THEN
    RAISE EXCEPTION 'league_locked';
  END IF;

  -- Saldo suficiente.
  IF g.coins < c.price_coins THEN
    RAISE EXCEPTION 'insufficient_coins';
  END IF;

  -- Descuenta y registra.
  UPDATE public.user_gamification
     SET coins = coins - c.price_coins, updated_at = now()
   WHERE user_id = uid
  RETURNING * INTO g;

  INSERT INTO public.user_cosmetics (user_id, cosmetic_id, source, reference_id)
  VALUES (uid, p_id, 'shop', NULL)
  ON CONFLICT (user_id, cosmetic_id) DO NOTHING;

  INSERT INTO public.coin_transactions (user_id, amount, reason, reference_id)
  VALUES (uid, -c.price_coins, 'shop', NULL);

  RETURN g;
END;
$$;
GRANT EXECUTE ON FUNCTION public.purchase_cosmetic(TEXT) TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- equip_cosmetic(p_id) — equipar un cosmético.
--   Permitido si: el usuario lo POSEE (user_cosmetics) o es un 'frame' de una liga
--   ya alcanzada (required_league_tier <= tier actual). Setea la columna de users
--   según el type del cosmético.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.equip_cosmetic(p_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid       UUID := auth.uid();
  c         public.cosmetic_catalog;
  user_tier INTEGER;
  owns      BOOLEAN;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'no auth'; END IF;

  SELECT * INTO c FROM public.cosmetic_catalog WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'cosmetic_not_found'; END IF;

  owns := EXISTS (SELECT 1 FROM public.user_cosmetics WHERE user_id = uid AND cosmetic_id = p_id);

  -- Marco de liga ya alcanzada: aunque no esté en el inventario, si es 'frame' y el
  -- usuario llegó a ese tier, puede equiparlo.
  IF NOT owns THEN
    SELECT COALESCE(l.tier_order, 0) INTO user_tier
      FROM public.user_gamification g
      LEFT JOIN public.leagues l ON l.id = g.current_league_id
     WHERE g.user_id = uid;
    user_tier := COALESCE(user_tier, 0);

    IF NOT (c.type = 'frame' AND c.required_league_tier IS NOT NULL AND user_tier >= c.required_league_tier) THEN
      RAISE EXCEPTION 'not_owned';
    END IF;
  END IF;

  -- Setea la columna correspondiente al tipo.
  CASE c.type
    WHEN 'frame' THEN
      UPDATE public.users SET equipped_frame = c.value WHERE id = uid;
    WHEN 'title' THEN
      UPDATE public.users SET equipped_title = c.value WHERE id = uid;
    WHEN 'name_color' THEN
      UPDATE public.users SET equipped_name_color = c.value WHERE id = uid;
    WHEN 'skin' THEN
      UPDATE public.users SET equipped_skin = c.value WHERE id = uid;
    -- 'banner' u otros tipos sin columna dedicada: no-op silencioso (futuro).
    ELSE
      NULL;
  END CASE;
END;
$$;
GRANT EXECUTE ON FUNCTION public.equip_cosmetic(TEXT) TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- close_week(p_week_start) — cierre semanal idempotente (service_role / cron).
--   Pasos por cada liga de la semana que cierra:
--     1. Rankea por points DESC; tie-break = timestamp del PRIMER activity_log de
--        la semana del usuario (quien llegó antes, mejor), luego user_id.
--     2. Ascensos/descensos:
--          · Top promote_count suben al tier+1 (si existe liga superior).
--          · Bottom demote_count bajan al tier-1, EXCEPTO:
--              - Madera (tier 1) nunca baja.
--              - Si la liga tiene < 15 activos: sin descensos (anti-desánimo).
--     3. Recompensas POR TRAMO (nadie con points>0 sale sin nada):
--          · Oro   : top 10%  → 200 coins + cosmético oro
--          · Plata : sig 25%  → 100 coins + cosmético plata
--          · Bronce: resto    →  40 coins + cosmético bronce
--          · Mínimo: top 3 SIEMPRE Oro.
--     4. Cofre de la Aldea: si SUM(points) >= target → reached=true; reparte el
--        reward_cosmetic_id + 50 coins a los aportantes (points>0).
--     5. Marca league_weeks.status='closed' (idempotente).
--     6. Siembra entries (points=0) de la semana entrante para activos de esta.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.close_week(p_week_start DATE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  wk          DATE := p_week_start;
  next_wk     DATE := p_week_start + 7;
  lg          RECORD;   -- liga en curso
  ent         RECORD;   -- entry rankeada
  total_active INTEGER; -- activos en la liga (entries con la liga)
  promote_n   INTEGER;
  demote_n    INTEGER;
  next_tier_id UUID;
  prev_tier_id UUID;
  gold_cut    INTEGER;  -- corte de tramo Oro (índice)
  silver_cut  INTEGER;  -- corte de tramo Plata (índice)
  reward_coins INTEGER;
  reward_cos  TEXT;
  -- Cofre
  chest_sum   INTEGER;
  chest_tgt   INTEGER;
  chest_members INTEGER;
  chest_reward TEXT;
  chest_reached BOOLEAN;
BEGIN
  -- IDEMPOTENCIA: si ya está cerrada, no hace nada.
  IF EXISTS (SELECT 1 FROM public.league_weeks WHERE week_start = wk AND status = 'closed') THEN
    RETURN;
  END IF;

  -- Asegura registro de la semana (si no existe, se crea como 'open' y se cerrará abajo).
  INSERT INTO public.league_weeks (week_start, status)
  VALUES (wk, 'open')
  ON CONFLICT (week_start) DO NOTHING;

  -- ── Procesa cada liga que tenga actividad esta semana ──────────────────────
  FOR lg IN
    SELECT l.id, l.name, l.tier_order, l.promote_count, l.demote_count
    FROM public.leagues l
    ORDER BY l.tier_order
  LOOP
    -- Activos de la liga en esta semana.
    SELECT COUNT(*) INTO total_active
      FROM public.leaderboard_entries le
     WHERE le.week_start = wk AND le.league_id = lg.id;

    IF total_active = 0 THEN
      CONTINUE;  -- liga sin participantes esta semana
    END IF;

    -- Ligas vecinas para ascenso/descenso.
    SELECT id INTO next_tier_id FROM public.leagues WHERE tier_order = lg.tier_order + 1;
    SELECT id INTO prev_tier_id FROM public.leagues WHERE tier_order = lg.tier_order - 1;

    -- Cortes de tramo de recompensa (mínimo top 3 Oro).
    gold_cut   := GREATEST(3, ceil(total_active * 0.10)::int);
    silver_cut := gold_cut + ceil(total_active * 0.25)::int;

    -- Cuántos suben/bajan (acotado al tamaño del grupo).
    promote_n := LEAST(COALESCE(lg.promote_count, 0), total_active);
    -- Sin descenso si <15 activos o si es Madera (tier 1).
    IF total_active < 15 OR lg.tier_order = 1 THEN
      demote_n := 0;
    ELSE
      demote_n := LEAST(COALESCE(lg.demote_count, 0), total_active);
    END IF;

    -- Recorre el ranking de la liga (mejor → peor). Tie-break por primer activity_log
    -- de la semana (más temprano gana), luego user_id para determinismo.
    FOR ent IN
      SELECT
        le.user_id,
        le.points,
        (row_number() OVER (
            ORDER BY le.points DESC,
                     COALESCE(fa.first_at, 'infinity'::timestamptz) ASC,
                     le.user_id ASC
        ))::int AS rnk
      FROM public.leaderboard_entries le
      LEFT JOIN LATERAL (
        SELECT MIN(al.created_at) AS first_at
        FROM public.activity_log al
        WHERE al.user_id = le.user_id
          AND al.activity_date >= wk
          AND al.activity_date <  next_wk
      ) fa ON true
      WHERE le.week_start = wk AND le.league_id = lg.id
      ORDER BY le.points DESC,
               COALESCE(fa.first_at, 'infinity'::timestamptz) ASC,
               le.user_id ASC
    LOOP
      -- ── Recompensa por tramo (solo si sumó puntos) ──────────────────────────
      IF ent.points > 0 THEN
        IF ent.rnk <= gold_cut THEN
          reward_coins := 200; reward_cos := 'frame_oro';
        ELSIF ent.rnk <= silver_cut THEN
          reward_coins := 100; reward_cos := 'frame_hierro';   -- "plata" → marco de hierro
        ELSE
          reward_coins := 40;  reward_cos := 'frame_madera';   -- "bronce" → marco de madera
        END IF;

        -- Monedas + transacción.
        UPDATE public.user_gamification
           SET coins = coins + reward_coins, updated_at = now()
         WHERE user_id = ent.user_id;
        INSERT INTO public.coin_transactions (user_id, amount, reason)
        VALUES (ent.user_id, reward_coins, 'weekly_reward');

        -- Cosmético del tramo (no duplica).
        IF reward_cos IS NOT NULL AND EXISTS (SELECT 1 FROM public.cosmetic_catalog WHERE id = reward_cos) THEN
          INSERT INTO public.user_cosmetics (user_id, cosmetic_id, source, reference_id)
          VALUES (ent.user_id, reward_cos, 'weekly_chest', wk::text)
          ON CONFLICT (user_id, cosmetic_id) DO NOTHING;
        END IF;
      END IF;

      -- ── Ascenso / descenso ──────────────────────────────────────────────────
      IF ent.rnk <= promote_n AND next_tier_id IS NOT NULL THEN
        -- Sube de liga.
        UPDATE public.user_gamification
           SET current_league_id = next_tier_id, updated_at = now()
         WHERE user_id = ent.user_id;
      ELSIF demote_n > 0
            AND ent.rnk > (total_active - demote_n)
            AND prev_tier_id IS NOT NULL THEN
        -- Baja de liga (zona de riesgo del fondo).
        UPDATE public.user_gamification
           SET current_league_id = prev_tier_id, updated_at = now()
         WHERE user_id = ent.user_id;
      END IF;

      -- Persiste el rank final de la entry (histórico de la semana cerrada).
      UPDATE public.leaderboard_entries
         SET rank = ent.rnk
       WHERE user_id = ent.user_id AND week_start = wk;
    END LOOP;

    -- ── Cofre de la Aldea de esta liga ────────────────────────────────────────
    SELECT COALESCE(SUM(le.points), 0)::int, COUNT(*)::int
      INTO chest_sum, chest_members
      FROM public.leaderboard_entries le
     WHERE le.week_start = wk AND le.league_id = lg.id;

    SELECT cg.target_points, cg.reward_cosmetic_id
      INTO chest_tgt, chest_reward
      FROM public.cohort_goals cg
     WHERE cg.league_id = lg.id AND cg.week_start = wk;

    chest_tgt     := COALESCE(chest_tgt, GREATEST(500, chest_members * 150));
    chest_reached := chest_sum >= chest_tgt;

    -- Upsert del estado del cofre (deja registro de target/reached para histórico).
    INSERT INTO public.cohort_goals (league_id, week_start, target_points, reward_cosmetic_id, reached)
    VALUES (lg.id, wk, chest_tgt, chest_reward, chest_reached)
    ON CONFLICT (league_id, week_start)
    DO UPDATE SET target_points = EXCLUDED.target_points, reached = EXCLUDED.reached;

    -- Si se alcanzó: 50 coins + cosmético del cofre a los aportantes (points>0).
    IF chest_reached THEN
      FOR ent IN
        SELECT le.user_id
        FROM public.leaderboard_entries le
        WHERE le.week_start = wk AND le.league_id = lg.id AND le.points > 0
      LOOP
        UPDATE public.user_gamification
           SET coins = coins + 50, updated_at = now()
         WHERE user_id = ent.user_id;
        INSERT INTO public.coin_transactions (user_id, amount, reason)
        VALUES (ent.user_id, 50, 'village_chest');

        IF chest_reward IS NOT NULL AND EXISTS (SELECT 1 FROM public.cosmetic_catalog WHERE id = chest_reward) THEN
          INSERT INTO public.user_cosmetics (user_id, cosmetic_id, source, reference_id)
          VALUES (ent.user_id, chest_reward, 'village_chest', wk::text)
          ON CONFLICT (user_id, cosmetic_id) DO NOTHING;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  -- ── Marca la semana como cerrada (idempotencia futura) ─────────────────────
  UPDATE public.league_weeks
     SET status = 'closed', closed_at = now()
   WHERE week_start = wk;

  -- ── Siembra de la semana entrante ──────────────────────────────────────────
  -- Cada usuario activo esta semana arranca la siguiente con su liga (ya actualizada
  -- por los ascensos/descensos de arriba) y 0 puntos. Idempotente vía UNIQUE.
  INSERT INTO public.league_weeks (week_start, status)
  VALUES (next_wk, 'open')
  ON CONFLICT (week_start) DO NOTHING;

  INSERT INTO public.leaderboard_entries (user_id, league_id, week_start, points, trend)
  SELECT DISTINCT le.user_id, g.current_league_id, next_wk, 0, NULL
  FROM public.leaderboard_entries le
  JOIN public.user_gamification g ON g.user_id = le.user_id
  WHERE le.week_start = wk
  ON CONFLICT (user_id, week_start) DO NOTHING;
END;
$$;
-- close_week NO se otorga a authenticated: solo service_role (cron) puede invocarla.
REVOKE ALL ON FUNCTION public.close_week(DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.close_week(DATE) TO service_role;
