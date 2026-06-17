-- =============================================================================
-- 0019_ranking_seasons — Fundación del ranking semanal "Liga + Cofre de la Aldea"
--  - Reordena las ligas a: Madera→Piedra→Hierro→Oro→Esmeralda→Diamante→Netherite
--  - Tablas del motor: league_weeks (idempotencia del cierre), cohort_id, cofre de aldea,
--    cosméticos (catálogo + inventario + equipados) y AMIGOS.
--  Escrituras sensibles seguirán por RPC SECURITY DEFINER (close_week / purchase_cosmetic) en
--  migraciones siguientes. Esta migración es ADITIVA (no rompe el flujo de XP existente).
-- =============================================================================

-- ── Ligas: 7 niveles. Renombra Carbón→Madera (preserva FKs de usuarios ya asignados) + Piedra ──
UPDATE public.leagues SET name = 'Madera', tier_order = 1, color = '#8B5E3C' WHERE name = 'Carbón';
INSERT INTO public.leagues (name, tier_order, color) VALUES ('Piedra', 2, '#9ca3af')
  ON CONFLICT (name) DO UPDATE SET tier_order = EXCLUDED.tier_order, color = EXCLUDED.color;
UPDATE public.leagues SET tier_order = 3, color = '#e5e7eb' WHERE name = 'Hierro';
UPDATE public.leagues SET tier_order = 4, color = '#f59e0b' WHERE name = 'Oro';
UPDATE public.leagues SET tier_order = 5, color = '#10b981' WHERE name = 'Esmeralda';
UPDATE public.leagues SET tier_order = 6, color = '#22d3ee' WHERE name = 'Diamante';
UPDATE public.leagues SET tier_order = 7, color = '#4b3a52' WHERE name = 'Netherite';

-- ── Idempotencia del cierre semanal ──
CREATE TABLE IF NOT EXISTS public.league_weeks (
  week_start DATE PRIMARY KEY,
  status     TEXT NOT NULL DEFAULT 'open',  -- 'open' | 'closed'
  closed_at  TIMESTAMPTZ
);

-- ── Cohortes (subdividir ligas grandes en grupos estables ~25-30) ──
ALTER TABLE public.leaderboard_entries ADD COLUMN IF NOT EXISTS cohort_id TEXT;
CREATE INDEX IF NOT EXISTS leaderboard_cohort_idx ON public.leaderboard_entries(week_start, cohort_id, points DESC);

-- ── Cofre de la Aldea (meta cooperativa por liga/semana) ──
CREATE TABLE IF NOT EXISTS public.cohort_goals (
  league_id          UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  week_start         DATE NOT NULL,
  target_points      INTEGER NOT NULL,
  reward_cosmetic_id TEXT,
  reached            BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (league_id, week_start)
);

-- ── Cosméticos: catálogo + inventario + equipados ──
CREATE TABLE IF NOT EXISTS public.cosmetic_catalog (
  id                   TEXT PRIMARY KEY,
  type                 TEXT NOT NULL,           -- 'frame' | 'title' | 'name_color' | 'banner' | 'skin'
  name                 TEXT NOT NULL,
  value                TEXT,                    -- color hex / nombre de skin / asset
  price_coins          INTEGER NOT NULL DEFAULT 0,  -- 0 = no comprable (solo se gana)
  required_league_tier INTEGER,                 -- exclusivo de rango (no comprable si NULL precio 0)
  season               TEXT,
  sort                 INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.user_cosmetics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cosmetic_id  TEXT NOT NULL REFERENCES public.cosmetic_catalog(id) ON DELETE CASCADE,
  source       TEXT,                            -- 'shop' | 'league_up' | 'weekly_chest' | 'village_chest'
  reference_id TEXT,
  granted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cosmetic_id)
);
CREATE INDEX IF NOT EXISTS user_cosmetics_user_idx ON public.user_cosmetics(user_id);

-- Cosméticos equipados (perfil dinámico; hoy el perfil hardcodea Steve/'Aventurero Maestro').
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS equipped_frame      TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS equipped_title      TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS equipped_name_color TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS equipped_skin       TEXT;

-- ── AMIGOS (conexiones / vínculos / rachas) ──
CREATE TABLE IF NOT EXISTS public.friendships (
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'accepted'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id <> friend_id)
);
CREATE INDEX IF NOT EXISTS friendships_friend_idx ON public.friendships(friend_id);

-- ── Seed inicial del catálogo: marcos por liga (se ganan al ascender) + algunos cosméticos ──
INSERT INTO public.cosmetic_catalog (id, type, name, value, price_coins, required_league_tier, sort) VALUES
  ('frame_madera',   'frame', 'Marco de Madera',   '#8B5E3C', 0, 1, 1),
  ('frame_piedra',   'frame', 'Marco de Piedra',   '#9ca3af', 0, 2, 2),
  ('frame_hierro',   'frame', 'Marco de Hierro',   '#e5e7eb', 0, 3, 3),
  ('frame_oro',      'frame', 'Marco de Oro',      '#f59e0b', 0, 4, 4),
  ('frame_esmeralda','frame', 'Marco de Esmeralda','#10b981', 0, 5, 5),
  ('frame_diamante', 'frame', 'Marco de Diamante', '#22d3ee', 0, 6, 6),
  ('frame_netherite','frame', 'Marco de Netherite','#4b3a52', 0, 7, 7),
  ('color_dorado',   'name_color', 'Nombre Dorado',  '#f59e0b', 300, NULL, 10),
  ('color_esmeralda','name_color', 'Nombre Esmeralda','#10b981', 300, NULL, 11),
  ('color_diamante', 'name_color', 'Nombre Diamante','#22d3ee', 500, NULL, 12),
  ('title_minero',   'title', 'Minero Novato',  'Minero Novato',  100, NULL, 20),
  ('title_aventurero','title','Aventurero',      'Aventurero',     100, NULL, 21)
ON CONFLICT (id) DO NOTHING;

-- ── RLS + grants ──
ALTER TABLE public.league_weeks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_goals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetic_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cosmetics   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships      ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.league_weeks, public.cohort_goals, public.cosmetic_catalog TO authenticated, anon;
GRANT SELECT ON public.user_cosmetics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.league_weeks, public.cohort_goals, public.cosmetic_catalog, public.user_cosmetics, public.friendships TO service_role;

-- Catálogos/estado legibles por autenticados.
DROP POLICY IF EXISTS "league_weeks read" ON public.league_weeks;
CREATE POLICY "league_weeks read" ON public.league_weeks FOR SELECT USING (true);
DROP POLICY IF EXISTS "cohort_goals read" ON public.cohort_goals;
CREATE POLICY "cohort_goals read" ON public.cohort_goals FOR SELECT USING (true);
DROP POLICY IF EXISTS "cosmetic_catalog read" ON public.cosmetic_catalog;
CREATE POLICY "cosmetic_catalog read" ON public.cosmetic_catalog FOR SELECT USING (true);

-- Inventario: lectura propia (escritura solo por RPC/service_role).
DROP POLICY IF EXISTS "user_cosmetics self read" ON public.user_cosmetics;
CREATE POLICY "user_cosmetics self read" ON public.user_cosmetics FOR SELECT USING (user_id = auth.uid());

-- Amigos: ves tus relaciones (como emisor o receptor); creas solicitudes propias; aceptas/borras lo tuyo.
DROP POLICY IF EXISTS "friendships read" ON public.friendships;
CREATE POLICY "friendships read" ON public.friendships FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());
DROP POLICY IF EXISTS "friendships insert" ON public.friendships;
CREATE POLICY "friendships insert" ON public.friendships FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "friendships update" ON public.friendships;
CREATE POLICY "friendships update" ON public.friendships FOR UPDATE USING (friend_id = auth.uid() OR user_id = auth.uid());
DROP POLICY IF EXISTS "friendships delete" ON public.friendships;
CREATE POLICY "friendships delete" ON public.friendships FOR DELETE USING (user_id = auth.uid() OR friend_id = auth.uid());
