import type { ActivityFilters } from '@/lib/types';
import { VILLAGE_BY_SLUG } from '@/lib/data/villages';
import { CATEGORY_BY_SLUG } from '@/lib/data/categories';

/** Next.js 15 passes searchParams as a promise of this shape. */
export type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() ? v.trim() : undefined;
}

const SORTS = new Set(['recommended', 'soonest', 'rating', 'nearest']);

/**
 * Parse and validate URL search params into typed filters.
 *
 * Unknown or malformed values are dropped rather than erroring, so a
 * hand-edited URL degrades to "show me everything" instead of a 500.
 */
export function parseFilters(params: SearchParams): ActivityFilters {
  const village = one(params.village);
  const category = one(params.category);
  const price = one(params.price);
  const sort = one(params.sort);
  const radius = Number(one(params.radius));
  const lat = Number(one(params.lat));
  const lng = Number(one(params.lng));

  const isDate = (s?: string) => Boolean(s && /^\d{4}-\d{2}-\d{2}$/.test(s));

  return {
    q: one(params.q),
    village: village && VILLAGE_BY_SLUG.has(village) ? village : undefined,
    category: category && CATEGORY_BY_SLUG.has(category) ? category : undefined,
    from: isDate(one(params.from)) ? one(params.from) : undefined,
    to: isDate(one(params.to)) ? one(params.to) : undefined,
    price: price === 'free' || price === 'paid' ? price : 'all',
    open: one(params.open) === '1' ? true : undefined,
    radius: Number.isFinite(radius) && radius > 0 ? radius : undefined,
    near:
      Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0
        ? { lat, lng }
        : undefined,
    sort: sort && SORTS.has(sort) ? (sort as ActivityFilters['sort']) : 'recommended',
  };
}

/** Human summary of the active filters, used in listing headings. */
export function describeFilters(f: ActivityFilters): string | null {
  const bits: string[] = [];
  if (f.q) bits.push(`“${f.q}”`);
  if (f.village) bits.push(VILLAGE_BY_SLUG.get(f.village)!.name);
  if (f.category) bits.push(CATEGORY_BY_SLUG.get(f.category)!.name);
  if (f.price === 'free') bits.push('free only');
  if (f.price === 'paid') bits.push('paid only');
  if (f.open) bits.push('open now');
  if (f.from && f.to) bits.push(`${f.from} to ${f.to}`);
  else if (f.from) bits.push(`from ${f.from}`);
  else if (f.to) bits.push(`until ${f.to}`);
  if (f.radius && f.near) bits.push(`within ${f.radius} mi`);
  return bits.length ? bits.join(' · ') : null;
}
