-- Interactive Learning Hub quota enforcement.
-- Safe pilot contract: uses the existing relational tables, server time, and auth.uid().
-- In a non-production Supabase test project only, an administrator may set
-- app.lab_daily_limit_seconds=120 to prove the short-cap flow. Production
-- leaves that setting unset and therefore uses 3600 seconds.
--
-- This migration does not enable payments or publish clinical content.

alter table public.daily_lab_usage
  add column if not exists last_heartbeat_at timestamptz,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists session_open boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_lab_usage_seconds_nonnegative'
      and conrelid = 'public.daily_lab_usage'::regclass
  ) then
    alter table public.daily_lab_usage
      add constraint daily_lab_usage_seconds_nonnegative
      check (seconds_used >= 0);
  end if;
end
$$;

alter table public.daily_lab_usage enable row level security;

revoke all on table public.daily_lab_usage from anon, authenticated;
revoke all on table public.subscriptions from anon, authenticated;

create or replace function public._lab_daily_limit_seconds()
returns integer
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_setting text := current_setting('app.lab_daily_limit_seconds', true);
  v_limit integer := 3600;
begin
  if v_setting is not null and btrim(v_setting) <> '' then
    begin
      v_limit := v_setting::integer;
    exception
      when invalid_text_representation then
        raise exception 'app.lab_daily_limit_seconds must be an integer';
    end;
  end if;

  -- The test override can make the cap shorter, never longer than production.
  return least(3600, greatest(1, v_limit));
end
$$;

create or replace function public._lab_has_active_subscription(
  p_user uuid,
  p_today date
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.subscriptions
    where user_id = p_user
      and status = 'active'
      and current_period_end is not null
      and current_period_end >= p_today
  );
$$;

create or replace function public._accrue_lab_usage(
  p_user uuid,
  p_today date,
  p_now timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_used integer;
  v_last timestamptz;
  v_lease timestamptz;
  v_open boolean;
  v_delta integer := 0;
  v_limit integer := public._lab_daily_limit_seconds();
begin
  select seconds_used, last_heartbeat_at, lease_expires_at, session_open
    into v_used, v_last, v_lease, v_open
  from public.daily_lab_usage
  where user_id = p_user and usage_date = p_today
  for update;

  if not found then
    return 0;
  end if;

  if v_open and v_last is not null and v_lease is not null and p_now > v_last then
    v_delta := greatest(
      0,
      floor(extract(epoch from (least(p_now, v_lease) - v_last)))::integer
    );
  end if;

  v_used := least(v_limit, v_used + v_delta);

  update public.daily_lab_usage
  set seconds_used = v_used,
      last_heartbeat_at = case
        when v_open and v_lease is not null then least(p_now, v_lease)
        else last_heartbeat_at
      end,
      session_open = (
        v_open
        and v_lease is not null
        and v_lease > p_now
        and v_used < v_limit
      )
  where user_id = p_user and usage_date = p_today;

  return v_used;
end
$$;

create or replace function public.get_lab_quota_status()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (clock_timestamp() at time zone 'Asia/Baghdad')::date;
  v_now timestamptz := clock_timestamp();
  v_used integer := 0;
begin
  if v_user is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  if public._lab_has_active_subscription(v_user, v_today) then
    return -1;
  end if;

  perform public._accrue_lab_usage(v_user, v_today, v_now);

  select coalesce(seconds_used, 0)
    into v_used
  from public.daily_lab_usage
  where user_id = v_user and usage_date = v_today;

  return greatest(0, public._lab_daily_limit_seconds() - coalesce(v_used, 0));
end
$$;

create or replace function public.start_lab_session()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (clock_timestamp() at time zone 'Asia/Baghdad')::date;
  v_now timestamptz := clock_timestamp();
  v_used integer;
  v_limit integer := public._lab_daily_limit_seconds();
begin
  if v_user is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  if public._lab_has_active_subscription(v_user, v_today) then
    return -1;
  end if;

  insert into public.daily_lab_usage (user_id, usage_date, seconds_used)
  values (v_user, v_today, 0)
  on conflict (user_id, usage_date) do nothing;

  perform public._accrue_lab_usage(v_user, v_today, v_now);

  select seconds_used
    into v_used
  from public.daily_lab_usage
  where user_id = v_user and usage_date = v_today
  for update;

  if v_used >= v_limit then
    update public.daily_lab_usage
    set session_open = false,
        last_heartbeat_at = null,
        lease_expires_at = null
    where user_id = v_user and usage_date = v_today;
    return 0;
  end if;

  update public.daily_lab_usage
  set session_open = true,
      last_heartbeat_at = v_now,
      lease_expires_at = v_now + interval '75 seconds'
  where user_id = v_user and usage_date = v_today;

  return greatest(0, v_limit - v_used);
end
$$;

create or replace function public.record_lab_heartbeat(p_seconds integer)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (clock_timestamp() at time zone 'Asia/Baghdad')::date;
  v_now timestamptz := clock_timestamp();
  v_used integer;
  v_open boolean;
  v_limit integer := public._lab_daily_limit_seconds();
begin
  if v_user is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  -- The client-reported value is validation only. Billing uses the server clock.
  if p_seconds is null or p_seconds < 1 or p_seconds > 90 then
    raise exception using errcode = '22023', message = 'heartbeat_interval_out_of_range';
  end if;

  if public._lab_has_active_subscription(v_user, v_today) then
    return -1;
  end if;

  perform public._accrue_lab_usage(v_user, v_today, v_now);

  select seconds_used, session_open
    into v_used, v_open
  from public.daily_lab_usage
  where user_id = v_user and usage_date = v_today
  for update;

  if not found then
    raise exception using errcode = '55000', message = 'lab_session_required_or_expired';
  end if;

  -- Reaching the cap closes the lease but must still return 0 so every client
  -- (including a refreshed page or second tab) receives the same lock signal.
  if v_used >= v_limit then
    update public.daily_lab_usage
    set session_open = false,
        last_heartbeat_at = null,
        lease_expires_at = null
    where user_id = v_user and usage_date = v_today;
    return 0;
  end if;

  if not v_open then
    raise exception using errcode = '55000', message = 'lab_session_required_or_expired';
  end if;

  update public.daily_lab_usage
  set last_heartbeat_at = v_now,
      lease_expires_at = v_now + interval '75 seconds'
  where user_id = v_user and usage_date = v_today;

  return greatest(0, v_limit - v_used);
end
$$;

create or replace function public.end_lab_session()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (clock_timestamp() at time zone 'Asia/Baghdad')::date;
  v_now timestamptz := clock_timestamp();
  v_used integer;
begin
  if v_user is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  if public._lab_has_active_subscription(v_user, v_today) then
    return -1;
  end if;

  v_used := public._accrue_lab_usage(v_user, v_today, v_now);

  update public.daily_lab_usage
  set session_open = false,
      last_heartbeat_at = null,
      lease_expires_at = null
  where user_id = v_user and usage_date = v_today;

  return greatest(0, public._lab_daily_limit_seconds() - coalesce(v_used, 0));
end
$$;

create or replace function public.get_lab_module_content(p_module_id uuid)
returns setof public.learning_modules
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (clock_timestamp() at time zone 'Asia/Baghdad')::date;
  v_now timestamptz := clock_timestamp();
  v_used integer;
  v_open boolean;
begin
  if v_user is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  if not public._lab_has_active_subscription(v_user, v_today) then
    perform public._accrue_lab_usage(v_user, v_today, v_now);

    select seconds_used, session_open
      into v_used, v_open
    from public.daily_lab_usage
    where user_id = v_user and usage_date = v_today
    for update;

    if not found then
      raise exception using errcode = '55000', message = 'lab_session_required_or_expired';
    end if;

    if v_used >= public._lab_daily_limit_seconds() then
      update public.daily_lab_usage
      set session_open = false,
          last_heartbeat_at = null,
          lease_expires_at = null
      where user_id = v_user and usage_date = v_today;
      raise exception using errcode = '54000', message = 'daily_lab_quota_exhausted';
    end if;

    if not v_open then
      raise exception using errcode = '55000', message = 'lab_session_required_or_expired';
    end if;
  end if;

  return query
  select module.*
  from public.learning_modules as module
  where module.id = p_module_id
    and module.status = 'published';
end
$$;

revoke execute on function public._lab_daily_limit_seconds() from public, anon, authenticated;
revoke execute on function public._lab_has_active_subscription(uuid, date) from public, anon, authenticated;
revoke execute on function public._accrue_lab_usage(uuid, date, timestamptz) from public, anon, authenticated;

revoke execute on function public.get_lab_quota_status() from public, anon;
revoke execute on function public.start_lab_session() from public, anon;
revoke execute on function public.record_lab_heartbeat(integer) from public, anon;
revoke execute on function public.end_lab_session() from public, anon;
revoke execute on function public.get_lab_module_content(uuid) from public, anon;

grant execute on function public.get_lab_quota_status() to authenticated;
grant execute on function public.start_lab_session() to authenticated;
grant execute on function public.record_lab_heartbeat(integer) to authenticated;
grant execute on function public.end_lab_session() to authenticated;
grant execute on function public.get_lab_module_content(uuid) to authenticated;
