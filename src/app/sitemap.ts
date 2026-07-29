import type { MetadataRoute } from 'next';
import { VILLAGES } from '@/lib/data/villages';
import { CATEGORIES } from '@/lib/data/categories';
import { getActivities } from '@/lib/queries';
import { SITE_URL } from '@/lib/supabase/config';

export const revalidate = 3600;

/** Full sitemap: static pages + all 13 villages + 8 categories + every listing. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const activities = await getActivities();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/activities`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/villages`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/submit`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  return [
    ...staticPages,
    ...VILLAGES.map((v) => ({
      url: `${SITE_URL}/villages/${v.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/categories/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...activities.map((a) => ({
      url: `${SITE_URL}/activities/${a.slug}`,
      lastModified: now,
      // Dated events change more often than standing places.
      changeFrequency: (a.isEvent ? 'daily' : 'monthly') as 'daily' | 'monthly',
      priority: a.featured ? 0.8 : 0.6,
    })),
  ];
}
