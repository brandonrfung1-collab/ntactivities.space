'use client';

import { LocateFixed, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { VILLAGES } from '@/lib/data/villages';
import { CATEGORIES } from '@/lib/data/categories';
import { cn, todayRange, tomorrowRange, upcomingWeekendRange } from '@/lib/utils';
import { FILTER_PRESETS, presetMatches, resolvePreset } from '@/lib/presets';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface FilterValues {
  q?: string;
  village?: string;
  category?: string;
  from?: string;
  to?: string;
  price?: string;
  open?: string;
  radius?: string;
  lat?: string;
  lng?: string;
  sort?: string;
}

const FAMILY_CATEGORY = 'family-kids';

function chipClass(active: boolean) {
  return cn(
    'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
    active
      ? 'border-transparent bg-primary text-primary-foreground'
      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
  );
}

/**
 * The filter panel used by /activities and by village/category pages.
 *
 * It is a real GET form: no JS is required to filter, results are linkable, and
 * the server does the work. Geolocation is the one progressive enhancement —
 * pressing "Near me" fills hidden lat/lng inputs before submit. The quick
 * chips below are plain links that carry every other active filter forward,
 * so "Free", "This weekend" and a village/category lock all combine instead
 * of resetting each other.
 */
export function FilterBar({
  action = '/activities',
  values,
  lockVillage = false,
  lockCategory = false,
  resultCount,
}: {
  action?: string;
  values: FilterValues;
  lockVillage?: boolean;
  lockCategory?: boolean;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(
    values.lat && values.lng ? { lat: values.lat, lng: values.lng } : null,
  );
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [sort, setSort] = useState(values.sort ?? 'recommended');

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setGeoError('Your browser does not support location.');
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5),
        });
        // Getting a location is almost always in service of "what's close to
        // me" — switch the sort automatically unless the visitor already
        // picked something more specific.
        setSort((s) => (s === 'recommended' ? 'nearest' : s));
        setLocating(false);
      },
      () => {
        setGeoError('Could not get your location.');
        setLocating(false);
      },
      { timeout: 8000 },
    );
  }

  const hasFilters = Boolean(
    values.q ||
      values.from ||
      values.to ||
      (values.price && values.price !== 'all') ||
      values.open === '1' ||
      coords,
  );

  function clearLocation() {
    setCoords(null);
    setGeoError(null);
    setSort((s) => (s === 'nearest' ? 'recommended' : s));
  }

  // Builds a link that carries every current filter forward, with `overrides`
  // applied — so a quick chip toggles just its own filter, combining with
  // whatever else (village lock, search text, other chips) is already active.
  function withParams(overrides: Record<string, string | undefined>) {
    const merged: Record<string, string | undefined> = {
      q: values.q,
      village: values.village,
      category: values.category,
      from: values.from,
      to: values.to,
      price: values.price,
      open: values.open,
      radius: values.radius,
      lat: coords?.lat,
      lng: coords?.lng,
      sort,
      ...overrides,
    };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `${action}?${qs}` : action;
  }

  const isFree = values.price === 'free';
  const isOpenNow = values.open === '1';
  const today = todayRange();
  const isToday = values.from === today.from && values.to === today.to;
  const tomorrow = tomorrowRange();
  const isTomorrow = values.from === tomorrow.from && values.to === tomorrow.to;
  const weekend = upcomingWeekendRange();
  const isWeekend = values.from === weekend.from && values.to === weekend.to;
  const isFamily = values.category === FAMILY_CATEGORY;
  const showFamilyChip = !(lockCategory && isFamily);

  return (
    <div className="space-y-3">
      <form action={action} method="get" className="space-y-3">
        {/* Compact row — always visible, works on its own. */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            name="q"
            defaultValue={values.q ?? ''}
            placeholder="Search Newton activities…"
            className="h-10 min-w-[12rem] flex-1"
            aria-label="Search"
          />

          <div className="w-[9.5rem]">
            <Select
              name="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort by"
            >
              <option value="recommended">Recommended</option>
              <option value="soonest">Soonest</option>
              <option value="rating">Top rated</option>
              <option value="nearest">Nearest</option>
            </Select>
          </div>

          <Button type="submit">Apply</Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="gap-2"
          >
            <SlidersHorizontal aria-hidden />
            Filters
          </Button>
        </div>

        {/* Expanded panel */}
        {open && (
          <div className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-3">
            {!lockVillage && (
              <div className="space-y-1.5">
                <Label htmlFor="f-village">Village</Label>
                <Select id="f-village" name="village" defaultValue={values.village ?? ''}>
                  <option value="">All 13 villages</option>
                  {VILLAGES.map((v) => (
                    <option key={v.slug} value={v.slug}>
                      {v.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {!lockCategory && (
              <div className="space-y-1.5">
                <Label htmlFor="f-category">Category</Label>
                <Select id="f-category" name="category" defaultValue={values.category ?? ''}>
                  <option value="">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="f-price">Price</Label>
              <Select id="f-price" name="price" defaultValue={values.price ?? 'all'}>
                <option value="all">Free &amp; paid</option>
                <option value="free">Free only</option>
                <option value="paid">Paid only</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="f-from">Happening from</Label>
              <Input id="f-from" name="from" type="date" defaultValue={values.from ?? ''} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="f-to">Happening until</Label>
              <Input id="f-to" name="to" type="date" defaultValue={values.to ?? ''} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="f-radius">Distance</Label>
              <div className="flex gap-2">
                <Select
                  id="f-radius"
                  name="radius"
                  defaultValue={values.radius ?? ''}
                  className="flex-1"
                >
                  <option value="">Any distance</option>
                  <option value="1">Within 1 mile</option>
                  <option value="2">Within 2 miles</option>
                  <option value="5">Within 5 miles</option>
                </Select>
                <Button
                  type="button"
                  variant={coords ? 'default' : 'outline'}
                  size="icon"
                  onClick={useMyLocation}
                  disabled={locating}
                  title="Use my location"
                  aria-label="Use my location"
                >
                  <LocateFixed aria-hidden />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {coords ? (
                  <>
                    Using your location — sorted nearest first.{' '}
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="font-medium text-primary underline underline-offset-2"
                    >
                      Clear
                    </button>
                  </>
                ) : (
                  (geoError ?? 'Tap the pin to sort by distance from you.')
                )}
              </p>
            </div>

            {/* Hidden inputs carry the geolocation result and locked context. */}
            {coords && (
              <>
                <input type="hidden" name="lat" value={coords.lat} />
                <input type="hidden" name="lng" value={coords.lng} />
              </>
            )}
            {lockVillage && values.village && (
              <input type="hidden" name="village" value={values.village} />
            )}
            {lockCategory && values.category && (
              <input type="hidden" name="category" value={values.category} />
            )}

            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
              <Button type="submit">Show {resultCount === 1 ? '1 result' : 'results'}</Button>
              {hasFilters && (
                <Button asChild variant="ghost" className="gap-1.5">
                  <Link href={action}>
                    <X aria-hidden />
                    Clear filters
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Quick chips — plain links, so they combine with whatever else is active. */}
      <div className="flex flex-wrap gap-2">
        <Link href={withParams({ open: isOpenNow ? undefined : '1' })} className={chipClass(isOpenNow)}>
          Open now
        </Link>
        <Link
          href={withParams({
            from: isToday ? undefined : today.from,
            to: isToday ? undefined : today.to,
          })}
          className={chipClass(isToday)}
        >
          Today
        </Link>
        <Link
          href={withParams({
            from: isTomorrow ? undefined : tomorrow.from,
            to: isTomorrow ? undefined : tomorrow.to,
          })}
          className={chipClass(isTomorrow)}
        >
          Tomorrow
        </Link>
        <Link
          href={withParams({
            from: isWeekend ? undefined : weekend.from,
            to: isWeekend ? undefined : weekend.to,
          })}
          className={chipClass(isWeekend)}
        >
          This weekend
        </Link>
        <Link href={withParams({ price: isFree ? undefined : 'free' })} className={chipClass(isFree)}>
          Free
        </Link>
        {showFamilyChip && (
          <Link
            href={withParams({ category: isFamily ? undefined : FAMILY_CATEGORY })}
            className={chipClass(isFamily)}
          >
            Family &amp; Kids
          </Link>
        )}
      </div>

      {/* Combination presets — single click applies every filter the preset
          bundles. Config lives in `lib/presets.ts`, not here, so new
          combinations don't require touching this component. */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Presets:</span>
        {FILTER_PRESETS.map((preset) => {
          const resolved = resolvePreset(preset);
          const active = presetMatches(preset, values);
          const href = active
            ? withParams({
                price: undefined,
                category: lockCategory ? values.category : undefined,
                open: undefined,
                from: undefined,
                to: undefined,
              })
            : withParams({
                price: resolved.price,
                category: resolved.category,
                open: resolved.open ? '1' : undefined,
                from: resolved.from,
                to: resolved.to,
              });
          return (
            <Link key={preset.key} href={href} className={chipClass(active)}>
              {preset.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
