import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { readRuntimeConfig } from "../src/lib/runtimeConfig.mjs"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("public preview can render without Supabase credentials", () => {
  assert.equal(
    readRuntimeConfig({ VITE_PUBLIC_PREVIEW: "true" }).mode,
    "public-preview",
  )
  assert.equal(readRuntimeConfig({}).mode, "blocked")
  assert.equal(
    readRuntimeConfig({ VITE_ENABLE_PROTOTYPE: "true" }).mode,
    "prototype",
  )
  assert.equal(
    readRuntimeConfig({
      VITE_PUBLIC_PREVIEW: "true",
      VITE_SUPABASE_URL: "https://example.supabase.co",
    }).mode,
    "blocked",
  )
})

test("consultations are closed by default and all three routes use one fail-closed boundary", () => {
  const flags = read("src/lib/releaseFlags.ts")
  const app = read("src/App.tsx")
  assert.match(flags, /VITE_CONSULTATIONS_ENABLED === "true"/)
  assert.match(flags, /!publicPreview &&/)
  assert.match(app, /function ConsultationRoute/)
  for (const path of [
    "/consultations",
    "/consultations/new",
    "/consultations/:id",
  ]) {
    assert.ok(app.includes(`path="${path}"`))
  }
  assert.match(app, /<ConsultationRoute>/)
  assert.match(app, /<UnavailableService service="الاستشارات" \/>/)
})

test("public preview prevents account and medical-verification UI flows", () => {
  const app = read("src/App.tsx")
  assert.match(app, /function PreviewRestricted/)
  for (const path of ["/auth/signup", "/auth/login", "/admin/*", "/verification/apply"]) {
    assert.ok(app.includes(`path="${path}"`))
  }
  assert.match(app, /<PreviewRestricted service="الحسابات">/)
  assert.match(app, /<PreviewRestricted service="لوحة الإدارة">/)
  assert.match(app, /<PreviewRestricted service="التحقق من الأطباء">/)
})

test("the demo content is intentionally retained and visibly described as fictional", () => {
  const articles = read("src/pages/articles/List.tsx")
  const home = read("src/pages/Home.tsx")
  assert.match(articles, /MOCK_ARTICLES/)
  assert.match(articles, /خيالية غير مراجعة/)
  assert.match(home, /المقالات الحالية خيالية وغير مراجعة/)
  assert.match(home, /consultationsEnabled \?/)
})

test("inactive article editor does not show a fake submission success", () => {
  const app = read("src/App.tsx")
  assert.match(app, /path="\/articles\/new"[\s\S]{0,120}<UnavailableService/)
})
