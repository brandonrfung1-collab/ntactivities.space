'use client';

import { useActionState, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitActivity, type SubmitState } from '@/app/actions/submissions';
import { VILLAGES } from '@/lib/data/villages';
import { CATEGORIES } from '@/lib/data/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const initial: SubmitState = { ok: false, message: '' };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

/** Public submission form. Everything lands in the moderation queue as pending. */
export function SubmitForm({ defaultVillage }: { defaultVillage?: string }) {
  const [state, formAction, pending] = useActionState(submitActivity, initial);
  const [priceType, setPriceType] = useState('free');
  const errors = state.errors ?? {};

  if (state.ok) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-10 text-primary" aria-hidden />
        <h2 className="font-display text-xl font-semibold">Submission received</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{state.message}</p>
        <Button asChild variant="outline" className="mt-5">
          <a href="/submit">Submit another</a>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="space-y-4" disabled={pending}>
        <legend className="sr-only">About the activity</legend>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" required maxLength={120} placeholder="Waban Winter Market" />
          <FieldError message={errors.title} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="summary">One-line summary *</Label>
          <Input
            id="summary"
            name="summary"
            required
            maxLength={200}
            placeholder="Twenty local makers, hot cider, and a brass quintet in the square."
          />
          <p className="text-xs text-muted-foreground">This is what shows on listing cards.</p>
          <FieldError message={errors.summary} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Full description *</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={6}
            maxLength={4000}
            placeholder="What is it, who is it for, what should people know before they go? Parking, accessibility, best time to arrive…"
          />
          <FieldError message={errors.description} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="villageSlug">Village *</Label>
            <Select id="villageSlug" name="villageSlug" required defaultValue={defaultVillage ?? ''}>
              <option value="" disabled>
                Choose a village
              </option>
              {VILLAGES.map((v) => (
                <option key={v.slug} value={v.slug}>
                  {v.name}
                </option>
              ))}
            </Select>
            <FieldError message={errors.villageSlug} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categorySlug">Category *</Label>
            <Select id="categorySlug" name="categorySlug" required defaultValue="">
              <option value="" disabled>
                Choose a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
            <FieldError message={errors.categorySlug} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Street address *</Label>
          <Input
            id="address"
            name="address"
            required
            placeholder="1200 Beacon Street, Newton Highlands, MA 02461"
          />
          <FieldError message={errors.address} />
        </div>
      </fieldset>

      <fieldset className="space-y-4" disabled={pending}>
        <legend className="mb-1 text-sm font-semibold">When &amp; how much</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="startAt">Starts (leave blank for an ongoing place)</Label>
            <Input id="startAt" name="startAt" type="datetime-local" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endAt">Ends</Label>
            <Input id="endAt" name="endAt" type="datetime-local" />
            <FieldError message={errors.endAt} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="priceType">Price *</Label>
            <Select
              id="priceType"
              name="priceType"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="varies">Varies</option>
            </Select>
          </div>
          {priceType === 'paid' && (
            <div className="space-y-1.5">
              <Label htmlFor="priceMin">Starting price (USD)</Label>
              <Input id="priceMin" name="priceMin" type="number" min="0" step="1" placeholder="15" />
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4" disabled={pending}>
        <legend className="mb-1 text-sm font-semibold">Contact</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" placeholder="https://example.com" />
            <FieldError message={errors.website} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactEmail">Your email *</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
            <p className="text-xs text-muted-foreground">
              Only used if we have a question. Never published.
            </p>
            <FieldError message={errors.contactEmail} />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Submitting…' : 'Submit for review'}
        </Button>
        <p className="text-xs text-muted-foreground">
          A moderator reviews every submission — usually within a few days.
        </p>
      </div>

      {state.message && !state.ok && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
