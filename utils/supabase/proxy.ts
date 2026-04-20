import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'


const publicRoutes = [
    '/',
    '/store',
    '/rent',
    '/blog',
    '/about',
    '/contact',
    '/api',
    '/auth',
    '/auth/signin',
    '/auth/signup',
    '/trees'
]

const protectedRoutes = [
    '/account',
    '/checkout',
    '/orders'
]

const adminRoutes = [
    '/admin'
]

const farmerRoutes = [
    '/farmer'
]


export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet, headers) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
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

    // Do not run code between createServerClient and
    // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // 1. Define Public and Protected Routes
    const isPublicRoute =
        pathname === '/' ||
        publicRoutes.some((route) => route !== '/' && pathname.startsWith(route))

    const isAuthRoute =
        pathname.startsWith('/auth/signin') ||
        pathname.startsWith('/auth/signup')

    const isAdminRoute = pathname.startsWith('/admin')
    const isFarmerRoute = pathname.startsWith('/farmer')
    const isProtectedRoute = !isPublicRoute

    // 2. Not Logged In
    if (!user) {
        if (isProtectedRoute && !isPublicRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/signin'
            url.searchParams.set('redirectTo', pathname + request.nextUrl.search)
            return NextResponse.redirect(url)
        }
        return supabaseResponse
    }

    // 3. Logged In - Handle Auth pages (redirect away from login/signup)
    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // 4. Role-based Access Control
    if (user && (isAdminRoute || isFarmerRoute)) {
        // Fetch role from profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role

        // Admin Route Protection
        if (isAdminRoute && role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Farmer Route Protection (Admins can also access farmer routes)
        if (isFarmerRoute && role !== 'farmer' && role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return supabaseResponse
}
