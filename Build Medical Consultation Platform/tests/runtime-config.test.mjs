import test from "node:test"
import assert from "node:assert/strict"
import { readRuntimeConfig } from "../src/lib/runtimeConfig.mjs"

test("empty environment blocks startup instead of faking a backend", () => {
  assert.deepEqual(readRuntimeConfig({}), {
    mode: "blocked",
    issues: ["أضيفي إعدادات Supabase لتشغيل المنصة المتصلة."],
  })
})

test("prototype mode requires an explicit development flag", () => {
  assert.deepEqual(readRuntimeConfig({ VITE_ENABLE_PROTOTYPE: "true" }), {
    mode: "prototype",
    issues: [],
  })
})

test("partial Supabase configuration is rejected", () => {
  assert.deepEqual(
    readRuntimeConfig({
      VITE_SUPABASE_URL: "https://example.supabase.co",
    }),
    {
      mode: "blocked",
      issues: ["أضيفي VITE_SUPABASE_ANON_KEY لإكمال اتصال Supabase."],
    },
  )
})

test("an invalid Supabase URL is rejected", () => {
  assert.deepEqual(
    readRuntimeConfig({
      VITE_SUPABASE_URL: "http://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "public-anon-key",
    }),
    {
      mode: "blocked",
      issues: ["رابط Supabase غير صالح أو لا يستخدم HTTPS."],
    },
  )
})

test("complete valid configuration enters connected mode", () => {
  const result = readRuntimeConfig({
    VITE_SUPABASE_URL: "https://example.supabase.co",
    VITE_SUPABASE_ANON_KEY: "public-anon-key",
  })

  assert.equal(result.mode, "connected")
  assert.equal(result.supabaseUrl, "https://example.supabase.co")
  assert.equal(result.supabaseAnonKey, "public-anon-key")
  assert.equal(result.issues.length, 0)
})
