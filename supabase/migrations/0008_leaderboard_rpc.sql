-- =============================================================================
-- 0008_leaderboard_rpc — ranking semanal seguro: expone SOLO nombre de pila +
-- puntos (la RLS de users impide leer perfiles ajenos; esto es lo apropiado para
-- un ranking entre menores: nada de email ni apellidos).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (user_id UUID, display_name TEXT, points INTEGER, rank INTEGER, is_self BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH wk AS (SELECT date_trunc('week', current_date)::date AS w)
  SELECT
    le.user_id,
    COALESCE(NULLIF(split_part(u.full_name, ' ', 1), ''), 'Aventurero') AS display_name,
    le.points,
    (row_number() OVER (ORDER BY le.points DESC, le.user_id))::int AS rank,
    (le.user_id = auth.uid()) AS is_self
  FROM public.leaderboard_entries le
  JOIN public.users u ON u.id = le.user_id, wk
  WHERE le.week_start = wk.w
  ORDER BY le.points DESC
  LIMIT 50;
$$;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
