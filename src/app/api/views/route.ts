import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Records an activity page view via the `record_activity_view` SQL function,
 * which is SECURITY DEFINER so anonymous visitors can bump the counter without
 * write access to the table.
 */
export async function POST(request: Request) {
  let body: { activityId?: string; referrer?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body.activityId) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = await createClient();
  // Demo mode: accept and drop, so the client never sees an error.
  if (!supabase) return NextResponse.json({ ok: true, recorded: false });

  const { error } = await supabase.rpc('record_activity_view', {
    p_activity_id: body.activityId,
    p_referrer: body.referrer ?? null,
  });

  if (error) {
    console.error('[api/views] failed:', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, recorded: true });
}
