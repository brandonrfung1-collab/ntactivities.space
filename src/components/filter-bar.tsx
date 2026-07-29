'use client';

import { LocateFixed, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { VILLAGES } from '@/lib/data/villages';
import { CATEGORIES } from '@/lib/data/categories';
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
  radius?: string;
  lat?: string;
  lng?: string;
  sort?: string;
}

/**
 * The filter panel used by /activities and by village/category pages.
 *
 * It is a real GET form: no JS is required to filter, results are linkable, and
 * the server does the work. Geolocation is the one progressive enhancement —
 * pressing "Near me" fills hidden lat/lng inputs before submit.
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
    values.q || values.from || values.to || (values.price && values.price !== 'all') || coords,
  );

  return (
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
          <Select name="sort" defaultValue={values.sort ?? 'recommended'} aria-label="Sort by">
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
              {coords
                ? 'Using your location for distance.'
                : (geoError ?? 'Tap the pin to sort by distance from you.')}
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
  );
}
