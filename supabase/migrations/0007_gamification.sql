-- =============================================================================
-- 0007_gamification — Fase 5: XP, monedas, rachas, logros, skills, ligas, leaderboard.
-- Escrituras sensibles SOLO vía RPC SECURITY DEFINER (anti-fraude de XP).
-- Dos ejes: BANDAS (CEFR, progreso) vs LIGAS (minerales, competencia semanal).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.leagues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  tier_order    INTEGER NOT NULL,
  color         TEXT,
  promote_count INTEGER NOT NULL DEFAULT 10,
  demote_count  INTEGER NOT NULL DEFAULT 5
);

CREATE TABLE IF NOT EXISTS public.user_gamification (
  user_id           UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  xp_total          INTEGER NOT NULL DEFAULT 0,
  level_number      INTEGER NOT NULL DEFAULT 1,
  coins             INTEGER NOT NULL DEFAULT 0,
  current_streak    INTEGER NOT NULL DEFAULT 0,
  longest_streak    INTEGER NOT NULL DEFAULT 0,
  last_active_date  DATE,
  current_league_id UUID REFERENCES public.leagues(id),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT current_date,
  xp_earned     INTEGER NOT NULL DEFAULT 0,
  source        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activity_log_user_idx ON public.activity_log(user_id, activity_date);

CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount       INTEGER NOT NULL,
  reason       TEXT,
  reference_id UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS coin_tx_user_idx ON public.coin_transactions(user_id);

CREATE TABLE IF NOT EXISTS public.achievements (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  criteria    JSONB,
  band        INTEGER
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.user_skills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id    TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mastery     NUMERIC,
  UNIQUE (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  league_id  UUID REFERENCES public.leagues(id),
  week_start DATE NOT NULL,
  points     INTEGER NOT NULL DEFAULT 0,
  rank       INTEGER,
  trend      TEXT,
  UNIQUE (user_id, week_start)
);
CREATE INDEX IF NOT EXISTS leaderboard_week_idx ON public.leaderboard_entries(week_start, points DESC);

-- ── Seeds: ligas minerales + catálogo de logros ─────────────────────────────
INSERT INTO public.leagues (name, tier_order, color) VALUES
  ('Carbón', 1, '#4b5563'), ('Hierro', 2, '#9ca3af'), ('Oro', 3, '#f59e0b'),
  ('Diamante', 4, '#22d3ee'), ('Esmeralda', 5, '#10b981'), ('Netherite', 6, '#1f2937')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.achievements (id, name, description, icon) VALUES
  ('base_structures','Estructuras Base Dominadas','Has sentado las bases del idioma con éxito.','Star'),
  ('instruction_master','Comprensión de Instrucciones','Capacidad para seguir directrices complejas.','Headphones'),
  ('visual_explorer','Explorador de Mapas','Excelente identificación de patrones visuales.','Map'),
  ('legend_scribe','Escriba de Libros y Plumas','Tu escritura empieza a contar grandes historias.','PenTool'),
  ('eloquent_bard','Bardo de la Aldea','Tu voz resuena con claridad y propósito en el Overworld.','Mic'),
  ('grammar_master','Maestro de Encantamientos','Dominio avanzado de las reglas del lenguaje.','Sparkles'),
  ('hawk_ear','Oído de Gato Relevador','No se te escapa ni un susurro de los creepers.','Ear'),
  ('redstone_engineer','Ingeniero de Redstone','Lógica impecable en la estructura de tus oraciones.','Cpu'),
  ('polyglot_scout','Explorador del End','Versatilidad legendaria en múltiples áreas del lenguaje.','Compass'),
  ('steve_apprentice','Aprendiz de Steve','Estás dando tus primeros pasos con valentía.','Pickaxe')
ON CONFLICT (id) DO UPDATE SET name=excluded.name, description=excluded.description, icon=excluded.icon;

-- ── RLS + grants ─────────────────────────────────────────────────────────────
ALTER TABLE public.leagues             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.leagues, public.achievements, public.leaderboard_entries TO authenticated, anon;
GRANT SELECT ON public.user_gamification, public.activity_log, public.coin_transactions, public.user_achievements, public.user_skills TO authenticated;
GRANT ALL ON public.leagues, public.user_gamification, public.activity_log, public.coin_transactions, public.achievements, public.user_achievements, public.user_skills, public.leaderboard_entries TO service_role;

-- Catálogos legibles; CRUD admin.
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['leagues','achievements'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s read" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s read" ON public.%I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s admin" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s admin" ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())', t, t);
  END LOOP;
END $$;

-- Estado del alumno: lectura propia + maestro. Escritura SOLO por RPC/service_role.
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['user_gamification','activity_log','coin_transactions','user_achievements','user_skills'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s self read" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s self read" ON public.%I FOR SELECT USING (user_id = auth.uid())', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s teacher read" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s teacher read" ON public.%I FOR SELECT USING (public.is_teacher_of(user_id))', t, t);
  END LOOP;
END $$;

-- Leaderboard: visible para autenticados (ranking entre la liga).
DROP POLICY IF EXISTS "leaderboard read" ON public.leaderboard_entries;
CREATE POLICY "leaderboard read" ON public.leaderboard_entries FOR SELECT TO authenticated USING (true);

-- ── Trigger: crear user_gamification al registrarse + backfill ───────────────
CREATE OR REPLACE FUNCTION public.handle_new_user_gamification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_gamification (user_id, current_league_id)
  VALUES (NEW.id, (SELECT id FROM public.leagues WHERE tier_order = 1 LIMIT 1))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_user_created_gamification ON public.users;
CREATE TRIGGER on_user_created_gamification
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_gamification();

-- Backfill usuarios existentes
INSERT INTO public.user_gamification (user_id, current_league_id)
SELECT u.id, (SELECT id FROM public.leagues WHERE tier_order = 1 LIMIT 1)
FROM public.users u
ON CONFLICT (user_id) DO NOTHING;

-- ── RPC: otorgar progreso (XP + monedas + racha + leaderboard) atómicamente ──
CREATE OR REPLACE FUNCTION public.grant_progress(p_xp INTEGER, p_coins INTEGER DEFAULT 0, p_source TEXT DEFAULT 'activity')
RETURNS public.user_gamification LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  g public.user_gamification;
  wk DATE := date_trunc('week', current_date)::date;
  new_streak INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'no auth'; END IF;
  INSERT INTO public.user_gamification (user_id, current_league_id)
    VALUES (uid, (SELECT id FROM public.leagues WHERE tier_order=1 LIMIT 1))
    ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO g FROM public.user_gamification WHERE user_id = uid FOR UPDATE;

  -- Racha
  IF g.last_active_date = current_date THEN
    new_streak := g.current_streak;
  ELSIF g.last_active_date = current_date - 1 THEN
    new_streak := g.current_streak + 1;
  ELSE
    new_streak := 1;
  END IF;

  UPDATE public.user_gamification SET
    xp_total = xp_total + GREATEST(p_xp,0),
    coins = coins + GREATEST(p_coins,0),
    level_number = GREATEST(1, floor((xp_total + GREATEST(p_xp,0)) / 100.0)::int + 1),
    current_streak = new_streak,
    longest_streak = GREATEST(longest_streak, new_streak),
    last_active_date = current_date,
    updated_at = now()
  WHERE user_id = uid
  RETURNING * INTO g;

  IF p_xp <> 0 THEN
    INSERT INTO public.activity_log (user_id, xp_earned, source) VALUES (uid, p_xp, p_source);
  END IF;
  IF p_coins <> 0 THEN
    INSERT INTO public.coin_transactions (user_id, amount, reason) VALUES (uid, p_coins, p_source);
  END IF;

  -- Leaderboard semanal
  INSERT INTO public.leaderboard_entries (user_id, league_id, week_start, points)
  VALUES (uid, g.current_league_id, wk, GREATEST(p_xp,0))
  ON CONFLICT (user_id, week_start) DO UPDATE SET points = public.leaderboard_entries.points + GREATEST(p_xp,0);

  RETURN g;
END;
$$;
GRANT EXECUTE ON FUNCTION public.grant_progress(INTEGER, INTEGER, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.unlock_achievement(p_achievement_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'no auth'; END IF;
  INSERT INTO public.user_achievements (user_id, achievement_id)
  VALUES (auth.uid(), p_achievement_id)
  ON CONFLICT (user_id, achievement_id) DO NOTHING;
END;
$$;
GRANT EXECUTE ON FUNCTION public.unlock_achievement(TEXT) TO authenticated;
