import { createClient } from '@supabase/supabase-js';

// Cliente Supabase con service_role. SOLO se debe usar en código server-side
// (route handlers, server actions, webhooks). Nunca exponer al browser.
// La service_role key bypassa RLS y permite usar la API admin (admin.generateLink,
// admin.createUser, etc.).
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error(
            'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.'
        );
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
