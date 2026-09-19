import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const migration = () =>
  readFileSync(
    new URL(
      "../../supabase/migrations/20260919090000_admin_content_platform.sql",
      import.meta.url,
    ),
    "utf8",
  )

test("admin content schema defines every durable record", () => {
  const sql = migration()
  for (const table of [
    "profiles",
    "specialties",
    "doctors",
    "invitations",
    "audit_events",
  ]) {
    assert.match(sql, new RegExp(`create table public\\.${table}`))
  }
})

test("every application table enables row level security", () => {
  const sql = migration()
  for (const table of [
    "profiles",
    "specialties",
    "doctors",
    "invitations",
    "audit_events",
  ]) {
    assert.match(
      sql,
      new RegExp(`alter table public\\.${table} enable row level security`),
    )
  }
})

test("doctor images reject oversized or non-image uploads", () => {
  const sql = migration()
  assert.match(sql, /file_size_limit[\s\S]{0,160}5242880/)
  assert.match(sql, /image\/webp/)
  assert.match(sql, /image\/jpeg/)
  assert.match(sql, /image\/png/)
})

test("audit events are immutable to browser roles", () => {
  const sql = migration()
  assert.doesNotMatch(sql, /create policy[^;]+audit_events[^;]+for update/is)
  assert.doesNotMatch(sql, /create policy[^;]+audit_events[^;]+for delete/is)
})
