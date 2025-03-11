import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          request.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  // If the user is not signed in and the route is not public, redirect to the home page
  const isAuthRoute = request.nextUrl.pathname === '/';
  const isAuthCallback = request.nextUrl.pathname === '/auth/callback';

  if (!session && !isAuthRoute && !isAuthCallback) {
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is signed in and trying to access the home page, redirect to the dashboard
  if (session && isAuthRoute) {
    const redirectUrl = new URL('/dashboards', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Specify which routes this middleware should run for
export const config = {
  matcher: ['/', '/dashboards/:path*', '/api/:path*', '/auth/callback'],
}; 