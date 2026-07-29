import { CalendarPlus, ExternalLink } from 'lucide-react';
import type { Activity } from '@/lib/types';
import { googleCalendarUrl } from '@/lib/ics';
import { Button } from '@/components/ui/button';

/**
 * Two paths, no JS: a .ics download (Apple Calendar / Outlook) and a Google
 * Calendar deep link.
 */
export function AddToCalendar({ activity }: { activity: Activity }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="accent" className="gap-2">
        <a href={`/activities/${activity.slug}/calendar`} download>
          <CalendarPlus aria-hidden />
          Add to calendar
        </a>
      </Button>
      <Button asChild variant="outline" className="gap-2">
        <a href={googleCalendarUrl(activity)} target="_blank" rel="noopener noreferrer">
          <ExternalLink aria-hidden />
          Google Calendar
        </a>
      </Button>
    </div>
  );
}
