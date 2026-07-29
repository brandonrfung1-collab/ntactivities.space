import { MapPin, Navigation } from 'lucide-react';
import { mapDirectionsUrl, mapEmbedUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Keyless Google Maps embed. `output=embed` needs no API key, which keeps setup
 * to zero steps; swap in the Maps Embed API if you want styled maps later.
 */
export function MapEmbed({ address, title }: { address: string; title: string }) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-border shadow-soft">
        <iframe
          title={`Map showing ${title}`}
          src={mapEmbedUrl(address)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-[4/3] w-full sm:aspect-[16/9]"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {address}
        </p>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <a href={mapDirectionsUrl(address)} target="_blank" rel="noopener noreferrer">
            <Navigation aria-hidden />
            Directions
          </a>
        </Button>
      </div>
    </div>
  );
}
