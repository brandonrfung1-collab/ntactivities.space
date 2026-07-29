import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createRawClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured, serviceRoleKey } from './config';

/**
 * Request-scoped Supabase client for Server Components, Server Actions and
 * Route Handlers. Returns null in demo mode.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component render — cookies are read-only here.
          // The middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * Service-role client that bypasses RLS. Only ever call this from server code
 * after you have independently verified the caller is an admin.
 */
export function createAdminClient(): SupabaseClient | null {
  const key = serviceRoleKey();
  if (!isSupabaseConfigured() || !key) return null;
  // `import 'server-only'` above guarantees this module never reaches the client
  // bundle, so the service key cannot leak through it.
  return createRawClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** The signed-in user, or null (also null in demo mode). */
export async function getCurrentUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Whether the signed-in user is an admin. Authoritative check lives in the
 * `profiles.is_admin` column, guarded by RLS.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  return Boolean(data?.is_admin);
}
