import { getActivityBySlug } from '@/lib/queries';
import { buildIcs } from '@/lib/ics';

/** Serves a downloadable .ics for a single activity. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) return new Response('Not found', { status: 404 });

  return new Response(buildIcs(activity), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${activity.slug}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
