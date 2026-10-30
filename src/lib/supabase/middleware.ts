// ==============================================================================
// SlotCare Supabase Middleware Session Handler
// Automatic Token Refresh & Route Protection with Hybrid Fallback
// ==============================================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from './client';

export async function updateSession(request: NextRequest) {
  // Graceful fallback for local evaluation / unconfigured preview mode
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid using getSession() — use getUser() to validate auth on server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protected clinic routes
  const isProtectedRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/calendar') ||
    path.startsWith('/waitlist') ||
    path.startsWith('/open-slots') ||
    path.startsWith('/recovery-history') ||
    path.startsWith('/settings');

  // If user is not logged in and accessing a protected clinic route, redirect to /login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is already logged in and visits /login, redirect to /dashboard
  if (user && path === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
