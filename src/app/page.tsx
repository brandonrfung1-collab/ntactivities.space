import Link from 'next/link';
import { ArrowRight, CalendarDays, Leaf, MapPin, Sparkles } from 'lucide-react';
import {
  getCategoryCounts,
  getFavoriteIds,
  getFeaturedActivities,
  getUpcomingEvents,
  getVillageCounts,
} from '@/lib/queries';
import { SearchBar } from '@/components/search-bar';
import { FeaturedCarousel } from '@/components/featured-carousel';
import { VillageGrid } from '@/components/village-grid';
import { CategoryGrid } from '@/components/category-grid';
import { ActivityCard } from '@/components/activity-card';
import { NewsletterForm } from '@/components/newsletter-form';
import { Button } from '@/components/ui/button';

/** Revalidate hourly — content is editorial, not real-time. */
export const revalidate = 3600;

export default async function HomePage() {
  const [featured, upcoming, villageCounts, categoryCounts, favoriteIds] = await Promise.all([
    getFeaturedActivities(8),
    getUpcomingEvents(3),
    getVillageCounts(),
    getCategoryCounts(),
    getFavoriteIds(),
  ]);

  const saved = [...favoriteIds];
  const total = Object.values(villageCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero-wash border-b border-border/70">
        <div className="container py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Leaf className="size-3.5 text-primary" aria-hidden />
              All 13 villages · {total} things to do
            </p>
            <h1 className="text-balance font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
              What&apos;s happening in{' '}
              <span className="text-primary">Newton</span> this week?
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
              Parks, dinner, festivals, story hours and hidden gems — from Auburndale to West
              Newton. Search by village, category, date or price.
            </p>
          </div>

          <SearchBar className="mx-auto mt-8 max-w-3xl" />

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-muted-foreground">Popular:</span>
            {[
              { label: 'Free & outdoors', href: '/activities?price=free&category=outdoors-parks' },
              { label: 'This weekend', href: '/activities?sort=soonest' },
              { label: 'With kids', href: '/categories/family-kids' },
              { label: 'Rainy day', href: '/activities?q=rainy%20day' },
            ].map((chip) => (
              <Link
                key={chip.href}
                href={chip.href}
                className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured carousel ────────────────────────────────────────────── */}
      <section className="container py-14">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold sm:text-3xl">
              <Sparkles className="size-5 text-accent" aria-hidden />
              Trending in Newton
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The places and events neighbors are saving most right now.
            </p>
          </div>
          <Button asChild variant="ghost" className="gap-1.5">
            <Link href="/activities">
              See everything
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>

        <FeaturedCarousel activities={featured} favoriteIds={saved} />
      </section>

      {/* ─── Village quick links ──────────────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/30 py-14">
        <div className="container">
          <div className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold sm:text-3xl">
              <MapPin className="size-5 text-primary" aria-hidden />
              Browse by village
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Newton is thirteen distinct villages, each with its own square, its own character and
              its own reasons to visit.
            </p>
          </div>
          <VillageGrid counts={villageCounts} />
        </div>
      </section>

      {/* ─── Coming up ────────────────────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="container py-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold sm:text-3xl">
                <CalendarDays className="size-5 text-accent" aria-hidden />
                Coming up next
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Dated events, soonest first — add any of them straight to your calendar.
              </p>
            </div>
            <Button asChild variant="ghost" className="gap-1.5">
              <Link href="/activities?sort=soonest">
                Full calendar
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((activity) => (
              <li key={activity.id}>
                <ActivityCard activity={activity} isFavorite={favoriteIds.has(activity.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section className="container pb-14">
        <div className="mb-6 max-w-2xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Or pick a mood</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Eight ways into the city, whether you want a trail, a table or a tree lighting.
          </p>
        </div>
        <CategoryGrid counts={categoryCounts} />
      </section>

      {/* ─── Newsletter ───────────────────────────────────────────────────── */}
      <section className="container pb-4">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-forest-600 to-forest-800 p-8 text-cream-50 shadow-lifted sm:p-12">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              One email. Everything happening in Newton.
            </h2>
            <p className="mt-2 text-sm text-cream-100/85">
              Thursday mornings: the weekend&apos;s events, new listings, and whatever is worth
              driving across town for. No spam, unsubscribe any time.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Submit CTA ───────────────────────────────────────────────────── */}
      <section className="container py-10">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Running something in Newton?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your event, shop or class. Free, and usually reviewed within a few days.
            </p>
          </div>
          <Button asChild size="lg" variant="accent" className="shrink-0">
            <Link href="/submit">Submit an activity</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
