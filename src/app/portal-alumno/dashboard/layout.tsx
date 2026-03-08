"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Newspaper,
    Trophy,
    GraduationCap,
    BookOpen,
    Video,
    CheckSquare,
    User,
    Type,
    Settings,
    CreditCard,
    LogOut,
    ChevronUp,
    Loader2
} from "lucide-react";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import CheckoutPrompt from "@/components/dashboard/CheckoutPrompt";

const SIDEBAR_LINKS = [
    { name: "Inicio", href: "/portal-alumno/dashboard", icon: Home },
    { name: "Noticias", href: "/portal-alumno/dashboard/noticias", icon: Newspaper },
    { name: "Leaderboards", href: "/portal-alumno/dashboard/leaderboards", icon: Trophy },
];

const LEARN_LINKS = [
    { name: "Cursos", href: "/portal-alumno/dashboard/cursos", icon: GraduationCap },
    { name: "Materiales", href: "/portal-alumno/dashboard/materiales", icon: BookOpen },
    { name: "Letras", href: "/portal-alumno/dashboard/letras", icon: Type },
    { name: "Videos", href: "/portal-alumno/dashboard/videos", icon: Video },
    { name: "Tareas", href: "/portal-alumno/dashboard/tareas", icon: CheckSquare },
];

function DashboardLogo() {
    return (
        <div className="flex items-center gap-2 mb-8 px-2">
            <svg
                viewBox="0 0 184.08 72.96"
                className="h-8 w-auto fill-[#2A2B2A] transition-colors duration-300 shrink-0"
                aria-hidden="true"
            >
                <g>
                    <path d="M172.51,0H11.57C5.18,0,0,5.18,0,11.57v27.75c0,6.39,5.18,11.57,11.57,11.57l146.64,.96c1.83,.01,3.32-1.47,3.32-3.3h0c0-1.82-1.48-3.3-3.3-3.3l-146.66,.04c-3.29,0-5.96-2.67-5.96-5.96V11.57c0-3.29,2.67-5.96,5.96-5.96H172.51c3.29,0,5.96,2.67,5.96,5.96V45.09c0,5.04-1.93,5.48-4.22,6.28-4.53,1.58-4.99,3.68-5.29,4.22-2.07,3.95-.07,11.69,7.67,17.37-2.88-4.78-3.61-8.74-3.83-11.03-.18-1.95,.01-2.77,.4-3.43,1.47-2.55,5.03-1.66,7.76-3.81,1.33-1.05,2.82-3.09,3.12-7.52V11.57c0-6.39-5.18-11.57-11.57-11.57Z" />
                    <g>
                        <path d="M137.88,26.91h-3.93v-1.15s6.73-.36,6.73-5.41v-1.81s-.13-5.94-6.96-5.94h-14.76v25.87h6.2v-9.2h9.84v9.2h6.12v-8.3c0-.82-.31-1.58-.81-2.15-.6-.67-1.47-1.1-2.44-1.1Zm-12.92-3.08v-6.25h7.85c2.03,0,2.16,1.99,2.16,1.99v1.7c0,2.39-2.59,2.56-2.59,2.56h-7.41Z" />
                        <path d="M164.21,38.46h6.47l-9.49-26h-9.04l-9.13,26h6.47l2.15-6.85h10.38l2.18,6.85Zm-11.06-11.64l2.9-9.22h1.51l2.94,9.22h-7.35Z" />
                    </g>
                    <g>
                        <path d="M76.18,11.88h-12.33v25.86h12.33c6.19,0,11.2-5.02,11.2-11.2v-3.46c0-6.19-5.02-11.2-11.2-11.2Zm5.6,14.66c0,3.09-2.51,5.6-5.6,5.6h-6.73v-14.65h6.73c3.09,0,5.6,2.51,5.6,5.6v3.46Z" />
                        <path d="M104.37,11.88h-3.16c-6.28,0-11.37,5.09-11.37,11.37v3.12c0,6.28,5.09,11.37,11.37,11.37h3.16c6.19,0,11.2-5.02,11.2-11.2v-3.46c0-6.19-5.02-11.2-11.2-11.2Zm5.6,14.66c0,3.09-2.51,5.6-5.6,5.6h-3.16c-3.18,0-5.76-2.58-5.76-5.76v-3.12c0-3.18,2.58-5.76,5.76-5.76h3.16c3.09,0,5.6,2.51,5.6,5.6v3.46Z" />
                    </g>
                    <g>
                        <path d="M20.94,12.11h-5.61v23.36c0,1.55,1.26,2.81,2.81,2.81h15.17v-5.61h-12.38V12.11Z" />
                        <path d="M54.67,12.11v15.51c0,3.08-2.51,5.59-5.6,5.59h-1.69c-3.18,0-5.77-2.58-5.77-5.76V12.11h-5.61v15.34c0,6.28,5.09,11.37,11.37,11.37h1.69c6.19,0,11.2-5.02,11.2-11.2V12.11h-5.61Z" />
                    </g>
                </g>
                <g>
                    <path d="M16.02,65.8v-7.2h1.03v6.31h3.9v.9h-4.93Z" />
                    <path d="M35.09,64.91h4.2v.9h-5.23v-7.2h5.08v.9h-4.05v5.41Zm-.09-3.2h3.7v.88h-3.7v-.88Z" />
                    <path d="M51.8,65.8l3.26-7.2h1.02l3.27,7.2h-1.08l-2.91-6.63h.41l-2.91,6.63h-1.06Zm1.39-1.8l.28-.82h4.05l.3,.82h-4.63Z" />
                    <path d="M72.36,65.8v-7.2h2.81c.63,0,1.17,.1,1.62,.3,.45,.2,.79,.49,1.03,.86s.36,.83,.36,1.35-.12,.97-.36,1.34-.58,.66-1.03,.86c-.45,.2-.98,.3-1.62,.3h-2.24l.46-.47v2.67h-1.03Zm1.03-2.56l-.46-.5h2.21c.66,0,1.16-.14,1.5-.43,.34-.29,.51-.68,.51-1.2s-.17-.91-.51-1.19c-.34-.28-.84-.42-1.5-.42h-2.21l.46-.51v4.26Zm3.79,2.56l-1.83-2.61h1.1l1.85,2.61h-1.12Z" />
                    <path d="M91.78,65.8v-7.2h.84l4.76,5.92h-.44v-5.92h1.03v7.2h-.84l-4.76-5.92h.44v5.92h-1.03Z" />
                    <path d="M112.07,65.8v-7.2h1.03v7.2h-1.03Z" />
                    <path d="M127.2,65.8v-7.2h.84l4.76,5.92h-.44v-5.92h1.03v7.2h-.84l-4.76-5.92h.44v5.92h-1.03Z" />
                    <path d="M150.74,65.88c-.56,0-1.07-.09-1.53-.27s-.87-.44-1.21-.77c-.34-.33-.61-.72-.8-1.17-.19-.45-.29-.94-.29-1.47s.1-1.03,.29-1.47c.19-.45,.46-.83,.81-1.17,.35-.33,.75-.59,1.22-.77,.47-.18,.98-.27,1.54-.27s1.09,.09,1.56,.28c.47,.19,.87,.46,1.2,.83l-.64,.64c-.29-.29-.62-.5-.96-.63s-.72-.2-1.13-.2-.79,.07-1.15,.21c-.35,.14-.66,.33-.92,.58-.26,.25-.46,.54-.6,.88-.14,.34-.21,.71-.21,1.11s.07,.76,.21,1.1c.14,.34,.34,.63,.6,.88,.26,.25,.56,.44,.91,.58,.35,.14,.73,.21,1.14,.21,.38,0,.75-.06,1.11-.18,.35-.12,.68-.32,.98-.6l.59,.78c-.36,.3-.77,.53-1.25,.68s-.97,.23-1.48,.23Zm1.74-1.05v-2.68h.99v2.81l-.99-.13Z" />
                </g>
            </svg>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);

    useEffect(() => {
        let isMounted = true;

        const checkAuthAndSubscription = async () => {
            try {
                // 1. Check Auth User
                const { data: { session }, error: authError } = await supabase.auth.getSession();

                if (authError || !session) {
                    if (isMounted) {
                        router.replace('/portal-alumno'); // Not logged in, go to login
                    }
                    return;
                }

                if (isMounted) setUser(session.user);

                // 2. Check Subscription
                const { data: subData, error: subError } = await supabase
                    .from('subscriptions')
                    .select('status')
                    .eq('user_id', session.user.id)
                    .in('status', ['active', 'trialing'])
                    .single();

                if (isMounted) {
                    // True if a record is found, false if no active/trialing sub exists
                    setHasActiveSubscription(!!subData);
                }

            } catch (err) {
                console.error("Error verifying access:", err);
                if (isMounted) setHasActiveSubscription(false);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        checkAuthAndSubscription();

        return () => { isMounted = false; };
    }, [pathname, router, supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/portal-alumno');
        router.refresh();
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#F8F9FA] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-[#0F5451] animate-spin" />
                    <p className="text-gray-500 font-medium">Cargando Ludora Learning...</p>
                </div>
            </div>
        );
    }

    // Default Name Handling
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Estudiante";

    // If user has NO active subscription, show them the Checkout screen ONLY
    if (hasActiveSubscription === false) {
        return (
            <div className="flex min-h-screen bg-[#F8F9FA] font-sans items-center justify-center relative overflow-hidden">
                {/* Nether Background for checkout page */}
                <div className="absolute inset-0 z-0 bg-white/50 backdrop-blur-3xl" />

                <div className="relative z-10 w-full max-w-2xl bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
                    <div className="flex justify-center mb-4">
                        <DashboardLogo />
                    </div>
                    <CheckoutPrompt />
                </div>
            </div>
        );
    }

    // IF Subscribed, show the full Dashboard
    return (
        <div className="flex min-h-screen bg-[#F8F9FA] font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col pt-6">

                <DashboardLogo />

                <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
                    {SIDEBAR_LINKS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-[#F3F4F6] text-[#2A2B2A] font-bold"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-[#5B4FE0]" : "text-gray-400"}`} />
                                {item.name}
                            </Link>
                        )
                    })}

                    <div className="pt-6 pb-2">
                        <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Aprender
                        </p>
                    </div>

                    {LEARN_LINKS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-[#F3F4F6] text-[#2A2B2A] font-bold"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-[#5B4FE0]" : "text-gray-400"}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* Profile Section (Bottom) */}
                <div className="relative mt-auto border-t border-gray-200 p-4">
                    {/* Collapsible Menu */}
                    {isProfileMenuOpen && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                            <div className="flex flex-col">
                                <Link
                                    href="/portal-alumno/dashboard/perfil"
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                                    onClick={() => setIsProfileMenuOpen(false)}
                                >
                                    <User className="w-4 h-4 text-gray-500" />
                                    Ver Perfil
                                </Link>
                                <Link
                                    href="/portal-alumno/dashboard/suscripcion"
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                                    onClick={() => setIsProfileMenuOpen(false)}
                                >
                                    <CreditCard className="w-4 h-4 text-gray-500" />
                                    Suscripción a Clases
                                </Link>
                                <div className="h-px bg-gray-200 mx-4 my-1" />
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm font-bold text-red-600 transition-colors text-left"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Profile Toggle Button */}
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B4FE0] focus:ring-offset-2"
                    >
                        <div className="flex items-center gap-3 w-full overflow-hidden text-left">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-gray-100 flex items-center justify-center">
                                {/* Fallback user icon or image */}
                                <img
                                    src="https://minecraftfaces.com/wp-content/bigfaces/big-steve-face.png"
                                    alt="Steve Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-bold text-gray-900 truncate">
                                    {userName}
                                </span>
                                <span className="text-xs text-gray-500 truncate">Suscrito 🎉</span>
                            </div>
                        </div>
                        <ChevronUp className={`w-4 h-4 text-gray-500 transition-transform duration-300 shrink-0 ml-1 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1200px] mx-auto py-8 px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
