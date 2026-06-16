-- Banco de ítems para la evaluación diagnóstica adaptativa.
-- Cada ítem es un ejercicio (mismo esquema que las lecciones) etiquetado por destreza y
-- dificultad en escala CEFR decimal (1.0=A1 .. 6.0=C2). El staircase elige el ítem cuya
-- dificultad esté más cerca del nivel estimado del alumno.
CREATE TABLE IF NOT EXISTS public.diagnostic_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    skill text NOT NULL,            -- listening | reading | writing | speaking
    difficulty real NOT NULL,       -- 1.0 .. 6.0 (CEFR decimal)
    cefr text,                      -- A1 .. C2 (referencia)
    type text NOT NULL,             -- tipo de ejercicio (lessonContent)
    content jsonb NOT NULL,         -- el ejercicio CON su respuesta (solo servidor)
    created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS diagnostic_items_skill_diff_idx ON public.diagnostic_items(skill, difficulty);

-- El contenido incluye la respuesta correcta -> NO se expone al cliente directamente.
-- Se sirve sanitizado (sin respuestas) vía RPC, y el grading/placement ocurre server-side.
ALTER TABLE public.diagnostic_items ENABLE ROW LEVEL SECURITY;
-- (Sin policy para authenticated: solo service_role / RPCs SECURITY DEFINER acceden.)
