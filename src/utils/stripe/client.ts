import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-02-25.clover' as any, // Using 'as any' to allow newer API versions if they are valid
    appInfo: {
        name: 'Ludora Learning',
        version: '0.1.0',
    },
});
