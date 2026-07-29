import Link from 'next/link';
import { Compass } from 'lucide-react';
import { VillageGrid } from '@/components/village-grid';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-lg text-center">
        <Compass className="mx-auto mb-4 size-12 text-primary" aria-hidden />
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          That one&apos;s not on the map
        </h1>
        <p className="mt-3 text-muted-foreground">
          The page you were after doesn&apos;t exist — it may have moved, or the listing may have
          been taken down. Here are thirteen better ideas.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/activities">Browse everything</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="mb-5 text-center font-display text-xl font-bold">Explore by village</h2>
        <VillageGrid />
      </div>
    </div>
  );
}
