import 'server-only';

import type { Activity } from '@/lib/types';
import { formatEventWindow } from '@/lib/utils';

export interface RsvpSlot {
  /** ISO timestamp — the grouping key stored in `rsvps.slot_at`. */
  key: string;
  label: string;
}

export interface RsvpSummary {
  slots: RsvpSlot[];
  /** slot key -> number of visitors going. */
  counts: Record<string, number>;
  /** The current visitor's chosen slot key, or null if they haven't RSVPed. */
  goingSlot: string | null;
}

const NY_TZ = 'America/New_York';

function startOfDayNewton(d: Date): Date {
  // Anchor on the New York calendar date so "Today" matches what the site
  // already shows for event dates, then normalize to a stable instant.
  const dateStr = d.toLocaleDateString('en-CA', { timeZone: NY_TZ }); // yyyy-mm-dd
  return new Date(`${dateStr}T12:00:00`); // noon avoids any DST edge case
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * The selectable RSVP slots for an activity.
 *
 * Dated events (`isEvent` with a `startAt`) get exactly one slot: the real
 * event time. Standing places and recurring activities have no structured
 * schedule in the data model, so we offer a handful of generic near-term
 * buckets instead of trying to parse the freeform `recurrence` string.
 */
export function getRsvpSlots(activity: Pick<Activity, 'isEvent' | 'startAt' | 'endAt'>): RsvpSlot[] {
  if (activity.isEvent && activity.startAt) {
    return [
      {
        key: activity.startAt,
        label: formatEventWindow(activity.startAt, activity.endAt) ?? 'Event time',
      },
    ];
  }

  const today = startOfDayNewton(new Date());

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const saturday = new Date(today);
  const daysUntilSat = (6 - today.getDay() + 7) % 7 || 7;
  saturday.setDate(saturday.getDate() + daysUntilSat);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    { key: today.toISOString(), label: `Today, ${dayLabel(today)}` },
    { key: tomorrow.toISOString(), label: `Tomorrow, ${dayLabel(tomorrow)}` },
    { key: saturday.toISOString(), label: `This weekend, ${dayLabel(saturday)}` },
    { key: nextWeek.toISOString(), label: `Next week, ${dayLabel(nextWeek)}` },
  ];
}

/**
 * Tallies RSVP rows against a known set of slot keys, matching by parsed
 * instant rather than string equality — Postgres normalizes `timestamptz`
 * text on the way back out, so it rarely round-trips byte-for-byte.
 */
export function buildSlotCounts(
  rows: { slot_at: string }[],
  slotKeys: string[],
): Record<string, number> {
  const slotTimes = new Map(slotKeys.map((key) => [new Date(key).getTime(), key]));
  const counts: Record<string, number> = {};
  for (const key of slotKeys) counts[key] = 0;

  for (const row of rows) {
    const key = slotTimes.get(new Date(row.slot_at).getTime());
    if (key) counts[key] += 1;
  }
  return counts;
}

/**
 * Zero-state summary for demo mode. Unlike reads elsewhere in the app, RSVPs
 * can't fall back to seed data — there's nothing to seed — and a per-process
 * in-memory store isn't a safe substitute: Next.js runs Server Components and
 * Server Actions in separate module registries even within one dev server,
 * so a module-level `Map` isn't reliably shared between the read path and the
 * write path (and wouldn't survive multiple serverless instances in prod
 * anyway). So demo mode shows real zero counts and lets `toggleRsvp` explain
 * why the click didn't stick, same as favorites/reviews/newsletter.
 */
export function emptySummary(slots: RsvpSlot[]): RsvpSummary {
  const counts: Record<string, number> = {};
  for (const slot of slots) counts[slot.key] = 0;
  return { slots, counts, goingSlot: null };
}
