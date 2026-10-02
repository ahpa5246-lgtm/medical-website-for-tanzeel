import assert from "node:assert/strict"

import { readFileSync } from "node:fs"

import test from "node:test"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("admin workspace is lazy loaded and protected by role", () => {
  const app = read("src/App.tsx")

  assert.match(
    app,

    /lazy\(\(\) => import\("@\/features\/admin\/AdminLayout"\)\)/,
  )

  assert.match(app, /<RequireRole allow=\{\["owner", "admin", "editor"\]\}>/)

  assert.match(app, /path="\/admin\/\*"/)
})

test("admin navigation exposes dashboard and doctor management", () => {
  const source = read("src/features/admin/AdminLayout.tsx")

  assert.match(source, /لوحة التحكم/)

  assert.match(source, /إدارة الأطباء/)

  assert.match(source, /تسجيل الخروج/)
})

test("admin consultation page keeps its role boundary and respects deferral", () => {
  const source = read("src/features/admin/AdminLayout.tsx")
  assert.match(
    source,
    /<RequireRole allow=\{\["owner", "admin"\]\}>\s*<ConsultationGate>\s*<AdminConsultations \/>/,
  )
})

test("admin doctor list queries persisted doctors with pagination", () => {
  const source = read("src/features/admin/adminRepository.ts")

  assert.match(source, /from\("doctors"\)/)

  assert.match(source, /\.range\(from, to\)/)
})
