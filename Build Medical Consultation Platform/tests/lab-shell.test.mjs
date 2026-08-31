import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("lab code is lazy loaded only from lab routes", () => {
  const app = read("src/App.tsx")
  assert.match(app, /lazy\(\(\) => import\("@\/pages\/labs\/LabHub"\)\)/)
  assert.match(app, /<Suspense/)
  assert.match(app, /path="\/labs"/)
  assert.match(app, /path="\/labs\/:moduleId"/)
  assert.doesNotMatch(app, /^import LabHub/m)
})

test("pilot catalog uses the three requested module types", () => {
  const catalog = read("src/pages/labs/catalog.ts")
  assert.match(catalog, /chest-pain-case/)
  assert.match(catalog, /branching-case/)
  assert.match(catalog, /anatomy-3d/)
  assert.match(catalog, /rapid-quiz/)
  assert.match(catalog, /unreviewed-placeholder/)
})

test("lab start remains locked until a server quota guard exists", () => {
  const hub = read("src/pages/labs/LabHub.tsx")
  assert.match(hub, /data-lab-start-guard="server-required"/)
  assert.match(hub, /disabled/)
  assert.match(hub, /ساعة واحدة يوميًا بتوقيت بغداد/)
  assert.match(hub, /لن نعتمد عدّادًا في المتصفح/)
})

test("shell adds no client quota store, payment, Supabase, or Three.js", () => {
  const sources = [
    read("src/pages/labs/LabHub.tsx"),
    read("src/pages/labs/catalog.ts"),
  ].join("\n")
  assert.doesNotMatch(
    sources,
    /localStorage|sessionStorage|indexedDB|setInterval|supabase|stripe|three|react-three/i,
  )
})

test("clinical placeholder is explicitly blocked from real use", () => {
  const hub = read("src/pages/labs/LabHub.tsx")
  for (const phrase of [
    "غير مراجع طبيًا",
    "لا تُستخدم للتشخيص",
    "لا يمكن نشرها قبل اعتماد",
    "لا تُحفظ نقاط أو تقدم أو شارات",
  ]) {
    assert.match(hub, new RegExp(phrase))
  }
})
