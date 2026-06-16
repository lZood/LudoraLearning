import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/client';

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Obtener el ID de cliente de Stripe desde la base de datos
        const { data: customerData } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (!customerData?.stripe_customer_id) {
            return NextResponse.json({ error: 'No se encontró información de facturación para este usuario' }, { status: 404 });
        }

        // Crear sesión del portal de facturación
        const session = await stripe.billingPortal.sessions.create({
            customer: customerData.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal-alumno/dashboard/suscripcion`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Billing Portal Session Error:', error);
        return NextResponse.json({ error: 'Error al conectar con el portal de facturación' }, { status: 500 });
    }
}
