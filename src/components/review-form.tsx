'use client';

import { useActionState, useState } from 'react';
import { Star } from 'lucide-react';
import { submitReview, type FormState } from '@/app/actions/reviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const initial: FormState = { ok: false, message: '' };

export function ReviewForm({
  activityId,
  activitySlug,
}: {
  activityId: string;
  activitySlug: string;
}) {
  const [state, formAction, pending] = useActionState(submitReview, initial);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-card p-5">
      <input type="hidden" name="activityId" value={activityId} />
      <input type="hidden" name="activitySlug" value={activitySlug} />
      <input type="hidden" name="rating" value={rating} />

      <div className="space-y-2">
        <Label>Your rating</Label>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              aria-pressed={rating === n}
              className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Star
                className={cn(
                  'size-6 transition-colors',
                  n <= (hover || rating)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-muted-foreground/40',
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-body">Your review</Label>
        <Textarea
          id="review-body"
          name="body"
          required
          minLength={10}
          maxLength={2000}
          placeholder="What was it like? Best time to go? Parking tips?"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || rating === 0}>
          {pending ? 'Posting…' : 'Post review'}
        </Button>
        {rating === 0 && (
          <p className="text-xs text-muted-foreground">Pick a star rating to continue.</p>
        )}
      </div>

      {state.message && (
        <p role="status" className={cn('text-sm', state.ok ? 'text-primary' : 'text-destructive')}>
          {state.message}
        </p>
      )}
    </form>
  );
}
