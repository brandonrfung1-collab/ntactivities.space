'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import type { Activity } from '@/lib/types';
import { ActivityCard } from '@/components/activity-card';
import { Button } from '@/components/ui/button';

/**
 * Horizontal scroll-snap rail. Native scrolling does the work — the arrow
 * buttons are a desktop nicety, and touch users just swipe.
 */
export function FeaturedCarousel({
  activities,
  favoriteIds = [],
}: {
  activities: Activity[];
  favoriteIds?: string[];
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const saved = new Set(favoriteIds);

  function scrollBy(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;
    // One "page" is roughly the width of a single card plus its gap.
    rail.scrollBy({ left: direction * Math.min(rail.clientWidth * 0.8, 360), behavior: 'smooth' });
  }

  if (!activities.length) return null;

  return (
    <div className="relative">
      <div className="mb-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
        >
          <ChevronLeft aria-hidden />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>

      <ul
        ref={railRef}
        className="snap-rail -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2"
      >
        {activities.map((activity, i) => (
          <li
            key={activity.id}
            className="w-[78vw] min-w-0 shrink-0 snap-start sm:w-[46%] lg:w-[31%] xl:w-[24%]"
          >
            <ActivityCard
              activity={activity}
              isFavorite={saved.has(activity.id)}
              priority={i < 2}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
