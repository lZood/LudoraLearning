-- =============================================================================
-- 0026_chest_members_active — Coherencia del Cofre de la Aldea.
--   get_village_chest contaba COUNT(*) (incluía entries sembradas en 0 pts), por lo
--   que el target EN VIVO (members*150) podía diferir del evaluado al cierre, que usa
--   active_cnt (points>0). Ahora ambos cuentan solo miembros ACTIVOS (points>0).
-- =============================================================================
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
  wk        DATE := date_trunc('week', current_date)::date;
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

  -- Solo miembros ACTIVOS (points > 0), igual que close_week.active_cnt.
  SELECT COALESCE(SUM(le.points), 0)::int, COUNT(*)::int
    INTO cur_pts, mem_count
    FROM public.leaderboard_entries le
   WHERE le.week_start = wk AND le.league_id = lg_id AND le.points > 0;

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
