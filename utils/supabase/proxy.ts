import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that are always accessible — no auth required
const publicPrefixes = [
    '/',
    '/store',
    '/rent',
    '/blog',
    '/about',
    '/contact',
    '/faq',
    '/api',
    '/auth',
    '/trees',
]

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet, headers) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                    Object.entries(headers).forEach(([key, value]) =>
                        supabaseResponse.headers.set(key, value)
                    )
                },
            },
        }
    )

    // IMPORTANT: Do not put any logic between createServerClient and getUser().
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Route classification
    const isAuthPage =
        pathname.startsWith('/auth/signin') ||
        pathname.startsWith('/auth/signup') ||
        pathname === '/admin/login'

    // Exclude /admin/login so it's always accessible (needed for the login form itself)
    const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login'
    const isFarmerRoute = pathname.startsWith('/farmer')

    const isPublicRoute =
        pathname === '/' ||
        publicPrefixes.some((p) => p !== '/' && pathname.startsWith(p))

    // ── 1. Unauthenticated ──────────────────────────────────────────
    if (!user) {
        // Always let public pages and auth pages through
        if (isPublicRoute || isAuthPage) {
            return supabaseResponse
        }
        // Protected route — redirect to the right login page
        const url = request.nextUrl.clone()
        if (isAdminRoute) {
            url.pathname = '/admin/login'
        } else {
            url.pathname = '/auth/signin'
            url.searchParams.set('redirectTo', pathname + request.nextUrl.search)
        }
        return NextResponse.redirect(url)
    }

    // ── 2. Authenticated — bounce away from login/signup pages ──────
    if (isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // ── 3. Role-based Access Control ────────────────────────────────
    if (isAdminRoute || isFarmerRoute) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role

        if (isAdminRoute && role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Admins can also access farmer routes
        if (isFarmerRoute && role !== 'farmer' && role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return supabaseResponse
}
