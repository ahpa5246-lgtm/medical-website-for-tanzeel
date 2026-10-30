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
const pages = [
  ["Home", "/"],
  ["auth/Login", "/auth/login"],
  ["auth/Signup", "/auth/signup"],
  ["auth/ForgotPassword", "/auth/forgot-password"],
  ["auth/UpdatePassword", "/auth/update-password"],
  ["auth/AcceptInvitation", "/auth/accept-invite"],
  ["doctors/Directory", "/doctors"],
  ["articles/List", "/articles"],
  ["articles/Detail", "/articles/missing"],
  ["courses/List", "/courses"],
  ["library/List", "/library"],
  ["legal/Disclaimer", "/legal/disclaimer"],
  ["legal/Privacy", "/legal/privacy"],
  ["legal/Terms", "/legal/terms"],
  ["training/Training", "/training"],
  ["labs/LabHub", "/labs"],
  ["verification/Application", "/verification/apply"],
]
for (const [component, route] of pages) {
  test(`render public route ${route}: readable structured content`, async () => {
    const html = await renderer.render(`/src/pages/${component}.tsx`, {}, route)
    assert.ok(html.length > 100)
    assert.match(html, /<h[12][\s>]/)
    assert.doesNotMatch(html, /undefined|null<\/|\[object Object\]/)
    for (const image of html.matchAll(/<img\b[^>]*>/g))
      assert.match(image[0], /\balt="[^"]*"/)
  })
}
for (const [props, checks] of [
  [
    { label: "Email", type: "email", required: true },
    [/type="email"/, /required=""/],
  ],
  [{ label: "Name", disabled: true }, [/disabled=""/]],
  [
    { label: "Name", value: "<script>alert(1)</script>", readOnly: true },
    [/&lt;script&gt;/, /readOnly=""/],
  ],
  [
    {
      id: "field",
      label: "Name",
      hint: "Hint",
      "aria-describedby": "external",
    },
    [/aria-describedby="external field-hint"/],
  ],
  [
    { id: "field", label: "Name", hint: "Hint", error: "Error" },
    [/aria-describedby="field-error"/, /role="alert"/],
  ],
  [
    { id: "field", label: "Name", "aria-invalid": true },
    [/aria-invalid="true"/],
  ],
]) {
  test(`render input contract: ${JSON.stringify(props)}`, async () => {
    const html = await renderer.render("/src/components/ui/Input.tsx", props)
    for (const pattern of checks) assert.match(html, pattern)
    const id = html.match(/<input[^>]*\bid="([^"]+)"/)?.[1]
    assert.ok(id)
    assert.ok(html.includes(`for="${id}"`))
  })
}
