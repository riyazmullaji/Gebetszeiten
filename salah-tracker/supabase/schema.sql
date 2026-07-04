-- ============================================================
-- Gebetszeiten 2026 — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Observers (name-only registration, no Supabase Auth required)
create table if not exists observers (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  created_at  timestamptz default now()
);

-- Observations
create table if not exists observations (
  id              uuid        primary key default gen_random_uuid(),
  date            date        not null,
  prayer          text        not null check (prayer in ('fajr', 'isha')),
  observed_time   time        not null,
  entry_type      text        not null check (entry_type in ('observed', 'interpolated')),
  sky_condition   text        check (sky_condition in ('clear', 'hazy', 'partly_cloudy')),
  notes           text,
  photo_url       text,
  observer_id     uuid        references observers(id) on delete set null,
  is_invalidated  boolean     not null default false,
  created_at      timestamptz default now()
);

create index if not exists observations_date_prayer_idx
  on observations (date, prayer);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table observers   enable row level security;
alter table observations enable row level security;

-- Public read
create policy "public_read_observers"
  on observers for select using (true);

create policy "public_read_observations"
  on observations for select using (true);

-- Public insert (anyone can register a name / submit an entry)
create policy "public_insert_observers"
  on observers for insert with check (true);

create policy "public_insert_observations"
  on observations for insert with check (true);

-- Admin DELETE / UPDATE — service role key bypasses RLS,
-- but add permissive policies as a fallback so the anon key
-- is never silently blocked on these operations.
create policy "service_delete_observations"
  on observations for delete using (true);

create policy "service_update_observations"
  on observations for update using (true);

-- ============================================================
-- Storage bucket for photos
-- ============================================================

-- Run this in the Supabase dashboard: Storage → New bucket
-- Bucket name: observation-photos
-- Public: true (so photos can be displayed without auth)
