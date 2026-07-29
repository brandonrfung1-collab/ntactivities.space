/**
 * Central place to read Supabase env vars.
 *
 * The whole app is designed to run in "demo mode" when these are absent: every
 * read falls back to the local seed dataset (src/lib/data) and every write is a
 * no-op that reports back to the UI. That means `npm run dev` works on a fresh
 * clone with no credentials, and wiring up Supabase later changes nothing else.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when both public Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Service-role key — server-only, never expose to the browser. */
export function serviceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://ntactivity.space';
