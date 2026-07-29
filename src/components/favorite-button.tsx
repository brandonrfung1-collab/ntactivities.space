'use client';

import { Heart } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toggleFavorite } from '@/app/actions/favorites';
import { cn } from '@/lib/utils';

/**
 * Optimistic save toggle. Reverts and surfaces a tooltip-style message if the
 * server rejects (usually "sign in first").
 */
export function FavoriteButton({
  activityId,
  initialSaved = false,
  compact = false,
  className,
}: {
  activityId: string;
  initialSaved?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    const previous = saved;
    setSaved(!previous);
    setError(null);

    startTransition(async () => {
      const result = await toggleFavorite(activityId, previous);
      if (!result.ok) {
        setSaved(previous);
        setError(result.message ?? 'Could not save.');
      }
    });
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/90 backdrop-blur transition-colors',
          'hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          compact ? 'size-9 justify-center' : 'h-10 px-4 text-sm font-medium',
          className,
        )}
      >
        <Heart
          className={cn(
            'size-4 transition-all',
            saved ? 'fill-accent text-accent scale-110' : 'text-muted-foreground',
          )}
          aria-hidden
        />
        {!compact && <span>{saved ? 'Saved' : 'Save'}</span>}
      </button>

      {error && (
        <span
          role="status"
          className="absolute right-0 top-full z-30 mt-1.5 w-max max-w-[14rem] rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-lifted"
        >
          {error}
        </span>
      )}
    </span>
  );
}
