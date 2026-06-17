-- =============================================================================
-- 0024_cron_catchup — Resiliencia del cierre semanal.
--   Antes: el cron solo cerraba la semana -7d; si fallaba/no corría un lunes,
--   esa semana quedaba 'open' para siempre (nadie sube/baja ni cobra premios).
--   Ahora: close_due_weeks() cierra TODAS las semanas pasadas aún no cerradas,
--   en orden ascendente. Idempotente (close_week salta las ya cerradas), así que
--   correrlo a diario auto-sana cualquier semana perdida en <24h.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.close_due_weeks()
RETURNS TABLE (closed_week DATE) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cur_week DATE := date_trunc('week', current_date)::date;  -- lunes de la semana EN CURSO (no se cierra)
  w        DATE;
BEGIN
  -- Semanas con actividad (entries) anteriores a la actual que aún no están cerradas.
  FOR w IN
    SELECT DISTINCT le.week_start
    FROM public.leaderboard_entries le
    WHERE le.week_start < cur_week
      AND NOT EXISTS (
        SELECT 1 FROM public.league_weeks lw
        WHERE lw.week_start = le.week_start AND lw.status = 'closed'
      )
    ORDER BY le.week_start ASC
  LOOP
    PERFORM public.close_week(w);
    closed_week := w;
    RETURN NEXT;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.close_due_weeks() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.close_due_weeks() TO service_role;
