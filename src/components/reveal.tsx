'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Fades + lifts its children in the first time they cross into the viewport.
 * One IntersectionObserver per instance is cheap at the counts used on this
 * page (dozens, not hundreds); `prefers-reduced-motion` is handled globally
 * in globals.css, not here, so this stays a pure visibility toggle.
 */
export function Reveal({
  children,
  className,
  as: Tag = 'div',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'li';
  /** Stagger, in ms. Callers computing this for a list should cap it (e.g. `Math.min(i * 60, 480)`). */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={cn(
        'transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
