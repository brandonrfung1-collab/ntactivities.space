import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CalendarDays,
  ChevronRight,
  Clock,
  ExternalLink,
  Phone,
  Repeat,
  Tag,
  Ticket,
} from 'lucide-react';
import {
  getActivityBySlug,
  getFavoriteIds,
  getRelatedActivities,
  getReviews,
  getRsvpSummary,
} from '@/lib/queries';
import { ACTIVITIES } from '@/lib/data/activities';
import { getVillage } from '@/lib/data/villages';
import { getCategory } from '@/lib/data/categories';
import { formatEventWindow, formatPrice } from '@/lib/utils';
import { SITE_URL } from '@/lib/supabase/config';
import { getCurrentUser } from '@/lib/supabase/server';
import { ActivityImage } from '@/components/activity-image';
import { ActivityCard } from '@/components/activity-card';
import { AddToCalendar } from '@/components/add-to-calendar';
import { CategoryIcon } from '@/components/category-icon';
import { FavoriteButton } from '@/components/favorite-button';
import { MapEmbed } from '@/components/map-embed';
import { RatingStars } from '@/components/rating-stars';
import { ScheduleBadge } from '@/components/schedule-badge';
import { ReviewForm } from '@/components/review-form';
import { ReviewList } from '@/components/review-list';
import { RsvpPanel } from '@/components/rsvp-panel';
import { ViewTracker } from '@/components/view-tracker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const revalidate = 3600;

/** Pre-render every seeded activity at build time. */
export function generateStaticParams() {
  return ACTIVITIES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) return { title: 'Activity not found' };

  const village = getVillage(activity.villageSlug);
  const title = `${activity.title} — ${village?.name ?? 'Newton'}, MA`;

  return {
    title,
    description: activity.summary,
    alternates: { canonical: `/activities/${activity.slug}` },
    openGraph: {
      type: activity.isEvent ? 'article' : 'website',
      title,
      description: activity.summary,
      url: `${SITE_URL}/activities/${activity.slug}`,
      images: activity.imageUrl ? [{ url: activity.imageUrl, alt: activity.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: activity.summary,
      images: activity.imageUrl ? [activity.imageUrl] : undefined,
    },
  };
}

export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) notFound();

  const village = getVillage(activity.villageSlug);
  const category = getCategory(activity.categorySlug);
  const [reviews, related, favoriteIds, user, rsvpSummary] = await Promise.all([
    getReviews(activity.id),
    getRelatedActivities(activity, 3),
    getFavoriteIds(),
    getCurrentUser(),
    getRsvpSummary(activity),
  ]);

  const when = formatEventWindow(activity.startAt, activity.endAt);
  const price = formatPrice(activity.priceType, activity.priceMin, activity.priceMax);

  /**
   * schema.org markup. Dated items are Events (eligible for rich results);
   * standing places are LocalBusiness/Place instead.
   */
  const jsonLd = activity.isEvent
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: activity.title,
        description: activity.summary,
        image: activity.imageUrl ? [activity.imageUrl] : undefined,
        startDate: activity.startAt,
        endDate: activity.endAt ?? undefined,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        url: `${SITE_URL}/activities/${activity.slug}`,
        location: {
          '@type': 'Place',
          name: activity.title,
          address: {
            '@type': 'PostalAddress',
            streetAddress: activity.address,
            addressLocality: village?.name ?? 'Newton',
            addressRegion: 'MA',
            postalCode: village?.zip,
            addressCountry: 'US',
          },
          geo: { '@type': 'GeoCoordinates', latitude: activity.lat, longitude: activity.lng },
        },
        offers: {
          '@type': 'Offer',
          price: activity.priceMin ?? 0,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/activities/${activity.slug}`,
        },
        organizer: { '@type': 'Organization', name: 'ntactivity.space', url: SITE_URL },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: activity.title,
        description: activity.summary,
        image: activity.imageUrl ? [activity.imageUrl] : undefined,
        url: `${SITE_URL}/activities/${activity.slug}`,
        telephone: activity.phone ?? undefined,
        address: {
          '@type': 'PostalAddress',
          streetAddress: activity.address,
          addressLocality: village?.name ?? 'Newton',
          addressRegion: 'MA',
          postalCode: village?.zip,
          addressCountry: 'US',
        },
        geo: { '@type': 'GeoCoordinates', latitude: activity.lat, longitude: activity.lng },
        ...(activity.ratingCount > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: activity.ratingAvg,
            reviewCount: activity.ratingCount,
          },
        }),
      };

  return (
    <>
      <script
        type="application/ld+json"
        // Static, server-generated object — no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker activityId={activity.id} />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            Home
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <Link href="/activities" className="hover:text-foreground hover:underline">
            Things to do
          </Link>
          {village && (
            <>
              <ChevronRight className="size-3" aria-hidden />
              <Link href={`/villages/${village.slug}`} className="hover:text-foreground hover:underline">
                {village.name}
              </Link>
            </>
          )}
          <ChevronRight className="size-3" aria-hidden />
          <span className="text-foreground">{activity.title}</span>
        </nav>

        {/* Hero image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-soft sm:aspect-[21/9]">
          <ActivityImage
            src={activity.imageUrl}
            alt={activity.title}
            sizes="100vw"
            priority
          />
          {activity.imageCredit && (
            <a
              href={activity.imageCreditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-3 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white/80 backdrop-blur-sm hover:text-white hover:underline"
            >
              Photo: {activity.imageCredit}
            </a>
          )}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ─── Main column ────────────────────────────────────────────── */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Link href={`/categories/${category.slug}`}>
                  <Badge variant="secondary" className="gap-1.5 hover:bg-secondary/70">
                    <CategoryIcon name={category.icon} className="size-3" />
                    {category.name}
                  </Badge>
                </Link>
              )}
              {activity.priceType === 'free' ? (
                <Badge variant="free">Free</Badge>
              ) : (
                <Badge variant="outline">{price}</Badge>
              )}
              {activity.featured && <Badge variant="accent">Featured</Badge>}
              <ScheduleBadge activity={activity} />
            </div>

            <h1 className="mt-3 text-balance font-display text-3xl font-bold leading-tight sm:text-4xl">
              {activity.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <RatingStars value={activity.ratingAvg} count={activity.ratingCount} />
              {village && (
                <Link
                  href={`/villages/${village.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  {village.name}, Newton MA
                </Link>
              )}
            </div>

            <p className="mt-5 text-lg text-muted-foreground">{activity.summary}</p>

            <div className="mt-6 space-y-4 text-[15px] leading-relaxed">
              {activity.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {activity.tags.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <Tag className="size-4 text-muted-foreground" aria-hidden />
                  Good to know
                </h2>
                <ul className="flex flex-wrap gap-1.5">
                  {activity.tags.map((tag) => (
                    <li key={tag}>
                      <Link href={`/activities?q=${encodeURIComponent(tag)}`}>
                        <Badge variant="outline" className="hover:border-primary/40">
                          {tag}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator className="my-10" />

            {/* Map */}
            <section aria-labelledby="location-heading">
              <h2 id="location-heading" className="mb-4 font-display text-xl font-bold">
                Where to find it
              </h2>
              <MapEmbed address={activity.address} title={activity.title} />
            </section>

            <Separator className="my-10" />

            {/* Reviews */}
            <section aria-labelledby="reviews-heading">
              <h2 id="reviews-heading" className="mb-1 font-display text-xl font-bold">
                Reviews
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                {activity.ratingCount > 0
                  ? `${activity.ratingAvg.toFixed(1)} out of 5 from ${activity.ratingCount} neighbors.`
                  : 'No ratings yet.'}
              </p>

              <div className="space-y-6">
                {user ? (
                  <ReviewForm activityId={activity.id} activitySlug={activity.slug} />
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border p-5">
                    <p className="text-sm text-muted-foreground">
                      Been here? Sign in to leave a rating and review.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/login?next=/activities/${activity.slug}`}>Sign in</Link>
                    </Button>
                  </div>
                )}

                <ReviewList reviews={reviews} />
              </div>
            </section>
          </div>

          {/* ─── Sidebar ────────────────────────────────────────────────── */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <dl className="space-y-3.5 text-sm">
                {when && (
                  <div className="flex gap-3">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                    <div>
                      <dt className="font-medium">When</dt>
                      <dd className="text-muted-foreground">{when}</dd>
                    </div>
                  </div>
                )}
                {activity.recurrence && (
                  <div className="flex gap-3">
                    <Repeat className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <dt className="font-medium">Schedule</dt>
                      <dd className="text-muted-foreground">{activity.recurrence}</dd>
                    </div>
                  </div>
                )}
                {!when && !activity.recurrence && (
                  <div className="flex gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <dt className="font-medium">When</dt>
                      <dd className="text-muted-foreground">Open year-round</dd>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <Ticket className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div>
                    <dt className="font-medium">Price</dt>
                    <dd className="text-muted-foreground">{price}</dd>
                  </div>
                </div>
                {activity.phone && (
                  <div className="flex gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div>
                      <dt className="font-medium">Phone</dt>
                      <dd>
                        <a href={`tel:${activity.phone}`} className="text-primary hover:underline">
                          {activity.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>

              <Separator />

              <RsvpPanel
                activityId={activity.id}
                activitySlug={activity.slug}
                slots={rsvpSummary.slots}
                initialCounts={rsvpSummary.counts}
                initialGoingSlot={rsvpSummary.goingSlot}
              />

              <Separator />

              <div className="space-y-3">
                <AddToCalendar activity={activity} />
                <div className="flex flex-wrap gap-2">
                  <FavoriteButton
                    activityId={activity.id}
                    initialSaved={favoriteIds.has(activity.id)}
                  />
                  {activity.website && (
                    <Button asChild variant="ghost" className="gap-1.5">
                      <a href={activity.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink aria-hidden />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {village && (
              <div className="rounded-2xl border border-border bg-secondary/40 p-5">
                <h2 className="font-display text-base font-semibold">About {village.name}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{village.tagline}</p>
                <Button asChild variant="link" className="mt-1 h-auto p-0">
                  <Link href={`/villages/${village.slug}`}>
                    Explore {village.name} →
                  </Link>
                </Button>
              </div>
            )}
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16" aria-labelledby="related-heading">
            <h2 id="related-heading" className="mb-5 font-display text-2xl font-bold">
              While you&apos;re nearby
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <ActivityCard activity={item} isFavorite={favoriteIds.has(item.id)} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
