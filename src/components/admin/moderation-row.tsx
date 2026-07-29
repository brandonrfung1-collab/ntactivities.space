'use client';

import { useState, useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Submission } from '@/lib/types';
import { approveSubmission, rejectSubmission } from '@/app/actions/admin';
import { getVillage } from '@/lib/data/villages';
import { getCategory } from '@/lib/data/categories';
import { formatEventWindow, formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** One pending submission with approve / reject controls. */
export function ModerationRow({ submission }: { submission: Submission }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [note, setNote] = useState('');
  const [showReject, setShowReject] = useState(false);

  const village = getVillage(submission.villageSlug);
  const category = getCategory(submission.categorySlug);
  const when = formatEventWindow(submission.startAt, submission.endAt);

  function act(fn: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const res = await fn();
      setResult(res.message);
      if (res.ok) setDone(true);
    });
  }

  return (
    <li
      className={`rounded-lg border border-border bg-card p-5 shadow-soft transition-opacity ${
        done ? 'opacity-50' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold">{submission.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{submission.summary}</p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="secondary">{village?.name ?? submission.villageSlug}</Badge>
        <Badge variant="outline">{category?.name ?? submission.categorySlug}</Badge>
        <Badge variant="outline">
          {formatPrice(submission.priceType, submission.priceMin, null)}
        </Badge>
        {when && <Badge variant="accent">{when}</Badge>}
      </div>

      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-medium">Address</dt>
          <dd className="text-muted-foreground">{submission.address}</dd>
        </div>
        <div>
          <dt className="font-medium">Contact</dt>
          <dd className="text-muted-foreground">
            <a href={`mailto:${submission.contactEmail}`} className="hover:underline">
              {submission.contactEmail}
            </a>
          </dd>
        </div>
        {submission.website && (
          <div className="sm:col-span-2">
            <dt className="font-medium">Website</dt>
            <dd>
              <a
                href={submission.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {submission.website}
              </a>
            </dd>
          </div>
        )}
      </dl>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
          Full description
        </summary>
        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
          {submission.description}
        </p>
      </details>

      {!done && (
        <div className="mt-5 space-y-3 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() => act(() => approveSubmission(submission.id, submission.title))}
              className="gap-1.5"
            >
              <Check aria-hidden />
              Approve &amp; publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setShowReject((v) => !v)}
              className="gap-1.5"
            >
              <X aria-hidden />
              Reject
            </Button>
          </div>

          {showReject && (
            <div className="flex flex-wrap gap-2">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason (optional, stored for the record)"
                className="h-9 min-w-[14rem] flex-1"
              />
              <Button
                size="sm"
                variant="destructive"
                disabled={pending}
                onClick={() => act(() => rejectSubmission(submission.id, note))}
              >
                Confirm reject
              </Button>
            </div>
          )}
        </div>
      )}

      {result && (
        <p role="status" className="mt-3 text-sm text-primary">
          {result}
        </p>
      )}
    </li>
  );
}
