# MASTER PLAN — Ludora Aprende Crafteando

**Reemplazo total del sistema de aprendizaje de Ludora por el método Duolingo (ejemplos primero + adaptativo + ruta guiada), 100% tematizado en Minecraft.**
Documento único de arquitectura. Estado verificado: última migración en repo = `supabase/migrations/0027_onboarding_state.sql` → **la secuencia nueva arranca en 0028**. Runner: `scripts/db/migrate.mjs`. Deploy: Dokploy autodeploy en `main`.

---

## 1. Visión y principios

### Qué cambia y por qué
Hoy el alumno **entra directo a `exercises[0]`** (player `src/app/portal-alumno/dashboard/leccion/[activityId]/page.tsx`), las lecciones **no adaptan**, no hay **dominio por concepto**, la ruta es **lineal** (`order_index`) y la tematización Minecraft es parcial. El método Duolingo exige un arco **TE MUESTRO → PRACTICAMOS → LO APLICAS → RECOMPENSA**, dificultad "al límite", repaso espaciado y una ruta que **aprende del usuario**. Reescribimos el flujo de aprendizaje conservando lo bueno (renderer de 19 tipos de ejercicio, XP server-authoritative, ligas, economía Aldea, audio ElevenLabs, juegos 3D voxel).

### Principios rectores (no negociables)
1. **Ejemplos primero (liberación gradual).** Toda lección abre con un paso `present` ("Libro de Recetas") que muestra 3–5 átomos sin evaluar, y los ejercicios se ordenan `recognize → produce → apply`.
2. **El mundo se adapta.** La diagnóstica deja de ser un evento muerto: siembra el **prior de dominio por concepto** (`user_concept_mastery.theta`), que cada intento actualiza con el **mismo Elo ya probado** en `src/lib/diagnostic.ts` (`estimateTheta`). El dominio decide orden intra-lección, repaso espaciado, gating y "siguiente mejor misión".
3. **Todo conectado, un solo camino de escritura.** Telemetría append-only (`exercise_attempts`) + RPC `SECURITY DEFINER` `service_role-only` (patrón de `0023`). El cliente nunca decide dominio ni XP.
4. **Retrocompatibilidad dura.** Todos los campos nuevos del JSONB son **opcionales**; `contentVersion` ausente = v1 = comportamiento actual. Cero ventana de mantenimiento, rollback por feature-flag.
5. **Minecraft uniforme y propio.** Una **biblia de tematización** (capa de datos pura `src/lib/minecraft/*`) es la fuente de verdad estética y verbal que TODOS los pilares consumen. Identidad propia inspirada (texturas por código, fuente propia, nombres propios Lía/Sam/Sabio); **nunca** assets/nombres registrados de Mojang.
6. **Motivación ligada a aprender, no a repetir.** El XP se parte en **Esfuerzo** (pequeño, por terminar) + **Encantamiento** (grande, por nueva maestría real). Esmeraldas solo compran cosméticos/protección: **nada de pay-to-learn**.

### El loop cerrado (todo vinculado)
```
Diagnóstica (theta/destreza)
   └─► backfill_mastery_from_diagnostic ──► user_concept_mastery (prior)
                                               │
        ┌──────────────────────────────────────┤
        ▼                                       ▼
  /api/lessons/plan                       /api/route/next
  (orden present→recognize→produce→apply  (siguiente mejor misión:
   + repasos inyectados "al límite")       gating + repaso + destreza débil)
        │                                       │
        ▼                                       ▼
   PLAYER (present + ejercicios + HUD Minecraft + feedback)
        │ por-intento: {conceptId, correct, response_ms, hint_used, difficulty, is_review}
        ▼
  /api/lessons/complete  ──orquesta──►
     1) apply_lesson_attempts  → exercise_attempts (telemetría) + user_concept_mastery (Elo+HLR) + rollup user_skills.mastery
     2) grant_mastery_rewards  → XP de Encantamiento por cruces de banda (ledger idempotente) + daily_quests
     3) complete_lesson        → XP de Esfuerzo (lesson_xp_grants)
     4) unlock_next_units      → gating de ruta (user_progress.status/stars)
        │
        ▼
  Gamificación (ligas/Cofre reflejan maestría) + CourseMap→WorldMap (brújula/biomas)
```

---

## 2. Sistema metafórico Minecraft (biblia — Pilar 5)

**Entregable transversal:** módulos puros `src/lib/minecraft/{biomes,structures,skills,exerciseTheme,characters,copy,sfx,enchant}.ts` + componentes `src/components/minecraft/{Block,RecipeBook,BiomeHeader,EnchantBadge}.tsx` + tokens `--mc-*` en `src/app/globals.css`. **Sin cambios de DB**: todo se deriva de `levels.band`, `units.order_index`, `activities.skill`, `user_gamification`.

### Regla de oro de copy
Todo string de aprendizaje pasa por `src/lib/minecraft/copy.ts` (diccionario tipado). Errores **nunca** punitivos ("Ese bloque no encaja, prueba otro"). Verbos del mundo: picar, colocar, craftear, forjar, encantar, minar, reparar, abrir el cofre.

### Tabla glosario concepto → metáfora → texto de UI

| Concepto app (tabla/columna real) | Metáfora Minecraft | Texto de UI / botón |
|---|---|---|
| `courses` | Tu Mundo | "Tu Mundo" |
| `levels` (band 1–8 / CEFR) | **Bioma** (Pradera→Bosque→Aldea/Ribera→Colinas→Cuevas→Río/Puerto→Tundra/Fortaleza→Portal·Nether) | "Bioma: Pradera" / "Entrar al bioma" |
| `units` (~48) | **Estructura** (casa/granja/mina/pozo/torre/faro/mercado/portal) | "Construye la Granja" |
| `activities` type=lesson | **Receta / Misión** | "Empezar receta" |
| `Exercise[]` (19 tipos) | **Acción de bloque** (picar/colocar/craftear) | instrucción por tipo (ver §2.1) |
| paso `present` (P1) | **Libro de Recetas** sobre la Mesa de Crafteo | "Ver la receta" → "¡A craftear!" |
| acierto | bloque colocado/encaja | "¡Encaja!" / "¡Bloque colocado!" (sfx `block_break`) |
| fallo | bloque que resiste | "Ese bloque no encaja, prueba otro" (sfx `block_thud`) |
| `concepts` (átomo) | **Mena/mineral** | "Vocabulario de comida" |
| dominio por concepto (`user_concept_mastery`) | **Encantamiento I–V** sobre tu herramienta | "Vocabulario III" / "¡Encantamiento subió!" |
| destreza (`activities.skill`) | herramienta: Listening=Brújula, Reading=Libro Encantado, Writing=Yunque, Speaking=Campana, Pronunciation=Disco/Afinador, Vocab/Conversation=Pico | guía el aldeano dueño |
| repaso espaciado due (`next_review_at`) | mena que se **desgasta** / antorcha que se apaga | "🧭 Repaso" / "Expedición de re-minado" |
| ruta adaptativa | **el mundo se adapta a ti** | "El mundo cambió para ti" |
| `user_gamification.coins` | **Esmeraldas** | "+5 esmeraldas" (icono gem) |
| `xp_total` / `level_number` | orbes de XP / **Nivel de Encantador** | "+20 XP" |
| vidas (opcional `lives`) | **Corazones** (reusa juego Aldea) | hearts |
| `current_streak` | **mantén las antorchas encendidas** | "Racha de 5 días" |
| streak-freeze nuevo | **Antorcha de Respaldo** | "Antorcha de Respaldo (×2)" |
| recompensa final | abrir el **Cofre** (prop `Chest` 3D) | "Abrir cofre" (sfx `chest_open`) |
| metas diarias (nuevo) | **Contratos del Aldeano** (trades) | "Extrae mineral nuevo" / "Refuerza la mina" |
| pista (`hint`) | **Antorcha** que enciendes | "Encender antorcha" |
| dificultad (1.0–6.0) | **dureza del bloque** (1–3 picos, nunca números) | madera→piedra→hierro→diamante→obsidiana |
| unidad bloqueada (gating) | estructura cerrada / cofre con candado | "Termina la Mina para entrar a la Cueva de Cristal" |
| `content_version` (P7) | **versión del data pack** del mundo | "Generando nuevos chunks…" |
| cohorte canary (P7) | **probadores de snapshot** | — |

### 2.1 Personajes (centraliza `charForSkill`, hoy en `page.tsx:20-21`)
`src/lib/minecraft/characters.ts`: **Lía** (granjerita) guía Reading/Writing/Conversation; **Sam** (apicultor) guía Listening/Speaking/Pronunciation; **Sabio** (narrator) = instrucciones del mundo; **Aldeano** = NPC de diálogo. Voces ElevenLabs ya existentes (`VOICE_ROLES`), TTS solo fallback.

### 2.2 Ejercicio → acción Minecraft (`src/lib/minecraft/exerciseTheme.ts`, los 19 tipos reales)
`exerciseTheme(type) → {verb, instructionFallback, icon, blockTexture, sfxKey}`. Ej.: `text_mc`=elige el bloque; `audio_mc`=escucha y pica; `multi_select`=mina todos los correctos (metáfora Cueva); `word_bank`=craftea la frase (Crafteo); `fill_blank`=coloca el bloque en el hueco; `match_pairs`=empareja con cuerda; `speak`=habla al Yunque; `minimal_pairs`=afina la campana; `match_madness`=Mina Relámpago; `reading_passage`=lee el Pergamino; `conversation`/`dialogue`=Charla con el Aldeano. El Renderer solo inyecta copy/icono/sfx; **no toca la calificación**.

---

## 3. Arquitectura técnica

### 3.1 Esquema canónico del contenido (resuelve conflictos entre pilares)

Todo vive en `activities.content` (JSONB). Se extiende `src/lib/lessonContent.ts`. **Decisiones de reconciliación** (los pilares proponían nombres distintos; esto es la versión única):

- **Versión:** campo JSONB `contentVersion?: 1 | 2` (ausente = 1). Columna denormalizada `activities.content_version SMALLINT DEFAULT 1` para consultar sin escanear JSONB. (Se descarta el alias `v` de P7.)
- **Envoltura de metadata por ejercicio:** `meta?: ExMeta` opcional en **cada** interface `ExXxx` (envoltura de P1, gana por ser la menos invasiva). Se **elimina la doble escala** de dificultad:
  - `section: 'recognize' | 'produce' | 'apply'` → fase de liberación gradual (sustituye el `difficulty 1|2|3` de P1 y el `phase` de P3).
  - `difficulty: number` (1.0–6.0) → dificultad CEFR del concepto, **misma escala que `diagnostic_items.difficulty`** (la usa el motor adaptativo).
- **Conceptos:** referenciados por **slug** estable (`conceptId`/`conceptIds`). El catálogo `concepts` tiene `id UUID` + `slug UNIQUE`; el JSONB siempre usa slug.

```ts
// src/lib/lessonContent.ts (adiciones, todo opcional => retrocompatible)
export type LessonSection = 'recognize' | 'produce' | 'apply';
export interface ExMeta {
  conceptId?: string;          // slug primario
  conceptIds?: string[];       // si entrena varios (reading_passage)
  section?: LessonSection;
  difficulty?: number;         // 1.0–6.0 (CEFR, escala diagnostic_items)
  isReview?: boolean;          // lo marca el motor en runtime
  hint?: string;               // andamiaje pre-respuesta (Antorcha)
  tip?: string;                // micro-regla
}
// + meta?: ExMeta en cada ExTextMC, ExAudioMC, … (19 tipos)

export interface PresentItem {
  conceptId: string; headline: string;
  en?: string; es?: string; note?: string; ipa?: string;
  imageUrl?: string; icon?: string; audioRole?: string;
}
export type PresentTheme = 'recipe_book' | 'crafting_table' | 'enchanting_table' | 'map';
export interface PresentStep { title?: string; intro?: string; items: PresentItem[]; theme?: PresentTheme; }

export interface LessonContent {
  kind: 'lesson'; skill: Skill; exercises: Exercise[]; mixed?: boolean;
  contentVersion?: 1 | 2;
  present?: PresentStep;
  lives?: boolean;             // activa corazones (off en bandas bajas)
}
// Helpers nuevos: lessonShapeOk(content), isLessonV2(content), normalizeLesson(content)
```

`src/lib/contentVersion.ts` (nuevo): `normalizeLesson(content)` lee `contentVersion ?? 1` y devuelve estructura runtime homogénea (doble-lectura v1/v2). Si v1 o flag off → entrada directa idéntica a hoy.

### 3.2 Modelo de datos nuevo — ledger de migraciones unificado (0028 → 0034)

Los pilares colisionaban en numeración (P1=0027, P2=0028/29, P4=0028, P6=0028, P7=0028-0035). **Secuencia canónica reconciliada**, todo additive-only, `IF NOT EXISTS`, con comentario `-- DOWN:` y aplicada por `scripts/db/migrate.mjs` (transaccional por archivo, registra en `schema_migrations`):

| # | Archivo | Contenido | Pilares | Bloquea a |
|---|---|---|---|---|
| **0028** | `0028_concepts_catalog.sql` | `concepts(id UUID PK, slug TEXT UNIQUE, skill, kind CHECK(lemma\|pattern\|rule\|phoneme\|function), label, cefr, difficulty REAL 1–6, biome_key, mc_block_key, order_index, needs_review BOOL, minecraft JSONB)`; `concept_prerequisites(concept_id, requires_concept_id)`; `activity_concepts(activity_id, concept_id, weight)`; `unit_concepts(unit_id, concept_id, role CHECK(primary\|recycled), weight)`. Índices `concepts_slug_idx`, `activity_concepts_concept_idx`. RLS: SELECT authenticated, ALL admin/service_role (patrón 0006). | P1,P2,P4 | todo |
| **0029** | `0029_content_v2_flags.sql` | `activities ADD content_version SMALLINT DEFAULT 1, ADD content_v2 JSONB`; índice parcial `WHERE content_version=2`; `app_config` keys `lessons_v2_enabled`(false), `lessons_v2_cohort_pct`(0), `present_step_enabled`(false); RPC `is_v2_user(uid)` (bucketing `hashInt(uid)%100 < cohort_pct`). | P1,P7 | player v2, rollout |
| **0030** | `0030_world_curriculum.sql` | `levels ADD biome_key, theme_key DEFAULT 'overworld', world_order, danger, map_color`; `units ADD structure_key, kind CHECK(standard\|keystone), est_minutes`; `user_progress ADD unlocked_at, mastery_pct INT DEFAULT 0, stars SMALLINT 0–3, tested_out BOOL`; `unit_prerequisites(unit_id, requires_unit_id, min_mastery_pct DEFAULT 60)`; RPC `unlock_next_units(p_user)`. Todo DEFAULT no destructivo. | P4 | ruta |
| **0031** | `0031_mastery_telemetry.sql` | `user_concept_mastery(user_id, concept_id, theta REAL DEFAULT 3.0, attempts, correct, half_life_hours REAL DEFAULT 4, last_seen_at, next_review_at, band TEXT, PK(user,concept))`; `exercise_attempts(id, user_id, activity_id, exercise_idx, exercise_type, concept_ids TEXT[], correct, response_ms, hint_used, why_used, skipped, difficulty, theta_before, theta_after, is_review, created_at)` índices `(user,created_at)`+GIN`(concept_ids)`. RPC `apply_lesson_attempts`, `get_due_reviews`, `recommend_next`, `backfill_mastery_from_diagnostic` (SECURITY DEFINER, REVOKE anon/authenticated en escritura, patrón 0023). | P2 | adaptación, repaso, gamif. dominio |
| **0032** | `0032_mastery_gamification.sql` | `user_gamification ADD streak_freezes INT DEFAULT 0`; `concept_mastery_grants(user_id, concept_id, band CHECK(aprendiendo\|competente\|dominado), xp, granted_at, PK(user,concept,band))`; `daily_quests`; `quest_templates`(+seed Contratos); vista `v_user_enchantments`; RPC `grant_mastery_rewards`, `roll_daily_quests`, `claim_daily_chest`, `buy_streak_freeze`; **modificación quirúrgica** del bloque de racha en `grant_progress_for` (consume Antorcha al saltar 1 día); filas `cosmetic_catalog` (tool_skin/pet/mascot_outfit). | P6 | — |
| **0033** | `0033_lessons_v2_cutover.sql` | Promueve `content_v2 → content` + `content_version=2` solo en filas validadas; conserva `content_v2` como respaldo. | P7 | — |
| **0034** | `0034_lessons_v2_cleanup.sql` | (tras burn-in) `DROP COLUMN activities.content_v2`. | P7 | — |

> **Resolución de tablas duplicadas:** `concepts` la definían P1 (UUID+slug), P2 (TEXT id) y P4 (UUID+slug). **Canónico: `id UUID` + `slug TEXT UNIQUE`**, el JSONB referencia por slug. `activity_concepts`/`concept_prerequisites` se definen UNA vez en 0028. `user_skills.mastery` (columna huérfana de 0007) se empieza a poblar como rollup ponderado por destreza desde `apply_lesson_attempts`.

### 3.3 El paso `present` (TE MUESTRO)
- Player: estado `phase: 'present' | 'practice' | 'finished'`. Si `content.present` existe, `present_step_enabled`, y **no se retoma a mitad** (`last_index===0`) → `phase='present'` (renderiza `<PresentStep>`/`<RecipeBook>` como "fase 0"). Al pulsar "¡A craftear!" → `practice`. Retomar (`last_index>0`) **salta** el present. La barra de progreso reserva un primer tramo; el present **no califica ni paga XP**.
- Autoría: 3–5 items; cada `conceptId` del present debe aparecer ≥1 vez en `exercises` (sección `recognize`). Validado por `lessonShapeOk` + `validate-content.mjs --strict-v2`.

### 3.4 Motor adaptativo (`src/lib/mastery.ts` nuevo, núcleo puro)
Reusa el Elo de `src/lib/diagnostic.ts` (se **extrae/exporta** el paso unitario `p = 1/(1+10^((d-theta)/1)); theta += k*((correct?1:0)-p)`, clamp(1,6), `k = max(0.15, 0.4*0.9^attempts)`). Funciones:
- `updateMastery(theta, attempts, difficulty, correct)` → nuevo theta/attempts.
- HLR repaso: acierto → `half_life *= 2.2` (modulado por dificultad); fallo → reset a 4h; `next_review_at = last_seen_at + half_life_hours`; `strength = 2^(-elapsed/half_life)`.
- `isMastered` (theta ≥ difficulty+0.5 ∧ attempts≥3 ∧ último repaso acierto), `masteryPct = round(clamp((theta-1)/5,0,1)*100)`.
- `planLesson(pool, mastery)` → orden `present → recognize (θ−0.5) → produce (θ) → apply (θ+0.5)` + repasos due inyectados (interleaving 1–3 slots). Reusa `pickNext` (máxima información + jitter anti-exposición). v1 = ordenar + inyectar; selección real crece con pools.
- **Prior (cold start):** `backfill_mastery_from_diagnostic` se llama en `/api/placement/finish`: por cada concepto de la destreza S, `theta_inicial = theta_destreza(S)` con shrinkage a la banda.

### 3.5 Telemetría que cierra el loop (un solo camino de escritura)
- Player acumula por intento `{activity_id, exercise_idx, exercise_type, concept_ids, correct, response_ms, hint_used, why_used, skipped, difficulty, is_review}` y envía **en lote al finalizar** (1 request, no por item).
- **Orquestación canónica en `/api/lessons/complete`** (resuelve el solapamiento P2/P6 — un solo writer de mastery):
  1. `apply_lesson_attempts(user, activity, attempts jsonb)` → inserta `exercise_attempts` (append-only) + actualiza `user_concept_mastery` (Elo+HLR) + rollup `user_skills.mastery`. **Re-califica tipos objetivos con `gradeItem()`** (respuestas en `content`, anti-fraude). Devuelve cruces de banda.
  2. `grant_mastery_rewards(user, events)` → paga **XP de Encantamiento** por cruces nuevos (ledger `concept_mastery_grants`, idempotente PK) + avanza `daily_quests`.
  3. `complete_lesson` → **XP de Esfuerzo** (3–5 XP, `lesson_xp_grants`).
  4. `unlock_next_units(user)` → gating ruta.
  Todo en transacción, service_role-only, `check_rate_limit`. `/api/lessons/attempt` queda como flush mid-lección opcional.
- **Degradación elegante:** si `user_concept_mastery` aún vacío, pasos 1–2 son no-op y solo se paga Esfuerzo → P6 y el player se despliegan antes que el motor.

### 3.6 Endpoints / RPC (lista única, sin duplicados)

| Endpoint | Backing | Función |
|---|---|---|
| `POST /api/lessons/plan` | `planLesson` + `user_concept_mastery` | plan ordenado + repasos inyectados |
| `POST /api/lessons/complete` (EXTENDER) | orquesta 4 RPC (§3.5) | cierre de lección, devuelve `{xpEarned, masteryXp, enchantUps[], questProgress[], unlocked[]}` |
| `POST /api/lessons/attempt` (opcional) | `apply_lesson_attempts` | flush mid-lección |
| `GET /api/route/next` | `src/lib/route.ts` → `recommend_next` + gating P4 | siguiente mejor misión `{activityId, unitId, kind:'lesson'\|'review'\|'test_out', reason, deepLink}` |
| `GET /api/reviews/due` | `get_due_reviews` | conceptos due → Expedición de repaso |
| `POST /api/units/[id]/test-out` | `estimateTheta`/`pickNext` sobre conceptos primary | Atajo del mapa |
| `GET\|POST /api/quests` | `roll_daily_quests` / `claim_daily_chest` | Contratos del Aldeano + Cofre del Día |
| `POST /api/shop/buy` | `buy_streak_freeze` + cosméticos | sumideros de Esmeraldas |
| `POST /api/explain` (EXTENDER) | flag `mode:'hint'\|'why'` | pista pre-respuesta sin spoiler |
| `RPC backfill_mastery_from_diagnostic` | en `/api/placement/finish` | prior de dominio |

### 3.7 Archivos clave a crear/cambiar (rutas reales)

**Crear (lógica):** `src/lib/concepts.ts`, `src/lib/mastery.ts`, `src/lib/route.ts`, `src/lib/world.ts`, `src/lib/contentVersion.ts`, `src/lib/featureFlags.ts`, `src/lib/gamification.ts`, `src/lib/minecraft/{biomes,structures,skills,exerciseTheme,characters,copy,sfx,enchant}.ts`.
**Crear (UI):** `src/components/lesson/{PresentStep,LessonHud,PhaseRibbon,HintTorch,Celebrate}.tsx`, `src/components/minecraft/{Block,RecipeBook,BiomeHeader,EnchantBadge}.tsx`, `src/components/dashboard/{DailyQuests,EnchantTable,StreakTorch}.tsx`.
**Crear (API):** `src/app/api/lessons/{plan,attempt}/route.ts`, `src/app/api/route/next/route.ts`, `src/app/api/reviews/due/route.ts`, `src/app/api/units/[id]/test-out/route.ts`, `src/app/api/quests/route.ts`, `src/app/api/shop/buy/route.ts`.
**Crear (scripts/migraciones):** `0028`–`0034` (§3.2); `scripts/db/{seed-concepts,tag-exercises,seed-world-map,backfill-activity-concepts,backfill-user-mastery,migrate-content-v2,validate-content}.mjs`; `scripts/content/lesson.template.json`; `scripts/db/lib/concept-taxonomy.json`; `scripts/db/lib/v2-templates/{skill}.md`.
**Modificar:** `src/lib/lessonContent.ts` (tipos §3.1), `src/lib/diagnostic.ts` (exportar Elo unitario), `src/lib/lessonAudio.ts` (sfx `block_break/block_place/block_thud/chest_open/level_up`), `src/app/portal-alumno/dashboard/leccion/[activityId]/page.tsx` (máquina de estados + HUD + telemetría + render desde plan), `src/components/dashboard/CourseMap.tsx` (→ WorldMap), `src/app/portal-alumno/dashboard/cursos/page.tsx`, `src/app/portal-alumno/dashboard/unidad/[id]/page.tsx`, `src/lib/unitIcons.ts`, `src/app/api/lessons/complete/route.ts`, `src/app/api/placement/finish/route.ts`, `src/app/api/explain/route.ts`, `src/app/globals.css` (tokens `--mc-*` + keyframes), `scripts/db/seed-all-generated.mjs` (validador compartido + staging), `scripts/db/seed-unit1-lessons.mjs` (canónico v2), `scripts/db/gen-lessons.workflow.js` (emite v2).

---

## 4. UX del aprendizaje (flujo de lección)

**Máquina de estados en `page.tsx`** (reusa todo el renderer; datos nuevos opcionales → v1 igual que hoy):

1. **TE MUESTRO — `<PresentStep>`/`<RecipeBook>`.** El aldeano dueño (`charForSkill`) abre el Libro de Recetas: 3–5 bloques-ingrediente; al tocar uno se "coloca" (`playSfx('block_place')`) y suena su audio EN (`playAudio`, ElevenLabs). Contador "Toca cada bloque"; botón "¡A craftear!" se habilita al tocar ≥1. Exposición pura, sin grading.
2. **PRACTICAMOS (gradual).** Renderiza el **plan** de `/api/lessons/plan` (no `exercises[]` crudo): `recognize` (receptivos fáciles) → `produce` (productivos). **PhaseRibbon** muestra el momento ("TE MUESTRO" madera / "PRACTICAS" piedra / "LO APLICAS" diamante). **HintTorch** (🔥) junto al `ExHeader`: enciende `ex.meta.hint` en globo del aldeano; fallback `/api/explain?mode=hint`; coste opcional en esmeraldas (gratis las 2 primeras lecciones).
3. **LO APLICAS.** Tipos productivos/aplicación en contexto nuevo (`free_text`, `speak_answer`, `dialogue`, `conversation`, `reading_passage`).
4. **RECOMPENSA.** Pantalla `finished` mejorada: **Cofre** que se abre (`Chest` 3D / sprite, `chest_open`), lluvia de esmeraldas, XP + % aciertos, y "subiste a Encantamiento II en \<concepto\>" (animación de orbes verdes), avance de Contratos del Aldeano.

**Feedback y corrección:** `FeedbackBar` **siempre muestra la respuesta correcta** con **altavoz** (corregir escuchando) — incluye arreglar `match_pairs`/`tap_pairs_audio`/`match_madness` que hoy no pasan `correctText`. Microcelebraciones: acierto = romper bloque (partículas `Celebrate` + `block_break`); racha intra-lección cada 3 aciertos = "¡VETA DE ESMERALDA ×3!"; fallo = `block_thud` + shake suave, el aldeano (mood `sad`) **anima, no regaña**.

**Adaptación visible pero sutil (sin números/theta):** chip "🧭 Repaso" si `ex.meta.isReview`; dificultad = **dureza de bloque** (1–3 picos + borde/sombra más gruesos). **HUD Minecraft (`<LessonHud>`):** barra de XP **segmentada en bloques** (uno por ejercicio, el actual late), **corazones** opcionales (`lives`, off en bandas bajas → no estresar), contador de **esmeraldas** en vivo (conecta economía Aldea), X = "Volver a la aldea", fondo de bioma a baja opacidad (`tex()`). `prefers-reduced-motion` respetado.

---

## 5. Currículo / ruta (mundo Minecraft)

### 5.1 Mundo y árbol de habilidades
- **Biomas** = `levels.band` 1–8 (mapeo CEFR vía `thetaToBand`/`bandToCefr`), derivados en `src/lib/world.ts` (`bandToBiome`): Pradera (A1) → Bosque → Aldea/Ribera (A2) → Colinas → Cuevas (B1) → Río/Puerto → Tundra → Portal·Nether (B2, reusa `THEME.nether`, sky `#5a2230`).
- **Estructuras** = `units.structure_key` (derivado de `icon`/`title`); última unidad del bioma = `kind='keystone'` (Cofre del Bioma → abre el siguiente).
- **Árbol espiral:** `concepts` + `unit_concepts(role='primary'|'recycled')` (reciclaje = re-exposición en contextos nuevos) + `concept_prerequisites` + `unit_prerequisites(min_mastery_pct DEFAULT 60)`. Por defecto los prereqs **reproducen el orden lineal actual** (cero regresión); permiten ramas.

### 5.2 "Siguiente mejor lección" (`src/lib/route.ts` → `recommend_next`)
Composición por prioridad: (1) **gating duro** por `unit_prerequisites` + dominio de conceptos; (2) **repaso espaciado**: si hay ≥N due → "Misión de mantenimiento" antes de avanzar; (3) **avance**: siguiente por `order_index` dentro de la unidad activa, o "Atajo del mapa" (test-out) si va holgado; (4) **fallback seguro**: orden lineal `order_index` si faltan datos de mastery → **cero acoplamiento duro**. CTA fijo "Continuar tu aventura" (dashboard + `/cursos`) deep-linkea a la actividad calculada.

### 5.3 Reciclaje y test-out
Repaso = "reparar bloques desgastados de la aldea". **Test-out** (`/api/units/[id]/test-out`) reusa `estimateTheta`/`pickNext` sobre conceptos `primary`; aprobar marca `user_progress.tested_out=true` + mastery alto y desbloquea sin repetir. **WorldMap** (`CourseMap.tsx`→) pinta caminos serpenteantes por biomas, nodos-estructura con `user_progress.status` (locked/in_progress/completed) + estrellas de encantamiento; bioma bloqueado = niebla + cofre. **Salvaguarda:** nunca bloquear unidades ya `in_progress`/`completed`.

---

## 6. Plan por fases (preparado para paralelo)

> Nomenclatura: **Fn** = fase; **T n.m** = track paralelizable dentro de la fase. "Hecho" = criterio de aceptación verificable.

### F0 — Cimientos contractuales `[bloquea a todos]`
**Objetivo:** congelar los contratos (tipos, vocabulario, schema, flags) para que el resto corra en paralelo.

| Track | Contenido | Depende de | Hecho |
|---|---|---|---|
| **T0.1** (∥) | Biblia Minecraft P5 Fase A: `src/lib/minecraft/*` + tokens `--mc-*` + `Block.tsx` | — | `copy.ts`/`exerciseTheme.ts` congelados; build verde |
| **T0.2** (∥) | Tipos `lessonContent.ts` (§3.1) + `contentVersion.ts` + `featureFlags.ts` + exportar Elo de `diagnostic.ts` | — | `tsc` pasa; `normalizeLesson(v1)` ≡ hoy |
| **T0.3** (∥) | Migraciones `0028` (concepts/joins) + `0029` (versioning/flags + `is_v2_user`) | — | aplicadas vía `migrate.mjs` en staging; flags off |
| **T0.4** | `seed-concepts.mjs` + `concept-taxonomy.json` (Banda 1–2) | T0.3 | catálogo Unidad 1 sembrado; slugs resolubles |

**Criterio fase:** prod sigue 100% v1 (flags off, additive). Riesgo cero.

### F1 — Player UX + paso PRESENTA `[dep F0]`
**Objetivo:** "ejemplos primero" + identidad Minecraft del player, **sin backend adaptativo** (degrada con valores autorados).

| Track | Contenido | Depende de | Hecho |
|---|---|---|---|
| **T1.1** (∥) | `PresentStep.tsx`/`RecipeBook.tsx` + audio por item | T0.1, T0.2 | tarjetas tocables suenan ElevenLabs |
| **T1.2** (∥) | `LessonHud`, `PhaseRibbon`, `HintTorch`, `Celebrate` (props mock) | T0.1 | Storybook/preview aislado OK |
| **T1.3** | Integración `page.tsx`: máquina `phase`, render present, HUD, feedback con respuesta+altavoz, RECOMPENSA cofre | T1.1, T1.2 | retomar (`li>0`) salta present; v1 intacto |
| **T1.4** (∥) | sfx en `lessonAudio.ts` + keyframes `globals.css` + `/api/explain mode='hint'` | T0.1 | sfx suenan; hint sin spoiler |

**Criterio fase:** lección piloto Unidad 1 v2 demuestra TE MUESTRO→…→RECOMPENSA con "wow" Minecraft. Quick win demo-able.

### F2 — Telemetría + motor de dominio + mundo `[dep F0; consume F1]`
**Objetivo:** cerrar el loop de aprendizaje y poblar el dominio.

| Track | Contenido | Depende de | Hecho |
|---|---|---|---|
| **T2.1** | Migración `0031` (mastery/telemetry + 4 RPC) | T0.3 | RPC aplican; RLS REVOKE verificado |
| **T2.2** (∥) | `src/lib/mastery.ts` (Elo+HLR+`planLesson`) | T0.2 | tests puros del Elo/HLR |
| **T2.3** | Hook telemetría en `page.tsx` + orquestación `/api/lessons/complete` (§3.5) | T2.1, T1.3 | 1 request/lección; `exercise_attempts` crece |
| **T2.4** (∥) | `backfill_mastery_from_diagnostic` en `/api/placement/finish` | T2.1 | placement siembra `user_concept_mastery` |
| **T2.5** (∥) | Migración `0030` + `world.ts` + `seed-world-map.mjs` + `backfill-user-mastery.mjs` | T0.3 | columnas pobladas; sin cambio visible |
| **T2.6** (∥) | `tag-exercises.mjs` + `backfill-activity-concepts.mjs` (Banda 1–2) | T0.4 | `activity_concepts` materializado |

**Criterio fase:** un intento mueve theta del concepto; rollup `user_skills.mastery` deja de ser huérfano.

### F3 — Adaptación intra-lección + ruta `[dep F2]`
| Track | Contenido | Depende de | Hecho |
|---|---|---|---|
| **T3.1** | `/api/lessons/plan` + player renderiza desde el plan | T2.2,T2.3 | orden `recognize→produce→apply` por usuario |
| **T3.2** (∥) | `route.ts` + `/api/route/next` + `unlock_next_units` en complete | T2.1,T2.5 | CTA "Continuar" deep-linkea correcto |
| **T3.3** (∥) | `CourseMap.tsx`→WorldMap (biomas/estructuras/estrellas/gating) | T2.5 | observer mobile + `data-tour='ruta'` intactos |

### F4 — Repaso espaciado + test-out `[dep F2]`
| Track | Contenido | Depende de | Hecho |
|---|---|---|---|
| **T4.1** | `get_due_reviews` + `/api/reviews/due` + "Expedición de re-minado" | T2.1 | conceptos due ordenados por strength |
| **T4.2** (∥) | Misiones de mantenimiento intercaladas en `unidad/[id]` | T2.5,T3.2 | nodo de repaso aparece si hay deuda |
| **T4.3** (∥) | `/api/units/[id]/test-out` (Atajo del mapa) | T2.5 | aprobar marca `tested_out` + desbloquea |

### F5 — Gamificación ligada a dominio `[dep F2]`
| Track | Contenido | Depende de | Hecho |
|---|---|---|---|
| **T5.1** (∥) | Migración `0032` + `gamification.ts` (degradación elegante) | T0.3 | desplegable antes de F2: solo XP Esfuerzo |
| **T5.2** | `grant_mastery_rewards` cableado en complete (XP Encantamiento) | T2.1,T2.3 | ledger idempotente (no doble-pago) |
| **T5.3** (∥) | `DailyQuests`, `EnchantTable`, `StreakTorch` + pantalla resultados | T5.1 | Contratos del Aldeano + Mesa de Encantamientos |
| **T5.4** (∥) | `/api/shop/buy` + `buy_streak_freeze` + cosméticos | T5.1 | sumideros equilibran fuentes nuevas |

### F6 — Producción de contenido a escala `[dep F0; ver §7]` — MASIVAMENTE PARALELO
### F7 — Rollout / cutover `[dep F1+F2+F6; ver §8]` — secuencial runtime

### 6.1 Diagrama/tabla de dependencias entre fases
```
F0 ──┬─► F1 ──┐
     │        ├─► F7 (rollout/cutover)
     ├─► F2 ──┼─► F3
     │        ├─► F4
     │        └─► F5 (T5.1 puede preceder a F2 con degradación)
     ├─► F5.T5.1 (∥, no-op sin F2)
     └─► F6 (∥ con F1–F5; solo el cutover de F7 lo requiere)
```

| Fase | Bloqueada por | Habilita | Paralelizable con |
|---|---|---|---|
| F0 | — | todo | — (T0.1/0.2/0.3 entre sí ∥) |
| F1 | F0 | F7 | F2, F5, F6 |
| F2 | F0 | F3,F4,F5 | F1, F6 |
| F3 | F2 | F7 | F4, F5 |
| F4 | F2 | — | F3, F5 |
| F5 | F2 (T5.1 solo F0) | — | F1, F3, F4, F6 |
| F6 | F0 (taxonomía+plantillas) | F7 cutover | F1–F5 |
| F7 | F1, F2, F6 | GA | — |

---

## 7. Producción de contenido a escala (288 lecciones = 48 unidades × 6 destrezas, en paralelo)

**Pipeline existente:** `gen-lessons.workflow.js` (agentes) → `scripts/db/data/gen/u{N}-{1..6}.json` → `seed-all-generated.mjs` (valida + escribe por unidad transaccional). Extensión:

1. **Conversor `migrate-content-v2.mjs` (idempotente por hash de input, fan-out N agentes):** por cada lección llama a un agente acotado por:
   - **Taxonomía CERRADA** `scripts/db/lib/concept-taxonomy.json` (conceptId válidos por unidad/CEFR, derivada de `levels`/`units`). El agente **solo elige de la lista** → no inventa FKs ni alucina conceptos.
   - **Plantillas** `scripts/db/lib/v2-templates/{skill}.md`: cómo escribir `present` (2–4 ejemplos del más fácil al complejo) y ordenar `recognize→produce→apply`.
   - `difficulty` = banda de la unidad (1.0–6.0) ajustada por posición (present más bajo, apply más alto).
   - **Escribe en `content_v2`** (shadow), nunca `content`; `content_version` queda 1 hasta cutover.
2. **Gate de validación `validate-content.mjs --strict-v2`** (extrae `validateExercise`/`validateUnit` de `seed-all-generated.mjs`): EXIGE `present`(3–5), `meta.conceptId ∈ taxonomía`, `difficulty`(1.0–6.0), orden de secciones, longitud 3–6, tipos en `SKILL_EXERCISE_WHITELIST`. Bloqueante antes de cualquier escritura.
3. **Idempotencia:** re-ejecutable por archivo; si el hash no cambió, skip → reintentos parciales sin duplicar.
4. **Audio:** el `present` introduce texto nuevo → **pre-generar MP3 ElevenLabs** (regla de memoria) vía manifest de `lessonAudio.ts` **antes del canary de cada unidad** (si no, TTS robótico rompe la preferencia).

**Paralelización:** las 288 conversiones son independientes (1 por archivo/unidad-destreza); validación y escritura a `content_v2` son por-unidad transaccionales. Backfill de tagging (`tag-exercises.mjs`) y curación (`needs_review`) corren en paralelo y **no bloquean** el piloto.

**Plantilla canónica:** `scripts/content/lesson.template.json` (present + 3 secciones) + `seed-unit1-lessons.mjs` actualizado a `contentVersion:2` como ejemplo de referencia.

---

## 8. Rollout, migración, feature-flag, verificación y rollback (Dokploy + `migrate.mjs`)

### Estrategia de versionado (no romper prod)
Doble-lectura (`contentVersion ?? 1`) + columna staging `content_v2` (la conversión escribe ahí; el player de prod lee `content` hasta el cutover). **El rollback es trivial porque `content` no se toca hasta `0033`.**

### Feature flags por cohorte (flip sin redeploy, vía `app_config` 0029)
`lessons_v2_enabled` (kill-switch global), `lessons_v2_cohort_pct` (0–100), `present_step_enabled` (separar riesgos). Bucketing determinista `hashInt(user_id)%100 < cohort_pct` (`src/lib/featureFlags.ts` + RPC `is_v2_user`). Subir/bajar canary = `UPDATE` en runtime, **sin push a main**.

### Fases de despliegue
- **A — Silenciosa:** push a `main` → Dokploy despliega doble-lectura con **todas las flags en false**. Player 100% v1. Riesgo cero.
- **B — Shadow:** conversor en unidades piloto → `content_v2` + `--strict-v2`. QA forzando v2 a la **cuenta maestro demo / staff** (override por `user_id`).
- **C — Canary 5%:** `lessons_v2_cohort_pct=5`. Comparar cohortes v1 vs v2 con `exercise_attempts`: completado, abandono, error por concepto, tiempo, XP.
- **D — Ramp:** 5→25→50→100 ajustando `app_config` en runtime.
- **E — Cutover:** `0033` promueve `content_v2→content`+`content_version=2` (solo validadas); burn-in; luego `0034` limpia.

### Verificación
Gate de esquema en CI + pre-seed; smoke headless cargando cada lección migrada; `migrate.mjs --status` para auditar migraciones; dashboards comparativos de cohorte. Tras `0032`, probar los 3 casos de racha (=hoy / =ayer+1 / salto de 1 día con y sin Antorcha) por la modificación quirúrgica de `grant_progress_for`.

### Rollback
1. **Instantáneo:** `lessons_v2_enabled=false` (runtime) → vuelve a v1 sin tocar datos.
2. `content` intacto hasta `0033`; basta apagar la flag.
3. Migraciones additive con `-- DOWN` (la `0029`/`0030` no se revierten estando en prod; el resto sí).
4. `content_v2` conservada como respaldo durante el burn-in (hasta `0034`).

---

## 9. Riesgos y DECISIONES ABIERTAS (para que el usuario decida)

### Riesgos principales y mitigación
| Riesgo | Mitigación |
|---|---|
| Carga de autoría: tagging + present en 288 lecciones | Taxonomía cerrada + agentes en paralelo + `--strict-v2`; piloto Unidad 1; `needs_review` no bloquea deploy |
| Doble-pago de XP de Encantamiento | Ledger `concept_mastery_grants` PK `(user,concept,band)` (patrón `lesson_xp_grants`) |
| Cliente reporta conceptos/aciertos falsos | Server valida `conceptId` contra `content` + re-califica con `gradeItem()`; mastery solo lo decide el motor; dominio **no paga XP directo** |
| Acoplamiento P6↔P2 si `user_concept_mastery` no listo | Contrato estable + degradación: `grant_mastery_rewards` no-op → solo XP de Esfuerzo |
| Gating agresivo "atrapa" alumnos | Nunca bloquear `in_progress`/`completed`; fallback lineal `order_index`; prereqs = orden actual por defecto |
| Cold start / theta ruidosa | Prior de diagnóstica + shrinkage a banda + rollup por destreza |
| Adaptación intra-lección limitada sin pools | v1 = ordenar + inyectar repaso; crece a selección al autorar pools/banco fallback |
| Audio del present sin pre-generar | ElevenLabs antes del canary de cada unidad; cachear en manifest |
| Inflación de Esmeraldas (Contratos diarios) | Añadir sumideros cosméticos en el mismo release; tunear recompensas |
| Sobre-tematización oculta la instrucción | Instrucción funcional siempre visible; skin decorativa; `prefers-reduced-motion` |
| WorldMap (refactor UI grande) rompe onboarding | Conservar IntersectionObserver mobile + anclas `data-tour='ruta'` |

### Decisiones abiertas (requieren tu elección)
1. **Corazones/vidas:** ¿activar `lives` por defecto, solo en bandas altas, o nunca? (recomendación: off en Banda 1–2 para no estresar).
2. **Coste de la Antorcha (pista) en esmeraldas:** ¿gratis siempre, gratis las 2 primeras por lección, o coste fijo? (recomendación: gratis las 2 primeras lecciones, luego coste leve).
3. **Bioma Tundra (textura `snow` nueva en `gen-textures.mjs`):** ¿añadir 8º bioma propio o reusar `nether` para Banda 8? (impacto: receta de textura extra, rendimiento móvil).
4. **Tamaño del canary y métrica de corte:** ¿qué umbral de abandono/error en cohorte v2 dispara rollback automático y con qué muestra mínima?
5. **Alcance del piloto v2:** ¿solo Unidad 1 todas las destrezas, o Banda 1 completa, antes del ramp?
6. **Test-out (Atajo del mapa):** ¿habilitado desde el lanzamiento o diferido a F4+1? (riesgo de saltar contenido aún poco etiquetado).
7. **Tope semanal de XP (1500) vs XP de Encantamiento:** ¿se mantiene el cap actual o se eleva para que la maestría no quede capada en alumnos muy activos?
8. **Migración de las ~240 lecciones legacy:** ¿backfill total a v2 antes del cutover, o convivencia indefinida v1/v2 por unidad (cutover por unidad ya validada)?

---

**Resumen ejecutivo:** F0 congela contratos y vocabulario Minecraft; F1 entrega "ejemplos primero" demo-able sin backend; F2 cierra el loop (telemetría→dominio); F3–F5 activan adaptación, ruta y motivación ligada a aprender; F6 produce contenido en paralelo; F7 hace rollout por flags con rollback instantáneo. Migraciones `0028`→`0034`, additive-only, vía `scripts/db/migrate.mjs` con autodeploy Dokploy. Un solo camino de escritura (`apply_lesson_attempts`), un solo cierre (`/api/lessons/complete`), una sola fuente estética (`src/lib/minecraft/*`): **todo conectado y bien vinculado.**