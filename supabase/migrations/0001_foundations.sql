-- =============================================================================
-- 0001_foundations — Fase 0: cimientos de auth + saneamiento de esquema
-- Aditivo, no destructivo. No borra datos existentes.
-- =============================================================================

-- 1) Extender public.users: rol + campos de perfil
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role            TEXT NOT NULL DEFAULT 'student';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone           TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url      TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS placement_level TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
    ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('student','teacher','admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key') THEN
    ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);

-- 2) updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS users_set_updated_at ON public.users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) handle_new_user: persistir full_name + phone (role queda por DEFAULT)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- 4) Saneamiento de evaluation_results
--    level INTEGER -> TEXT (guarda CEFR 'A1'/'Pre-A1'); 0 filas hoy => conversión segura
ALTER TABLE public.evaluation_results ALTER COLUMN level TYPE TEXT USING level::TEXT;
ALTER TABLE public.evaluation_results ADD COLUMN IF NOT EXISTS evaluation_id      UUID REFERENCES public.evaluations(id) ON DELETE CASCADE;
ALTER TABLE public.evaluation_results ADD COLUMN IF NOT EXISTS question_id        TEXT;
ALTER TABLE public.evaluation_results ADD COLUMN IF NOT EXISTS audio_path         TEXT;
ALTER TABLE public.evaluation_results ADD COLUMN IF NOT EXISTS ai_raw_response    JSONB;
ALTER TABLE public.evaluation_results ADD COLUMN IF NOT EXISTS needs_human_review BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS evaluation_results_evaluation_id_idx ON public.evaluation_results(evaluation_id);
CREATE INDEX IF NOT EXISTS evaluation_results_review_idx ON public.evaluation_results(needs_human_review) WHERE needs_human_review;

-- 5) evaluations: estado + idempotencia por intento
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS status         TEXT NOT NULL DEFAULT 'completed';
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS attempt_number INTEGER;
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS completed_at   TIMESTAMPTZ;

-- 6) Helpers de rol (para RLS futuras y guards). SECURITY DEFINER => no recursan en RLS.
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$;

-- 7) Admin puede ver/gestionar todos los perfiles (para el futuro CMS/admin)
DROP POLICY IF EXISTS "Admins manage all profiles." ON public.users;
CREATE POLICY "Admins manage all profiles." ON public.users
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
