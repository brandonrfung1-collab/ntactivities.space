import {
  Baby,
  Dumbbell,
  Palette,
  ShoppingBag,
  Sparkles,
  Trees,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/** Explicit map so lucide icons stay tree-shakeable (no dynamic imports). */
const ICONS: Record<string, LucideIcon> = {
  Trees,
  UtensilsCrossed,
  Palette,
  Baby,
  Wine,
  Dumbbell,
  Sparkles,
  ShoppingBag,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon aria-hidden className={cn('size-5', className)} />;
}
