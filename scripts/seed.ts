/**
 * Seed script — `npm run seed`
 *
 * Single source of truth for sample data is src/lib/data/*.ts. This script:
 *   1. Always writes `supabase/seed.sql` (idempotent upserts) so you can paste
 *      it into the Supabase SQL editor or run it with `supabase db reset`.
 *   2. If SUPABASE_SERVICE_ROLE_KEY is present, also pushes the rows directly
 *      via the Supabase REST API.
 *
 * Safe to re-run: everything is an upsert keyed on `slug`.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { VILLAGES } from '../src/lib/data/villages';
import { CATEGORIES } from '../src/lib/data/categories';
import { ACTIVITIES } from '../src/lib/data/activities';

const ROOT = process.cwd();

/** Minimal .env.local reader — avoids a dotenv dependency for one script. */
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const path = join(ROOT, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  }
}

/** Quote a value as a Postgres literal. */
function sql(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) {
    return `ARRAY[${value.map((v) => sql(v)).join(', ')}]::text[]`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildSql(): string {
  const lines: string[] = [
    '-- ============================================================',
    '-- GENERATED FILE — do not edit by hand.',
    '-- Regenerate with: npm run seed',
    '-- Source of truth: src/lib/data/{villages,categories,activities}.ts',
    '-- ============================================================',
    '',
    'begin;',
    '',
    '-- ─── villages ───────────────────────────────────────────────',
  ];

  for (const v of VILLAGES) {
    lines.push(
      `insert into public.villages (slug, name, tagline, description, zip, lat, lng, image_url, fun_fact) values (` +
        [v.slug, v.name, v.tagline, v.description, v.zip, v.lat, v.lng, v.imageUrl, v.funFact]
          .map(sql)
          .join(', ') +
        `)\non conflict (slug) do update set name = excluded.name, tagline = excluded.tagline, ` +
        `description = excluded.description, zip = excluded.zip, lat = excluded.lat, lng = excluded.lng, ` +
        `image_url = excluded.image_url, fun_fact = excluded.fun_fact;`,
    );
  }

  lines.push('', '-- ─── categories ─────────────────────────────────────────────');
  for (const c of CATEGORIES) {
    lines.push(
      `insert into public.categories (slug, name, description, icon, accent_class) values (` +
        [c.slug, c.name, c.description, c.icon, c.accentClass].map(sql).join(', ') +
        `)\non conflict (slug) do update set name = excluded.name, description = excluded.description, ` +
        `icon = excluded.icon, accent_class = excluded.accent_class;`,
    );
  }

  lines.push('', '-- ─── activities ─────────────────────────────────────────────');
  for (const a of ACTIVITIES) {
    const cols = [
      'slug',
      'title',
      'summary',
      'description',
      'village_slug',
      'category_slug',
      'address',
      'lat',
      'lng',
      'image_url',
      'price_type',
      'price_min',
      'price_max',
      'is_event',
      'start_at',
      'end_at',
      'recurrence',
      'website',
      'phone',
      'tags',
      'featured',
      'rating_avg',
      'rating_count',
      'view_count',
      'save_count',
    ];
    const values = [
      a.slug,
      a.title,
      a.summary,
      a.description,
      a.villageSlug,
      a.categorySlug,
      a.address,
      a.lat,
      a.lng,
      a.imageUrl,
      a.priceType,
      a.priceMin,
      a.priceMax,
      a.isEvent,
      a.startAt,
      a.endAt,
      a.recurrence,
      a.website,
      a.phone,
      a.tags,
      a.featured,
      a.ratingAvg,
      a.ratingCount,
      a.viewCount,
      a.saveCount,
    ];

    // price_type is an enum; the rest cast implicitly.
    const rendered = values.map((v, i) =>
      cols[i] === 'price_type' ? `${sql(v)}::price_type` : sql(v),
    );

    lines.push(
      `insert into public.activities (${cols.join(', ')}) values (${rendered.join(', ')})\n` +
        `on conflict (slug) do update set ` +
        cols
          .filter((c) => c !== 'slug')
          .map((c) => `${c} = excluded.${c}`)
          .join(', ') +
        `;`,
    );
  }

  lines.push('', 'commit;', '');
  return lines.join('\n');
}

/** Push rows straight to Supabase using the service-role key. */
async function pushToSupabase(url: string, key: string) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const steps: Array<[string, () => Promise<{ error: { message: string } | null }>]> = [
    [
      'villages',
      async () =>
        supabase.from('villages').upsert(
          VILLAGES.map((v) => ({
            slug: v.slug,
            name: v.name,
            tagline: v.tagline,
            description: v.description,
            zip: v.zip,
            lat: v.lat,
            lng: v.lng,
            image_url: v.imageUrl,
            fun_fact: v.funFact,
          })),
          { onConflict: 'slug' },
        ),
    ],
    [
      'categories',
      async () =>
        supabase.from('categories').upsert(
          CATEGORIES.map((c) => ({
            slug: c.slug,
            name: c.name,
            description: c.description,
            icon: c.icon,
            accent_class: c.accentClass,
          })),
          { onConflict: 'slug' },
        ),
    ],
    [
      'activities',
      async () =>
        supabase.from('activities').upsert(
          ACTIVITIES.map((a) => ({
            slug: a.slug,
            title: a.title,
            summary: a.summary,
            description: a.description,
            village_slug: a.villageSlug,
            category_slug: a.categorySlug,
            address: a.address,
            lat: a.lat,
            lng: a.lng,
            image_url: a.imageUrl,
            price_type: a.priceType,
            price_min: a.priceMin,
            price_max: a.priceMax,
            is_event: a.isEvent,
            start_at: a.startAt,
            end_at: a.endAt,
            recurrence: a.recurrence,
            website: a.website,
            phone: a.phone,
            tags: a.tags,
            featured: a.featured,
            rating_avg: a.ratingAvg,
            rating_count: a.ratingCount,
            view_count: a.viewCount,
            save_count: a.saveCount,
          })),
          { onConflict: 'slug' },
        ),
    ],
  ];

  for (const [name, run] of steps) {
    const { error } = await run();
    if (error) {
      console.error(`  ✗ ${name}: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    console.log(`  ✓ ${name}`);
  }
}

async function main() {
  loadEnv();

  const outPath = join(ROOT, 'supabase', 'seed.sql');
  writeFileSync(outPath, buildSql(), 'utf8');
  console.log(
    `Wrote ${VILLAGES.length} villages, ${CATEGORIES.length} categories, ` +
      `${ACTIVITIES.length} activities → supabase/seed.sql`,
  );

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log(
      '\nNo NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY found — skipping direct push.\n' +
        'Run the migration first, then paste supabase/seed.sql into the Supabase SQL editor.',
    );
    return;
  }

  console.log('\nPushing to Supabase…');
  await pushToSupabase(url, key);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
