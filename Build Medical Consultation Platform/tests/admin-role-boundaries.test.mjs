import test from "node:test"
import assert from "node:assert/strict"
import { validateAccountChange } from "../../supabase/functions/_shared/accountChanges.mjs"

test("administrator cannot create an owner or administrator through a crafted request", () => {
  for (const role of ["owner", "admin", "unknown", null]) {
    assert.ok(validateAccountChange("admin", "member", "set_role", role))
  }
  assert.equal(validateAccountChange("admin", "member", "set_role", "editor"), null)
})

test("owner creation is forbidden even to existing owners; owner accounts are protected", () => {
  assert.ok(validateAccountChange("owner", "member", "set_role", "owner"))
  assert.ok(validateAccountChange("owner", "owner", "disable"))
  assert.equal(validateAccountChange("owner", "member", "set_role", "admin"), null)
})

test("administrators cannot disable other administrators and members cannot manage accounts", () => {
  assert.ok(validateAccountChange("admin", "admin", "disable"))
  assert.ok(validateAccountChange("member", "editor", "disable"))
  assert.ok(validateAccountChange("owner", "member", "invalid"))
  assert.equal(validateAccountChange("admin", "editor", "disable"), null)
})
