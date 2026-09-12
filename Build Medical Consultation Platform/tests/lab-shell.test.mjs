import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("lab code is lazy loaded only from lab routes", () => {
  const app = read("src/App.tsx")
  assert.match(app, /lazy\(\(\) => import\("@\/pages\/labs\/LabHub"\)\)/)
  assert.match(app, /path="\/labs\/:moduleId"/)
})

test("pilot catalog exposes a playable safe demo", () => {
  const catalog = read("src/pages/labs/catalog.ts")
  assert.match(catalog, /chest-pain-case/)
  assert.match(catalog, /playable-demo/)
  assert.match(catalog, /unreviewed-placeholder/)
})

test("case room has deterministic scenes, feedback and an in-memory reset", () => {
  const room = read("src/pages/labs/CaseRoom.tsx")
  assert.match(room, /const SCENES/)
  assert.match(room, /غرفة الأدلة/)
  assert.match(room, /تغذية راجعة فورية/)
  assert.match(room, /data-demo-storage="memory-only"/)
  assert.match(room, /setAnswers\(\{\}\)/)
  assert.doesNotMatch(
    room,
    /Math\.random|localStorage|sessionStorage|indexedDB/i,
  )
})

test("safe demo is not presented as clinical education or advice", () => {
  const room = read("src/pages/labs/CaseRoom.tsx")
  for (const phrase of [
    "محاكاة خيالية",
    "ليست تعليمًا طبيًا معتمدًا",
    "لا تُستخدم للتشخيص أو العلاج",
  ]) {
    assert.match(room, new RegExp(phrase))
  }
})

test("server quota remains fail closed and separate from the safe demo", () => {
  const hub = read("src/pages/labs/LabHub.tsx")
  assert.match(hub, /data-lab-quota-source="server"/)
  assert.match(hub, /canStart \? "server-verified" : "server-locked"/)
  assert.match(hub, /<CaseRoom/)
})

test("lab route has no payment or 3D dependency", () => {
  const sources = [
    read("src/pages/labs/LabHub.tsx"),
    read("src/pages/labs/CaseRoom.tsx"),
  ].join("\n")
  assert.doesNotMatch(sources, /stripe|react-three|from ["']three["']/i)
  assert.doesNotMatch(sources, /VITE_SUPABASE_(SERVICE|SECRET)|service_role/i)
})
