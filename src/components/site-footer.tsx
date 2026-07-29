import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { VILLAGES } from '@/lib/data/villages';
import { CATEGORIES } from '@/lib/data/categories';
import { NewsletterForm } from '@/components/newsletter-form';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="size-4" aria-hidden />
              </span>
              nt<span className="-ml-2 text-primary">activity</span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              Everything worth doing in Newton, Massachusetts — all thirteen villages, from Crystal
              Lake to Echo Bridge. Built by neighbors.
            </p>
            <div className="max-w-md">
              <p className="mb-2 text-sm font-medium">What’s happening in Newton, weekly</p>
              <NewsletterForm />
            </div>
          </div>

          <nav aria-label="Villages">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Villages
            </h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {VILLAGES.map((v) => (
                <li key={v.slug}>
                  <Link
                    href={`/villages/${v.slug}`}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {v.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Categories">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Browse
            </h2>
            <ul className="space-y-1.5 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link href="/submit" className="font-medium text-primary hover:underline">
                  Submit an activity →
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ntactivity.space · Newton, Massachusetts</p>
          <p>
            Listings are community-submitted. Always double-check hours and prices before you go.
          </p>
        </div>
      </div>
    </footer>
  );
}
