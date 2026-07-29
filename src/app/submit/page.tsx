import type { Metadata } from 'next';
import { ClipboardCheck, Eye, Send } from 'lucide-react';
import { SubmitForm } from '@/components/submit-form';
import { VILLAGE_BY_SLUG } from '@/lib/data/villages';
import type { SearchParams } from '@/lib/filters';

export const metadata: Metadata = {
  title: 'Submit an activity',
  description:
    'Local business or community member? Add your Newton event, class, shop or gathering to ntactivity.space. Free, moderated within a few days.',
  alternates: { canonical: '/submit' },
};

const STEPS = [
  {
    icon: Send,
    title: 'You submit',
    body: 'Fill in the form below. Two minutes, no account required.',
  },
  {
    icon: ClipboardCheck,
    title: 'We review',
    body: 'A moderator checks the details are accurate and in Newton. Usually a few days.',
  },
  {
    icon: Eye,
    title: 'It goes live',
    body: 'Your listing appears on its village page, category page and in search.',
  },
];

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  // Village pages link here with ?village=… to pre-select the right village.
  const requested = Array.isArray(sp.village) ? sp.village[0] : sp.village;
  const defaultVillage = requested && VILLAGE_BY_SLUG.has(requested) ? requested : undefined;

  return (
    <div className="container py-10">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Submit an activity</h1>
        <p className="mt-3 text-muted-foreground">
          This site is written by locals. If you run something in Newton — an event, a class, a
          shop, a monthly gathering — add it here and we&apos;ll get it in front of neighbors.
        </p>
      </header>

      <ol className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="rounded-lg border border-border bg-card p-4 shadow-soft"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <step.icon className="size-4" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-semibold">
              {i + 1}. {step.title}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <SubmitForm defaultVillage={defaultVillage} />
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
        We only publish things happening in Newton. Commercial listings are welcome; spam and
        anything outside the city gets rejected.
      </p>
    </div>
  );
}
