'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const reviewSchema = z.object({
  activityId: z.string().min(1),
  activitySlug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10, 'Tell us a little more — at least 10 characters.').max(2000),
});

export interface FormState {
  ok: boolean;
  message: string;
}

/**
 * Create or update the signed-in user's review. The `(activity_id, user_id)`
 * unique constraint means an upsert edits in place rather than stacking.
 */
export async function submitReview(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = reviewSchema.safeParse({
    activityId: formData.get('activityId'),
    activitySlug: formData.get('activitySlug'),
    rating: formData.get('rating'),
    body: formData.get('body'),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Please check your review.' };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, message: 'Reviews need Supabase configured. Running in demo mode.' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Please sign in to leave a review.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle();

  const { error } = await supabase.from('reviews').upsert(
    {
      activity_id: parsed.data.activityId,
      user_id: user.id,
      author_name: profile?.display_name ?? user.email?.split('@')[0] ?? 'Newton neighbor',
      rating: parsed.data.rating,
      body: parsed.data.body,
    },
    { onConflict: 'activity_id,user_id' },
  );

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/activities/${parsed.data.activitySlug}`);
  return { ok: true, message: 'Thanks — your review is live.' };
}

export async function deleteReview(reviewId: string, activitySlug: string): Promise<FormState> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase is not configured.' };

  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) return { ok: false, message: error.message };

  revalidatePath(`/activities/${activitySlug}`);
  return { ok: true, message: 'Review deleted.' };
}
