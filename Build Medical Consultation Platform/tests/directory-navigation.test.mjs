import assert from "node:assert/strict"
import test, { before, after } from "node:test"
import { createRenderer } from "./helpers/render.mjs"
let renderer
before(async () => {
  renderer = await createRenderer()
})
after(async () => {
  await renderer?.close()
})
test("doctor search reflects a URL query as a controlled value", async () => {
  const html = await renderer.render(
    "/src/pages/doctors/Directory.tsx",
    {},
    "/doctors?q=cardiology",
  )
  assert.match(html, /value="cardiology"/)
  // React SSR renders both controlled and defaultValue alike; navigation contract
  // is covered by a source check alongside the rendered accessibility checks.
  const { readFileSync } = await import("node:fs")
  const source = readFileSync(
    new URL("../src/pages/doctors/Directory.tsx", import.meta.url),
    "utf8",
  )
  assert.doesNotMatch(source, /defaultValue=\{query\}/)
  assert.match(source, /setParams\(next, \{ replace: true \}\)/)
})
test("doctor directory does not nest a second main landmark", async () => {
  const html = await renderer.render("/src/pages/doctors/Directory.tsx")
  assert.doesNotMatch(html, /<main/)
})
