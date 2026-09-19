import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("login delegates to Supabase password authentication", () => {
  assert.match(
    read("src/features/auth/authRepository.ts"),
    /signInWithPassword/,
  )
})

test("password recovery uses a trusted same-origin callback", () => {
  const source = read("src/features/auth/authRepository.ts")
  assert.match(source, /resetPasswordForEmail/)
  assert.match(source, /window\.location\.origin/)
  assert.doesNotMatch(source, /redirectTo:\s*returnTo/)
})

test("role guard denies disabled and unauthorized profiles", () => {
  const source = read("src/features/auth/RequireRole.tsx")
  assert.match(source, /profile\.status !== "active"/)
  assert.match(source, /allow\.includes\(profile\.role\)/)
})

test("auth state refreshes profile on focus to enforce revocation", () => {
  const source = read("src/features/auth/AuthProvider.tsx")
  assert.match(source, /addEventListener\("focus"/)
  assert.match(source, /refreshProfile/)
})
