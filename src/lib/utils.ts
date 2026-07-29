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
