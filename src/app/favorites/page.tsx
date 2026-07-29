import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getFavoriteActivities, getFavoriteIds } from '@/lib/queries';
import { getCurrentUser } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { ActivityResults } from '@/components/activity-results';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Your saved activities',
  description: 'The Newton activities and events you have saved.',
  robots: { index: false, follow: false },
};

/** Per-user content — never cache this route. */
export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  const [activities, favoriteIds] = await Promise.all([
    getFavoriteActivities(),
    getFavoriteIds(),
  ]);

  return (
    <div className="container py-10">
      <header className="mb-8">
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold sm:text-4xl">
          <Heart className="size-7 fill-accent text-accent" aria-hidden />
          Saved
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your shortlist for the next free afternoon.
        </p>
      </header>

      {!isSupabaseConfigured() ? (
        <div className="rounded-lg border border-dashed border-border py-14 text-center">
          <p className="font-medium">Favorites need Supabase</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            This build is running in demo mode. Add your Supabase credentials to{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code> to enable
            accounts and saved activities.
          </p>
        </div>
      ) : !user ? (
        <div className="rounded-lg border border-dashed border-border py-14 text-center">
          <p className="font-medium">Sign in to see your saves</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Your favorites are tied to your account so they follow you across devices.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/login?next=/favorites">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup?next=/favorites">Create an account</Link>
            </Button>
          </div>
        </div>
      ) : (
        <ActivityResults
          activities={activities}
          favoriteIds={favoriteIds}
          emptyHint="Tap the heart on any listing to save it here."
          clearHref="/activities"
        />
      )}
    </div>
  );
}
