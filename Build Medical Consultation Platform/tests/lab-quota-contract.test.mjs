import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

const migration = readFileSync(
  new URL(
    "../../supabase/migrations/20260831160000_learning_lab_quota.sql",
    import.meta.url,
  ),
  "utf8",
)

test("quota migration extends existing relational storage without creating a parallel store", () => {
  assert.match(migration, /alter table public\.daily_lab_usage/)
  assert.doesNotMatch(migration, /create table/i)
  assert.match(migration, /public\.subscriptions/)
  assert.match(migration, /public\.learning_modules/)
})

test("Baghdad calendar day and production cap are authoritative on the server", () => {
  assert.match(migration, /time zone 'Asia\/Baghdad'/)
  assert.match(migration, /v_limit integer := 3600/)
  assert.match(migration, /least\(3600, greatest\(1, v_limit\)\)/)
})

test("heartbeat accepts elapsed telemetry but charges from the server clock", () => {
  assert.match(migration, /record_lab_heartbeat\(p_seconds integer\)/)
  assert.match(migration, /client-reported value is validation only/)
  assert.match(migration, /clock_timestamp\(\)/)
  assert.match(migration, /lease_expires_at = v_now \+ interval '75 seconds'/)
  assert.doesNotMatch(
    migration,
    /seconds_used\s*=\s*seconds_used\s*\+\s*p_seconds/i,
  )
})

test("free content requires a live server session and quota", () => {
  assert.match(migration, /get_lab_module_content\(p_module_id uuid\)/)
  assert.match(migration, /lab_session_required_or_expired/)
  assert.match(migration, /daily_lab_quota_exhausted/)
  assert.match(migration, /module\.status = 'published'/)
})

test("active subscriptions are checked before the free cap", () => {
  assert.match(migration, /status = 'active'/)
  assert.match(migration, /current_period_end >= p_today/)
  assert.match(migration, /return -1/)
})

test("quota mutation is RPC-only for authenticated users", () => {
  assert.match(
    migration,
    /revoke all on table public\.daily_lab_usage from anon, authenticated/,
  )
  assert.match(
    migration,
    /grant execute on function public\.record_lab_heartbeat\(integer\) to authenticated/,
  )
  assert.match(migration, /auth\.uid\(\)/)
})

test("refresh and new-tab starts accrue the previous lease before reopening", () => {
  const start = migration.slice(
    migration.indexOf("create or replace function public.start_lab_session"),
    migration.indexOf("create or replace function public.record_lab_heartbeat"),
  )
  assert.match(start, /perform public\._accrue_lab_usage/)
  assert.match(start, /on conflict \(user_id, usage_date\) do nothing/)
  assert.match(start, /for update/)
})
