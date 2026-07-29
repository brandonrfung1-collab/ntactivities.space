'use client';

import { useActionState } from 'react';
import { Mail } from 'lucide-react';
import { subscribeToNewsletter, type NewsletterState } from '@/app/actions/newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const initial: NewsletterState = { ok: false, message: '' };

/** Weekly digest signup. `villageSlug` pre-targets the subscriber's village. */
export function NewsletterForm({
  villageSlug,
  className,
}: {
  villageSlug?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initial);

  return (
    <div className={cn('space-y-2', className)}>
      <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
        {villageSlug && <input type="hidden" name="villageSlug" value={villageSlug} />}
        <label className="flex-1">
          <span className="sr-only">Email address</span>
          <Input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 bg-background"
          />
        </label>
        <Button type="submit" variant="accent" size="lg" disabled={pending} className="gap-2">
          <Mail aria-hidden />
          {pending ? 'Signing up…' : 'Get the weekly email'}
        </Button>
      </form>

      {state.message && (
        <p
          role="status"
          className={cn('text-sm', state.ok ? 'text-primary' : 'text-destructive')}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
