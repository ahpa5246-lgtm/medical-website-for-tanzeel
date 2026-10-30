import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { createRenderer } from "./helpers/render.mjs"
let renderer
before(async () => {
  renderer = await createRenderer()
})
after(async () => {
  await renderer?.close()
})

test("tablet users retain the menu button until desktop navigation appears", async () => {
  const html = await renderer.render("/src/components/layout/Header.tsx")
  const button = html.match(
    /<button[^>]*aria-controls="mobile-menu"[^>]*>/,
  )?.[0]
  assert.ok(button)
  assert.match(button, /lg:hidden/)
  assert.doesNotMatch(button, /(?:^|\s)md:hidden/)
})
test("active navigation is exposed to screen readers", async () => {
  const html = await renderer.render(
    "/src/components/layout/Header.tsx",
    {},
    "/training",
  )
  assert.match(
    html,
    /<a[^>]*aria-current="page"[^>]*href="\/training"|<a[^>]*href="\/training"[^>]*aria-current="page"/,
  )
})
test("input errors are associated with invalid fields", async () => {
  const html = await renderer.render("/src/components/ui/Input.tsx", {
    id: "email",
    label: "Email",
    error: "Invalid email",
  })
  assert.match(html, /aria-invalid="true"/)
  assert.match(html, /aria-describedby="email-error"/)
  assert.match(html, /id="email-error"/)
})
test("input hints have an accessible description", async () => {
  const html = await renderer.render("/src/components/ui/Input.tsx", {
    id: "name",
    label: "Name",
    hint: "Full name",
  })
  assert.match(html, /aria-describedby="name-hint"/)
  assert.match(html, /id="name-hint"/)
})
test("article search has an explicit accessible name", async () => {
  const html = await renderer.render("/src/pages/articles/List.tsx")
  assert.match(html, /aria-label="ابحث في المقالات"/)
})
test("article filters expose their selected state", async () => {
  const html = await renderer.render("/src/pages/articles/List.tsx")
  assert.match(html, /aria-pressed="true"/)
  assert.match(html, /aria-pressed="false"/)
})
