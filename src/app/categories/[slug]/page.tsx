import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, getCategory } from '@/lib/data/categories';
import { VILLAGES } from '@/lib/data/villages';
import { getActivities, getFavoriteIds } from '@/lib/queries';
import { parseFilters, type SearchParams } from '@/lib/filters';
import { SITE_URL } from '@/lib/supabase/config';
import { ActivityResults } from '@/components/activity-results';
import { FilterBar } from '@/components/filter-bar';
import { CategoryIcon } from '@/components/category-icon';
import { cn } from '@/lib/utils';

export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: 'Category not found' };

  const title = `${category.name} in Newton, MA`;
  return {
    title,
    description: category.description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      type: 'website',
      title,
      description: category.description,
      url: `${SITE_URL}/categories/${category.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = getCategory(slug);
  if (!category) notFound();

  const filters = { ...parseFilters(sp), category: category.slug };
  const [activities, favoriteIds] = await Promise.all([
    getActivities(filters),
    getFavoriteIds(),
  ]);

  // Villages that have something in this category, for cross-navigation.
  const villagesWithListings = VILLAGES.filter((v) =>
    activities.some((a) => a.villageSlug === v.slug),
  );

  return (
    <div className="container py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          className={cn(
            'flex size-14 shrink-0 items-center justify-center rounded-xl',
            category.accentClass,
          )}
        >
          <CategoryIcon name={category.icon} className="size-7" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {category.name} in Newton
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
        </div>
      </header>

      {villagesWithListings.length > 1 && (
        <nav aria-label="Villages with listings" className="mt-6 flex flex-wrap gap-2">
          {villagesWithListings.map((v) => (
            <Link
              key={v.slug}
              href={`/categories/${category.slug}?village=${v.slug}`}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {v.name}
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-8">
        <FilterBar
          action={`/categories/${category.slug}`}
          values={{
            q: filters.q,
            village: filters.village,
            category: category.slug,
            from: filters.from,
            to: filters.to,
            price: filters.price,
            radius: filters.radius?.toString(),
            lat: filters.near?.lat.toString(),
            lng: filters.near?.lng.toString(),
            sort: filters.sort,
          }}
          lockCategory
          resultCount={activities.length}
        />
      </div>

      <h2 className="mb-4 mt-8 font-display text-2xl font-bold">
        {activities.length} {activities.length === 1 ? 'listing' : 'listings'}
      </h2>

      <ActivityResults
        activities={activities}
        favoriteIds={favoriteIds}
        clearHref={`/categories/${category.slug}`}
        emptyHint={`Nothing in ${category.name} matches those filters yet.`}
      />
    </div>
  );
}
