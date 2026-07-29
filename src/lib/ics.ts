import type { Activity } from '@/lib/types';
import { SITE_URL } from '@/lib/supabase/config';

/** RFC 5545 wants UTC basic format: 20260815T140000Z */
function toIcsStamp(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Escape per RFC 5545 §3.3.11 and fold nothing (lines stay short enough). */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Build a single-event .ics file for an activity.
 *
 * Undated places get a 2-hour block on the next day so "add to calendar" still
 * does something sensible for e.g. a restaurant or a park visit.
 */
export function buildIcs(activity: Activity): string {
  const start = activity.startAt ? new Date(activity.startAt) : new Date(Date.now() + 86_400_000);
  const end = activity.endAt
    ? new Date(activity.endAt)
    : new Date(start.getTime() + 2 * 3_600_000);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ntactivity.space//Newton Activities//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${activity.slug}@ntactivity.space`,
    `DTSTAMP:${toIcsStamp(new Date())}`,
    `DTSTART:${toIcsStamp(start)}`,
    `DTEND:${toIcsStamp(end)}`,
    `SUMMARY:${escapeText(activity.title)}`,
    `DESCRIPTION:${escapeText(`${activity.summary}\n\nMore: ${SITE_URL}/activities/${activity.slug}`)}`,
    `LOCATION:${escapeText(activity.address)}`,
    `URL:${SITE_URL}/activities/${activity.slug}`,
    `GEO:${activity.lat};${activity.lng}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return `${lines.join('\r\n')}\r\n`;
}

/** "Add to Google Calendar" deep link, as an alternative to downloading .ics. */
export function googleCalendarUrl(activity: Activity): string {
  const start = activity.startAt ? new Date(activity.startAt) : new Date(Date.now() + 86_400_000);
  const end = activity.endAt
    ? new Date(activity.endAt)
    : new Date(start.getTime() + 2 * 3_600_000);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: activity.title,
    dates: `${toIcsStamp(start)}/${toIcsStamp(end)}`,
    details: `${activity.summary}\n\n${SITE_URL}/activities/${activity.slug}`,
    location: activity.address,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
