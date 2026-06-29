-- =============================================================================
-- 0028_concepts_catalog — Catálogo de CONCEPTOS (átomos de aprendizaje) y sus
-- relaciones (Master Plan §3.2). Es la base del motor adaptativo: cada lección/
-- unidad referencia conceptos por SLUG estable; el dominio por concepto vive en
-- otras tablas (0031). Identidad propia Minecraft: concepts.minecraft (JSONB)
-- guarda metáfora/bloque (mena/mineral, Encantamiento), sin assets de Mojang.
--
-- ADITIVO y RETROCOMPATIBLE: tablas nuevas con IF NOT EXISTS; nada del esquema
-- actual cambia. RLS patrón 0006: SELECT para authenticated, ALL para admin;
-- service_role bypassa RLS (lo usan los route handlers / seeds).
--
-- Resolución de duplicados (Plan §3.2): `concepts` es UUID PK + slug UNIQUE; el
-- JSONB de contenido referencia SIEMPRE por slug. Las tablas de unión se definen
-- UNA sola vez aquí.
-- =============================================================================

-- 1) Catálogo de conceptos (átomos: lema, patrón, regla, fonema, función).
CREATE TABLE IF NOT EXISTS public.concepts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  skill        TEXT,
  kind         TEXT CHECK (kind IN ('lemma','pattern','rule','phoneme','function')),
  label        TEXT,
  cefr         TEXT,
  difficulty   REAL CHECK (difficulty >= 1 AND difficulty <= 6),
  biome_key    TEXT,
  mc_block_key TEXT,
  order_index  INTEGER,
  needs_review BOOLEAN NOT NULL DEFAULT false,
  minecraft    JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 2) Prerrequisitos entre conceptos (árbol espiral; por defecto reproducen el
--    orden lineal actual => cero regresión). PK compuesta evita duplicados.
CREATE TABLE IF NOT EXISTS public.concept_prerequisites (
  concept_id          UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  requires_concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (concept_id, requires_concept_id)
);

-- 3) Conceptos que entrena cada actividad (materializado por tag-exercises.mjs).
CREATE TABLE IF NOT EXISTS public.activity_concepts (
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  concept_id  UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  weight      REAL NOT NULL DEFAULT 1,
  PRIMARY KEY (activity_id, concept_id)
);

-- 4) Conceptos por unidad y su rol: primary (se enseña) / recycled (re-expuesto
--    en contexto nuevo = reciclaje espiral).
CREATE TABLE IF NOT EXISTS public.unit_concepts (
  unit_id    UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'primary' CHECK (role IN ('primary','recycled')),
  weight     REAL NOT NULL DEFAULT 1,
  PRIMARY KEY (unit_id, concept_id)
);

-- ── Índices ──────────────────────────────────────────────────────────────────
-- slug ya tiene índice único por la constraint UNIQUE; se nombra explícitamente
-- el de búsqueda directa de unión por concepto.
CREATE INDEX IF NOT EXISTS concepts_slug_idx          ON public.concepts(slug);
CREATE INDEX IF NOT EXISTS activity_concepts_concept_idx ON public.activity_concepts(concept_id);
CREATE INDEX IF NOT EXISTS unit_concepts_concept_idx     ON public.unit_concepts(concept_id);

-- ── RLS (patrón 0006: catálogo legible por autenticados, CRUD admin) ─────────
ALTER TABLE public.concepts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_concepts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_concepts         ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.concepts, public.concept_prerequisites, public.activity_concepts, public.unit_concepts TO authenticated;
GRANT ALL    ON public.concepts, public.concept_prerequisites, public.activity_concepts, public.unit_concepts TO service_role;

-- Catálogo: lectura para autenticados; CRUD solo admin (service_role bypassa RLS).
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['concepts','concept_prerequisites','activity_concepts','unit_concepts'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s readable" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s readable" ON public.%I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s admin" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s admin" ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())', t, t);
  END LOOP;
END $$;

-- =============================================================================
-- DOWN: (additive-only; revertir solo en entornos no productivos)
-- DROP TABLE IF EXISTS public.unit_concepts;
-- DROP TABLE IF EXISTS public.activity_concepts;
-- DROP TABLE IF EXISTS public.concept_prerequisites;
-- DROP TABLE IF EXISTS public.concepts;
-- (Los índices y políticas caen con sus tablas.)
-- =============================================================================
