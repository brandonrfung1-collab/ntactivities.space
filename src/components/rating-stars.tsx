import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Read-only star display with a half-star final position. */
export function RatingStars({
  value,
  count,
  className,
  showNumber = true,
}: {
  value: number;
  count?: number;
  className?: string;
  showNumber?: boolean;
}) {
  if (!value) {
    return <span className={cn('text-xs text-muted-foreground', className)}>No ratings yet</span>;
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs', className)}
      aria-label={`Rated ${value.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ''}`}
    >
      <span className="flex" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={cn(
              'size-3.5',
              i + 0.5 <= value
                ? 'fill-amber-500 text-amber-500'
                : i < value
                  ? 'fill-amber-500/50 text-amber-500'
                  : 'text-muted-foreground/40',
            )}
          />
        ))}
      </span>
      {showNumber && (
        <span className="font-medium text-foreground">
          {value.toFixed(1)}
          {count ? <span className="ml-1 font-normal text-muted-foreground">({count})</span> : null}
        </span>
      )}
    </span>
  );
}
