-- =============================================================================
-- 0010_hardening — Fase 7: asegurar la tabla interna de migraciones.
-- schema_migrations no debe ser legible por los roles de API (anon/authenticated).
-- El runner se conecta como supabase_admin (bypassa RLS), así que no se rompe.
-- =============================================================================
ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.schema_migrations FROM anon, authenticated;
-- Sin políticas: solo superusuario/service_role (bypass RLS) la acceden.
