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
  assert.doesNotMatch(app, /labQuotaClient|supabase/i)
})

test("pilot catalog uses the three requested module types", () => {
  const catalog = read("src/pages/labs/catalog.ts")
  assert.match(catalog, /chest-pain-case/)
  assert.match(catalog, /branching-case/)
  assert.match(catalog, /anatomy-3d/)
  assert.match(catalog, /rapid-quiz/)
  assert.match(catalog, /unreviewed-placeholder/)
})

test("lab start is driven only by a verified server quota state", () => {
  const hub = read("src/pages/labs/LabHub.tsx")
  assert.match(hub, /data-lab-quota-source="server"/)
  assert.match(hub, /data-lab-start-guard=/)
  assert.match(hub, /canStart \? "server-verified" : "server-locked"/)
  assert.match(hub, /state\.phase === "ready"/)
  assert.match(hub, /ساعة واحدة يوميًا بتوقيت بغداد/)
  assert.match(hub, /لا يوجد عدّ تنازلي محلي/)
})

test("lab route has no client quota store, payment SDK, or 3D dependency", () => {
  const sources = [
    read("src/pages/labs/LabHub.tsx"),
    read("src/pages/labs/catalog.ts"),
    read("src/pages/labs/labQuotaClient.ts"),
    read("src/pages/labs/labQuotaSession.ts"),
  ].join("\n")
  assert.doesNotMatch(
    sources,
    /localStorage|sessionStorage|indexedDB|stripe|react-three|from ["']three["']/i,
  )
  assert.doesNotMatch(sources, /VITE_SUPABASE_(SERVICE|SECRET)|service_role/i)
})

test("route client supports every reviewed RPC and no arbitrary function name", () => {
  const client = read("src/pages/labs/labQuotaClient.ts")
  for (const rpc of [
    "get_lab_quota_status",
    "start_lab_session",
    "record_lab_heartbeat",
    "end_lab_session",
    "get_lab_module_content",
  ]) {
    assert.match(client, new RegExp(rpc))
  }
  assert.match(client, /export type LabRpcName/)
  assert.match(client, /VITE_SUPABASE_URL/)
  assert.match(client, /VITE_SUPABASE_ANON_KEY/)
})

test("clinical placeholder is explicitly blocked from real use", () => {
  const hub = read("src/pages/labs/LabHub.tsx")
  for (const phrase of [
    "غير مراجع طبيًا",
    "لا تُستخدم للتشخيص",
    "لا يمكن نشرها قبل اعتماد",
    "لا\\s+تُحفظ نقاط أو تقدم أو شارات",
  ]) {
    assert.match(hub, new RegExp(phrase))
  }
})
