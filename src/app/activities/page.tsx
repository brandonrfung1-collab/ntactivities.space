import type { Metadata } from 'next';
import { getActivities, getFavoriteIds } from '@/lib/queries';
import { describeFilters, parseFilters, type SearchParams } from '@/lib/filters';
import { distanceMiles } from '@/lib/utils';
import { FilterBar } from '@/components/filter-bar';
import { ActivityResults } from '@/components/activity-results';
import { ResultsView } from '@/components/results-view';

export const metadata: Metadata = {
  title: 'Things to do in Newton, MA',
  description:
    'Search every activity, event, park and restaurant across Newton’s 13 villages. Filter by village, category, date range, price and distance.',
  alternates: { canonical: '/activities' },
};

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const [activities, favoriteIds] = await Promise.all([
    getActivities(filters),
    getFavoriteIds(),
  ]);
  const summary = describeFilters(filters);
  const distances = filters.near
    ? new Map(activities.map((a) => [a.id, distanceMiles(filters.near!, a)]))
    : undefined;

  return (
    <div className="container py-10">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Things to do in Newton</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {activities.length} {activities.length === 1 ? 'result' : 'results'}
          {summary ? <> · {summary}</> : ' across all 13 villages'}
        </p>
      </header>

      <div className="mb-8">
        <FilterBar
          values={{
            q: filters.q,
            village: filters.village,
            category: filters.category,
            from: filters.from,
            to: filters.to,
            price: filters.price,
            open: filters.open ? '1' : undefined,
            radius: filters.radius?.toString(),
            lat: filters.near?.lat.toString(),
            lng: filters.near?.lng.toString(),
            sort: filters.sort,
          }}
          resultCount={activities.length}
        />
      </div>

      <ResultsView activities={activities}>
        <ActivityResults activities={activities} favoriteIds={favoriteIds} distances={distances} />
      </ResultsView>
    </div>
  );
}
