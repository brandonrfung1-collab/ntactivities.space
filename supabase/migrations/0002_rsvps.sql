-- ============================================================================
-- ntactivity.space — RSVPs
-- Run with: supabase db push   (or paste into the Supabase SQL editor)
-- ============================================================================

-- One row per (activity, slot, visitor). `slot_at` is a generated bucket, not
-- necessarily the activity's own start_at — see src/lib/rsvp.ts for how slots
-- are chosen (the real event time for dated events; a few generic near-term
-- day buckets for standing places, since those have no structured schedule).
create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  slot_at     timestamptz not null,
  -- Anonymous per-browser cookie, not auth.uid() — RSVPs don't require an
  -- account. See RLS note below for what that trades away.
  visitor_id  uuid not null,
  created_at  timestamptz not null default now(),
  unique (activity_id, slot_at, visitor_id)
);

create index if not exists rsvps_activity_slot_idx on public.rsvps (activity_id, slot_at);

alter table public.rsvps enable row level security;

-- Counts are the whole point, so rows are world-readable. `visitor_id` is a
-- random cookie value, not personal data.
drop policy if exists rsvps_read on public.rsvps;
create policy rsvps_read on public.rsvps for select using (true);

-- Prototype tradeoff: with no auth.uid() to check against, insert/delete
-- can't be scoped to "your own visitor_id" at the database layer the way
-- favorites/reviews are. The app only ever sends the visitor_id from the
-- caller's own cookie (src/lib/visitor.ts), so this is fine for a prototype
-- but not tamper-proof — revisit (e.g. a SECURITY DEFINER RPC keyed off a
-- signed cookie) if RSVPs need to resist a malicious client.
drop policy if exists rsvps_insert_any on public.rsvps;
create policy rsvps_insert_any on public.rsvps for insert with check (true);

drop policy if exists rsvps_delete_any on public.rsvps;
create policy rsvps_delete_any on public.rsvps for delete using (true);
