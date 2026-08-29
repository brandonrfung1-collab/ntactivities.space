import { todayRange, tomorrowRange, upcomingWeekendRange } from '@/lib/utils';

/**
 * One-click combination filters. Add/remove/tweak entries here — the UI
 * (`components/filter-bar.tsx`) reads this array and renders + highlights
 * without any per-preset logic living in the component.
 */
export interface FilterPreset {
  key: string;
  label: string;
  price?: 'free' | 'paid';
  category?: string;
  open?: boolean;
  dateRange?: 'today' | 'tomorrow' | 'weekend';
}

export const FILTER_PRESETS: FilterPreset[] = [
  { key: 'free-outdoors', label: 'Free + Outdoors', price: 'free', category: 'outdoors-parks' },
  { key: 'weekend-free', label: 'This Weekend + Free', price: 'free', dateRange: 'weekend' },
  { key: 'family-today', label: 'Family-Friendly + Today', category: 'family-kids', dateRange: 'today' },
];

/** A preset's `dateRange` token resolved to concrete from/to dates. */
export interface PresetResolved {
  price?: 'free' | 'paid';
  category?: string;
  open?: boolean;
  from?: string;
  to?: string;
}

export function resolvePreset(preset: FilterPreset, now: Date = new Date()): PresetResolved {
  const range =
    preset.dateRange === 'today'
      ? todayRange(now)
      : preset.dateRange === 'tomorrow'
        ? tomorrowRange(now)
        : preset.dateRange === 'weekend'
          ? upcomingWeekendRange(now)
          : undefined;

  return {
    price: preset.price,
    category: preset.category,
    open: preset.open,
    from: range?.from,
    to: range?.to,
  };
}

/** Is this preset the one currently active, given the filter bar's values? */
export function presetMatches(
  preset: FilterPreset,
  values: { price?: string; category?: string; open?: string; from?: string; to?: string },
  now: Date = new Date(),
): boolean {
  const resolved = resolvePreset(preset, now);
  if (resolved.price && values.price !== resolved.price) return false;
  if (resolved.category && values.category !== resolved.category) return false;
  if (resolved.open && values.open !== '1') return false;
  if (resolved.from && values.from !== resolved.from) return false;
  if (resolved.to && values.to !== resolved.to) return false;
  return true;
}
