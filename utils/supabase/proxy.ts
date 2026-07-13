import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { safeRedirect } from '@/lib/safe-redirect'

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

// The phone-OTP screens. Authenticated, fully-onboarded users are bounced away.
// /auth/signin doubles as the onboarding host: when a signed-in user has no
// full_name it renders the profile dialog instead of the phone form, which gives
// the completion gate below a real URL to redirect to.
const AUTH_PAGES = [
    '/auth/signin',
    '/auth/signup',
    '/admin/login',
]

const SIGNIN = '/auth/signin'

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

/** Send the user to sign-in, remembering where they were headed. */
function redirectToSignin(request: NextRequest, pathname: string) {
    const url = request.nextUrl.clone()
    url.pathname = SIGNIN
    url.search = ''
    url.searchParams.set('redirectTo', safeRedirect(pathname + request.nextUrl.search))
    return NextResponse.redirect(url)
}

// ── Middleware ─────────────────────────────────────────────────────────────────

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const { pathname } = request.nextUrl

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

        return redirectToSignin(request, pathname)
    }

    // ── PHASE 2 — Profile + assurance level ────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    const role = profile?.role as 'admin' | 'farmer' | 'user' | undefined
    // Completeness is full_name ONLY. Testing email here would permanently trap
    // every user who legitimately skipped it during onboarding.
    const profileComplete = !!profile?.full_name

    // ── PHASE 3 — Admin MFA, evaluated BEFORE the profile gate ─────────────────
    // Order matters: an admin without a full_name would otherwise ping-pong
    // between /admin/login (wants MFA) and /auth/signin (wants a profile).
    // AAL is only relevant to admins, so fetch it only for them — this middleware
    // runs on every request and the call is a needless round-trip otherwise.
    if (role === 'admin') {
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        const isAAL2 = aal?.currentLevel === 'aal2'

        // An admin below AAL2 must be able to sit on the login page to finish MFA.
        if (pathname === ADMIN_LOGIN) {
            return isAAL2 ? redirectTo(request, '/admin') : supabaseResponse
        }
        if (isAdminRoute(pathname) && !isAAL2) {
            return redirectTo(request, ADMIN_LOGIN)
        }
    }

    // ── PHASE 4 — Profile integrity ────────────────────────────────────────────
    if (!isPublicRoute(pathname) && !isAuthPage(pathname) && (!profile || profileError)) {
        return redirectToSignin(request, pathname)
    }

    // ── PHASE 5 — Onboarding gate ──────────────────────────────────────────────
    // /auth/signin hosts the profile dialog, so it must pass through or we loop.
    if (profile && !profileComplete) {
        if (pathname === SIGNIN) return supabaseResponse
        if (!isPublicRoute(pathname)) return redirectToSignin(request, pathname)
    }

    // ── PHASE 6 — Auth page bounce (fully onboarded users) ─────────────────────
    if (isAuthPage(pathname)) {
        if (!profile || profileError) return supabaseResponse

        if (role === 'admin') return redirectTo(request, '/admin')
        if (role === 'farmer') return redirectTo(request, '/farmer')
        return redirectTo(request, '/')
    }

    // ── PHASE 7 — Role rules ───────────────────────────────────────────────────
    if (role === 'admin') {
        if (isCustomerOnlyRoute(pathname)) return redirectTo(request, '/admin')
        if (isFarmerRoute(pathname)) return redirectTo(request, '/admin')
        return supabaseResponse
    }

    if (role === 'farmer') {
        if (isAdminRoute(pathname)) return redirectTo(request, '/farmer')
        if (isCustomerOnlyRoute(pathname)) return redirectTo(request, '/farmer')
        return supabaseResponse
    }

    // Customer
    if (isAdminRoute(pathname)) return redirectTo(request, '/')
    if (isFarmerRoute(pathname)) return redirectTo(request, '/')

    return supabaseResponse
}
