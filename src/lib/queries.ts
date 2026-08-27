import 'server-only';

import type { Activity, ActivityFilters, Review, Submission } from '@/lib/types';
import { ACTIVITIES } from '@/lib/data/activities';
import { CATEGORY_BY_SLUG } from '@/lib/data/categories';
import { VILLAGE_BY_SLUG } from '@/lib/data/villages';
import { distanceMiles } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { getVisitorId } from '@/lib/visitor';
import { buildSlotCounts, emptySummary, getRsvpSlots, type RsvpSummary } from '@/lib/rsvp';

/**
 * Read layer for the app.
 *
 * Every function returns data from Supabase when configured, and from the local
 * seed dataset otherwise. Filtering and sorting are applied in-memory in both
 * cases: the listing table is small (hundreds of rows, not millions), and one
 * implementation of the filter semantics is far easier to keep correct than two.
 * If the dataset outgrows that, move `applyFilters` into a Postgres RPC.
 */

/** Maps a snake_case `activities` row to our camelCase domain type. */
/* eslint-disable @typescript-eslint/no-explicit-any */
function mapActivity(row: any): Activity {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? '',
    description: row.description ?? '',
    villageSlug: row.village_slug,
    categorySlug: row.category_slug,
    address: row.address ?? '',
    lat: Number(row.lat ?? 0),
    lng: Number(row.lng ?? 0),
    imageUrl: row.image_url ?? '',
    priceType: row.price_type ?? 'free',
    priceMin: row.price_min,
    priceMax: row.price_max,
    isEvent: Boolean(row.is_event),
    startAt: row.start_at,
    endAt: row.end_at,
    recurrence: row.recurrence,
    website: row.website,
    phone: row.phone,
    tags: row.tags ?? [],
    featured: Boolean(row.featured),
    ratingAvg: Number(row.rating_avg ?? 0),
    ratingCount: Number(row.rating_count ?? 0),
    viewCount: Number(row.view_count ?? 0),
    saveCount: Number(row.save_count ?? 0),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** All published activities, from Supabase if available. */
async function loadAll(): Promise<Activity[]> {
  const supabase = await createClient();
  if (!supabase) return ACTIVITIES;

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('published', true)
    .limit(2000);

  if (error || !data?.length) {
    // Fail soft: a misconfigured project should still render a usable site.
    if (error) console.error('[queries] activities fetch failed:', error.message);
    return ACTIVITIES;
  }
  return data.map(mapActivity);
}

/** Free-text match across title, summary, tags, village and category names. */
function matchesQuery(a: Activity, q: string): boolean {
  const needle = q.toLowerCase();
  const village = VILLAGE_BY_SLUG.get(a.villageSlug)?.name ?? '';
  const category = CATEGORY_BY_SLUG.get(a.categorySlug)?.name ?? '';
  return [a.title, a.summary, a.description, village, category, ...a.tags]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

export function applyFilters(input: Activity[], f: ActivityFilters): Activity[] {
  let out = input;

  if (f.q?.trim()) {
    const q = f.q.trim();
    out = out.filter((a) => matchesQuery(a, q));
  }
  if (f.village) out = out.filter((a) => a.villageSlug === f.village);
  if (f.category) out = out.filter((a) => a.categorySlug === f.category);

  if (f.price === 'free') out = out.filter((a) => a.priceType === 'free');
  if (f.price === 'paid') out = out.filter((a) => a.priceType !== 'free');

  // Date range applies to dated events. Places (isEvent === false) are always
  // available, so they stay in the results rather than being filtered out.
  if (f.from) {
    const from = new Date(`${f.from}T00:00:00`).getTime();
    out = out.filter((a) => !a.startAt || new Date(a.startAt).getTime() >= from);
  }
  if (f.to) {
    const to = new Date(`${f.to}T23:59:59`).getTime();
    out = out.filter((a) => !a.startAt || new Date(a.startAt).getTime() <= to);
  }

  const near = f.near;
  if (near && f.radius) {
    out = out.filter((a) => distanceMiles(near, a) <= f.radius!);
  }

  const sorted = [...out];
  switch (f.sort) {
    case 'soonest':
      sorted.sort((a, b) => {
        // Dated events first, chronologically; undated places after.
        if (a.startAt && b.startAt) return a.startAt.localeCompare(b.startAt);
        if (a.startAt) return -1;
        if (b.startAt) return 1;
        return b.ratingAvg - a.ratingAvg;
      });
      break;
    case 'rating':
      sorted.sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount);
      break;
    case 'nearest':
      if (near) {
        sorted.sort((a, b) => distanceMiles(near, a) - distanceMiles(near, b));
        break;
      }
    // falls through to recommended when we have no origin
    default:
      // "Recommended": featured first, then best-rated with enough reviews.
      sorted.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.ratingAvg * Math.log1p(b.ratingCount) - a.ratingAvg * Math.log1p(a.ratingCount),
      );
  }

  return f.limit ? sorted.slice(0, f.limit) : sorted;
}

export async function getActivities(filters: ActivityFilters = {}): Promise<Activity[]> {
  return applyFilters(await loadAll(), filters);
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  const all = await loadAll();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getFeaturedActivities(limit = 8): Promise<Activity[]> {
  const all = await loadAll();
  const featured = all.filter((a) => a.featured);
  const pool = featured.length >= limit ? featured : all;
  return applyFilters(pool, { sort: 'recommended', limit });
}

/** Upcoming dated events, soonest first. */
export async function getUpcomingEvents(limit = 6): Promise<Activity[]> {
  const all = await loadAll();
  const now = Date.now();
  const upcoming = all.filter((a) => a.isEvent && a.startAt && new Date(a.startAt).getTime() >= now);
  return applyFilters(upcoming, { sort: 'soonest', limit });
}

/** Other things to do nearby, excluding the current activity. */
export async function getRelatedActivities(activity: Activity, limit = 3): Promise<Activity[]> {
  const all = await loadAll();
  const candidates = all.filter((a) => a.id !== activity.id);
  const sameVillage = candidates.filter((a) => a.villageSlug === activity.villageSlug);
  const sameCategory = candidates.filter(
    (a) => a.categorySlug === activity.categorySlug && a.villageSlug !== activity.villageSlug,
  );
  return [...sameVillage, ...sameCategory].slice(0, limit);
}

/** Per-village counts for the homepage village grid. */
export async function getVillageCounts(): Promise<Record<string, number>> {
  const all = await loadAll();
  return all.reduce<Record<string, number>>((acc, a) => {
    acc[a.villageSlug] = (acc[a.villageSlug] ?? 0) + 1;
    return acc;
  }, {});
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const all = await loadAll();
  return all.reduce<Record<string, number>>((acc, a) => {
    acc[a.categorySlug] = (acc[a.categorySlug] ?? 0) + 1;
    return acc;
  }, {});
}

/** Reviews for an activity, newest first. Empty in demo mode. */
export async function getReviews(activityId: string): Promise<Review[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select('id, activity_id, user_id, author_name, rating, body, created_at')
    .eq('activity_id', activityId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    activityId: r.activity_id,
    userId: r.user_id,
    authorName: r.author_name ?? 'Newton neighbor',
    rating: r.rating,
    body: r.body ?? '',
    createdAt: r.created_at,
  }));
}

/** RSVP slots, counts and the current visitor's status for an activity. */
export async function getRsvpSummary(activity: Activity): Promise<RsvpSummary> {
  const slots = getRsvpSlots(activity);
  const supabase = await createClient();

  if (!supabase) return emptySummary(slots);

  const visitorId = await getVisitorId();
  const { data } = await supabase
    .from('rsvps')
    .select('slot_at, visitor_id')
    .eq('activity_id', activity.id);

  const rows = data ?? [];
  const counts = buildSlotCounts(rows, slots.map((s) => s.key));

  let goingSlot: string | null = null;
  if (visitorId) {
    const slotTimes = new Map(slots.map((s) => [new Date(s.key).getTime(), s.key]));
    const own = rows.find((r) => r.visitor_id === visitorId);
    if (own) goingSlot = slotTimes.get(new Date(own.slot_at as string).getTime()) ?? null;
  }

  return { slots, counts, goingSlot };
}

/** Activity IDs the current user has saved. */
export async function getFavoriteIds(): Promise<Set<string>> {
  const supabase = await createClient();
  if (!supabase) return new Set();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase.from('favorites').select('activity_id').eq('user_id', user.id);
  return new Set((data ?? []).map((r) => r.activity_id as string));
}

export async function getFavoriteActivities(): Promise<Activity[]> {
  const ids = await getFavoriteIds();
  if (!ids.size) return [];
  const all = await loadAll();
  return all.filter((a) => ids.has(a.id));
}

/** Moderation queue. Requires an admin session; returns [] in demo mode. */
export async function getSubmissions(status?: Submission['status']): Promise<Submission[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase.from('submissions').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((s) => ({
    id: s.id,
    title: s.title,
    summary: s.summary ?? '',
    description: s.description ?? '',
    villageSlug: s.village_slug,
    categorySlug: s.category_slug,
    address: s.address ?? '',
    priceType: s.price_type ?? 'free',
    priceMin: s.price_min,
    startAt: s.start_at,
    endAt: s.end_at,
    website: s.website,
    contactEmail: s.contact_email ?? '',
    submittedBy: s.submitted_by,
    status: s.status,
    moderatorNote: s.moderator_note,
    createdAt: s.created_at,
  }));
}

/** Aggregate numbers for the admin dashboard. */
export async function getAnalyticsSummary() {
  const all = await loadAll();
  const supabase = await createClient();

  const totalViews = all.reduce((sum, a) => sum + a.viewCount, 0);
  const mostSaved = [...all].sort((a, b) => b.saveCount - a.saveCount).slice(0, 5);
  const mostViewed = [...all].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  let pendingCount = 0;
  let subscriberCount = 0;
  if (supabase) {
    const [{ count: pending }, { count: subs }] = await Promise.all([
      supabase
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
    ]);
    pendingCount = pending ?? 0;
    subscriberCount = subs ?? 0;
  }

  return {
    activityCount: all.length,
    eventCount: all.filter((a) => a.isEvent).length,
    totalViews,
    mostSaved,
    mostViewed,
    pendingCount,
    subscriberCount,
  };
}
