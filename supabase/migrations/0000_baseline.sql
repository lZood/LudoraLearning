-- =============================================================================
-- 0000_baseline — Esquema base de LudoraLearning (reconstruido del código)
-- Tablas: users, subscriptions, evaluations, evaluation_results
-- Storage: bucket público student_audios (se vuelve privado en 0002)
-- Idempotente. Ya aplicado en el remoto; se incluye para reproducibilidad.
-- =============================================================================

-- 1. users
CREATE TABLE IF NOT EXISTS public.users (
  id                       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    TEXT NOT NULL,
  full_name                TEXT,
  age                      INTEGER,
  stripe_customer_id       TEXT,
  english_level            TEXT,
  has_completed_evaluation BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (id)
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile."   ON public.users;
DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
CREATE POLICY "Users can view own profile."   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                   TEXT PRIMARY KEY,
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status               TEXT NOT NULL,
  price_id             TEXT,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end   TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscriptions." ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions." ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 3. evaluations
CREATE TABLE IF NOT EXISTS public.evaluations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  calculated_band    INTEGER,
  category_levels    JSONB,
  evaluation_history JSONB,
  ai_oracle_verdict  TEXT,
  achievements       JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS evaluations_user_id_idx ON public.evaluations(user_id);
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own evaluations."   ON public.evaluations;
DROP POLICY IF EXISTS "Users can insert own evaluations." ON public.evaluations;
CREATE POLICY "Users can view own evaluations."   ON public.evaluations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own evaluations." ON public.evaluations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. evaluation_results
CREATE TABLE IF NOT EXISTS public.evaluation_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id         TEXT,
  level            INTEGER,
  is_correct       BOOLEAN,
  user_answer_text TEXT,
  audio_url        TEXT,
  ai_feedback      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS evaluation_results_user_id_idx ON public.evaluation_results(user_id);
ALTER TABLE public.evaluation_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own results."   ON public.evaluation_results;
DROP POLICY IF EXISTS "Users can insert own results." ON public.evaluation_results;
CREATE POLICY "Users can view own results."   ON public.evaluation_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own results." ON public.evaluation_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Trigger handle_new_user (se actualiza en 0001 para persistir phone)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Storage bucket (público; se endurece en 0002)
INSERT INTO storage.buckets (id, name, public)
VALUES ('student_audios', 'student_audios', true)
ON CONFLICT (id) DO UPDATE SET public = true;
DROP POLICY IF EXISTS "student_audios public read"          ON storage.objects;
DROP POLICY IF EXISTS "student_audios authenticated upload" ON storage.objects;
CREATE POLICY "student_audios public read"
  ON storage.objects FOR SELECT USING (bucket_id = 'student_audios');
CREATE POLICY "student_audios authenticated upload"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'student_audios');
