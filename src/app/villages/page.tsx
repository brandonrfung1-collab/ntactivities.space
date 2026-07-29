import type { Metadata } from 'next';
import Link from 'next/link';
import { VILLAGES } from '@/lib/data/villages';
import { getVillageCounts } from '@/lib/queries';
import { ActivityImage } from '@/components/activity-image';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'The 13 villages of Newton, MA',
  description:
    'Newton is made of thirteen villages — Auburndale, Chestnut Hill, Newton Centre, Newton Corner, Newton Highlands, Lower Falls, Upper Falls, Newtonville, Nonantum, Oak Hill, Thompsonville, Waban and West Newton. Explore what to do in each.',
  alternates: { canonical: '/villages' },
};

export default async function VillagesPage() {
  const counts = await getVillageCounts();

  return (
    <div className="container py-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Thirteen villages, one city
        </h1>
        <p className="mt-3 text-muted-foreground">
          Newton has no downtown — it has thirteen village centers, each with its own square,
          personality and reasons to make the trip.
        </p>
      </header>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {VILLAGES.map((village) => (
          <li key={village.slug}>
            <Link
              href={`/villages/${village.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-shadow hover:shadow-lifted"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <ActivityImage
                  src={village.imageUrl}
                  alt=""
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-lg font-semibold">{village.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{village.tagline}</p>
                <p className="mt-4 text-xs font-medium text-primary">
                  {counts[village.slug] ?? 0} things to do · {village.zip}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
