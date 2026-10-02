-- The learning lab was removed from the product. Retain historical migrations,
-- then retire their database objects in a forward-only migration.
drop function if exists public.get_lab_module_content(uuid);
drop function if exists public.end_lab_session();
drop function if exists public.record_lab_heartbeat(integer);
drop function if exists public.start_lab_session();
drop function if exists public.get_lab_quota_status();
drop function if exists public._accrue_lab_usage(uuid, date, timestamptz);
drop function if exists public._lab_has_active_subscription(uuid, date);
drop function if exists public._lab_daily_limit_seconds();

drop table if exists public.daily_lab_usage;
drop table if exists public.learning_modules;
drop table if exists public.subscriptions;
