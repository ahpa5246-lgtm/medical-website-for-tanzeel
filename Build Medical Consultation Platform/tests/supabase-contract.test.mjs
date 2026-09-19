import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

test("Supabase client uses only public Vite variables", () => {
  const source = readFileSync(
    new URL("../src/lib/supabase.ts", import.meta.url),
    "utf8",
  )

  assert.match(source, /VITE_SUPABASE_URL/)
  assert.match(source, /VITE_SUPABASE_ANON_KEY/)
  assert.doesNotMatch(source, /SERVICE_ROLE/)
})
