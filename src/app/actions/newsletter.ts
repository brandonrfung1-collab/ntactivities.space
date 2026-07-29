'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { VILLAGES } from '@/lib/data/villages';

const schema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  villageSlug: z.string().optional(),
});

export interface NewsletterState {
  ok: boolean;
  message: string;
}

/** Capture an email for the weekly "what's happening in Newton" digest. */
export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    villageSlug: formData.get('villageSlug') || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]!.message };
  }

  const village =
    parsed.data.villageSlug && VILLAGES.some((v) => v.slug === parsed.data.villageSlug)
      ? parsed.data.villageSlug
      : null;

  const supabase = await createClient();
  if (!supabase) {
    return { ok: true, message: 'You’re on the list! (Demo mode — nothing was stored.)' };
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: parsed.data.email, village_slug: village }, { onConflict: 'email' });

  // A duplicate is a success from the subscriber's point of view.
  if (error && error.code !== '23505') {
    return { ok: false, message: 'Something went wrong. Please try again.' };
  }

  return { ok: true, message: 'You’re on the list — first digest lands Thursday morning.' };
}
