import type { SupabaseClient } from '@supabase/supabase-js';

// A dónde mandar a un usuario ya autenticado:
//  - si ya hizo la evaluación/placement (has_completed_evaluation o english_level) -> dashboard
//  - si aún no -> evaluación (onboarding)
// Se usa tanto en el cliente (página de login) como en el servidor (callback OAuth).
export async function getAuthDestination(supabase: SupabaseClient, userId: string): Promise<string> {
    try {
        const { data } = await supabase
            .from('users')
            .select('has_completed_evaluation, english_level')
            .eq('id', userId)
            .maybeSingle();
        const placed = Boolean(data?.has_completed_evaluation || data?.english_level);
        return placed ? '/portal-alumno/dashboard' : '/portal-alumno/evaluacion';
    } catch {
        // Ante un fallo de query, preferimos el dashboard (usuario ya logueado).
        return '/portal-alumno/dashboard';
    }
}
