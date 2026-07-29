'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import type { Activity } from '@/lib/types';
import { deleteActivity, setActivityPublished } from '@/app/actions/admin';
import { getVillage } from '@/lib/data/villages';
import { Button } from '@/components/ui/button';

/** A live listing with hide / delete controls, used in the admin listings table. */
export function ListingRow({ activity }: { activity: Activity }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const village = getVillage(activity.villageSlug);

  function act(fn: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => setMessage((await fn()).message));
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-3">
        <Link
          href={`/activities/${activity.slug}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {activity.title}
        </Link>
        <p className="text-xs text-muted-foreground">{village?.name}</p>
        {message && <p className="mt-1 text-xs text-primary">{message}</p>}
      </td>
      <td className="whitespace-nowrap py-3 pr-3 text-right text-sm tabular-nums text-muted-foreground">
        {activity.viewCount.toLocaleString()}
      </td>
      <td className="whitespace-nowrap py-3 pr-3 text-right text-sm tabular-nums text-muted-foreground">
        {activity.saveCount.toLocaleString()}
      </td>
      <td className="py-3">
        <div className="flex justify-end gap-1.5">
          <Button
            size="icon"
            variant="ghost"
            disabled={pending}
            title="Hide from the public site"
            aria-label="Hide listing"
            onClick={() => act(() => setActivityPublished(activity.id, false))}
          >
            <EyeOff aria-hidden />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            disabled={pending}
            title="Publish"
            aria-label="Publish listing"
            onClick={() => act(() => setActivityPublished(activity.id, true))}
          >
            <Eye aria-hidden />
          </Button>
          {confirming ? (
            <Button
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={() => act(() => deleteActivity(activity.id))}
            >
              Really delete
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              title="Delete"
              aria-label="Delete listing"
              onClick={() => setConfirming(true)}
            >
              <Trash2 aria-hidden className="text-destructive" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
