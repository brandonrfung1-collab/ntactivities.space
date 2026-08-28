'use client';

import { useEffect, useState } from 'react';
import type { Activity } from '@/lib/types';
import { getAvailabilityBadge, type Availability } from '@/lib/schedule';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * "Open now" / "Happening today" chip, computed client-side from live time.
 *
 * Pages are statically rendered (`revalidate = 3600`), so "now" can't be
 * baked in server-side without going stale for up to an hour. Renders
 * nothing on first paint (matching SSR) and fills in after mount, then
 * re-checks every minute so it flips over live without a refresh.
 */
export function ScheduleBadge({ activity, className }: { activity: Activity; className?: string }) {
  const [badge, setBadge] = useState<Availability | null>(null);

  useEffect(() => {
    const update = () => setBadge(getAvailabilityBadge(activity));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [activity]);

  if (!badge) return null;

  return (
    <Badge variant={badge.tone === 'live' ? 'live' : 'outline'} className={cn('gap-1.5', className)}>
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          badge.tone === 'live' ? 'animate-pulse bg-white' : 'bg-accent',
        )}
      />
      {badge.label}
    </Badge>
  );
}
