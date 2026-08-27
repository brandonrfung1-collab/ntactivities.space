'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateVisitorId } from '@/lib/visitor';
import { buildSlotCounts } from '@/lib/rsvp';

const rsvpSchema = z.object({
  activityId: z.string().min(1),
  activitySlug: z.string().min(1),
  slotAt: z.string().min(1),
  slotKeys: z.array(z.string().min(1)).min(1),
});

export interface RsvpResult {
  ok: boolean;
  goingSlot: string | null;
  counts: Record<string, number>;
  message?: string;
}

/**
 * Toggles the signed-in visitor's RSVP for one slot of an activity. A visitor
 * may be going to at most one slot per activity — picking a different slot
 * moves the RSVP rather than stacking it.
 *
 * Identity is an anonymous cookie (`ntc_visitor`), not auth — this is a
 * prototype, so anyone can RSVP without an account. See rsvps table RLS in
 * supabase/migrations/0002_rsvps.sql for the tradeoff that implies.
 */
export async function toggleRsvp(
  activityId: string,
  activitySlug: string,
  slotAt: string,
  slotKeys: string[],
): Promise<RsvpResult> {
  const parsed = rsvpSchema.safeParse({ activityId, activitySlug, slotAt, slotKeys });
  if (!parsed.success) {
    return { ok: false, goingSlot: null, counts: {}, message: 'Something went wrong.' };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      goingSlot: null,
      counts: {},
      message: 'RSVPs need Supabase configured — running in demo mode.',
    };
  }

  const visitorId = await getOrCreateVisitorId();

  await supabase
    .from('rsvps')
    .delete()
    .eq('activity_id', activityId)
    .eq('visitor_id', visitorId)
    .neq('slot_at', slotAt);

  const { data: existing } = await supabase
    .from('rsvps')
    .select('id')
    .eq('activity_id', activityId)
    .eq('visitor_id', visitorId)
    .eq('slot_at', slotAt)
    .maybeSingle();

  let goingSlot: string | null = slotAt;
  if (existing) {
    const { error } = await supabase.from('rsvps').delete().eq('id', existing.id);
    if (error) return { ok: false, goingSlot: null, counts: {}, message: error.message };
    goingSlot = null;
  } else {
    const { error } = await supabase
      .from('rsvps')
      .insert({ activity_id: activityId, slot_at: slotAt, visitor_id: visitorId });
    if (error) return { ok: false, goingSlot: null, counts: {}, message: error.message };
  }

  const { data: rows } = await supabase
    .from('rsvps')
    .select('slot_at')
    .eq('activity_id', activityId);

  revalidatePath(`/activities/${activitySlug}`);
  return { ok: true, goingSlot, counts: buildSlotCounts(rows ?? [], slotKeys) };
}
