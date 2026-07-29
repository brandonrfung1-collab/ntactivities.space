import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { VILLAGES } from '@/lib/data/villages';
import { ActivityImage } from '@/components/activity-image';

/** The 13-village quick-links grid. Two-up on phones, up to four-up on desktop. */
export function VillageGrid({ counts = {} }: { counts?: Record<string, number> }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {VILLAGES.map((village) => (
        <li key={village.slug}>
          <Link
            href={`/villages/${village.slug}`}
            className="group relative flex h-32 flex-col justify-end overflow-hidden rounded-lg border border-border shadow-soft transition-shadow hover:shadow-lifted sm:h-36"
          >
            <ActivityImage
              src={village.imageUrl}
              alt=""
              sizes="(max-width: 640px) 50vw, 25vw"
              className="transition-transform duration-500 group-hover:scale-105"
            />
            {/* Scrim keeps the label legible over any photo. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/35 to-transparent"
            />
            <div className="relative z-10 p-3 text-cream-50">
              <p className="flex items-center gap-1 font-display text-sm font-semibold leading-tight">
                {village.name}
                <ArrowUpRight
                  aria-hidden
                  className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </p>
              <p className="text-[11px] text-cream-200/90">
                {counts[village.slug] ? `${counts[village.slug]} things to do` : 'Explore'}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
