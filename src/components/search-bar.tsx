'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { VILLAGES } from '@/lib/data/villages';
import { CATEGORIES } from '@/lib/data/categories';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Hero search. Submits as a GET to /activities so results are shareable,
 * bookmarkable and server-rendered.
 */
export function SearchBar({
  className,
  defaultQuery = '',
  size = 'lg',
}: {
  className?: string;
  defaultQuery?: string;
  size?: 'lg' | 'sm';
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);
  const [village, setVillage] = useState('');
  const [category, setCategory] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (village) params.set('village', village);
    if (category) params.set('category', category);
    router.push(`/activities${params.size ? `?${params}` : ''}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={cn(
        'flex flex-col gap-2 rounded-2xl border border-border bg-card/90 p-2 shadow-lifted backdrop-blur',
        'sm:flex-row sm:items-center',
        className,
      )}
    >
      <label className="flex flex-1 items-center gap-2 px-2">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Search activities in Newton</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Crystal Lake, pizza, kids, hiking…"
          className={cn(
            'w-full bg-transparent outline-none placeholder:text-muted-foreground',
            size === 'lg' ? 'h-11 text-base' : 'h-9 text-sm',
          )}
        />
      </label>

      <div className="flex gap-2 sm:contents">
        <select
          value={village}
          onChange={(e) => setVillage(e.target.value)}
          aria-label="Filter by village"
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm sm:w-40 sm:flex-none"
        >
          <option value="">All villages</option>
          {VILLAGES.map((v) => (
            <option key={v.slug} value={v.slug}>
              {v.name}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm sm:w-44 sm:flex-none"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" size={size === 'lg' ? 'lg' : 'default'} className="sm:px-8">
        Search
      </Button>
    </form>
  );
}
