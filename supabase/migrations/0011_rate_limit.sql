-- =============================================================================
-- 0011_rate_limit — Fase 7: limitador de tasa en BD (anti-abuso/costos de IA).
-- Lo invocan los route handlers con el cliente service_role (bypassa RLS).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count        INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;  -- sin policies: solo service_role
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

-- Devuelve TRUE si se permite la solicitud; FALSE si excede p_max en la ventana p_window (seg).
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key TEXT, p_max INTEGER, p_window INTEGER)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ws TIMESTAMPTZ; cnt INTEGER;
BEGIN
  SELECT window_start, count INTO ws, cnt FROM public.rate_limits WHERE key = p_key FOR UPDATE;
  IF ws IS NULL OR (now() - ws) > make_interval(secs => p_window) THEN
    INSERT INTO public.rate_limits (key, window_start, count) VALUES (p_key, now(), 1)
      ON CONFLICT (key) DO UPDATE SET window_start = now(), count = 1;
    RETURN TRUE;
  END IF;
  IF cnt >= p_max THEN RETURN FALSE; END IF;
  UPDATE public.rate_limits SET count = count + 1 WHERE key = p_key;
  RETURN TRUE;
END;
$$;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;
