'use server';

import { revalidatePath } from 'next/cache';
import { createClient, isCurrentUserAdmin } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

export interface AdminActionState {
  ok: boolean;
  message: string;
}

/**
 * Approve a pending submission. The heavy lifting happens in the
 * `approve_submission` SQL function, which re-checks admin status server-side
 * so this cannot be bypassed by calling the RPC directly.
 */
export async function approveSubmission(
  submissionId: string,
  title: string,
): Promise<AdminActionState> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase is not configured.' };
  if (!(await isCurrentUserAdmin())) return { ok: false, message: 'Admins only.' };

  // Slug collisions are possible across villages; suffix on conflict.
  let slug = slugify(title);
  const { data: existing } = await supabase.from('activities').select('slug').eq('slug', slug);
  if (existing?.length) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const { error } = await supabase.rpc('approve_submission', {
    p_submission_id: submissionId,
    p_slug: slug,
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  revalidatePath('/activities');
  return { ok: true, message: `Approved and published as /activities/${slug}` };
}

export async function rejectSubmission(
  submissionId: string,
  note: string,
): Promise<AdminActionState> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase is not configured.' };
  if (!(await isCurrentUserAdmin())) return { ok: false, message: 'Admins only.' };

  const { error } = await supabase
    .from('submissions')
    .update({
      status: 'rejected',
      moderator_note: note || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  return { ok: true, message: 'Submission rejected.' };
}

/** Unpublish a live listing without deleting its reviews or favorites. */
export async function setActivityPublished(
  activityId: string,
  published: boolean,
): Promise<AdminActionState> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase is not configured.' };
  if (!(await isCurrentUserAdmin())) return { ok: false, message: 'Admins only.' };

  const { error } = await supabase.from('activities').update({ published }).eq('id', activityId);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  revalidatePath('/activities');
  return { ok: true, message: published ? 'Listing published.' : 'Listing hidden.' };
}

export async function deleteActivity(activityId: string): Promise<AdminActionState> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase is not configured.' };
  if (!(await isCurrentUserAdmin())) return { ok: false, message: 'Admins only.' };

  const { error } = await supabase.from('activities').delete().eq('id', activityId);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  revalidatePath('/activities');
  return { ok: true, message: 'Listing deleted.' };
}
