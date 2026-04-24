import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Route Definitions ──────────────────────────────────────────────────────────

/**
 * Always publicly accessible — no auth, no role check.
 * These are read-only storefront/informational pages.
 */
const PUBLIC_PREFIXES = [
    '/store',
    '/rent',
    '/blog',
    '/about',
    '/contact',
    '/faq',
    '/trees',
    '/api',          // webhooks / internal endpoints
]

/** Auth pages — accessible only when NOT logged in */
const AUTH_PAGES = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/admin/login',
]

/** 
 * Customer-only routes — authenticated users with role "customer".
 * Admins & farmers are intentionally blocked from these.
 */
const CUSTOMER_ONLY_PREFIXES = [
    '/account',
    '/checkout',
]

/** Admin suite */
const ADMIN_PREFIX = '/admin'
const ADMIN_LOGIN = '/admin/login'

/** Farmer portal */
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

/** Canonical redirect helper — avoids redirect loops */
function redirectTo(request: NextRequest, destination: string) {
    const url = request.nextUrl.clone()
    url.pathname = destination
    url.search = ''
    return NextResponse.redirect(url)
}

// ── Middleware ─────────────────────────────────────────────────────────────────

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
                    Object.entries(headers ?? {}).forEach(([key, value]) =>
                        supabaseResponse.headers.set(key, value)
                    )
                },
            },
        }
    );

    // IMPORTANT: Do NOT put any logic between createServerClient and getUser().
    const { data: { user } } = await supabase.auth.getUser()

    // ── PHASE 0 — Arcjet Protection ───────────────────────────────────────────
    const { pathname } = request.nextUrl

    // Skip Arcjet for the blocked page itself and other static assets
    const isExcluded = pathname === "/blocked" ||
        pathname.startsWith("/_next") ||
        pathname.includes(".")

    if (!isExcluded) {
        const { aj, authenticatedAj } = await import('@/lib/arcjet')

        // Determine if we should use the authenticated rate limiter
        const isProtectedRoute = isAdminRoute(pathname) ||
            isFarmerRoute(pathname) ||
            isCustomerOnlyRoute(pathname)

        let decision;

        if (isProtectedRoute && user) {
            // Protected routes use the user's ID for rate limiting
            decision = await authenticatedAj.protect(request, {
                userId: user.id,
                requested: 1,
            })
        } else {
            // Public/Auth routes use the IP-based limiter
            decision = await aj.protect(request, {
                requested: 1,
            })
        }

        if (decision.isDenied()) {
            const url = request.nextUrl.clone()
            url.pathname = "/blocked"
            url.searchParams.set("reason", decision.reason.type ?? "UNKNOWN")
            return NextResponse.redirect(url)
        }
    }

    // ── PHASE 1 — Unauthenticated ──────────────────────────────────────────────
    if (!user) {
        // Always allow: public storefront, auth pages
        if (isPublicRoute(pathname) || isAuthPage(pathname)) {
            return supabaseResponse
        }

        // Everything else requires login — send to the right login page
        if (isAdminRoute(pathname)) {
            return redirectTo(request, ADMIN_LOGIN)
        }

        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        url.searchParams.set('redirectTo', pathname + request.nextUrl.search)
        return NextResponse.redirect(url)
    }

    // ── PHASE 2 — Auth Page Bounce ────────────────────────────────────────────
    // If they are logged in and hit an auth page, we usually bounce them.
    // BUT we need to fetch the profile first to know where to bounce them.
    // However, if they are already on an auth page, we should ALLOW it if their 
    // profile is missing (e.g. deleted user trying to sign in again).

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role as 'admin' | 'farmer' | 'customer' | undefined

    if (isAuthPage(pathname)) {
        // Special case: reset-password page MUST be accessible even when logged in
        // (because the recovery link creates a session)
        if (pathname.startsWith('/auth/reset-password')) {
            return supabaseResponse
        }

        if (!profile || profileError) {
            // User is deleted or has no profile — ALLOW them to stay on auth pages
            // so they can sign out or sign in as someone else.
            return supabaseResponse
        }

        // Valid user on auth page — bounce to their dashboard
        if (role === 'admin') return redirectTo(request, '/admin')
        if (role === 'farmer') return redirectTo(request, '/farmer')
        return redirectTo(request, '/')
    }

    // ── PHASE 3 — Profile Integrity Check ─────────────────────────────────────
    // For all other routes (except public ones), if they have an Auth session 
    // but NO profile, they are likely a deleted user. Force them to sign in.
    if (!isPublicRoute(pathname) && (!profile || profileError)) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        url.searchParams.set('redirectTo', pathname + request.nextUrl.search)
        return NextResponse.redirect(url)
    }

    // ── PHASE 4 — ADMIN rules ──────────────────────────────────────────────────
    if (role === 'admin') {
        // Admins are BLOCKED from customer-only routes
        // (they don't have personal orders / checkouts)
        if (isCustomerOnlyRoute(pathname)) {
            return redirectTo(request, '/admin')
        }

        // Admins cannot enter the farmer portal
        if (isFarmerRoute(pathname)) {
            return redirectTo(request, '/admin')
        }

        // Admins can freely browse the public storefront + their admin suite
        return supabaseResponse
    }

    // ── PHASE 5 — FARMER rules ─────────────────────────────────────────────────
    if (role === 'farmer') {
        // Farmers are blocked from the admin suite entirely
        if (isAdminRoute(pathname)) {
            return redirectTo(request, '/farmer')
        }

        // Farmers are blocked from customer-only routes
        if (isCustomerOnlyRoute(pathname)) {
            return redirectTo(request, '/farmer')
        }

        // Farmers can access their portal + the public storefront
        return supabaseResponse
    }

    // ── PHASE 6 — CUSTOMER (default authenticated) rules ──────────────────────
    // Customers are blocked from admin & farmer areas
    if (isAdminRoute(pathname)) {
        return redirectTo(request, '/')
    }
    if (isFarmerRoute(pathname)) {
        return redirectTo(request, '/')
    }

    // Customers can access: public storefront, /account, /checkout
    return supabaseResponse
}