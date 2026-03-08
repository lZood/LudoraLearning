import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/client';
import { createClient } from '@/utils/supabase/server';

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
        const { priceId } = body;

        if (!priceId) {
            return NextResponse.json(
                { error: 'Price ID is required' },
                { status: 400 }
            );
        }

        // Fetch user from public.users to see if they already have a stripe_customer_id
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

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
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.get('origin')}/portal-alumno/dashboard?session_id={CHECKOUT_SESSION_ID}&payment=success`,
            cancel_url: `${req.headers.get('origin')}/portal-alumno/checkout?payment=cancelled`,
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
