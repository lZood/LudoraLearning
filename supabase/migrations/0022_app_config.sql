-- =============================================================================
-- 0022_app_config — Config clave/valor de servidor (secretos NO gestionados por
-- el panel de deploy). Caso de uso: CRON_SECRET para /api/cron/close-week, que
-- así vive en la BD (sobrevive redeploys) y no depende de variables de entorno
-- del panel. Solo service_role puede leerla/escribirla (RLS sin políticas).
-- El valor real se inserta fuera de git (no se commitea el secreto).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Sin políticas RLS => anon/authenticated NO pueden ver ni tocar la tabla.
-- service_role (usado por createAdminClient en los route handlers) bypassa RLS.
REVOKE ALL ON public.app_config FROM anon, authenticated;
