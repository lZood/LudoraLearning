-- =============================================================================
-- 0006_curriculum — Fase 4: estructura curricular real + progreso por alumno.
-- Reemplaza COURSE_DATA/ACTIVITIES (mock) con catálogo en BD + progreso separado.
-- Aditivo (no rompe prod: el código viejo sigue usando courseData.ts hasta el refactor).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT,
  total_levels INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.levels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  external_id TEXT UNIQUE,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  band        INTEGER,
  cefr_levels TEXT[]
);

CREATE TABLE IF NOT EXISTS public.units (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id    TEXT UNIQUE,
  level_id       UUID REFERENCES public.levels(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  icon           TEXT,
  description    TEXT,
  intro_video_url TEXT,
  order_index    INTEGER NOT NULL DEFAULT 0,
  is_new         BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS units_level_idx ON public.units(level_id);

CREATE TABLE IF NOT EXISTS public.activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id     UUID REFERENCES public.units(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('theory','exercise','audio','midterm','chat','final')),
  title       TEXT,
  subtitle    TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  content     JSONB,
  xp_reward   INTEGER NOT NULL DEFAULT 10
);
CREATE INDEX IF NOT EXISTS activities_unit_idx ON public.activities(unit_id);

CREATE TABLE IF NOT EXISTS public.user_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  unit_id          UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  progress_pct     INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked','in_progress','completed')),
  last_accessed_at TIMESTAMPTZ,
  UNIQUE (user_id, unit_id)
);
CREATE INDEX IF NOT EXISTS user_progress_user_idx ON public.user_progress(user_id);

CREATE TABLE IF NOT EXISTS public.user_activity_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_id  UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  score        NUMERIC,
  attempts     INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, activity_id)
);
CREATE INDEX IF NOT EXISTS user_activity_user_idx ON public.user_activity_progress(user_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.courses                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_progress ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.courses, public.levels, public.units, public.activities TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress, public.user_activity_progress TO authenticated;
GRANT ALL ON public.courses, public.levels, public.units, public.activities, public.user_progress, public.user_activity_progress TO service_role;

-- Catálogo: lectura para autenticados; CRUD admin.
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['courses','levels','units','activities'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s readable" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s readable" ON public.%I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s admin" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s admin" ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())', t, t);
  END LOOP;
END $$;

-- Progreso: el alumno gestiona el suyo; el maestro lo ve; admin todo.
DROP POLICY IF EXISTS "progress self"    ON public.user_progress;
DROP POLICY IF EXISTS "progress teacher" ON public.user_progress;
CREATE POLICY "progress self"    ON public.user_progress FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "progress teacher" ON public.user_progress FOR SELECT USING (public.is_teacher_of(user_id));

DROP POLICY IF EXISTS "act progress self"    ON public.user_activity_progress;
DROP POLICY IF EXISTS "act progress teacher" ON public.user_activity_progress;
CREATE POLICY "act progress self"    ON public.user_activity_progress FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "act progress teacher" ON public.user_activity_progress FOR SELECT USING (public.is_teacher_of(user_id));
