# CLAUDE.md — ntactivity.space

Project conventions and architecture. Read this before making changes so future
sessions stay consistent.

## Standing instruction: auto-deploy (test site)

This is a **test site** — the user (2026-08-27) said to immediately deploy any
change made here, every time, without asking first. Commit and push to
`origin/main` (git) and deploy to Vercel (`vercel --prod`, or push-to-deploy if
that's wired up) as part of finishing any task in this repo. Do **not** ask for
confirmation before deploying. Keep doing this until the user explicitly says
to stop.

## What this is

A mobile-first activity/event discovery site for **Newton, Massachusetts** and
its **13 villages**. Users browse "things to do" — events, restaurants, parks,
seasonal activities, family spots, hidden gems — filtered by village, category,
date, price and distance.

Domain: `ntactivity.space`

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript strict |
| Styling | Tailwind CSS 3 + CSS-variable design tokens |
| Components | shadcn/ui pattern (copy-in components, not a dependency) |
| Data / Auth | Supabase (Postgres + Auth, email + Google OAuth) |
| Icons | lucide-react |
| Validation | zod (server actions only) |
| Deploy | Vercel |

## The demo-mode contract (important)

**The app must always run with zero credentials.** `src/lib/supabase/config.ts`
exposes `isSupabaseConfigured()`. When the Supabase env vars are absent:

- Every read in `src/lib/queries.ts` falls back to the local seed dataset in
  `src/lib/data/*.ts`.
- Both Supabase client factories (`lib/supabase/client.ts`, `server.ts`) return
  **`null`** rather than throwing.
- Writes (favorites, reviews, submissions, newsletter) validate input, then
  return a friendly "demo mode" message instead of erroring.

When you add a feature that touches Supabase, **preserve this**: null-check the
client and provide a sensible fallback. Never let a missing env var produce a
500.

## Directory layout

```
src/
  app/
    layout.tsx                       root layout: fonts, header/footer, auth state
    page.tsx                         homepage (hero, carousel, villages, categories)
    globals.css                      design tokens (light + dark), utilities
    sitemap.ts  robots.ts            SEO routes
    not-found.tsx
    actions/                         'use server' mutations
      favorites.ts reviews.ts submissions.ts newsletter.ts admin.ts rsvps.ts
    activities/
      page.tsx                       search + filter listing
      [slug]/page.tsx                detail page (+ JSON-LD, map, reviews)
      [slug]/calendar/route.ts       .ics download
    villages/page.tsx  villages/[slug]/page.tsx
    categories/page.tsx  categories/[slug]/page.tsx
    submit/page.tsx                  public submission form
    favorites/page.tsx               per-user saved list
    admin/page.tsx                   moderation queue + analytics
    login/page.tsx  signup/page.tsx
    auth/callback/route.ts           OAuth / email confirm exchange
    auth/signout/route.ts            POST-only sign out
    api/views/route.ts               page-view recorder
  components/
    ui/                              shadcn primitives (button, card, badge, …)
    admin/                           moderation-row, listing-row
    <feature components>             activity-card, filter-bar, search-bar, …
  lib/
    data/                            SEED DATA — source of truth for samples
      villages.ts categories.ts activities.ts
    supabase/config.ts client.ts server.ts
    queries.ts                       ALL reads live here
    filters.ts                       searchParams → typed filters
    types.ts utils.ts ics.ts
    rsvp.ts                          RSVP slot generation + count tallying
    visitor.ts                       anonymous visitor-id cookie
middleware.ts                        Supabase session refresh
supabase/
  migrations/0001_init.sql           schema + RLS + triggers + RPCs
  migrations/0002_rsvps.sql          rsvps table + RLS
  seed.sql                           GENERATED — do not edit (npm run seed)
scripts/seed.ts                      generates seed.sql, optionally pushes
```

## Database schema

Defined in `supabase/migrations/0001_init.sql` (+ `0002_rsvps.sql`). Ten tables:

| Table | Purpose | Key policy |
| --- | --- | --- |
| `profiles` | one row per auth user; `is_admin` flag | read own (admins read all); `is_admin` only writable by service role (trigger-enforced) |
| `villages` | the 13 villages, keyed by `slug` | public read, admin write |
| `categories` | the 8 categories, keyed by `slug` | public read, admin write |
| `activities` | events **and** standing places | public read where `published`, admin write |
| `favorites` | `(user_id, activity_id)` composite PK | strictly private to owner |
| `reviews` | one per user per activity (unique constraint) | public read, own write |
| `submissions` | moderation queue | anyone inserts as `pending`; submitter + admins read; admins moderate |
| `newsletter_subscribers` | weekly digest list | public insert, **admin-only read** (mailing list is not public) |
| `activity_views` | append-only raw analytics | admin read; written only via RPC |
| `rsvps` | `(activity_id, slot_at, visitor_id)` — who's going, and when | public read/write, keyed by an anonymous cookie, not `auth.uid()` — see the migration's RLS comment for the tradeoff |

### RSVPs (prototype)

`src/lib/rsvp.ts` picks the selectable time slots: the real `start_at` for a
dated event, or four generic near-term day buckets (today / tomorrow / this
weekend / next week) for standing places, since those have no structured
schedule. No sign-in required — visitors are identified by an anonymous
`ntc_visitor` cookie (`src/lib/visitor.ts`), and `toggleRsvp`
(`src/app/actions/rsvps.ts`) lets a visitor hold at most one slot per
activity. Like favorites/reviews, this needs Supabase configured — demo mode
shows real zero counts and reverts the click with an inline message rather
than faking persistence (a per-process in-memory store was tried and
discarded: Server Components and Server Actions don't reliably share
module-level state, even within one dev server).

### Conventions

- **`slug` is the public identifier**, not `id`. URLs use slugs; foreign keys
  between reference tables use slugs (`village_slug`, `category_slug`) so seed
  data is stable across resets.
- **Postgres is snake_case; TypeScript is camelCase.** Mapping happens in exactly
  one place: `mapActivity()` in `src/lib/queries.ts`.
- **Denormalised aggregates** (`rating_avg`, `rating_count`, `save_count`) are
  maintained by triggers, never by application code. Don't write them from the app.
- **`view_count`** is bumped by the `record_activity_view` SECURITY DEFINER
  function so anonymous visitors can count without table write access.
- **`approve_submission(uuid, text)`** copies a submission into `activities` and
  re-checks `is_admin()` server-side — approval cannot be spoofed by calling the
  RPC directly.
- `is_event = true` → dated event (schema.org `Event`).
  `is_event = false` → standing place (schema.org `Place`).

### RLS

RLS is enabled on **every** table. Policies use the `public.is_admin()`
SECURITY DEFINER helper to avoid recursive policy evaluation on `profiles`.
When adding a table: enable RLS and write policies in the same migration.

## Data access rules

- **All reads go through `src/lib/queries.ts`.** Pages never call Supabase
  directly.
- **All writes go through `src/app/actions/*.ts`** as server actions, validated
  with zod before touching the database.
- Filtering and sorting are applied **in memory** by `applyFilters()`, over both
  Supabase rows and seed rows. This is deliberate: one implementation of the
  filter semantics instead of two dialects. The listing table is small
  (hundreds of rows). If it grows past a few thousand, move `applyFilters` into
  a Postgres RPC — the FTS index in the migration is already there for it.

## Seed data

`src/lib/data/activities.ts` holds **64 activities — 5 per village, except
Auburndale (4)**, across all 8 categories. Landmarks are real Newton fixtures
(Crystal Lake, Echo Bridge, Hemlock Gorge, Nahanton Park, Newton Community
Farm, West Newton Cinema, the Nonantum Festa…). **Hours, prices and specific
event times are illustrative sample data** meant to be replaced by real
submissions.

Three things to know before editing:

1. Event timestamps use the `inDays(n, 'HH:MM')` helper, so they are generated
   **relative to today**. The demo never shows a calendar of past events. Do not
   hardcode absolute dates.
2. Rows use the compact `Row` interface and are expanded into full `Activity`
   records at the bottom of the file. Add entries in the `ROWS` array.
3. **Images are real, verified Wikimedia Commons photos, not stock imagery.**
   A row naming a specific landmark that appears more than once (Echo Bridge,
   Farlow Park, …) gets a `imageKey` into the `LANDMARK_IMAGES` map; every
   other row falls back to its own village's verified photo
   (`village.imageUrl`) in the `ACTIVITIES` mapper. Never wire in a stock
   photo, and never reuse a landmark photo for a place it doesn't actually
   depict — if no verified photo exists for a place (e.g. Thompsonville),
   leave `imageUrl` empty and let `ActivityImage` show its gradient fallback
   rather than guessing. Wikimedia photos usually require attribution: set
   `imageCredit` / `imageCreditUrl` alongside `imageUrl` (see `villages.ts` for
   the pattern) — CC0/public-domain photos can skip the credit.

After editing, run `npm run seed` to regenerate `supabase/seed.sql`.

## Design system

Tokens live in `src/app/globals.css` as HSL CSS variables, wired into
`tailwind.config.ts`. Palette is "leafy New England suburb":

- `--primary` deep forest green `hsl(134 33% 27%)` — primary actions, links
- `--accent` muted maple `hsl(20 71% 44%)` — **sparingly**: dates, CTAs, seasonal
- `--background` warm paper cream `hsl(42 50% 97%)` — never pure white
- Raw ramps `forest-*`, `maple-*`, `cream-*` for decorative use only

Type: **Inter** for body, **Fraunces** for headings (`font-display`, applied
automatically to `h1/h2/h3` in the base layer). Dark mode variables exist and
are complete; add a theme toggle by putting `.dark` on `<html>`.

Rules of thumb:
- Mobile-first — write the phone layout, then add `sm:` / `lg:`.
- Cards use `shadow-soft`, hover to `shadow-lifted`.
- Buttons and badges are fully rounded (`rounded-full`).
- Filters are **real GET forms**. They must work without JavaScript; results
  must stay linkable and server-rendered. Geolocation is the only progressive
  enhancement.

## SEO requirements

Every new page type needs:
- `generateMetadata` with title, description and `alternates.canonical`
- OpenGraph tags (`url`, `title`, `description`, `images` where available)
- an entry in `src/app/sitemap.ts`
- JSON-LD where a schema.org type fits — `Event` for dated activities,
  `Place` for venues and villages

Private routes (`/admin`, `/favorites`, `/login`, `/signup`) set
`robots: { index: false }` and are disallowed in `robots.ts`.

## Rendering strategy

- Static + `revalidate = 3600`: homepage, villages, categories, activity detail
  (`generateStaticParams` prerenders all 64 + 13 + 8)
- `force-dynamic`: `/admin`, `/favorites` (per-user or must-be-live)
- Dynamic on demand: `/activities` and other pages reading `searchParams`

## Commands

```bash
npm run dev        # dev server on :3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
npm run seed       # regenerate supabase/seed.sql (+ push if service key set)
```

## Gotchas

- `params` and `searchParams` are **promises** in Next 15 — always `await` them.
- `next/font/google` fetches at build time; the build needs network access.
- Remote images require a `remotePatterns` entry in `next.config.mjs`.
  `ActivityImage` falls back to a gradient panel if a photo 404s.
- Redirect targets from query params (`?next=`) are validated to start with `/`
  — keep that open-redirect guard on any new auth flow.
- `middleware.ts` calling `supabase.auth.getUser()` is what refreshes the
  session. Removing it silently logs users out.
