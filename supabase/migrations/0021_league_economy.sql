-- =============================================================================
-- 0021_league_economy — Descenso por INACTIVIDAD + Escudo de Obsidiana.
--   Filosofía: el alumno desciende si DEJA de aprender (no alcanza la meta semanal),
--   no por ir último. Ascenso sigue siendo competitivo (top promote_count).
--   Protecciones: Madera no baja, semana de gracia (nuevos), <15 activos sin descenso,
--   y un Escudo de Obsidiana (comprado con monedas) que absorbe un descenso.
-- =============================================================================

-- Escudos de liga del alumno (consumibles anti-descenso).
ALTER TABLE public.user_gamification ADD COLUMN IF NOT EXISTS league_shields INTEGER NOT NULL DEFAULT 0;

-- ── Comprar Escudo de Obsidiana (sumidero de monedas) ──
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

-- ── Cierre semanal v2: ascenso competitivo + descenso SOLO por inactividad ──
CREATE OR REPLACE FUNCTION public.close_week(p_week_start DATE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  floor_xp     CONSTANT INTEGER := 50;   -- meta semanal: ~2-3 lecciones -> "a salvo"
  promo_n      CONSTANT INTEGER := 10;
  demote_n     CONSTANT INTEGER := 5;
  min_active   CONSTANT INTEGER := 15;
  prev_week    DATE := p_week_start - 7;
  lg           RECORD;
  e            RECORD;
  active_cnt   INTEGER;
  next_lg      UUID;
  prev_lg      UUID;
  demote_cut   INTEGER;       -- rank a partir del cual es "fondo"
  bracket_gold INTEGER;
  bracket_silv INTEGER;
  reward_coins INTEGER;
  frame_id     TEXT;
  goal_target  INTEGER;
  goal_sum     INTEGER;
  goal_reward  TEXT;
BEGIN
  -- Idempotente: si ya cerró esta semana, no repite.
  IF EXISTS (SELECT 1 FROM public.league_weeks WHERE week_start = p_week_start AND status = 'closed') THEN RETURN; END IF;
  INSERT INTO public.league_weeks (week_start, status) VALUES (p_week_start, 'open') ON CONFLICT (week_start) DO NOTHING;

  FOR lg IN SELECT id, tier_order, name FROM public.leagues LOOP
    SELECT count(*) INTO active_cnt FROM public.leaderboard_entries
      WHERE week_start = p_week_start AND league_id = lg.id AND points > 0;
    CONTINUE WHEN active_cnt = 0;

    SELECT id INTO next_lg FROM public.leagues WHERE tier_order = lg.tier_order + 1;
    SELECT id INTO prev_lg FROM public.leagues WHERE tier_order = lg.tier_order - 1;
    demote_cut   := active_cnt - demote_n + 1;          -- ranks >= esto = fondo
    bracket_gold := GREATEST(3, ceil(active_cnt * 0.10)::int);   -- top ~10% (mín 3)
    bracket_silv := GREATEST(bracket_gold, ceil(active_cnt * 0.35)::int);

    FOR e IN
      SELECT le.user_id, le.points,
             row_number() OVER (ORDER BY le.points DESC, COALESCE(fa.first_at, now())) AS rnk
      FROM public.leaderboard_entries le
      LEFT JOIN LATERAL (
        SELECT min(a.created_at) AS first_at FROM public.activity_log a
        WHERE a.user_id = le.user_id AND a.activity_date >= p_week_start
      ) fa ON true
      WHERE le.week_start = p_week_start AND le.league_id = lg.id AND le.points > 0
    LOOP
      -- Congela rank + tendencia.
      UPDATE public.leaderboard_entries SET rank = e.rnk WHERE user_id = e.user_id AND week_start = p_week_start;

      -- Recompensa por tramo (todo el que sumó >0 se lleva monedas: aprender siempre paga).
      reward_coins := CASE WHEN e.rnk <= bracket_gold THEN 200 WHEN e.rnk <= bracket_silv THEN 100 ELSE 40 END;
      UPDATE public.user_gamification SET coins = coins + reward_coins, updated_at = now() WHERE user_id = e.user_id;
      INSERT INTO public.coin_transactions (user_id, amount, reason) VALUES (e.user_id, reward_coins, 'weekly_chest');

      -- ASCENSO competitivo (top promote_n) -> sube de liga + gana el marco mineral de la nueva.
      IF e.rnk <= promo_n AND next_lg IS NOT NULL THEN
        UPDATE public.user_gamification SET current_league_id = next_lg WHERE user_id = e.user_id;
        SELECT 'frame_' || lower(name) INTO frame_id FROM public.leagues WHERE id = next_lg;
        IF EXISTS (SELECT 1 FROM public.cosmetic_catalog WHERE id = frame_id) THEN
          INSERT INTO public.user_cosmetics (user_id, cosmetic_id, source, reference_id)
            VALUES (e.user_id, frame_id, 'league_up', p_week_start::text) ON CONFLICT DO NOTHING;
        END IF;

      -- DESCENSO solo por INACTIVIDAD: fondo de la liga Y sin alcanzar la meta semanal.
      ELSIF lg.tier_order > 1 AND active_cnt >= min_active AND e.rnk >= demote_cut AND e.points < floor_xp THEN
        -- Semana de gracia: si no participó la semana anterior (nuevo), no desciende.
        IF EXISTS (SELECT 1 FROM public.leaderboard_entries WHERE user_id = e.user_id AND week_start = prev_week) THEN
          IF COALESCE((SELECT league_shields FROM public.user_gamification WHERE user_id = e.user_id), 0) > 0 THEN
            UPDATE public.user_gamification SET league_shields = league_shields - 1 WHERE user_id = e.user_id; -- escudo absorbe
          ELSIF prev_lg IS NOT NULL THEN
            UPDATE public.user_gamification SET current_league_id = prev_lg WHERE user_id = e.user_id;
          END IF;
        END IF;
      END IF;
    END LOOP;

    -- Cofre de la Aldea: si la liga llenó la meta, recompensa a los aportantes.
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

  UPDATE public.league_weeks SET status = 'closed', closed_at = now() WHERE week_start = p_week_start;
END;
$$;
-- close_week sigue siendo service_role-only (lo dispara el cron); no se concede a authenticated.
