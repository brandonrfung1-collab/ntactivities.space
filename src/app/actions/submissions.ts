'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { VILLAGES } from '@/lib/data/villages';
import { CATEGORIES } from '@/lib/data/categories';

const villageSlugs = VILLAGES.map((v) => v.slug) as [string, ...string[]];
const categorySlugs = CATEGORIES.map((c) => c.slug) as [string, ...string[]];

const submissionSchema = z
  .object({
    title: z.string().trim().min(4, 'Give your listing a title.').max(120),
    summary: z.string().trim().min(20, 'Add a one-line summary (20+ characters).').max(200),
    description: z.string().trim().min(40, 'Tell people what to expect (40+ characters).').max(4000),
    villageSlug: z.enum(villageSlugs, { message: 'Pick a Newton village.' }),
    categorySlug: z.enum(categorySlugs, { message: 'Pick a category.' }),
    address: z.string().trim().min(6, 'Add a street address.').max(200),
    priceType: z.enum(['free', 'paid', 'varies']),
    priceMin: z.string().optional(),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
    website: z.string().trim().url('That does not look like a URL.').or(z.literal('')).optional(),
    contactEmail: z.string().trim().email('We need a valid contact email.'),
  })
  .refine((d) => !(d.endAt && d.startAt && d.endAt < d.startAt), {
    message: 'The end time cannot be before the start time.',
    path: ['endAt'],
  });

export interface SubmitState {
  ok: boolean;
  message: string;
  /** Field-level errors keyed by input name, for inline display. */
  errors?: Record<string, string>;
}

export async function submitActivity(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = submissionSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      errors[key] ??= issue.message;
    }
    return { ok: false, message: 'Please fix the highlighted fields.', errors };
  }

  const d = parsed.data;
  const supabase = await createClient();
  if (!supabase) {
    // Demo mode: validation still runs so the form is fully exercisable.
    return {
      ok: true,
      message:
        'Looks good! This build is running without Supabase, so nothing was saved. Add your credentials to .env.local to accept real submissions.',
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('submissions').insert({
    title: d.title,
    summary: d.summary,
    description: d.description,
    village_slug: d.villageSlug,
    category_slug: d.categorySlug,
    address: d.address,
    price_type: d.priceType,
    price_min: d.priceMin ? Number(d.priceMin) : null,
    start_at: d.startAt || null,
    end_at: d.endAt || null,
    website: d.website || null,
    contact_email: d.contactEmail,
    submitted_by: user?.id ?? null,
    status: 'pending',
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  return {
    ok: true,
    message: 'Thanks! Your submission is in the queue — we review new listings within a few days.',
  };
}
