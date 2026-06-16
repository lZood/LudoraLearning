-- Conteos agregados (read-only) expuestos como RPC SECURITY DEFINER, para no depender de
-- RLS (que solo deja ver filas propias -> conteos incorrectos) ni traer todas las filas al cliente.

-- Reservas activas por clase (cupos).
CREATE OR REPLACE FUNCTION public.class_booking_counts()
RETURNS TABLE(class_id uuid, taken bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT class_id, count(*)::bigint
  FROM public.class_bookings
  WHERE status = 'booked'
  GROUP BY class_id;
$$;
GRANT EXECUTE ON FUNCTION public.class_booking_counts() TO authenticated;

-- Likes por noticia.
CREATE OR REPLACE FUNCTION public.post_like_counts()
RETURNS TABLE(post_id uuid, likes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT post_id, count(*)::bigint
  FROM public.post_likes
  GROUP BY post_id;
$$;
GRANT EXECUTE ON FUNCTION public.post_like_counts() TO authenticated;
