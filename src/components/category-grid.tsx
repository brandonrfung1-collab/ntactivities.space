import Link from 'next/link';
import { CATEGORIES } from '@/lib/data/categories';
import { CategoryIcon } from '@/components/category-icon';
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
      {CATEGORIES.map((category) => (
        <li key={category.slug}>
          <Link
            href={`/categories/${category.slug}`}
            className="flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lifted"
          >
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-lg',
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
        </li>
      ))}
    </ul>
  );
}
