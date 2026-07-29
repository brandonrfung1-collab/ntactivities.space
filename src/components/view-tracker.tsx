'use client';

import { useEffect, useRef } from 'react';

/**
 * Records one page view per mount. Fire-and-forget: the detail page is statically
 * generated, so counting has to happen from the client. Failures are silent —
 * analytics must never break the page.
 */
export function ViewTracker({ activityId }: { activityId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const controller = new AbortController();
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityId, referrer: document.referrer || null }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {});

    return () => controller.abort();
  }, [activityId]);

  return null;
}
