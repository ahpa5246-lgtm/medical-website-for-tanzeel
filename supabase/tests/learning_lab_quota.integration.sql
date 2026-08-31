\set ON_ERROR_STOP on

-- Isolated PostgreSQL proof for the Supabase quota contract. This test creates
-- only disposable fixtures, applies the real migration, and rolls everything
-- back. It never connects to a live Supabase project or uses real user data.
begin;

create schema auth;
create role anon nologin;
create role authenticated nologin;

create type public.content_status as enum (
  'draft',
  'pending_review',
  'published',
  'rejected'
);
create type public.subscription_status as enum (
  'active',
  'expired',
  'canceled',
  'pending_renewal'
);

create table public.users (
  id uuid primary key
);

create table public.learning_modules (
  id uuid primary key,
  title text not null,
  status public.content_status not null default 'draft'
);

create table public.subscriptions (
  id uuid primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  status public.subscription_status not null default 'active',
  current_period_end date
);

create table public.daily_lab_usage (
  user_id uuid not null references public.users(id) on delete cascade,
  usage_date date not null,
  seconds_used integer not null default 0,
  primary key (user_id, usage_date)
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

\ir ../migrations/20260831160000_learning_lab_quota.sql

-- The override can only shorten the production cap. Two seconds keeps this
-- integration proof fast while exercising server-clock accounting.
set local app.lab_daily_limit_seconds = '2';

insert into public.users (id)
values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');

insert into public.learning_modules (id, title, status)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Fictional integration fixture',
  'published'
);

insert into public.subscriptions (
  id,
  user_id,
  status,
  current_period_end
)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '22222222-2222-4222-8222-222222222222',
  'active',
  '2099-01-01'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '11111111-1111-4111-8111-111111111111',
  true
);

do $test$
declare
  v_remaining integer;
  v_count integer;
begin
  v_remaining := public.start_lab_session();
  if v_remaining <> 2 then
    raise exception 'expected fresh free session to have 2 seconds, got %',
      v_remaining;
  end if;

  perform pg_sleep(1.1);

  -- Starting again models a refresh or a second tab. The previous lease must
  -- accrue before the server reopens it; the client cannot reset the quota.
  v_remaining := public.start_lab_session();
  if v_remaining < 0 or v_remaining > 1 then
    raise exception 'refresh/new-tab reset quota: remaining %', v_remaining;
  end if;

  select count(*)
    into v_count
  from public.get_lab_module_content(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  );
  if v_count <> 1 then
    raise exception 'live free session did not return published module';
  end if;

  perform pg_sleep(1.1);
  v_remaining := public.record_lab_heartbeat(1);
  if v_remaining <> 0 then
    raise exception 'expected exhausted quota to return 0, got %', v_remaining;
  end if;

  begin
    perform *
    from public.get_lab_module_content(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    );
    raise exception 'module content remained available after quota exhaustion';
  exception
    when sqlstate '54000' then
      null;
  end;

  v_remaining := public.start_lab_session();
  if v_remaining <> 0 then
    raise exception 'new tab reopened exhausted quota: remaining %',
      v_remaining;
  end if;
end
$test$;

-- A subscribed fixture bypasses only the lab cap, not authentication.
select set_config(
  'request.jwt.claim.sub',
  '22222222-2222-4222-8222-222222222222',
  true
);

do $test$
declare
  v_remaining integer;
  v_count integer;
begin
  v_remaining := public.start_lab_session();
  if v_remaining <> -1 then
    raise exception 'active subscription should return -1, got %', v_remaining;
  end if;

  select count(*)
    into v_count
  from public.get_lab_module_content(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  );
  if v_count <> 1 then
    raise exception 'subscribed fixture could not read published module';
  end if;
end
$test$;

-- Authentication remains mandatory even for an otherwise valid RPC call.
select set_config('request.jwt.claim.sub', '', true);

do $test$
begin
  perform public.start_lab_session();
  raise exception 'anonymous session unexpectedly started';
exception
  when sqlstate '42501' then
    null;
end
$test$;

reset role;
rollback;
