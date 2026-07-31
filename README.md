# ntactivity.space

Things to do in **Newton, Massachusetts** — events, restaurants, parks, seasonal
activities and hidden gems across all **13 villages**, filterable by village,
category, date, price and distance.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS and Supabase.

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

**No credentials needed.** With no Supabase environment variables set, the app
runs in **demo mode**: it serves the bundled seed dataset (64 activities across
all 13 villages, each pictured with a real, verified Wikimedia Commons photo)
and every page works. Accounts, favorites, reviews and the moderation queue
show a friendly "needs Supabase" notice instead of erroring.

---

## Full setup with Supabase

### 1. Create the project

1. Create a project at <https://supabase.com/dashboard>.
2. Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Find all three under **Project Settings → API**. The service-role key is server
only — never prefix it with `NEXT_PUBLIC_`.

### 2. Run the migration

Paste `supabase/migrations/0001_init.sql` into the Supabase **SQL Editor** and
run it. This creates all nine tables, the enums, the triggers that maintain
rating/save counters, the RPC functions, and **row-level security policies on
every table**.

Or, with the Supabase CLI:

```bash
npx supabase link --project-ref <your-ref>
npx supabase db push
```

### 3. Seed the data

```bash
npm run seed
```

This regenerates `supabase/seed.sql` from `src/lib/data/*.ts` and — if
`SUPABASE_SERVICE_ROLE_KEY` is set — pushes 13 villages, 8 categories and 65
activities straight to your database. Re-running is safe; everything upserts on
`slug`.

Without the service key, paste `supabase/seed.sql` into the SQL Editor instead.

### 4. Configure auth

**Email/password** works immediately.

**Google OAuth:**

1. In Supabase → **Authentication → Providers → Google**, enable it and paste a
   Google OAuth client ID and secret from the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. In the Google console, add this authorized redirect URI:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. In Supabase → **Authentication → URL Configuration**, add your redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://ntactivity.space/auth/callback`

### 5. Make yourself an admin

Sign up through the app, then in the SQL Editor:

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

`/admin` is now available: moderation queue, listing management, and analytics.

> Admin status is deliberately not self-assignable. A trigger blocks any change
> to `profiles.is_admin` that does not come from the service role.

---

## Deploying to Vercel

```bash
npm i -g vercel
vercel        # link the project
vercel --prod
```

Or push to GitHub and import the repo at <https://vercel.com/new>. Framework
detection picks up Next.js automatically; no `vercel.json` is required.

### Environment variables

Add these in **Vercel → Project → Settings → Environment Variables** (Production
*and* Preview):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service-role key (**not** public) |
| `NEXT_PUBLIC_SITE_URL` | `https://ntactivity.space` |

Then pull them locally with:

```bash
vercel env pull .env.local
```

### After the first deploy

1. Add the custom domain `ntactivity.space` under **Settings → Domains**.
2. Set `NEXT_PUBLIC_SITE_URL` to the final origin — it drives canonical URLs,
   OpenGraph tags, the sitemap and calendar links.
3. Add `https://ntactivity.space/auth/callback` to Supabase's allowed redirect
   URLs.
4. Submit `https://ntactivity.space/sitemap.xml` to Google Search Console.

---

## What's included

**Pages**
- Homepage — hero search, trending carousel, 13-village grid, upcoming events, categories, newsletter
- `/activities` — search with village, category, date-range, free/paid and distance filters
- `/activities/[slug]` — photos, embedded map, add-to-calendar (.ics + Google), reviews, related listings
- `/villages` and `/villages/[slug]` — a page per village with local trivia and its own filters
- `/categories` and `/categories/[slug]` — eight browse categories
- `/submit` — public submission form feeding the moderation queue
- `/admin` — approve/reject submissions, hide/delete listings, view analytics
- `/favorites`, `/login`, `/signup`

**Features**
- Supabase Auth: email/password + Google OAuth, with session refresh in middleware
- Saved favorites and one-review-per-user ratings, both enforced by RLS
- Submission moderation queue with approve-to-publish
- Newsletter capture (mailing list readable only by admins)
- Page-view and save-count analytics on the admin dashboard
- SEO: per-page metadata, OpenGraph, `sitemap.xml`, `robots.txt`, and schema.org
  `Event` / `Place` JSON-LD for rich results
- 100 pages prerendered at build time; ISR revalidates hourly

**Accessibility & performance**
- Mobile-first throughout; filters work without JavaScript
- Skip-to-content link, labelled form controls, `aria-*` on interactive elements
- `next/image` optimization with a graceful fallback for dead photo URLs
- Complete dark-mode token set (add `.dark` to `<html>` to enable a toggle)

---

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
npm run seed       # regenerate supabase/seed.sql (+ push if service key present)
```

---

## Project conventions

See [`CLAUDE.md`](./CLAUDE.md) for architecture, the database schema reference,
the demo-mode contract, design tokens and coding conventions.

## A note on the sample data

Landmarks are real Newton fixtures — Crystal Lake, Echo Bridge, Hemlock Gorge,
Cold Spring Park, Nahanton Park, Newton Community Farm, the West Newton Cinema,
Nonantum's St. Mary of Carmen Festival. **Hours, prices and specific event times
are illustrative placeholders** for demonstrating the app, not verified listings.
Replace them with real submissions before launch.
