'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Heart, Leaf, Menu, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/activities', label: 'Things to do' },
  { href: '/villages', label: 'Villages' },
  { href: '/categories', label: 'Categories' },
  { href: '/activities?sort=soonest', label: 'This week' },
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

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-4" aria-hidden />
          </span>
          <span>
            nt<span className="text-primary">activity</span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                pathname === item.href.split('?')[0] && 'bg-secondary text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
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
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-sm font-medium hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
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
