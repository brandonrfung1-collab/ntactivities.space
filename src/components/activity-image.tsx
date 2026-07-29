'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * next/image wrapper with a graceful fallback.
 *
 * Seed photos are remote, and a dead URL should degrade to a pleasant tinted
 * panel rather than a broken-image icon — so we track load errors client-side.
 */
export function ActivityImage({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false,
  fill = true,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        aria-hidden
        className={cn(
          'h-full w-full bg-gradient-to-br from-forest-200 via-cream-200 to-maple-200',
          'dark:from-forest-800 dark:via-forest-900 dark:to-maple-900',
          className,
        )}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
