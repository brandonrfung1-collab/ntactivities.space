/**
 * Central place to read Supabase env vars.
 *
 * The whole app is designed to run in "demo mode" when these are absent: every
 * read falls back to the local seed dataset (src/lib/data) and every write is a
 * no-op that reports back to the UI. That means `npm run dev` works on a fresh
 * clone with no credentials, and wiring up Supabase later changes nothing else.
 */
/**
 * Strips a leading UTF-8 BOM and surrounding whitespace.
 *
 * Some shells (PowerShell's `echo | vercel env add` in particular) inject a
 * BOM into piped stdin, which lands in the stored env var value. A BOM inside
 * a URL string fails `new URL()` with a cryptic "Invalid URL", so every env
 * var we read passes through this first.
 */
function clean(value: string | undefined): string {
  return (value ?? '').replace(/^﻿/, '').trim();
}

export const SUPABASE_URL = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const SUPABASE_ANON_KEY = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** True when both public Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Service-role key — server-only, never expose to the browser. */
export function serviceRoleKey(): string | null {
  return clean(process.env.SUPABASE_SERVICE_ROLE_KEY) || null;
}

const rawSiteUrl = clean(process.env.NEXT_PUBLIC_SITE_URL) || 'https://ntactivity.space';
export const SITE_URL = rawSiteUrl.replace(/\/$/, '');
