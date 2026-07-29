import type { Metadata } from 'next';
import { getCategoryCounts } from '@/lib/queries';
import { CategoryGrid } from '@/components/category-grid';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Browse by category',
  description:
    'Browse Newton, MA activities by category — Outdoors & Parks, Food & Drink, Arts & Culture, Family & Kids, Nightlife, Fitness, Seasonal & Holiday, and Shopping.',
  alternates: { canonical: '/categories' },
};

export default async function CategoriesPage() {
  const counts = await getCategoryCounts();

  return (
    <div className="container py-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Browse by category</h1>
        <p className="mt-3 text-muted-foreground">
          Eight ways into Newton, whether you want a trail, a table, a stage or a tree lighting.
        </p>
      </header>

      <div className="mt-10">
        <CategoryGrid counts={counts} showDescriptions />
      </div>
    </div>
  );
}
