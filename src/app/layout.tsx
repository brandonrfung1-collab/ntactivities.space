import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getCurrentUser, isCurrentUserAdmin } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/supabase/config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Fraunces gives headings a warm, slightly bookish New England feel.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['SOFT'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ntactivity — Things to do in Newton, Massachusetts',
    template: '%s · ntactivity',
  },
  description:
    'Discover events, restaurants, parks and hidden gems across all 13 villages of Newton, MA. Filter by village, category, date and price.',
  keywords: [
    'Newton MA things to do',
    'Newton Massachusetts events',
    'Newton villages',
    'Crystal Lake Newton',
    'Newton restaurants',
    'family activities Newton MA',
  ],
  authors: [{ name: 'ntactivity.space' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'ntactivity.space',
    title: 'Things to do in Newton, Massachusetts',
    description:
      'Events, restaurants, parks and hidden gems across all 13 Newton villages — searchable by village, category, date and price.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Things to do in Newton, Massachusetts',
    description: 'Discover activities across all 13 villages of Newton, MA.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f0' },
    { media: '(prefers-color-scheme: dark)', color: '#12201a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Header needs auth state; both calls no-op to null/false in demo mode.
  const user = await getCurrentUser();
  const admin = await isCurrentUserAdmin();

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SiteHeader userEmail={user?.email ?? null} isAdmin={admin} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
