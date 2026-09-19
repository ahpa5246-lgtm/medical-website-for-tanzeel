import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) => {
  try {
    return readFileSync(new URL(path, import.meta.url), "utf8")
  } catch {
    return ""
  }
}

const home = read("../src/pages/Home.tsx")
const css = read("../src/index.css")
const previewNotice = read("../src/components/PreviewNotice.tsx")

test("the public home page contains no fictional-doctor presentation copy", () => {
  for (const phrase of [
    "شخصية طبيب خيالية",
    "عرض الطبيب الخيالي",
    "ترخيص خيالي",
    "سجل خيالي",
  ]) {
    assert.equal(home.includes(phrase), false, `found public copy: ${phrase}`)
  }
  assert.match(home, /الرعاية تبدأ بخطوة أوضح/)
})

test("the signature care rail is controllable and respects reduced motion", () => {
  assert.match(home, /care-flight-track/)
  assert.match(home, /aria-pressed=\{isMotionPaused\}/)
  assert.match(home, /إيقاف الحركة|تشغيل الحركة/)
  assert.match(css, /@keyframes care-flight/)
  assert.match(css, /prefers-reduced-motion: reduce/)
})

test("the home page routes users to real platform capabilities", () => {
  for (const route of [
    "/consultations/new",
    "/doctors",
    "/training",
    "/articles",
  ])
    assert.match(home, new RegExp(route.replace("/", "\\/")))
})

test("preview status appears only when the live backend is not configured", () => {
  assert.match(previewNotice, /isSupabaseConfigured/)
  assert.match(previewNotice, /if \(isSupabaseConfigured\(\)\) return null/)
  assert.doesNotMatch(previewNotice, /كل الأسماء والمحتوى.*خيالية/)
})
