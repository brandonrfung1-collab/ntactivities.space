import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarClock, Eye, Heart, Inbox, Mail, ShieldAlert } from 'lucide-react';
import { getActivities, getAnalyticsSummary, getSubmissions } from '@/lib/queries';
import { getCurrentUser, isCurrentUserAdmin } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { ModerationRow } from '@/components/admin/moderation-row';
import { ListingRow } from '@/components/admin/listing-row';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Admin dashboard',
  robots: { index: false, follow: false },
};

/** Admin data must always be live. */
export const dynamic = 'force-dynamic';

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Eye;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Blocking notice shown when the visitor is not an authenticated admin. */
function Gate({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <ShieldAlert className="mx-auto mb-3 size-10 text-accent" aria-hidden />
        <h1 className="font-display text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        {children}
      </div>
    </div>
  );
}

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <Gate
        title="Admin needs Supabase"
        body="This build is running in demo mode. Add your Supabase credentials to .env.local, run the migration, and set profiles.is_admin = true for your account."
      />
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return (
      <Gate title="Sign in required" body="The admin dashboard is only available to signed-in moderators.">
        <Button asChild className="mt-5">
          <Link href="/login?next=/admin">Sign in</Link>
        </Button>
      </Gate>
    );
  }

  if (!(await isCurrentUserAdmin())) {
    return (
      <Gate
        title="Not an admin"
        body="Your account does not have moderator access. Ask an existing admin to set profiles.is_admin = true for your user id."
      />
    );
  }

  const [pending, recent, stats, listings] = await Promise.all([
    getSubmissions('pending'),
    getSubmissions(),
    getAnalyticsSummary(),
    getActivities({ sort: 'recommended', limit: 25 }),
  ]);

  const decided = recent.filter((s) => s.status !== 'pending').slice(0, 10);

  return (
    <div className="container py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Admin</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Moderation queue, listing management and basic analytics.
        </p>
      </header>

      {/* ─── Analytics ────────────────────────────────────────────────────── */}
      <section aria-labelledby="stats-heading" className="mb-12">
        <h2 id="stats-heading" className="mb-4 font-display text-xl font-bold">
          At a glance
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={Inbox} label="Pending" value={pending.length} hint="Awaiting review" />
          <StatCard
            icon={CalendarClock}
            label="Listings"
            value={stats.activityCount}
            hint={`${stats.eventCount} dated events`}
          />
          <StatCard icon={Eye} label="Total views" value={stats.totalViews} hint="All time" />
          <StatCard
            icon={Heart}
            label="Top saves"
            value={stats.mostSaved[0]?.saveCount ?? 0}
            hint={stats.mostSaved[0]?.title ?? '—'}
          />
          <StatCard icon={Mail} label="Subscribers" value={stats.subscriberCount} hint="Newsletter" />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold">Most viewed</h3>
            <ol className="space-y-2 text-sm">
              {stats.mostViewed.map((a, i) => (
                <li key={a.id} className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/activities/${a.slug}`}
                    className="truncate hover:text-primary hover:underline"
                  >
                    <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
                    {a.title}
                  </Link>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {a.viewCount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold">Most saved</h3>
            <ol className="space-y-2 text-sm">
              {stats.mostSaved.map((a, i) => (
                <li key={a.id} className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/activities/${a.slug}`}
                    className="truncate hover:text-primary hover:underline"
                  >
                    <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
                    {a.title}
                  </Link>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {a.saveCount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─── Moderation queue ─────────────────────────────────────────────── */}
      <section aria-labelledby="queue-heading" className="mb-12">
        <h2 id="queue-heading" className="mb-4 font-display text-xl font-bold">
          Moderation queue{' '}
          {pending.length > 0 && (
            <span className="ml-1 rounded-full bg-accent px-2 py-0.5 align-middle text-xs text-accent-foreground">
              {pending.length}
            </span>
          )}
        </h2>

        {pending.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Queue is empty. Nothing waiting for review.
          </p>
        ) : (
          <ul className="space-y-4">
            {pending.map((submission) => (
              <ModerationRow key={submission.id} submission={submission} />
            ))}
          </ul>
        )}
      </section>

      {/* ─── Live listings ────────────────────────────────────────────────── */}
      <section aria-labelledby="listings-heading" className="mb-12">
        <h2 id="listings-heading" className="mb-4 font-display text-xl font-bold">
          Listings
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card p-1 shadow-soft">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">Published listings with views, saves and controls</caption>
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-3 py-2 font-medium">
                  Listing
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Views
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Saves
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_td:first-child]:pl-3 [&_td:last-child]:pr-3">
              {listings.map((activity) => (
                <ListingRow key={activity.id} activity={activity} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Recently decided ────────────────────────────────────────────── */}
      {decided.length > 0 && (
        <section aria-labelledby="decided-heading">
          <h2 id="decided-heading" className="mb-4 font-display text-xl font-bold">
            Recently decided
          </h2>
          <ul className="space-y-2 text-sm">
            {decided.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-4 py-2.5"
              >
                <span className="font-medium">{s.title}</span>
                <span
                  className={
                    s.status === 'approved'
                      ? 'text-xs font-medium text-primary'
                      : 'text-xs font-medium text-destructive'
                  }
                >
                  {s.status}
                  {s.moderatorNote ? ` — ${s.moderatorNote}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
