import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SuscripcionContent from '@/components/dashboard/SuscripcionContent';

export default async function SuscripcionPage() {
    const supabase = await createClient();

    // 1. Validate Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/portal-alumno');

    // 2. Fetch User Data for personalization
    const { data: userData } = await supabase
        .from('users')
        .select('full_name') // Fetching full_name for personalization
        .eq('id', user.id)
        .single();

    const userName = userData?.full_name || 'Estudiante';

    // 3. Subscription Status
    const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle();

    const isPremium = !!subsData;
    const renewalDateRaw = subsData?.current_period_end;
    
    // Formatting date to a more elegant string
    const renewalDate = renewalDateRaw 
        ? new Date(renewalDateRaw).toLocaleDateString('es-MX', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })
        : 'Indefinido';

    return (
        <div className="min-h-screen bg-white pt-0">
            <SuscripcionContent 
                isPremium={isPremium} 
                renewalDate={renewalDate} 
                userName={userName}
            />
        </div>
    );
}
