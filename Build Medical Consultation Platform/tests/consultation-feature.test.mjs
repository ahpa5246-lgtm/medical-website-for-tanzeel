import test from "node:test"
import assert from "node:assert/strict"
import { consultationsEnabled } from "../src/lib/featureFlags.mjs"

test("consultations remain deferred unless explicitly enabled", () => {
  for (const env of [
    {},
    { VITE_ENABLE_CONSULTATIONS: "false" },
    { VITE_ENABLE_CONSULTATIONS: "TRUE" },
  ]) {
    assert.equal(consultationsEnabled(env), false)
  }
  assert.equal(
    consultationsEnabled({ VITE_ENABLE_CONSULTATIONS: "true" }),
    true,
  )
})
