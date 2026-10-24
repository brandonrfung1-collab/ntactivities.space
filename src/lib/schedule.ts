import type { Activity } from '@/lib/types';

/**
 * Turns "Open now" / "Happening today" badges out of the freeform `recurrence`
 * text (e.g. "Every Tuesday, year-round", "Mon–Thu 9am–9pm, Fri–Sat 9am–5pm")
 * plus, as a fallback, a dated event's `startAt`/`endAt`.
 *
 * `recurrence` is prose, not structured data, so this is a best-effort parser
 * for the shapes that actually occur in the seed data — not a general natural
 * language scheduler. Anything it can't parse confidently (irregular cadences
 * like "Second Saturday of the month") is deliberately skipped rather than
 * guessed at; `getAvailabilityBadge` falls back to the dated-event window in
 * that case, and returns `null` (no badge) if neither source is usable.
 */

export interface Availability {
  label: string;
  tone: 'live' | 'today';
}

const DAY_IDX: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  weds: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

const MONTH_IDX: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

const WEEKDAY_SHORT_IDX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// Irregular cadences ("Second Saturday of the month", "Select Fri–Sun",
// "Monthly", "Four days each July", "open-studio weekends", "After snowfall")
// aren't a weekly pattern — don't pretend to parse them.
const IRREGULAR_RE = /\b(first|second|third|fourth|last|monthly|each|select)\b|open-studio|snowfall/i;

function dashNormalize(s: string): string {
  return s.replace(/[–—−]/g, '-');
}

function dayToken(raw: string): number | null {
  const key = raw.toLowerCase().trim().replace(/s$/, '');
  return key in DAY_IDX ? DAY_IDX[key] : null;
}

function expandDayRange(a: number, b: number): number[] {
  const out: number[] = [];
  let i = a;
  for (;;) {
    out.push(i);
    if (i === b) break;
    i = (i + 1) % 7;
  }
  return out;
}

function parseDaySpec(segment: string): number[] {
  const t = segment.toLowerCase();
  if (/\bweekdays?\b/.test(t)) return [1, 2, 3, 4, 5];
  if (/\bweekends?\b/.test(t)) return [0, 6];

  const days = new Set<number>();
  let consumed = t;

  const rangeRe = /\b([a-z]+)\s*-\s*([a-z]+)\b/g;
  let m: RegExpExecArray | null;
  while ((m = rangeRe.exec(t))) {
    const a = dayToken(m[1]);
    const b = dayToken(m[2]);
    if (a != null && b != null) {
      expandDayRange(a, b).forEach((d) => days.add(d));
      consumed = consumed.replace(m[0], ' ');
    }
  }

  for (const tok of consumed.split(/[^a-z]+/)) {
    if (!tok) continue;
    const idx = dayToken(tok);
    if (idx != null) days.add(idx);
  }

  return [...days];
}

function parseClock(hour: string, minute: string | undefined, ampm: string): number {
  let h = parseInt(hour, 10) % 12;
  if (ampm.toLowerCase() === 'pm') h += 12;
  const m = minute ? parseInt(minute.slice(1), 10) : 0;
  return h * 60 + m;
}

const TIME_RE = /(\d{1,2})(:\d{2})?\s*(am|pm)/gi;

function parseTimeSpec(segment: string): { start: number; end: number } | null {
  const t = segment.toLowerCase();
  if (/dawn to dusk|dawn-dusk|daylight/.test(t)) return { start: 6 * 60, end: 20 * 60 };

  const times: number[] = [];
  TIME_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TIME_RE.exec(t))) {
    times.push(parseClock(m[1], m[2], m[3]));
  }

  if (times.length >= 2) return { start: times[0], end: times[1] };
  if (times.length === 1) {
    if (/\bfrom\b/.test(t)) return { start: times[0], end: 24 * 60 };
    if (/\buntil\b|\btill\b/.test(t)) return { start: 0, end: times[0] };
    return { start: 0, end: times[0] };
  }
  return null;
}

function monthInRange(cur: number, a: number, b: number): boolean {
  return a <= b ? cur >= a && cur <= b : cur >= a || cur <= b;
}

/** Strips a "Month–Month" / "Month through Month" season window out of the text. */
function stripMonthRange(text: string, currentMonth: number): { text: string; inSeason: boolean } {
  const re = /\b([a-z]+)\s*(?:-|through)\s*([a-z]+)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const a = MONTH_IDX[m[1].toLowerCase()];
    const b = MONTH_IDX[m[2].toLowerCase()];
    if (a !== undefined && b !== undefined) {
      return {
        text: text.slice(0, m.index) + text.slice(m.index + m[0].length),
        inSeason: monthInRange(currentMonth, a, b),
      };
    }
  }
  return { text, inSeason: true };
}

function nyParts(date: Date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) parts[p.type] = p.value;
  let hour = parseInt(parts.hour, 10);
  if (hour === 24) hour = 0;
  return {
    weekday: WEEKDAY_SHORT_IDX[parts.weekday] ?? 0,
    month: new Date(`${parts.month} 1, 2000`).getMonth(),
    minutes: hour * 60 + parseInt(parts.minute, 10),
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

function badgeLabel(isEvent: boolean, tone: 'live' | 'today'): string {
  const verb = isEvent ? 'Happening' : 'Open';
  return tone === 'live' ? `${verb} now` : `${verb} today`;
}

function fromRecurrence(activity: Activity, now: Date): Availability | null {
  const { weekday, minutes, month } = nyParts(now);
  const normalized = dashNormalize(activity.recurrence!);
  const { text, inSeason } = stripMonthRange(normalized, month);
  if (!inSeason) return null;

  const hasWeekdayWord = /\b(sun|mon|tue|wed|thu|fri|sat|weekday|weekend)/i.test(text);
  const schedule = new Map<number, { start: number; end: number }>();

  if (!hasWeekdayWord) {
    const time = parseTimeSpec(text) ?? { start: 0, end: 24 * 60 };
    for (let d = 0; d < 7; d++) schedule.set(d, time);
  } else {
    const segments = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    let pending: number[] = [];

    for (const seg of segments) {
      const days = parseDaySpec(seg);
      const looksTimey = /\d/.test(seg) || /\bdawn\b|\buntil\b|\btill\b|\bfrom\b/i.test(seg);
      const time = looksTimey ? parseTimeSpec(seg) : null;

      if (days.length && time) {
        days.forEach((d) => schedule.set(d, time));
        pending = [];
      } else if (days.length && !time) {
        pending = [...pending, ...days];
      } else if (!days.length && time) {
        const targets = pending.length ? pending : [0, 1, 2, 3, 4, 5, 6];
        targets.forEach((d) => schedule.set(d, time));
        pending = [];
      }
    }

    pending.forEach((d) => schedule.set(d, { start: 0, end: 24 * 60 }));
  }

  const today = schedule.get(weekday);
  if (!today) return null;

  if (minutes >= today.start && minutes < today.end) {
    return { label: badgeLabel(activity.isEvent, 'live'), tone: 'live' };
  }
  if (minutes < today.start) {
    return { label: badgeLabel(activity.isEvent, 'today'), tone: 'today' };
  }
  return null;
}

function fromDatedEvent(activity: Activity, now: Date): Availability | null {
  const start = new Date(activity.startAt!).getTime();
  if (Number.isNaN(start)) return null;
  const end = activity.endAt ? new Date(activity.endAt).getTime() : start + 3 * 60 * 60 * 1000;
  const t = now.getTime();

  if (t >= start && t <= end) return { label: 'Happening now', tone: 'live' };
  if (t > end) return null;

  const nowKey = nyParts(now).dateKey;
  const startInfo = nyParts(new Date(start));
  if (nowKey === startInfo.dateKey) return { label: 'Happening today', tone: 'today' };

  const diffDays = Math.round((start - t) / 86_400_000);
  if (diffDays >= 0 && diffDays <= 7 && (startInfo.weekday === 0 || startInfo.weekday === 6)) {
    return { label: 'This weekend', tone: 'today' };
  }
  return null;
}

/**
 * Best-effort "Open now" / "Happening today" badge, evaluated at `now`
 * (defaults to the caller's current time — pass a fixed Date in tests).
 * Returns `null` when there's nothing confident to show.
 */
export function getAvailabilityBadge(activity: Activity, now: Date = new Date()): Availability | null {
  if (activity.recurrence && !IRREGULAR_RE.test(activity.recurrence)) {
    return fromRecurrence(activity, now);
  }
  if (activity.isEvent && activity.startAt) {
    return fromDatedEvent(activity, now);
  }
  return null;
}

/** How far ahead a dated event still counts as "happening now" for ranking. */
const IN_SEASON_DAYS = 45;

/**
 * True when an activity is worth doing right now: a dated event starting in
 * the next few weeks, or a place whose season window (e.g. "June–October",
 * "December–March", "through Labor Day") includes the current month. Used to
 * rank off-season listings (a July festival, the sledding hill in summer)
 * below what is actually happening.
 */
export function isInSeason(activity: Activity, now: Date = new Date()): boolean {
  if (activity.isEvent) {
    if (!activity.startAt) return false;
    const start = new Date(activity.startAt).getTime();
    return start - now.getTime() <= IN_SEASON_DAYS * 86_400_000;
  }
  if (!activity.recurrence) return true;
  const text = dashNormalize(activity.recurrence)
    .replace(/\b(?:mid|early|late)[-\s]+/gi, '')
    .replace(/labor day/i, 'September');
  return stripMonthRange(text, nyParts(now).month).inSeason;
}
