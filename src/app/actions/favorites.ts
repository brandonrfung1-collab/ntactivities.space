'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface ToggleResult {
  ok: boolean;
  saved: boolean;
  /** Set when the action could not complete — surfaced inline in the UI. */
  message?: string;
}

/**
 * Add or remove a favorite for the signed-in user.
 *
 * RLS restricts favorites to `user_id = auth.uid()`, so we still pass the id
 * explicitly and let Postgres be the authority.
 */
export async function toggleFavorite(
  activityId: string,
  currentlySaved: boolean,
): Promise<ToggleResult> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      saved: currentlySaved,
      message: 'Saving favorites needs Supabase configured.',
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, saved: false, message: 'Sign in to save favorites.' };
  }

  if (currentlySaved) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('activity_id', activityId);
    if (error) return { ok: false, saved: true, message: error.message };
  } else {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, activity_id: activityId });
    if (error) return { ok: false, saved: false, message: error.message };
  }

  revalidatePath('/favorites');
  return { ok: true, saved: !currentlySaved };
}
