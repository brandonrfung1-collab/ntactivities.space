import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / email-confirmation callback.
 *
 * Supabase redirects here with a `code`; exchanging it sets the session cookie.
 * Configure this URL in Supabase → Authentication → URL Configuration:
 *   http://localhost:3000/auth/callback  (dev)
 *   https://ntactivity.space/auth/callback  (prod)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const requested = url.searchParams.get('next');
  // Never follow an absolute URL from a query param — open-redirect guard.
  const next = requested?.startsWith('/') ? requested : '/';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', url.origin));
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(new URL('/login?error=not_configured', url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
