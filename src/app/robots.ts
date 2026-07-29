import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/supabase/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private / per-user routes have no SEO value and shouldn't be crawled.
        disallow: ['/admin', '/favorites', '/login', '/signup', '/auth/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
