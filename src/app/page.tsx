import Link from 'next/link';
import { ArrowRight, CalendarDays, Leaf, MapPin, Sparkles } from 'lucide-react';
import {
  getCategoryCounts,
  getFavoriteIds,
  getFeaturedActivities,
  getUpcomingEvents,
  getVillageCounts,
} from '@/lib/queries';
import { LANDMARK_IMAGES } from '@/lib/data/activities';
import { SearchBar } from '@/components/search-bar';
import { FeaturedCarousel } from '@/components/featured-carousel';
import { VillageGrid } from '@/components/village-grid';
import { CategoryGrid } from '@/components/category-grid';
import { ActivityCard } from '@/components/activity-card';
import { ActivityImage } from '@/components/activity-image';
import { NewsletterForm } from '@/components/newsletter-form';
import { Reveal } from '@/components/reveal';
import { Button } from '@/components/ui/button';

/** Same verified Echo Bridge photo used on its activity listing — Newton's most photogenic landscape, doubling as the homepage hero. */
const HERO_IMAGE = LANDMARK_IMAGES['echo-bridge'];

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
      <section className="relative isolate overflow-hidden border-b border-border/70">
        {/* Echo Bridge, Newton Upper Falls — a slow, near-imperceptible drift for atmosphere. */}
        <div className="absolute inset-0" aria-hidden>
          <ActivityImage
            src={HERO_IMAGE.url}
            alt=""
            sizes="100vw"
            priority
            className="animate-hero-pan"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-900/85 via-forest-900/65 to-background" />
          <div className="hero-wash absolute inset-0" />
        </div>

        <div className="container relative py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex animate-fade-up items-center gap-1.5 rounded-full border border-white/15 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Leaf className="size-3.5 text-primary" aria-hidden />
              All 13 villages · {total} things to do
            </p>
            <h1 className="text-balance font-display text-4xl font-bold leading-[1.1] text-cream-50 [animation-delay:80ms] animate-fade-up sm:text-5xl lg:text-6xl">
              What&apos;s happening in <span className="text-accent">Newton</span> this week?
            </h1>
            <p className="mx-auto mt-5 max-w-xl animate-fade-up text-balance text-base text-cream-100/90 [animation-delay:160ms] sm:text-lg">
              Parks, dinner, festivals, story hours and hidden gems — from Auburndale to West
              Newton. Search by village, category, date or price.
            </p>
          </div>

          <div className="animate-fade-up [animation-delay:240ms]">
            <SearchBar className="mx-auto mt-8 max-w-3xl" />
          </div>

          <div className="mt-5 flex animate-fade-up flex-wrap items-center justify-center gap-2 text-xs [animation-delay:320ms]">
            <span className="text-cream-100/80">Popular:</span>
            {[
              { label: 'Free & outdoors', href: '/activities?price=free&category=outdoors-parks' },
              { label: 'This weekend', href: '/activities?sort=soonest' },
              { label: 'With kids', href: '/categories/family-kids' },
              { label: 'Rainy day', href: '/activities?q=rainy%20day' },
            ].map((chip) => (
              <Link
                key={chip.href}
                href={chip.href}
                className="rounded-full border border-white/15 bg-card/90 px-3 py-1.5 font-medium text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>

        <a
          href={HERO_IMAGE.creditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-3 text-[10px] text-cream-100/70 hover:text-cream-50 hover:underline"
        >
          Photo: {HERO_IMAGE.credit}
        </a>
      </section>

      {/* ─── Featured carousel ────────────────────────────────────────────── */}
      <section className="container py-14">
        <Reveal className="mb-2 flex flex-wrap items-end justify-between gap-3">
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
        </Reveal>

        <Reveal delay={100}>
          <FeaturedCarousel activities={featured} favoriteIds={saved} />
        </Reveal>
      </section>

      {/* ─── Village quick links ──────────────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/30 py-14">
        <div className="container">
          <Reveal className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold sm:text-3xl">
              <MapPin className="size-5 text-primary" aria-hidden />
              Browse by village
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Newton is thirteen distinct villages, each with its own square, its own character and
              its own reasons to visit.
            </p>
          </Reveal>
          <VillageGrid counts={villageCounts} />
        </div>
      </section>

      {/* ─── Coming up ────────────────────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="container py-14">
          <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
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
          </Reveal>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((activity, i) => (
              <Reveal key={activity.id} as="li" delay={Math.min(i * 80, 320)}>
                <ActivityCard activity={activity} isFavorite={favoriteIds.has(activity.id)} />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section className="container pb-14">
        <Reveal className="mb-6 max-w-2xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Or pick a mood</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Eight ways into the city, whether you want a trail, a table or a tree lighting.
          </p>
        </Reveal>
        <CategoryGrid counts={categoryCounts} />
      </section>

      {/* ─── Newsletter ───────────────────────────────────────────────────── */}
      <section className="container pb-4">
        <Reveal className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-forest-600 to-forest-800 p-8 text-cream-50 shadow-lifted transition-shadow duration-300 hover:shadow-[0_24px_60px_-20px_rgba(33,60,41,0.45)] sm:p-12">
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
        </Reveal>
      </section>

      {/* ─── Submit CTA ───────────────────────────────────────────────────── */}
      <section className="container py-10">
        <Reveal className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border p-8 transition-colors duration-300 hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Running something in Newton?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your event, shop or class. Free, and usually reviewed within a few days.
            </p>
          </div>
          <Button asChild size="lg" variant="accent" className="shrink-0">
            <Link href="/submit">Submit an activity</Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
