-- =============================================================================
-- 0009_content — Fase 6: planes, clases en vivo, eventos, videos, materiales,
-- fonética, noticias, acceso a servidor MC. Aditivo. RLS + seeds + RPC de reserva.
-- =============================================================================

-- ── Planes (catálogo de precios; reemplaza precios hardcodeados) ──────────────
CREATE TABLE IF NOT EXISTS public.plans (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  price_cents           INTEGER,
  currency              TEXT NOT NULL DEFAULT 'MXN',
  interval              TEXT NOT NULL DEFAULT 'month',
  stripe_price_id       TEXT,
  live_classes_per_month INTEGER,
  features              JSONB,
  order_index           INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES public.plans(id);

-- ── Clases en vivo + reservas ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.live_classes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  teacher_id   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  group_id     UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 45,
  capacity     INTEGER NOT NULL DEFAULT 10,
  level        TEXT,
  status       TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','done','cancelled')),
  coin_cost    INTEGER NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_classes_when_idx ON public.live_classes(scheduled_at);

CREATE TABLE IF NOT EXISTS public.class_bookings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id   UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','attended','cancelled','no_show')),
  booked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id)
);

-- ── Eventos de comunidad ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  type         TEXT,
  scheduled_at TIMESTAMPTZ,
  description  TEXT,
  reward_coins INTEGER NOT NULL DEFAULT 0,
  capacity     INTEGER
);
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'registered',
  UNIQUE (event_id, student_id)
);

-- ── Videos + progreso ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  category      TEXT,
  level         TEXT,
  thumbnail_url TEXT,
  youtube_id    TEXT,
  duration_sec  INTEGER,
  xp_reward     INTEGER NOT NULL DEFAULT 10,
  unlock_level  INTEGER NOT NULL DEFAULT 1,
  order_index   INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS public.video_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_id        UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  watched         BOOLEAN NOT NULL DEFAULT FALSE,
  watched_seconds INTEGER NOT NULL DEFAULT 0,
  quiz_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, video_id)
);

-- ── Materiales ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.materials (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category       TEXT,
  title          TEXT NOT NULL,
  type           TEXT,
  required_level TEXT,
  url            TEXT,
  icon           TEXT,
  unit_id        UUID REFERENCES public.units(id) ON DELETE SET NULL,
  order_index    INTEGER NOT NULL DEFAULT 0
);

-- ── Fonética (tabla IPA) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.phonemes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ipa_symbol   TEXT NOT NULL,
  type         TEXT CHECK (type IN ('vowel','consonant')),
  example_word TEXT,
  image_url    TEXT,
  audio_url    TEXT,
  order_index  INTEGER NOT NULL DEFAULT 0
);

-- ── Noticias + likes + comentarios ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.news_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  image_url    TEXT,
  category     TEXT,
  cta_url      TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.post_likes (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  UNIQUE (post_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.post_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Acceso al servidor Minecraft ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.minecraft_server_access (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  granted           BOOLEAN NOT NULL DEFAULT FALSE,
  minecraft_username TEXT,
  server_id         TEXT,
  granted_at        TIMESTAMPTZ
);

-- ── RLS + grants ─────────────────────────────────────────────────────────────
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['plans','live_classes','events','videos','materials','phonemes','news_posts','class_bookings','event_registrations','video_progress','post_likes','post_comments','minecraft_server_access'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

-- Catálogos: lectura autenticada (planes también anon); CRUD admin/teacher.
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['plans','live_classes','events','videos','materials','phonemes','news_posts'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated, anon', t);
    EXECUTE format('DROP POLICY IF EXISTS "%s read" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s read" ON public.%I FOR SELECT USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s manage" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s manage" ON public.%I FOR ALL USING (public.is_admin() OR public.current_app_role()=''teacher'') WITH CHECK (public.is_admin() OR public.current_app_role()=''teacher'')', t, t);
  END LOOP;
END $$;

-- Tablas por-usuario: self CRUD.
DO $$ DECLARE t TEXT; col TEXT; BEGIN
  FOR t, col IN SELECT * FROM (VALUES
    ('class_bookings','student_id'),('event_registrations','student_id'),
    ('video_progress','user_id'),('post_likes','user_id'),
    ('post_comments','user_id'),('minecraft_server_access','user_id')
  ) AS v(t,col) LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('DROP POLICY IF EXISTS "%s self" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s self" ON public.%I FOR ALL USING (%I = auth.uid()) WITH CHECK (%I = auth.uid())', t, t, col, col);
  END LOOP;
END $$;

-- Likes y comentarios: lectura pública (autenticada) para contar/mostrar.
DROP POLICY IF EXISTS "likes readable" ON public.post_likes;
CREATE POLICY "likes readable" ON public.post_likes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "comments readable" ON public.post_comments;
CREATE POLICY "comments readable" ON public.post_comments FOR SELECT TO authenticated USING (true);

-- ── RPC: reservar clase (valida cupo + descuenta monedas) ────────────────────
CREATE OR REPLACE FUNCTION public.book_class(p_class_id UUID)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  c public.live_classes;
  taken INTEGER;
  bal INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'no auth'; END IF;
  SELECT * INTO c FROM public.live_classes WHERE id = p_class_id;
  IF c.id IS NULL OR c.status <> 'scheduled' THEN RAISE EXCEPTION 'clase no disponible'; END IF;
  IF EXISTS (SELECT 1 FROM public.class_bookings WHERE class_id = p_class_id AND student_id = uid AND status='booked') THEN
    RETURN 'already';
  END IF;
  SELECT count(*) INTO taken FROM public.class_bookings WHERE class_id = p_class_id AND status='booked';
  IF taken >= c.capacity THEN RAISE EXCEPTION 'cupo lleno'; END IF;
  SELECT coins INTO bal FROM public.user_gamification WHERE user_id = uid;
  IF COALESCE(bal,0) < c.coin_cost THEN RAISE EXCEPTION 'monedas insuficientes'; END IF;

  UPDATE public.user_gamification SET coins = coins - c.coin_cost, updated_at = now() WHERE user_id = uid;
  INSERT INTO public.coin_transactions (user_id, amount, reason, reference_id) VALUES (uid, -c.coin_cost, 'reserva_clase', p_class_id);
  INSERT INTO public.class_bookings (class_id, student_id) VALUES (p_class_id, uid);
  RETURN 'ok';
END;
$$;
GRANT EXECUTE ON FUNCTION public.book_class(UUID) TO authenticated;

-- ── Seeds ────────────────────────────────────────────────────────────────────
INSERT INTO public.plans (id, name, price_cents, currency, interval, stripe_price_id, live_classes_per_month, features, order_index) VALUES
  ('basic','Plan Estándar', 39900, 'MXN', 'month', 'price_1T8WrO0qbWrTcjOehklKiW9X', 4,
    '["Acceso a todos los niveles","4 clases en vivo al mes","Evaluación con IA","Acceso al servidor Minecraft"]'::jsonb, 1),
  ('plus','Plan Plus', 99900, 'MXN', 'month', NULL, 12,
    '["Todo lo del plan Estándar","12 clases en vivo al mes","Feedback prioritario del maestro","Eventos exclusivos de comunidad"]'::jsonb, 2)
ON CONFLICT (id) DO UPDATE SET name=excluded.name, price_cents=excluded.price_cents, features=excluded.features, live_classes_per_month=excluded.live_classes_per_month, order_index=excluded.order_index;

INSERT INTO public.phonemes (ipa_symbol, type, example_word, order_index) VALUES
  ('/iː/','vowel','sheep',1),('/ɪ/','vowel','ship',2),('/e/','vowel','bed',3),('/æ/','vowel','cat',4),
  ('/ɑː/','vowel','car',5),('/ɒ/','vowel','hot',6),('/ɔː/','vowel','door',7),('/ʊ/','vowel','book',8),
  ('/uː/','vowel','blue',9),('/ʌ/','vowel','cup',10),('/ɜː/','vowel','bird',11),('/ə/','vowel','about',12),
  ('/p/','consonant','pig',13),('/b/','consonant','bed',14),('/t/','consonant','tree',15),('/d/','consonant','dog',16),
  ('/k/','consonant','cake',17),('/g/','consonant','gold',18),('/θ/','consonant','think',19),('/ð/','consonant','this',20),
  ('/ʃ/','consonant','sheep',21),('/tʃ/','consonant','chicken',22),('/dʒ/','consonant','jump',23),('/ŋ/','consonant','king',24)
ON CONFLICT DO NOTHING;

INSERT INTO public.materials (category, title, type, required_level, icon, order_index) VALUES
  ('pronunciacion','Guía de fonemas IPA','pdf','Banda 1','Volume2',1),
  ('listening','Diálogos de aldea (audio)','audio','Banda 1','Headphones',2),
  ('gramatica','Verbo to be — resumen','pdf','Banda 1','BookOpen',3),
  ('juegos','Memorama de vocabulario','game','Banda 1','Gamepad2',4)
ON CONFLICT DO NOTHING;

INSERT INTO public.videos (title, category, level, xp_reward, unlock_level, order_index) VALUES
  ('Saludos básicos en Minecraft','Vocabulario','Banda 1',15,1,1),
  ('Colores y números','Vocabulario','Banda 1',15,1,2),
  ('El verbo to be','Gramática','Banda 1',20,1,3),
  ('Pedir ayuda en el chat','Conversación','Banda 2',20,2,4)
ON CONFLICT DO NOTHING;

INSERT INTO public.news_posts (title, description, category) VALUES
  ('¡Bienvenido a Ludora!','Tu aventura para aprender inglés jugando Minecraft empieza aquí.','Anuncio'),
  ('Nuevo: evaluación con IA','Ahora tu nivel se calcula con inteligencia artificial y feedback personalizado.','Producto'),
  ('Torneo de Spelling este viernes','Compite con otros aventureros y gana monedas Ludora.','Evento')
ON CONFLICT DO NOTHING;

INSERT INTO public.events (title, type, description, reward_coins) VALUES
  ('Torneo de Spelling','competencia','Demuestra tu vocabulario en tiempo real.',5),
  ('Escape Room en inglés','cooperativo','Resuelve acertijos en equipo, todo en inglés.',8)
ON CONFLICT DO NOTHING;
