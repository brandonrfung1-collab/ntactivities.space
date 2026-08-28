import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware className merge (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Newton Centre" -> "newton-centre" */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Human price label, e.g. "Free", "$12", "$8–$20", "Varies". */
export function formatPrice(
  priceType: 'free' | 'paid' | 'varies',
  min?: number | null,
  max?: number | null,
): string {
  if (priceType === 'free') return 'Free';
  if (priceType === 'varies') return 'Varies';
  if (min == null) return 'Paid';
  if (max != null && max !== min) return `$${min}–$${max}`;
  return `$${min}`;
}

/** Compact date range for event cards, e.g. "Sat, Aug 15 · 10:00 AM". */
export function formatEventWindow(startAt?: string | null, endAt?: string | null): string | null {
  if (!startAt) return null;
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) return null;

  const day = start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  });
  const time = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  });

  if (!endAt) return `${day} · ${time}`;
  const end = new Date(endAt);
  const sameDay = start.toDateString() === end.toDateString();
  const endTime = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  });
  if (sameDay) return `${day} · ${time}–${endTime}`;
  const endDay = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  });
  return `${day} – ${endDay}`;
}

/**
 * Great-circle distance in miles. Used by the "near me" proximity filter so we
 * can sort client-side without a PostGIS round trip.
 */
export function distanceMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Google Maps embed URL that needs no API key (place mode requires one). */
export function mapEmbedUrl(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

export function mapDirectionsUrl(query: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

/**
 * The upcoming (or current) Saturday/Sunday as yyyy-mm-dd, in America/New_York
 * regardless of the caller's own timezone — backs the "This weekend" quick
 * filter, and needs to agree between server and client renders.
 */
export function upcomingWeekendRange(now: Date = new Date()): { from: string; to: string } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const weekdayIdx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.weekday] ?? 0;
  const daysUntilSat = (6 - weekdayIdx + 7) % 7;

  const today = new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00Z`);
  const sat = new Date(today);
  sat.setUTCDate(sat.getUTCDate() + daysUntilSat);
  const sun = new Date(sat);
  sun.setUTCDate(sat.getUTCDate() + 1);

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(sat), to: iso(sun) };
}
