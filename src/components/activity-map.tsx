'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Activity } from '@/lib/types';
import { getVillage } from '@/lib/data/villages';
import { cn } from '@/lib/utils';

// Newton, MA town center — used only as a fallback view when nothing plots.
const NEWTON_CENTER: [number, number] = [42.337, -71.209];

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/**
 * Keyless multi-pin map (Leaflet + OpenStreetMap tiles — no API key, unlike
 * Google/Mapbox, which keeps the zero-credential demo-mode contract intact).
 * Client-only: Leaflet touches `window` at import time, so it's dynamically
 * imported inside the effect rather than at module scope.
 */
export function ActivityMap({ activities, className }: { activities: Activity[]; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        // Default marker icon assets don't resolve through bundlers; point at the CDN instead.
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        mapRef.current = L.map(containerRef.current, { scrollWheelZoom: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      const points = activities.filter((a) => a.lat && a.lng);
      for (const a of points) {
        const village = getVillage(a.villageSlug);
        const marker = L.marker([a.lat, a.lng]).addTo(map);
        marker.bindPopup(
          `<div style="min-width:170px"><strong>${escapeHtml(a.title)}</strong><br/>` +
            `<span style="color:#666">${escapeHtml(village?.name ?? '')}</span><br/>` +
            `<a href="/activities/${a.slug}" style="color:#2f6b3c;font-weight:600">View details &rarr;</a></div>`,
        );
        markersRef.current.push(marker);
      }

      if (points.length) {
        const bounds = L.featureGroup(markersRef.current).getBounds();
        map.fitBounds(bounds.pad(0.15), { maxZoom: 15 });
      } else {
        map.setView(NEWTON_CENTER, 12);
      }

      // Container may have been hidden (e.g. behind a list/map tab) when sized.
      setTimeout(() => map.invalidateSize(), 0);
    })();

    return () => {
      cancelled = true;
    };
  }, [activities]);

  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className={cn('bg-muted', className)}
      role="img"
      aria-label={`Map showing ${activities.length} ${activities.length === 1 ? 'activity' : 'activities'}`}
    />
  );
}
