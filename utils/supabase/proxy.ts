import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isMaintenanceMode, isMaintenanceAllowedPath } from '@/lib/maintenance'

// ── Route Definitions ──────────────────────────────────────────────────────────

const PUBLIC_PREFIXES = [
    '/store',
    '/rent',
    '/blog',
    '/about',
    '/contact',
    '/faq',
    '/trees',
    '/api',
    '/privacy',
    '/terms',
]

const AUTH_PAGES = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/admin/login',
]

const CUSTOMER_ONLY_PREFIXES = [
    '/account',
    '/checkout',
]

const ADMIN_PREFIX = '/admin'
const ADMIN_LOGIN = '/admin/login'
const FARMER_PREFIX = '/farmer'

// ── Helpers ────────────────────────────────────────────────────────────────────

function matchesPrefix(pathname: string, prefixes: string[]) {
    return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function isAuthPage(pathname: string) {
    return AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p))
}

function isAdminRoute(pathname: string) {
    return pathname.startsWith(ADMIN_PREFIX) && pathname !== ADMIN_LOGIN
}

function isFarmerRoute(pathname: string) {
    return pathname.startsWith(FARMER_PREFIX)
}

function isCustomerOnlyRoute(pathname: string) {
    return matchesPrefix(pathname, CUSTOMER_ONLY_PREFIXES)
}

function isPublicRoute(pathname: string) {
    return pathname === '/' || matchesPrefix(pathname, PUBLIC_PREFIXES)
}

function redirectTo(request: NextRequest, destination: string) {
    const url = request.nextUrl.clone()
    url.pathname = destination
    url.search = ''
    return NextResponse.redirect(url)
}

// ── Middleware ─────────────────────────────────────────────────────────────────

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const { pathname } = request.nextUrl

    // ── MAINTENANCE MODE ───────────────────────────────────────────────────────
    // Hold every visitor on the home page while an upgrade is in progress.
    // Runs before any Supabase call so it still works if the database is mid-migration.
    // /admin and /api stay reachable (see lib/maintenance.ts).
    if (isMaintenanceMode() && !isMaintenanceAllowedPath(pathname)) {
        return redirectTo(request, '/')
    }

    // Auth callback must reach its route handler even without a session — its whole
    // purpose is to exchange the code for a session. Gating it here bounces it to
    // /auth/signin before the exchange runs, breaking password reset + signup confirm.
    // Match the exact path only (not a prefix) so protected routes stay gated.
    // (Add '/auth/confirm' here if a dedicated confirmation endpoint is introduced.)
    if (pathname === '/auth/callback') {
        return supabaseResponse
    }

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
                    Object.entries(headers ?? {}).forEach(([key, value]) =>
                        supabaseResponse.headers.set(key, value)
                    )
                },
            },
        }
    )

    // IMPORTANT: Do NOT put any logic between createServerClient and getUser().
    const { data: { user } } = await supabase.auth.getUser()

    // ── PHASE 1 — Unauthenticated ──────────────────────────────────────────────
    if (!user) {
        if (isPublicRoute(pathname) || isAuthPage(pathname)) {
            return supabaseResponse
        }

        if (isAdminRoute(pathname)) {
            return redirectTo(request, ADMIN_LOGIN)
        }

        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        url.searchParams.set('redirectTo', pathname + request.nextUrl.search)
        return NextResponse.redirect(url)
    }

    // ── PHASE 2 — Fetch Profile ────────────────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role as 'admin' | 'farmer' | 'customer' | undefined

    // ── PHASE 3 — Auth Page Bounce ─────────────────────────────────────────────
    if (isAuthPage(pathname)) {
        if (pathname.startsWith('/auth/reset-password')) {
            return supabaseResponse
        }

        if (!profile || profileError) {
            return supabaseResponse
        }

        if (role === 'admin') return redirectTo(request, '/admin')
        if (role === 'farmer') return redirectTo(request, '/farmer')
        return redirectTo(request, '/')
    }

    // ── PHASE 4 — Profile Integrity Check ─────────────────────────────────────
    if (!isPublicRoute(pathname) && (!profile || profileError)) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        url.searchParams.set('redirectTo', pathname + request.nextUrl.search)
        return NextResponse.redirect(url)
    }

    // ── PHASE 5 — Admin Rules ──────────────────────────────────────────────────
    if (role === 'admin') {
        if (isCustomerOnlyRoute(pathname)) return redirectTo(request, '/admin')
        if (isFarmerRoute(pathname)) return redirectTo(request, '/admin')
        return supabaseResponse
    }

    // ── PHASE 6 — Farmer Rules ─────────────────────────────────────────────────
    if (role === 'farmer') {
        if (isAdminRoute(pathname)) return redirectTo(request, '/farmer')
        if (isCustomerOnlyRoute(pathname)) return redirectTo(request, '/farmer')
        return supabaseResponse
    }

    // ── PHASE 7 — Customer Rules ───────────────────────────────────────────────
    if (isAdminRoute(pathname)) return redirectTo(request, '/')
    if (isFarmerRoute(pathname)) return redirectTo(request, '/')

    return supabaseResponse
}