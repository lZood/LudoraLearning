-- Guarda el avance dentro de una lección para poder retomar donde se quedó.
ALTER TABLE public.user_activity_progress
    ADD COLUMN IF NOT EXISTS last_index integer NOT NULL DEFAULT 0;
