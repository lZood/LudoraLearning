import React from "react";
import { BookOpen, ChevronRight, Zap, Medal, Star, Type, GraduationCap } from "lucide-react";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CourseMap from "@/components/dashboard/CourseMap";
import MobileDashboardContent from "@/components/dashboard/MobileDashboardContent";
import DesktopDashboardContent from "@/components/dashboard/DesktopDashboardContent";

export default async function DashboardIndex() {
    const supabase = await createClient();

    // 1. Validate Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/portal-alumno');

    // 2. Validate Level
    const { data: userData } = await supabase
        .from('users')
        .select('english_level')
        .eq('id', user.id)
        .single();

    if (!userData || !userData.english_level) {
        redirect('/portal-alumno/evaluacion');
    }

    // 3. Subscription Status
    const { data: subsData } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing']);

    const isPremium = !!(subsData && subsData.length > 0);

    const bandaNumber = userData.english_level.replace('Banda ', '');
    const bandaTitle = bandaNumber === '1' ? 'Iniciación Inmersiva' : bandaNumber === '2' ? 'Básico Funcional' : 'Aventurero Independiente';

    return (
        <div className="w-full">
            {/* MOBILE VIEW (vistas pequeñas) */}
            <div className="md:hidden">
              <MobileDashboardContent 
                bandaNumber={bandaNumber} 
                bandaTitle={bandaTitle} 
                isPremium={isPremium} 
              />
            </div>

            {/* DESKTOP VIEW (vistas medianas/grandes) */}
            <div className="hidden md:flex flex-col w-full max-w-7xl mx-auto">
                <DesktopDashboardContent 
                    bandaNumber={bandaNumber} 
                    bandaTitle={bandaTitle} 
                    isPremium={isPremium} 
                />
            </div>

        </div>
    );
}
