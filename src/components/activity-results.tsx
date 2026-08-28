import Link from 'next/link';
import { SearchX } from 'lucide-react';
import type { Activity } from '@/lib/types';
import { ActivityCard } from '@/components/activity-card';
import { Button } from '@/components/ui/button';

/** Results grid with a helpful empty state. */
export function ActivityResults({
  activities,
  favoriteIds = new Set<string>(),
  emptyHint = 'Try widening your date range or clearing a filter.',
  clearHref = '/activities',
  distances,
}: {
  activities: Activity[];
  favoriteIds?: Set<string>;
  emptyHint?: string;
  clearHref?: string;
  /** Miles from the visitor's "near me" point, keyed by activity id. */
  distances?: Map<string, number>;
}) {
  if (!activities.length) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center">
        <SearchX className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden />
        <p className="font-medium">Nothing matches that yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{emptyHint}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link href={clearHref}>Clear filters</Link>
          </Button>
          <Button asChild>
            <Link href="/submit">Add a missing listing</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity, i) => (
        <li key={activity.id} className="animate-fade-up">
          <ActivityCard
            activity={activity}
            isFavorite={favoriteIds.has(activity.id)}
            priority={i < 3}
            distanceMiles={distances?.get(activity.id)}
          />
        </li>
      ))}
    </ul>
  );
}
