import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("admin user repository calls protected edge functions", () => {
  const source = read("src/features/admin/userAdminRepository.ts")
  assert.match(source, /functions\.invoke\("admin-invite"/)
  assert.match(source, /functions\.invoke\("admin-user-status"/)
  assert.match(source, /from\("profiles"\)/)
})

test("user management hides admin grants from non-owner accounts", () => {
  const source = read("src/features/admin/AdminUsers.tsx")
  assert.match(source, /profile\?\.role === "owner"/)
  assert.match(source, /دعوة مستخدم/)
  assert.match(source, /تعطيل/)
})

test("edge functions re-authorize every request and protect privileged roles", () => {
  const auth = read("../supabase/functions/_shared/authorize.ts")
  const invite = read("../supabase/functions/admin-invite/index.ts")
  const status = read("../supabase/functions/admin-user-status/index.ts")
  assert.match(auth, /authorization/i)
  assert.match(auth, /status.*active/s)
  assert.match(invite, /caller\.role !== "owner" && role !== "editor"/)
  assert.match(invite, /expires_at/)
  assert.match(status, /targetId === caller\.id/)
  assert.match(status, /target\.role === "owner"/)
  assert.match(status, /\["admin", "editor"\]\.includes\(role\)/)
})
