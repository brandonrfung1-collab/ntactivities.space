import 'server-only';

import { cookies } from 'next/headers';

const COOKIE_NAME = 'ntc_visitor';

/**
 * Anonymous per-browser id used to attribute RSVPs without requiring sign-in.
 * Read-only — safe to call from Server Components, where cookies can't be
 * written mid-render. Returns null until the visitor's first RSVP.
 */
export async function getVisitorId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

/**
 * Read-or-create version for Server Actions / Route Handlers, where cookies
 * are writable. Issues a fresh id on first call and persists it for a year.
 */
export async function getOrCreateVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  store.set(COOKIE_NAME, id, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  });
  return id;
}
