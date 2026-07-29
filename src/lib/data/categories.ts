import type { Category } from '@/lib/types';

/** The eight browse categories. `icon` maps to a lucide-react component. */
export const CATEGORIES: Category[] = [
  {
    slug: 'outdoors-parks',
    name: 'Outdoors & Parks',
    description:
      'Trails, ponds, playgrounds and conservation land — from Crystal Lake to Hemlock Gorge.',
    icon: 'Trees',
    accentClass: 'bg-forest-100 text-forest-700 dark:bg-forest-900 dark:text-forest-200',
  },
  {
    slug: 'food-drink',
    name: 'Food & Drink',
    description: 'Village-center restaurants, bakeries, coffee, farmstands and ice cream.',
    icon: 'UtensilsCrossed',
    accentClass: 'bg-maple-100 text-maple-700 dark:bg-maple-900 dark:text-maple-200',
  },
  {
    slug: 'arts-culture',
    name: 'Arts & Culture',
    description: 'Theatre, galleries, live music, historic houses and the library.',
    icon: 'Palette',
    accentClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
  },
  {
    slug: 'family-kids',
    name: 'Family & Kids',
    description: 'Playgrounds, story hours, farm programs and rainy-day escapes.',
    icon: 'Baby',
    accentClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  },
  {
    slug: 'nightlife',
    name: 'Nightlife',
    description: 'Late dinners, cocktail bars, trivia nights and live sets.',
    icon: 'Wine',
    accentClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  },
  {
    slug: 'fitness',
    name: 'Fitness',
    description: 'Studios, pools, run clubs, tennis, and outdoor bootcamps.',
    icon: 'Dumbbell',
    accentClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  },
  {
    slug: 'seasonal-events',
    name: 'Seasonal & Holiday',
    description: 'Village festivals, tree lightings, harvest fairs and Fourth of July.',
    icon: 'Sparkles',
    accentClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
  },
  {
    slug: 'shopping',
    name: 'Shopping',
    description: 'Independent bookshops, boutiques, markets and The Street.',
    icon: 'ShoppingBag',
    accentClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200',
  },
];

export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): Category | undefined {
  return CATEGORY_BY_SLUG.get(slug);
}
