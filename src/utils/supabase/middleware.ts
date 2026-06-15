import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas privadas: requieren sesión. Si no hay usuario, se redirige al login.
// El control fino por rol (alumno vs maestro) se hace en el layout de cada portal.
const PROTECTED_PREFIXES = [
    '/portal-alumno/dashboard',
    '/portal-alumno/evaluacion',
    '/portal-maestro',
]

function isProtected(pathname: string): boolean {
    return PROTECTED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
    )
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANTE: no meter lógica entre createServerClient y getUser().
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Ruta privada sin sesión -> login, recordando a dónde quería ir.
    if (!user && isProtected(pathname)) {
        const url = request.nextUrl.clone()
        url.pathname = '/portal-alumno'
        url.search = ''
        url.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
