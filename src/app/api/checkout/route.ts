import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/client';
import { createClient } from '@/utils/supabase/server';
import { getSiteUrl } from '@/lib/siteUrl';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in first.' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { priceId, planId } = body;

        // Precio autoritativo: si llega planId, lo tomamos de la tabla plans (no del cliente).
        let finalPrice: string | undefined = priceId;
        if (planId) {
            const { data: plan } = await supabase.from('plans').select('stripe_price_id').eq('id', planId).maybeSingle();
            if (plan?.stripe_price_id) finalPrice = plan.stripe_price_id;
        }
        if (!finalPrice) finalPrice = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

        if (!finalPrice) {
            return NextResponse.json(
                { error: 'No hay un precio configurado para este plan.' },
                { status: 400 }
            );
        }

        // Fetch user from public.users to see if they already have a stripe_customer_id
        const { data: userData } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .maybeSingle();

        let customerId = userData?.stripe_customer_id;

        // If no customer ID exists, create one in Stripe
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabaseUUID: user.id,
                },
            });

            customerId = customer.id;

            // Save the new Stripe Customer ID back to Supabase
            // We use the service role key internally if RLS blocks updates.
            // But since RLS policy "Users can update own profile" is active, this should work.
            await supabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                {
                    price: finalPrice,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${getSiteUrl()}/portal-alumno/dashboard?session_id={CHECKOUT_SESSION_ID}&payment=success`,
            cancel_url: `${getSiteUrl()}/portal-alumno/dashboard/suscripcion?payment=cancelled`,
            metadata: {
                supabaseUUID: user.id,
            },
        });

        if (session.url) {
            return NextResponse.json({ url: session.url });
        } else {
            throw new Error('Could not create Checkout Session URL');
        }

    } catch (err: any) {
        console.error('Error in Checkout API:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
