import Link from 'next/link';
import { CATEGORIES } from '@/lib/data/categories';
import { CategoryIcon } from '@/components/category-icon';
import { Reveal } from '@/components/reveal';
import { cn } from '@/lib/utils';

export function CategoryGrid({
  counts = {},
  showDescriptions = false,
}: {
  counts?: Record<string, number>;
  showDescriptions?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {CATEGORIES.map((category, i) => (
        <Reveal key={category.slug} as="li" delay={Math.min(i * 50, 350)}>
          <Link
            href={`/categories/${category.slug}`}
            className="group flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
          >
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110',
                category.accentClass,
              )}
            >
              <CategoryIcon name={category.icon} />
            </span>
            <span className="font-medium leading-tight">{category.name}</span>
            {showDescriptions ? (
              <span className="text-xs text-muted-foreground">{category.description}</span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {counts[category.slug] ? `${counts[category.slug]} listings` : 'Browse'}
              </span>
            )}
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
