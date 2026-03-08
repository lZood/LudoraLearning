import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/client';
import { createClient } from '@supabase/supabase-js';

// We must use the Service Role Key here because webhooks run outside of a user's session,
// and we need to bypass Row Level Security to update the subscriptions table.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature) {
            console.error('No stripe-signature header found');
            return NextResponse.json({ error: 'No signature' }, { status: 400 });
        }

        let event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
        }

        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                console.log(`[Webhook] Processing ${event.type} for customer ${customerId}`);

                // Try to find user by stripe_customer_id
                let { data: user, error: userError } = await supabaseAdmin
                    .from('users')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single();

                // FALLBACK: If user not found, try searching by Stripe metadata
                if (userError || !user) {
                    console.log(`[Webhook] User not found by ID. Checking Stripe metadata...`);
                    try {
                        const customer = await stripe.customers.retrieve(customerId) as any;
                        const supabaseUUID = customer.metadata?.supabaseUUID;

                        if (supabaseUUID) {
                            user = { id: supabaseUUID };
                            console.log(`[Webhook] Found user UUID in metadata: ${supabaseUUID}`);

                            // Link them now for next time
                            await supabaseAdmin
                                .from('users')
                                .update({ stripe_customer_id: customerId })
                                .eq('id', supabaseUUID);
                        }
                    } catch (stripeErr) {
                        console.error('[Webhook] Stripe API Error:', stripeErr);
                    }
                }

                if (!user) {
                    console.error('[Webhook] CRITICAL: No user found for customer', customerId);
                    break;
                }

                // Safely convert conversion timestamps to ISO strings
                const startDate = subscription.current_period_start
                    ? new Date(subscription.current_period_start * 1000).toISOString()
                    : new Date().toISOString();

                const endDate = subscription.current_period_end
                    ? new Date(subscription.current_period_end * 1000).toISOString()
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default +30 days

                // Insert or update subscription in Supabase
                const { error: upsertError } = await supabaseAdmin
                    .from('subscriptions')
                    .upsert({
                        id: subscription.id,
                        user_id: user.id,
                        status: subscription.status,
                        price_id: subscription.items.data[0]?.price?.id || null,
                        current_period_start: startDate,
                        current_period_end: endDate,
                        cancel_at_period_end: subscription.cancel_at_period_end || false,
                    });

                if (upsertError) {
                    console.error('[Webhook] Database Upsert Error:', upsertError);
                    return NextResponse.json({ error: 'DB Upsert Failed' }, { status: 500 });
                }

                console.log(`Successfully handled ${event.type} for user ${user.id}`);
                break;

            case 'checkout.session.completed':
                // The subscription created/updated event usually handles the actual data.
                // We can use this to send a welcome email if we wanted to.
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Webhook Error:', err.message);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
