-- =============================================================================
-- 0004_teacher_model — Fase 2: rol maestro, grupos y RLS de maestro (aditivo)
-- Relación maestro-alumno vía grupos. feedback_sessions con audiencia diferenciada.
-- =============================================================================

-- Datos extendidos del maestro
CREATE TABLE IF NOT EXISTS public.teachers (
  id          UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  bio         TEXT,
  specialties TEXT[],
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  teacher_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  level       TEXT,
  invite_code TEXT UNIQUE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS groups_teacher_idx ON public.groups(teacher_id);

CREATE TABLE IF NOT EXISTS public.group_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status     TEXT NOT NULL DEFAULT 'active',
  UNIQUE (group_id, student_id)
);
CREATE INDEX IF NOT EXISTS group_members_group_idx   ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS group_members_student_idx ON public.group_members(student_id);

-- Feedback maestro/agente -> alumno, con audiencia.
CREATE TABLE IF NOT EXISTS public.feedback_sessions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  author_id            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_type          TEXT NOT NULL DEFAULT 'teacher' CHECK (author_type IN ('teacher','ai_agent','system')),
  audience             TEXT NOT NULL DEFAULT 'both'   CHECK (audience IN ('student','teacher','both')),
  evaluation_id        UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
  evaluation_result_id UUID REFERENCES public.evaluation_results(id) ON DELETE CASCADE,
  content              TEXT,
  recommendations      JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS feedback_sessions_student_idx ON public.feedback_sessions(student_id);

-- ── Función pivote: ¿el usuario actual es maestro de este alumno? ─────────────
CREATE OR REPLACE FUNCTION public.is_teacher_of(p_student_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    JOIN public.groups g ON g.id = gm.group_id
    WHERE gm.student_id = p_student_id
      AND g.teacher_id = auth.uid()
      AND gm.status = 'active'
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_teacher_of(UUID) TO authenticated, service_role;

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.teachers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_sessions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers, public.groups, public.group_members, public.feedback_sessions TO authenticated;
GRANT ALL ON public.teachers, public.groups, public.group_members, public.feedback_sessions TO service_role;

-- teachers: lectura pública (datos no sensibles); cada quien gestiona lo suyo; admin todo.
DROP POLICY IF EXISTS "teachers readable"   ON public.teachers;
DROP POLICY IF EXISTS "teacher self manage" ON public.teachers;
DROP POLICY IF EXISTS "admin manage teachers" ON public.teachers;
CREATE POLICY "teachers readable"     ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "teacher self manage"   ON public.teachers FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "admin manage teachers" ON public.teachers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- groups: el maestro dueño gestiona; el alumno miembro ve; admin todo.
DROP POLICY IF EXISTS "group owner manage" ON public.groups;
DROP POLICY IF EXISTS "group member read"  ON public.groups;
DROP POLICY IF EXISTS "admin manage groups" ON public.groups;
CREATE POLICY "group owner manage" ON public.groups FOR ALL USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "group member read"  ON public.groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = id AND gm.student_id = auth.uid())
);
CREATE POLICY "admin manage groups" ON public.groups FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- group_members: alumno gestiona su propia membresía; maestro dueño del grupo gestiona; admin todo.
DROP POLICY IF EXISTS "member self"        ON public.group_members;
DROP POLICY IF EXISTS "teacher manage members" ON public.group_members;
DROP POLICY IF EXISTS "admin manage members"   ON public.group_members;
CREATE POLICY "member self" ON public.group_members FOR ALL
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "teacher manage members" ON public.group_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.teacher_id = auth.uid()));
CREATE POLICY "admin manage members" ON public.group_members FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- feedback_sessions: alumno ve lo dirigido a él; maestro de ese alumno escribe/lee; admin todo.
DROP POLICY IF EXISTS "student reads own feedback" ON public.feedback_sessions;
DROP POLICY IF EXISTS "teacher manages student feedback" ON public.feedback_sessions;
DROP POLICY IF EXISTS "admin manage feedback" ON public.feedback_sessions;
CREATE POLICY "student reads own feedback" ON public.feedback_sessions FOR SELECT
  USING (student_id = auth.uid() AND audience IN ('student','both'));
CREATE POLICY "teacher manages student feedback" ON public.feedback_sessions FOR ALL
  USING (public.is_teacher_of(student_id))
  WITH CHECK (public.is_teacher_of(student_id) AND author_id = auth.uid());
CREATE POLICY "admin manage feedback" ON public.feedback_sessions FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── Políticas de maestro sobre tablas existentes (SELECT de sus alumnos) ──────
DROP POLICY IF EXISTS "Teachers read their students" ON public.users;
CREATE POLICY "Teachers read their students" ON public.users FOR SELECT USING (public.is_teacher_of(id));

DROP POLICY IF EXISTS "Teachers read student evaluations" ON public.evaluations;
CREATE POLICY "Teachers read student evaluations" ON public.evaluations FOR SELECT USING (public.is_teacher_of(user_id));

DROP POLICY IF EXISTS "Teachers read student results" ON public.evaluation_results;
CREATE POLICY "Teachers read student results" ON public.evaluation_results FOR SELECT USING (public.is_teacher_of(user_id));

-- Audios: el maestro de un alumno puede leer los objetos de su carpeta {uid}/...
DROP POLICY IF EXISTS "student_audios teacher read" ON storage.objects;
CREATE POLICY "student_audios teacher read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'student_audios'
    AND public.is_teacher_of(NULLIF((storage.foldername(name))[1], '')::uuid)
  );
