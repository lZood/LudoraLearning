-- =============================================================================
-- 0025_ranking_hardening — Corrige regresiones de 0021 y cierra huecos medios.
--   (1) close_week v3: re-siembra la semana entrante (regresión 0021), desempate
--       DETERMINISTA (infinity + user_id), cota superior del LATERAL, y calcula
--       trend (↑/↓/=) comparando con la semana previa (lo que la UI ya maqueta).
--   (2) equip_cosmetic: marca un flag transaccional para ser la ÚNICA vía legítima.
--   (3) trigger que revierte cambios DIRECTOS a users.equipped_* del propio usuario.
--   (4) friendships: el UPDATE (aceptar) solo lo puede hacer el RECEPTOR.
--   (5) buy_shield: guarda IF NOT FOUND (no "éxito" silencioso sin fila).
-- =============================================================================

-- ── (2) equip_cosmetic: setea flag transaccional app.equipping antes de tocar equipped_* ──
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
  IF NOT owns THEN
    SELECT COALESCE(l.tier_order, 0) INTO user_tier
      FROM public.user_gamification g LEFT JOIN public.leagues l ON l.id = g.current_league_id
     WHERE g.user_id = uid;
    user_tier := COALESCE(user_tier, 0);
    IF NOT (c.type = 'frame' AND c.required_league_tier IS NOT NULL AND user_tier >= c.required_league_tier) THEN
      RAISE EXCEPTION 'not_owned';
    END IF;
  END IF;

  -- Autoriza el cambio de equipped_* a ESTA transacción (lo lee el trigger de abajo).
  PERFORM set_config('app.equipping', '1', true);

  CASE c.type
    WHEN 'frame'      THEN UPDATE public.users SET equipped_frame = c.value WHERE id = uid;
    WHEN 'title'      THEN UPDATE public.users SET equipped_title = c.value WHERE id = uid;
    WHEN 'name_color' THEN UPDATE public.users SET equipped_name_color = c.value WHERE id = uid;
    WHEN 'skin'       THEN UPDATE public.users SET equipped_skin = c.value WHERE id = uid;
    ELSE NULL;
  END CASE;
END;
$$;
GRANT EXECUTE ON FUNCTION public.equip_cosmetic(TEXT) TO authenticated;

-- ── (3) Trigger: revierte cambios DIRECTOS del propio usuario a equipped_* ──
--   La única vía válida es equip_cosmetic (que valida posesión/tier y setea el flag).
--   Un UPDATE directo (.from('users').update({equipped_frame:...})) se revierte.
CREATE OR REPLACE FUNCTION public.prevent_self_cosmetic_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() = OLD.id
     AND current_setting('app.equipping', true) IS DISTINCT FROM '1' THEN
    NEW.equipped_frame      := OLD.equipped_frame;
    NEW.equipped_title      := OLD.equipped_title;
    NEW.equipped_name_color := OLD.equipped_name_color;
    NEW.equipped_skin       := OLD.equipped_skin;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_prevent_self_cosmetic_change ON public.users;
CREATE TRIGGER trg_prevent_self_cosmetic_change
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_cosmetic_change();

-- ── (4) friendships: aceptar (UPDATE) solo el RECEPTOR; cancelar = DELETE (ya existe) ──
DROP POLICY IF EXISTS "friendships update" ON public.friendships;
CREATE POLICY "friendships update" ON public.friendships
  FOR UPDATE USING (friend_id = auth.uid()) WITH CHECK (friend_id = auth.uid());

-- ── (5) buy_shield: guarda IF NOT FOUND (espejo de purchase_cosmetic) ──
CREATE OR REPLACE FUNCTION public.buy_shield()
RETURNS public.user_gamification LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  g   public.user_gamification;
  cost CONSTANT INTEGER := 200;
  max_shields CONSTANT INTEGER := 2;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'no auth'; END IF;
  SELECT * INTO g FROM public.user_gamification WHERE user_id = uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'no_gamification_row'; END IF;
  IF g.league_shields >= max_shields THEN RAISE EXCEPTION 'shield_max'; END IF;
  IF g.coins < cost THEN RAISE EXCEPTION 'insufficient_coins'; END IF;
  UPDATE public.user_gamification
     SET coins = coins - cost, league_shields = COALESCE(league_shields, 0) + 1, updated_at = now()
   WHERE user_id = uid RETURNING * INTO g;
  INSERT INTO public.coin_transactions (user_id, amount, reason) VALUES (uid, -cost, 'shield');
  RETURN g;
END;
$$;
GRANT EXECUTE ON FUNCTION public.buy_shield() TO authenticated;

-- ── (1) close_week v3 — corrige regresiones de 0021 ──
CREATE OR REPLACE FUNCTION public.close_week(p_week_start DATE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  floor_xp     CONSTANT INTEGER := 50;
  promo_n      CONSTANT INTEGER := 10;
  demote_n     CONSTANT INTEGER := 5;
  min_active   CONSTANT INTEGER := 15;
  prev_week    DATE := p_week_start - 7;
  lg           RECORD;
  e            RECORD;
  active_cnt   INTEGER;
  next_lg      UUID;
  prev_lg      UUID;
  demote_cut   INTEGER;
  bracket_gold INTEGER;
  bracket_silv INTEGER;
  reward_coins INTEGER;
  frame_id     TEXT;
  goal_target  INTEGER;
  goal_sum     INTEGER;
  goal_reward  TEXT;
  v_prev_rank  INTEGER;
  v_trend      TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM public.league_weeks WHERE week_start = p_week_start AND status = 'closed') THEN RETURN; END IF;
  INSERT INTO public.league_weeks (week_start, status) VALUES (p_week_start, 'open') ON CONFLICT (week_start) DO NOTHING;

  FOR lg IN SELECT id, tier_order, name FROM public.leagues LOOP
    SELECT count(*) INTO active_cnt FROM public.leaderboard_entries
      WHERE week_start = p_week_start AND league_id = lg.id AND points > 0;
    CONTINUE WHEN active_cnt = 0;

    SELECT id INTO next_lg FROM public.leagues WHERE tier_order = lg.tier_order + 1;
    SELECT id INTO prev_lg FROM public.leagues WHERE tier_order = lg.tier_order - 1;
    demote_cut   := active_cnt - demote_n + 1;
    bracket_gold := GREATEST(3, ceil(active_cnt * 0.10)::int);
    bracket_silv := GREATEST(bracket_gold, ceil(active_cnt * 0.35)::int);

    FOR e IN
      SELECT le.user_id, le.points,
             -- Desempate DETERMINISTA: puntos desc, primer XP de la semana (acotado), luego user_id.
             row_number() OVER (ORDER BY le.points DESC, COALESCE(fa.first_at, 'infinity'::timestamptz) ASC, le.user_id ASC) AS rnk
      FROM public.leaderboard_entries le
      LEFT JOIN LATERAL (
        SELECT min(a.created_at) AS first_at FROM public.activity_log a
        WHERE a.user_id = le.user_id
          AND a.activity_date >= p_week_start AND a.activity_date < p_week_start + 7
      ) fa ON true
      WHERE le.week_start = p_week_start AND le.league_id = lg.id AND le.points > 0
    LOOP
      -- Tendencia respecto a la semana previa (lo que la UI pinta como ↑/↓).
      SELECT rank INTO v_prev_rank FROM public.leaderboard_entries WHERE user_id = e.user_id AND week_start = prev_week;
      v_trend := CASE
        WHEN v_prev_rank IS NULL THEN 'same'
        WHEN e.rnk < v_prev_rank THEN 'up'
        WHEN e.rnk > v_prev_rank THEN 'down'
        ELSE 'same' END;
      UPDATE public.leaderboard_entries SET rank = e.rnk, trend = v_trend
        WHERE user_id = e.user_id AND week_start = p_week_start;

      reward_coins := CASE WHEN e.rnk <= bracket_gold THEN 200 WHEN e.rnk <= bracket_silv THEN 100 ELSE 40 END;
      UPDATE public.user_gamification SET coins = coins + reward_coins, updated_at = now() WHERE user_id = e.user_id;
      INSERT INTO public.coin_transactions (user_id, amount, reason) VALUES (e.user_id, reward_coins, 'weekly_chest');

      IF e.rnk <= promo_n AND next_lg IS NOT NULL THEN
        UPDATE public.user_gamification SET current_league_id = next_lg WHERE user_id = e.user_id;
        SELECT 'frame_' || lower(name) INTO frame_id FROM public.leagues WHERE id = next_lg;
        IF EXISTS (SELECT 1 FROM public.cosmetic_catalog WHERE id = frame_id) THEN
          INSERT INTO public.user_cosmetics (user_id, cosmetic_id, source, reference_id)
            VALUES (e.user_id, frame_id, 'league_up', p_week_start::text) ON CONFLICT DO NOTHING;
        END IF;
      ELSIF lg.tier_order > 1 AND active_cnt >= min_active AND e.rnk >= demote_cut AND e.points < floor_xp THEN
        IF EXISTS (SELECT 1 FROM public.leaderboard_entries WHERE user_id = e.user_id AND week_start = prev_week) THEN
          IF COALESCE((SELECT league_shields FROM public.user_gamification WHERE user_id = e.user_id), 0) > 0 THEN
            UPDATE public.user_gamification SET league_shields = league_shields - 1 WHERE user_id = e.user_id;
          ELSIF prev_lg IS NOT NULL THEN
            UPDATE public.user_gamification SET current_league_id = prev_lg WHERE user_id = e.user_id;
          END IF;
        END IF;
      END IF;
    END LOOP;

    -- Cofre de la Aldea.
    SELECT COALESCE(SUM(points), 0) INTO goal_sum FROM public.leaderboard_entries WHERE week_start = p_week_start AND league_id = lg.id;
    SELECT target_points, reward_cosmetic_id INTO goal_target, goal_reward FROM public.cohort_goals WHERE league_id = lg.id AND week_start = p_week_start;
    goal_target := COALESCE(goal_target, GREATEST(500, active_cnt * 150));
    IF goal_sum >= goal_target THEN
      INSERT INTO public.cohort_goals (league_id, week_start, target_points, reached)
        VALUES (lg.id, p_week_start, goal_target, true)
        ON CONFLICT (league_id, week_start) DO UPDATE SET reached = true;
      FOR e IN SELECT user_id FROM public.leaderboard_entries WHERE week_start = p_week_start AND league_id = lg.id AND points > 0 LOOP
        UPDATE public.user_gamification SET coins = coins + 50 WHERE user_id = e.user_id;
        INSERT INTO public.coin_transactions (user_id, amount, reason) VALUES (e.user_id, 50, 'village_chest');
        IF goal_reward IS NOT NULL THEN
          INSERT INTO public.user_cosmetics (user_id, cosmetic_id, source, reference_id)
            VALUES (e.user_id, goal_reward, 'village_chest', p_week_start::text) ON CONFLICT DO NOTHING;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  -- Siembra de la semana entrante: roster activo con su liga YA actualizada (post
  -- ascenso/descenso) y arrastrando el trend de esta semana (feedback de movimiento).
  -- Restaura el comportamiento de 0020 que 0021 eliminó (y la precondición de la "semana de gracia").
  INSERT INTO public.league_weeks (week_start, status) VALUES (p_week_start + 7, 'open') ON CONFLICT (week_start) DO NOTHING;
  INSERT INTO public.leaderboard_entries (user_id, league_id, week_start, points, trend)
    SELECT le.user_id, g.current_league_id, p_week_start + 7, 0, le.trend
    FROM public.leaderboard_entries le
    JOIN public.user_gamification g ON g.user_id = le.user_id
    WHERE le.week_start = p_week_start AND le.points > 0
    ON CONFLICT (user_id, week_start) DO NOTHING;

  UPDATE public.league_weeks SET status = 'closed', closed_at = now() WHERE week_start = p_week_start;
END;
$$;
