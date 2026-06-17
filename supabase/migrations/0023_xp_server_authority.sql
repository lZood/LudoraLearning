-- =============================================================================
-- 0023_xp_server_authority — CIERRA el agujero crítico de inflado de XP/monedas.
--   Antes: grant_progress(int,int,text) usaba auth.uid(), estaba GRANT a
--   authenticated y el cliente lo invocaba DIRECTO desde el browser con p_xp/
--   p_coins arbitrarios -> cualquiera inflaba ranking/economía desde la consola.
--   Ahora: el otorgamiento de XP/monedas es SOLO server-side y autoritativo.
--     · grant_progress_for(user_id, ...) : misma lógica pero user_id explícito,
--       service_role-only (la invocan los route handlers tras validar la sesión).
--     · complete_lesson(user_id, activity) : paga el XP de una lección UNA vez,
--       de forma atómica y a prueba de reset (registro propio que el user no toca).
--     · REVOKE de grant_progress(int,int,text) a authenticated -> mata el exploit.
-- =============================================================================

-- 1) Registro a prueba de manipulación de qué lecciones ya pagaron XP.
--    Aunque el usuario borre/resetee su fila en user_activity_progress (que SÍ
--    controla por RLS), esta tabla persiste y el pago no se repite. Solo
--    service_role (vía las funciones SECURITY DEFINER) la escribe/lee.
CREATE TABLE IF NOT EXISTS public.lesson_xp_grants (
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  xp          INTEGER NOT NULL DEFAULT 0,
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_id)
);
ALTER TABLE public.lesson_xp_grants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lesson_xp_grants FROM anon, authenticated;

-- 2) grant_progress_for — idéntico a grant_progress v2 (0020) pero con user_id
--    EXPLÍCITO en vez de auth.uid(). service_role-only.
CREATE OR REPLACE FUNCTION public.grant_progress_for(
  p_user_id UUID, p_xp INTEGER, p_coins INTEGER DEFAULT 0, p_source TEXT DEFAULT 'activity')
RETURNS public.user_gamification LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid          UUID    := p_user_id;
  g            public.user_gamification;
  wk           DATE    := date_trunc('week', current_date)::date;
  new_streak   INTEGER;
  cur_points   INTEGER;
  add_points   INTEGER;
  weekly_cap   CONSTANT INTEGER := 1500;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'no user'; END IF;

  INSERT INTO public.user_gamification (user_id, current_league_id)
    VALUES (uid, (SELECT id FROM public.leagues WHERE tier_order = 1 LIMIT 1))
    ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO g FROM public.user_gamification WHERE user_id = uid FOR UPDATE;

  IF g.last_active_date = current_date THEN new_streak := g.current_streak;
  ELSIF g.last_active_date = current_date - 1 THEN new_streak := g.current_streak + 1;
  ELSE new_streak := 1; END IF;

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

  IF p_xp <> 0 THEN INSERT INTO public.activity_log (user_id, xp_earned, source) VALUES (uid, p_xp, p_source); END IF;
  IF p_coins <> 0 THEN INSERT INTO public.coin_transactions (user_id, amount, reason) VALUES (uid, p_coins, p_source); END IF;

  INSERT INTO public.leaderboard_entries (user_id, league_id, week_start, points)
    VALUES (uid, g.current_league_id, wk, 0)
    ON CONFLICT (user_id, week_start) DO NOTHING;
  SELECT points INTO cur_points FROM public.leaderboard_entries WHERE user_id = uid AND week_start = wk FOR UPDATE;
  add_points := LEAST(GREATEST(p_xp, 0), GREATEST(weekly_cap - COALESCE(cur_points, 0), 0));
  IF add_points > 0 THEN
    UPDATE public.leaderboard_entries
       SET points = points + add_points, league_id = COALESCE(league_id, g.current_league_id)
     WHERE user_id = uid AND week_start = wk;
  END IF;

  RETURN g;
END;
$$;
REVOKE ALL ON FUNCTION public.grant_progress_for(UUID, INTEGER, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_progress_for(UUID, INTEGER, INTEGER, TEXT) TO service_role;

-- 3) complete_lesson — paga el XP de una lección UNA sola vez, atómico y a prueba
--    de reset. El XP se deriva de activities.xp_reward (BD), nunca del cliente.
CREATE OR REPLACE FUNCTION public.complete_lesson(p_user_id UUID, p_activity_id UUID)
RETURNS TABLE (xp_earned INTEGER, already_done BOOLEAN) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_xp   INTEGER;
  v_rows INTEGER;
BEGIN
  IF p_user_id IS NULL OR p_activity_id IS NULL THEN RAISE EXCEPTION 'bad args'; END IF;

  SELECT COALESCE(xp_reward, 10) INTO v_xp FROM public.activities WHERE id = p_activity_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'activity_not_found'; END IF;

  -- Gate de pago idempotente y a prueba de manipulación: solo paga si es la 1ª vez.
  INSERT INTO public.lesson_xp_grants (user_id, activity_id, xp)
    VALUES (p_user_id, p_activity_id, v_xp)
    ON CONFLICT (user_id, activity_id) DO NOTHING;
  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows > 0 THEN
    PERFORM public.grant_progress_for(p_user_id, v_xp, 0, 'leccion');
    RETURN QUERY SELECT v_xp, false;
  ELSE
    RETURN QUERY SELECT 0, true;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.complete_lesson(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_lesson(UUID, UUID) TO service_role;

-- 4) Cierra el exploit: grant_progress(int,int,text) deja de ser invocable por el
--    cliente. Queda como función interna (nadie la llama ya; los endpoints usan
--    grant_progress_for). Mantener la definición evita romper dependencias previas.
REVOKE ALL ON FUNCTION public.grant_progress(INTEGER, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
