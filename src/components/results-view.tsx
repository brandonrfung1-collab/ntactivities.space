'use client';

import { useState, type ReactNode } from 'react';
import { List, MapPin } from 'lucide-react';
import type { Activity } from '@/lib/types';
import { ActivityMap } from '@/components/activity-map';
import { cn } from '@/lib/utils';

/**
 * List/Map toggle for a results page. `children` is the already
 * server-rendered `<ActivityResults>` list — passing it down like this keeps
 * that markup server-rendered instead of pushing the whole listing into a
 * client bundle just to add a tab.
 */
export function ResultsView({ activities, children }: { activities: Activity[]; children: ReactNode }) {
  const [view, setView] = useState<'list' | 'map'>('list');
  const mappable = activities.filter((a) => a.lat && a.lng).length;

  if (mappable === 0) return <>{children}</>;

  return (
    <div>
      <div className="mb-4 inline-flex rounded-full border border-border bg-card p-1 shadow-soft">
        <button
          type="button"
          onClick={() => setView('list')}
          aria-pressed={view === 'list'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
            view === 'list'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <List className="size-3.5" aria-hidden />
          List
        </button>
        <button
          type="button"
          onClick={() => setView('map')}
          aria-pressed={view === 'map'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
            view === 'map'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <MapPin className="size-3.5" aria-hidden />
          Map
        </button>
      </div>

      {view === 'map' ? (
        <ActivityMap
          activities={activities}
          className="h-[26rem] w-full overflow-hidden rounded-lg border border-border shadow-soft sm:h-[32rem]"
        />
      ) : (
        children
      )}
    </div>
  );
}
