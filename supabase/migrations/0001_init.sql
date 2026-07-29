-- ============================================================================
-- ntactivity.space — initial schema
-- Run with: supabase db push   (or paste into the Supabase SQL editor)
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ─── Enums ──────────────────────────────────────────────────────────────────
do $$ begin
  create type price_type as enum ('free', 'paid', 'varies');
exception when duplicate_object then null; end $$;

do $$ begin
  create type submission_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ─── profiles ───────────────────────────────────────────────────────────────
-- One row per auth user. `is_admin` gates the /admin dashboard and is only
-- writable by the service role (see the guard trigger below).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url  text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Mirror new auth users into profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Stop a user from granting themselves admin via the self-update policy.
create or replace function public.guard_is_admin()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and current_setting('request.jwt.claim.role', true) is distinct from 'service_role' then
    raise exception 'is_admin can only be changed by the service role';
  end if;
  return new;
end $$;

drop trigger if exists profiles_guard_is_admin on public.profiles;
create trigger profiles_guard_is_admin
  before update on public.profiles
  for each row execute function public.guard_is_admin();

-- Helper used by policies. SECURITY DEFINER so it can read profiles without
-- recursively triggering profiles' own RLS policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- ─── villages ───────────────────────────────────────────────────────────────
create table if not exists public.villages (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  tagline     text,
  description text,
  zip         text,
  lat         double precision not null,
  lng         double precision not null,
  image_url   text,
  fun_fact    text
);

-- ─── categories ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text,
  icon         text,
  accent_class text
);

-- ─── activities ─────────────────────────────────────────────────────────────
-- Holds both dated events (is_event = true) and standing places/venues.
create table if not exists public.activities (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  summary       text,
  description   text,
  village_slug  text not null references public.villages (slug) on update cascade,
  category_slug text not null references public.categories (slug) on update cascade,
  address       text,
  lat           double precision not null,
  lng           double precision not null,
  image_url     text,
  price_type    price_type not null default 'free',
  price_min     numeric(8, 2),
  price_max     numeric(8, 2),
  is_event      boolean not null default false,
  start_at      timestamptz,
  end_at        timestamptz,
  recurrence    text,
  website       text,
  phone         text,
  tags          text[] not null default '{}',
  featured      boolean not null default false,
  published     boolean not null default true,
  -- Denormalised aggregates, maintained by triggers below.
  rating_avg    numeric(3, 2) not null default 0,
  rating_count  integer not null default 0,
  view_count    integer not null default 0,
  save_count    integer not null default 0,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint activities_price_range check (price_max is null or price_min is null or price_max >= price_min),
  constraint activities_event_window check (end_at is null or start_at is null or end_at >= start_at)
);

create index if not exists activities_village_idx  on public.activities (village_slug);
create index if not exists activities_category_idx on public.activities (category_slug);
create index if not exists activities_start_idx    on public.activities (start_at) where is_event;
create index if not exists activities_published_idx on public.activities (published);
create index if not exists activities_tags_idx     on public.activities using gin (tags);
-- Full-text search over the headline fields, for when the dataset outgrows
-- in-memory filtering (see src/lib/queries.ts).
create index if not exists activities_fts_idx on public.activities
  using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(description, '')));

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists activities_touch on public.activities;
create trigger activities_touch before update on public.activities
  for each row execute function public.touch_updated_at();

-- ─── favorites ──────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  user_id     uuid not null references auth.users (id) on delete cascade,
  activity_id uuid not null references public.activities (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, activity_id)
);

create index if not exists favorites_activity_idx on public.favorites (activity_id);

-- Keep activities.save_count in sync.
create or replace function public.sync_save_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.activities set save_count = save_count + 1 where id = new.activity_id;
  elsif tg_op = 'DELETE' then
    update public.activities set save_count = greatest(save_count - 1, 0) where id = old.activity_id;
  end if;
  return null;
end $$;

drop trigger if exists favorites_sync_count on public.favorites;
create trigger favorites_sync_count
  after insert or delete on public.favorites
  for each row execute function public.sync_save_count();

-- ─── reviews ────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  author_name text,
  rating      smallint not null check (rating between 1 and 5),
  body        text,
  created_at  timestamptz not null default now(),
  -- One review per person per activity; edit instead of stacking.
  unique (activity_id, user_id)
);

create index if not exists reviews_activity_idx on public.reviews (activity_id);

create or replace function public.sync_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target uuid := coalesce(new.activity_id, old.activity_id);
begin
  update public.activities a
  set rating_avg = coalesce(r.avg, 0),
      rating_count = coalesce(r.cnt, 0)
  from (
    select avg(rating)::numeric(3,2) as avg, count(*) as cnt
    from public.reviews where activity_id = target
  ) r
  where a.id = target;
  return null;
end $$;

drop trigger if exists reviews_sync_rating on public.reviews;
create trigger reviews_sync_rating
  after insert or update or delete on public.reviews
  for each row execute function public.sync_rating();

-- ─── submissions (moderation queue) ─────────────────────────────────────────
create table if not exists public.submissions (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  summary        text,
  description    text,
  village_slug   text not null references public.villages (slug) on update cascade,
  category_slug  text not null references public.categories (slug) on update cascade,
  address        text,
  price_type     price_type not null default 'free',
  price_min      numeric(8, 2),
  start_at       timestamptz,
  end_at         timestamptz,
  website        text,
  contact_email  citext not null,
  submitted_by   uuid references auth.users (id) on delete set null,
  status         submission_status not null default 'pending',
  moderator_note text,
  reviewed_by    uuid references auth.users (id) on delete set null,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists submissions_status_idx on public.submissions (status, created_at desc);

-- ─── newsletter_subscribers ─────────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         citext unique not null,
  -- Optional interest targeting for the weekly digest.
  village_slug  text references public.villages (slug) on update cascade,
  confirmed     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ─── activity_views (raw analytics) ─────────────────────────────────────────
-- Append-only. `activities.view_count` is the rolled-up counter the dashboard
-- reads; this table exists for time-series questions later.
create table if not exists public.activity_views (
  id          bigint generated always as identity primary key,
  activity_id uuid not null references public.activities (id) on delete cascade,
  viewed_at   timestamptz not null default now(),
  referrer    text
);

create index if not exists activity_views_activity_idx on public.activity_views (activity_id, viewed_at desc);

-- Called from the activity detail page. SECURITY DEFINER so anonymous visitors
-- can bump the counter without write access to the tables themselves.
create or replace function public.record_activity_view(p_activity_id uuid, p_referrer text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.activity_views (activity_id, referrer) values (p_activity_id, p_referrer);
  update public.activities set view_count = view_count + 1 where id = p_activity_id;
end $$;

grant execute on function public.record_activity_view(uuid, text) to anon, authenticated;

-- Approve a submission: copy it into activities and mark it approved.
create or replace function public.approve_submission(p_submission_id uuid, p_slug text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  s public.submissions;
  new_id uuid;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  select * into s from public.submissions where id = p_submission_id;
  if not found then raise exception 'submission not found'; end if;

  insert into public.activities (
    slug, title, summary, description, village_slug, category_slug, address,
    lat, lng, price_type, price_min, is_event, start_at, end_at, website,
    created_by, published
  )
  select
    p_slug, s.title, s.summary, s.description, s.village_slug, s.category_slug, s.address,
    v.lat, v.lng, s.price_type, s.price_min, s.start_at is not null, s.start_at, s.end_at, s.website,
    s.submitted_by, true
  from public.villages v where v.slug = s.village_slug
  returning id into new_id;

  update public.submissions
  set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_submission_id;

  return new_id;
end $$;

grant execute on function public.approve_submission(uuid, text) to authenticated;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles               enable row level security;
alter table public.villages               enable row level security;
alter table public.categories             enable row level security;
alter table public.activities             enable row level security;
alter table public.favorites              enable row level security;
alter table public.reviews                enable row level security;
alter table public.submissions            enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.activity_views         enable row level security;

-- profiles: read your own row (and admins read all); update only your own.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- villages / categories: public reference data, admin-managed.
drop policy if exists villages_read on public.villages;
create policy villages_read on public.villages for select using (true);

drop policy if exists villages_write on public.villages;
create policy villages_write on public.villages for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select using (true);

drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- activities: anyone reads published rows; admins read and write everything.
drop policy if exists activities_read_published on public.activities;
create policy activities_read_published on public.activities
  for select using (published or public.is_admin());

drop policy if exists activities_admin_write on public.activities;
create policy activities_admin_write on public.activities for all
  using (public.is_admin()) with check (public.is_admin());

-- favorites: strictly private to their owner.
drop policy if exists favorites_own on public.favorites;
create policy favorites_own on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reviews: world-readable, but you may only write your own.
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select using (true);

drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own on public.reviews for insert
  with check (user_id = auth.uid());

drop policy if exists reviews_update_own on public.reviews;
create policy reviews_update_own on public.reviews for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists reviews_delete_own_or_admin on public.reviews;
create policy reviews_delete_own_or_admin on public.reviews for delete
  using (user_id = auth.uid() or public.is_admin());

-- submissions: anyone (including anonymous) may submit; only the submitter and
-- admins can read; only admins can moderate.
drop policy if exists submissions_insert_any on public.submissions;
create policy submissions_insert_any on public.submissions for insert
  with check (status = 'pending' and (submitted_by is null or submitted_by = auth.uid()));

drop policy if exists submissions_select_own_or_admin on public.submissions;
create policy submissions_select_own_or_admin on public.submissions for select
  using (submitted_by = auth.uid() or public.is_admin());

drop policy if exists submissions_admin_update on public.submissions;
create policy submissions_admin_update on public.submissions for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists submissions_admin_delete on public.submissions;
create policy submissions_admin_delete on public.submissions for delete
  using (public.is_admin());

-- newsletter: write-only for the public (no reading the mailing list).
drop policy if exists newsletter_insert_any on public.newsletter_subscribers;
create policy newsletter_insert_any on public.newsletter_subscribers for insert
  with check (true);

drop policy if exists newsletter_admin_read on public.newsletter_subscribers;
create policy newsletter_admin_read on public.newsletter_subscribers for select
  using (public.is_admin());

-- activity_views: written only through record_activity_view(); admins can read.
drop policy if exists activity_views_admin_read on public.activity_views;
create policy activity_views_admin_read on public.activity_views for select
  using (public.is_admin());
