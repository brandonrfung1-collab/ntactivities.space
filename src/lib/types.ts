/**
 * Domain types for ntactivity.space.
 *
 * These mirror the Supabase schema in `supabase/migrations/0001_init.sql`.
 * Row shapes are hand-written rather than generated so the app compiles before
 * a Supabase project exists; regenerate with
 *   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
 * if you prefer generated types later.
 */

export type PriceType = 'free' | 'paid' | 'varies';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface Village {
  id?: string;
  slug: string;
  name: string;
  /** One-line hook shown on the village grid tile. */
  tagline: string;
  description: string;
  zip: string;
  lat: number;
  lng: number;
  imageUrl: string;
  /** Trivia shown on the village page — gives the site local personality. */
  funFact: string;
}

export interface Category {
  id?: string;
  slug: string;
  name: string;
  description: string;
  /** lucide-react icon name, resolved in components/category-icon.tsx */
  icon: string;
  /** Tailwind classes for the category chip. */
  accentClass: string;
}

export interface Activity {
  id: string;
  slug: string;
  title: string;
  /** Card-length teaser (~140 chars). */
  summary: string;
  /** Full detail-page copy. Plain text paragraphs separated by \n\n. */
  description: string;
  villageSlug: string;
  categorySlug: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl: string;
  priceType: PriceType;
  priceMin: number | null;
  priceMax: number | null;
  /** true => has a specific date/time (schema.org Event); false => a place. */
  isEvent: boolean;
  startAt: string | null;
  endAt: string | null;
  /** Human recurrence note, e.g. "Every Tuesday, June–October". */
  recurrence: string | null;
  website: string | null;
  phone: string | null;
  tags: string[];
  featured: boolean;
  /** Denormalised review aggregates (kept fresh by a Postgres trigger). */
  ratingAvg: number;
  ratingCount: number;
  /** Analytics counters surfaced on the admin dashboard. */
  viewCount: number;
  saveCount: number;
}

export interface Review {
  id: string;
  activityId: string;
  userId: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  title: string;
  summary: string;
  description: string;
  villageSlug: string;
  categorySlug: string;
  address: string;
  priceType: PriceType;
  priceMin: number | null;
  startAt: string | null;
  endAt: string | null;
  website: string | null;
  contactEmail: string;
  submittedBy: string | null;
  status: SubmissionStatus;
  moderatorNote: string | null;
  createdAt: string;
}

/** Normalised query input shared by /activities, village and category pages. */
export interface ActivityFilters {
  q?: string;
  village?: string;
  category?: string;
  /** ISO date (yyyy-mm-dd) inclusive bounds on an event's start. */
  from?: string;
  to?: string;
  price?: 'free' | 'paid' | 'all';
  /** Radius in miles from `near`. */
  radius?: number;
  near?: { lat: number; lng: number };
  sort?: 'recommended' | 'soonest' | 'rating' | 'nearest';
  limit?: number;
}
