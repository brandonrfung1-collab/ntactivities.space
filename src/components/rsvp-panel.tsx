'use client';

import { Users } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toggleRsvp } from '@/app/actions/rsvps';
import type { RsvpSlot } from '@/lib/rsvp';
import { cn } from '@/lib/utils';

/**
 * "I'll be there" — visitors pick one slot per activity and see how many
 * others picked the same one. No sign-in required; identity is an anonymous
 * cookie, so counts are indicative, not audited.
 */
export function RsvpPanel({
  activityId,
  activitySlug,
  slots,
  initialCounts,
  initialGoingSlot,
}: {
  activityId: string;
  activitySlug: string;
  slots: RsvpSlot[];
  initialCounts: Record<string, number>;
  initialGoingSlot: string | null;
}) {
  const [counts, setCounts] = useState(initialCounts);
  const [goingSlot, setGoingSlot] = useState(initialGoingSlot);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onPick(slotKey: string) {
    const prevCounts = counts;
    const prevGoing = goingSlot;
    setError(null);

    // Optimistic: move the visitor's count from their old slot (if any) to
    // the new one, or drop it if they re-clicked their current slot.
    const next = { ...counts };
    if (prevGoing) next[prevGoing] = Math.max(0, (next[prevGoing] ?? 0) - 1);
    const willGo = prevGoing !== slotKey;
    if (willGo) next[slotKey] = (next[slotKey] ?? 0) + 1;
    setCounts(next);
    setGoingSlot(willGo ? slotKey : null);

    startTransition(async () => {
      const result = await toggleRsvp(
        activityId,
        activitySlug,
        slotKey,
        slots.map((s) => s.key),
      );
      if (!result.ok) {
        setCounts(prevCounts);
        setGoingSlot(prevGoing);
        setError(result.message ?? 'Could not RSVP.');
        return;
      }
      setCounts(result.counts);
      setGoingSlot(result.goingSlot);
    });
  }

  const totalGoing = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold">
        <Users className="size-4 text-muted-foreground" aria-hidden />
        Who&apos;s going
        {totalGoing > 0 && (
          <span className="font-normal text-muted-foreground">
            · {totalGoing} {totalGoing === 1 ? 'person' : 'people'}
          </span>
        )}
      </h2>

      <div className="flex flex-col gap-2">
        {slots.map((slot) => {
          const count = counts[slot.key] ?? 0;
          const active = goingSlot === slot.key;
          return (
            <button
              key={slot.key}
              type="button"
              disabled={pending}
              aria-pressed={active}
              onClick={() => onPick(slot.key)}
              className={cn(
                'flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'border-primary bg-primary/10 font-medium text-primary'
                  : 'border-border hover:border-primary/40 hover:bg-secondary/40',
              )}
            >
              <span>{slot.label}</span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs',
                  active ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground',
                )}
              >
                {count === 0 ? "Be the first" : `${count} going`}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
