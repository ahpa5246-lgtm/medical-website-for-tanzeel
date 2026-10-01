-- Minimal relational foundation required by the learning-lab quota migration.
-- This file exists because the original quota migration assumed these tables
-- had already been created manually outside the committed migration history.
-- Keep this foundation deliberately narrow to avoid colliding with the newer
-- production profiles/consultations schema.

create extension if not exists pgcrypto;

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  specialty text,
  difficulty text,
  type text not null,
  xp_reward integer not null default 0,
  asset_url text,
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'published', 'rejected'))
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'learning_hub_monthly',
  status text not null default 'active'
    check (status in ('active', 'expired', 'canceled', 'pending_renewal')),
  current_period_end date,
  provider text,
  provider_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_lab_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  seconds_used integer not null default 0,
  primary key (user_id, usage_date)
);

create index if not exists subscriptions_user_status_idx
  on public.subscriptions (user_id, status, current_period_end);
