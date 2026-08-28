import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Info, MapPin } from 'lucide-react';
import { VILLAGES, getVillage } from '@/lib/data/villages';
import { CATEGORIES } from '@/lib/data/categories';
import { getActivities, getFavoriteIds } from '@/lib/queries';
import { parseFilters, type SearchParams } from '@/lib/filters';
import { SITE_URL } from '@/lib/supabase/config';
import { ActivityImage } from '@/components/activity-image';
import { ActivityResults } from '@/components/activity-results';
import { ResultsView } from '@/components/results-view';
import { FilterBar } from '@/components/filter-bar';
import { NewsletterForm } from '@/components/newsletter-form';
import { CategoryIcon } from '@/components/category-icon';
import { Button } from '@/components/ui/button';
import { cn, distanceMiles } from '@/lib/utils';

export const revalidate = 3600;

export function generateStaticParams() {
  return VILLAGES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const village = getVillage(slug);
  if (!village) return { title: 'Village not found' };

  const title = `Things to do in ${village.name}, Newton MA`;
  return {
    title,
    description: village.description,
    alternates: { canonical: `/villages/${village.slug}` },
    openGraph: {
      type: 'website',
      title,
      description: village.description,
      url: `${SITE_URL}/villages/${village.slug}`,
      images: village.imageUrl ? [{ url: village.imageUrl, alt: village.name }] : undefined,
    },
  };
}

export default async function VillagePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const village = getVillage(slug);
  if (!village) notFound();

  // Village is fixed for this route; everything else comes from the URL.
  const filters = { ...parseFilters(sp), village: village.slug };
  const [activities, favoriteIds] = await Promise.all([
    getActivities(filters),
    getFavoriteIds(),
  ]);

  // Which categories actually have listings here, for the in-village nav.
  const presentCategories = CATEGORIES.filter((c) =>
    activities.some((a) => a.categorySlug === c.slug),
  );

  const distances = filters.near
    ? new Map(activities.map((a) => [a.id, distanceMiles(filters.near!, a)]))
    : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${village.name}, Newton, Massachusetts`,
    description: village.description,
    url: `${SITE_URL}/villages/${village.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Newton',
      addressRegion: 'MA',
      postalCode: village.zip,
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', latitude: village.lat, longitude: village.lng },
    containedInPlace: { '@type': 'City', name: 'Newton', address: { '@type': 'PostalAddress', addressRegion: 'MA' } },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── Village hero ─────────────────────────────────────────────────── */}
      <section className="relative border-b border-border">
        <div className="relative h-56 w-full overflow-hidden bg-muted sm:h-72">
          <ActivityImage src={village.imageUrl} alt="" sizes="100vw" priority />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/50 to-forest-900/20"
          />
          <div className="absolute inset-0 flex items-end">
            <div className="container pb-6">
              <p className="flex items-center gap-1.5 text-xs font-medium text-cream-200">
                <MapPin className="size-3.5" aria-hidden />
                Newton, Massachusetts · {village.zip}
              </p>
              <h1 className="mt-1.5 font-display text-3xl font-bold text-cream-50 sm:text-4xl lg:text-5xl">
                {village.name}
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-cream-100/90 sm:text-base">
                {village.tagline}
              </p>
            </div>
          </div>
          {village.imageCredit && (
            <a
              href={village.imageCreditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-3 text-[10px] text-cream-100/70 hover:text-cream-50 hover:underline"
            >
              Photo: {village.imageCredit}
            </a>
          )}
        </div>
      </section>

      <div className="container py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div>
            <p className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
              {village.description}
            </p>

            {presentCategories.length > 1 && (
              <nav aria-label="Categories in this village" className="mt-6 flex flex-wrap gap-2">
                {presentCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/villages/${village.slug}?category=${c.slug}`}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80',
                      c.accentClass,
                    )}
                  >
                    <CategoryIcon name={c.icon} className="size-3.5" />
                    {c.name}
                  </Link>
                ))}
              </nav>
            )}

            <div className="mt-8">
              <FilterBar
                action={`/villages/${village.slug}`}
                values={{
                  q: filters.q,
                  village: village.slug,
                  category: filters.category,
                  from: filters.from,
                  to: filters.to,
                  price: filters.price,
                  radius: filters.radius?.toString(),
                  lat: filters.near?.lat.toString(),
                  lng: filters.near?.lng.toString(),
                  sort: filters.sort,
                }}
                lockVillage
                resultCount={activities.length}
              />
            </div>

            <h2 className="mb-4 mt-8 font-display text-2xl font-bold">
              {activities.length} {activities.length === 1 ? 'thing' : 'things'} to do in{' '}
              {village.name}
            </h2>

            <ResultsView activities={activities}>
              <ActivityResults
                activities={activities}
                favoriteIds={favoriteIds}
                clearHref={`/villages/${village.slug}`}
                emptyHint={`Nothing matches those filters in ${village.name} yet. Try clearing them, or browse all of Newton.`}
                distances={distances}
              />
            </ResultsView>
          </div>

          {/* ─── Sidebar ────────────────────────────────────────────────── */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-secondary/40 p-5">
              <h2 className="flex items-center gap-1.5 font-display text-base font-semibold">
                <Info className="size-4 text-primary" aria-hidden />
                Local trivia
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{village.funFact}</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="font-display text-base font-semibold">
                {village.name} in your inbox
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Weekly picks, weighted toward your village.
              </p>
              <div className="mt-4">
                <NewsletterForm villageSlug={village.slug} />
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border p-5">
              <h2 className="font-display text-base font-semibold">Know something we missed?</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Locals write this site. Add a {village.name} listing.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={`/submit?village=${village.slug}`}>Submit an activity</Link>
              </Button>
            </div>

            <nav aria-label="Other villages" className="rounded-2xl border border-border p-5">
              <h2 className="mb-3 font-display text-base font-semibold">Nearby villages</h2>
              <ul className="space-y-1.5 text-sm">
                {VILLAGES.filter((v) => v.slug !== village.slug)
                  .slice(0, 6)
                  .map((v) => (
                    <li key={v.slug}>
                      <Link
                        href={`/villages/${v.slug}`}
                        className="text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {v.name}
                      </Link>
                    </li>
                  ))}
                <li className="pt-1">
                  <Link href="/villages" className="font-medium text-primary hover:underline">
                    All 13 villages →
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </>
  );
}
