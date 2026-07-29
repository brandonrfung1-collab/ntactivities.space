import Link from 'next/link';
import { CalendarDays, MapPin } from 'lucide-react';
import type { Activity } from '@/lib/types';
import { getVillage } from '@/lib/data/villages';
import { getCategory } from '@/lib/data/categories';
import { cn, formatEventWindow, formatPrice } from '@/lib/utils';
import { ActivityImage } from '@/components/activity-image';
import { RatingStars } from '@/components/rating-stars';
import { CategoryIcon } from '@/components/category-icon';
import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from '@/components/favorite-button';

export function ActivityCard({
  activity,
  isFavorite = false,
  className,
  priority = false,
}: {
  activity: Activity;
  isFavorite?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const village = getVillage(activity.villageSlug);
  const category = getCategory(activity.categorySlug);
  const when = formatEventWindow(activity.startAt, activity.endAt);
  const price = formatPrice(activity.priceType, activity.priceMin, activity.priceMax);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-shadow hover:shadow-lifted',
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <ActivityImage
          src={activity.imageUrl}
          alt={activity.title}
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {/* Favorite sits above the card link so it stays independently clickable. */}
        <div className="absolute right-2 top-2 z-20">
          <FavoriteButton activityId={activity.id} initialSaved={isFavorite} compact />
        </div>
        <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1.5">
          {activity.priceType === 'free' ? (
            <Badge variant="free">Free</Badge>
          ) : (
            <Badge variant="secondary">{price}</Badge>
          )}
          {activity.featured && <Badge variant="accent">Featured</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {category && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                category.accentClass,
              )}
            >
              <CategoryIcon name={category.icon} className="size-3" />
              {category.name}
            </span>
          )}
        </div>

        <h3 className="font-display text-lg font-semibold leading-snug text-balance">
          {/* Stretched link makes the whole card tappable — important on mobile. */}
          <Link href={`/activities/${activity.slug}`} className="after:absolute after:inset-0">
            {activity.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">{activity.summary}</p>

        <div className="mt-auto space-y-1.5 pt-1 text-xs text-muted-foreground">
          {when && (
            <p className="flex items-center gap-1.5 font-medium text-accent">
              <CalendarDays className="size-3.5" aria-hidden />
              {when}
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            {village?.name ?? 'Newton'}
          </p>
          <RatingStars value={activity.ratingAvg} count={activity.ratingCount} />
        </div>
      </div>
    </article>
  );
}
