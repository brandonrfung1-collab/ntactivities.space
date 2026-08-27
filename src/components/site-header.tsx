'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Compass, Heart, LayoutGrid, Leaf, MapPinned, Menu, Plus, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/activities', label: 'Things to do', icon: Compass },
  { href: '/villages', label: 'Villages', icon: MapPinned },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/activities?sort=soonest', label: 'This week', icon: Sparkles },
];

export function SiteHeader({
  userEmail,
  isAdmin = false,
}: {
  userEmail: string | null;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  // Read the query string client-side only, so prerendering never depends on it.
  useEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);

  const isActive = (href: string) => {
    const [path, query] = href.split('?');
    if (pathname !== path) return false;
    const isSoonest = new URLSearchParams(search).get('sort') === 'soonest';
    return query ? isSoonest : !isSoonest;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-4 md:h-20">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-4" aria-hidden />
          </span>
          <span>
            nt<span className="text-primary">activity</span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-2 hidden items-stretch gap-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex flex-col items-center gap-1 px-3.5 pb-2.5 pt-2 text-muted-foreground transition-colors',
                  active ? 'text-foreground' : 'hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-5 transition-transform duration-200 ease-out',
                    active ? 'scale-100' : 'scale-95 group-hover:scale-105',
                  )}
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                <span className={cn('text-xs font-medium', active && 'font-semibold')}>
                  {item.label}
                </span>
                <span
                  className={cn(
                    'absolute -bottom-px left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-foreground transition-all duration-200 ease-out',
                    active ? 'w-7 opacity-100' : 'w-0 opacity-0 group-hover:w-7 group-hover:bg-muted-foreground/50 group-hover:opacity-100',
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="icon" aria-label="Saved activities">
            <Link href="/favorites">
              <Heart aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/submit">
              <Plus aria-hidden />
              Submit
            </Link>
          </Button>
          {isAdmin && (
            <Button asChild variant="ghost">
              <Link href="/admin">Admin</Link>
            </Button>
          )}
          {userEmail ? (
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="secondary" title={userEmail}>
                Sign out
              </Button>
            </form>
          ) : (
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="ml-auto rounded-md p-2 hover:bg-secondary md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav aria-label="Mobile" className="container flex flex-col py-2">
            {NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2 py-3 text-sm font-medium hover:bg-secondary',
                    active && 'bg-secondary text-foreground',
                  )}
                >
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-sm font-medium hover:bg-secondary"
            >
              Saved
            </Link>
            <Link
              href="/submit"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-sm font-medium hover:bg-secondary"
            >
              Submit an activity
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-sm font-medium hover:bg-secondary"
              >
                Admin dashboard
              </Link>
            )}
            <div className="py-2">
              {userEmail ? (
                <form action="/auth/signout" method="post">
                  <Button type="submit" variant="secondary" className="w-full">
                    Sign out ({userEmail})
                  </Button>
                </form>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
