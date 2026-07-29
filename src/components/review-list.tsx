import { formatDistanceToNow } from 'date-fns';
import type { Review } from '@/lib/types';
import { RatingStars } from '@/components/rating-stars';

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No reviews yet. Be the first to tell your neighbors about it.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">{review.authorName}</p>
            <RatingStars value={review.rating} showNumber={false} />
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{review.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </p>
        </li>
      ))}
    </ul>
  );
}
