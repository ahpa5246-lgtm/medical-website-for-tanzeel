import { readFileSync } from "node:fs"
import test from "node:test"
import assert from "node:assert/strict"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("persistent warning wraps every route and cannot be dismissed", () => {
  const app = read("src/App.tsx")
  const notice = read("src/components/PreviewNotice.tsx")
  assert.match(app, /<BrowserRouter>\s*<PreviewNotice \/>\s*<Routes>/)
  assert.doesNotMatch(notice, /useState|onClick|button|\bX\b/)
  assert.match(notice, /نموذج أولي غير تشغيلي/)
})

test("medical question content is not read from or written to URL parameters", () => {
  const home = read("src/pages/Home.tsx")
  const submit = read("src/pages/consultations/Submit.tsx")
  assert.doesNotMatch(home, /encodeURIComponent|\?q=/)
  assert.doesNotMatch(submit, /params\.get\(["']q["']\)/)
})

test("prototype has no file input or file-selection API", () => {
  const submit = read("src/pages/consultations/Submit.tsx")
  assert.doesNotMatch(
    submit,
    /type=["']file["']|\.files|FileReader|showOpenFilePicker/,
  )
  assert.match(submit, /اختيار الملفات معطّل/)
})

test("emergency numbers and copy have one source", () => {
  const emergency = read("src/lib/emergency.ts")
  for (const path of [
    "src/components/EmergencyBanner.tsx",
    "src/pages/legal/Disclaimer.tsx",
    "src/components/layout/Footer.tsx",
  ]) {
    const source = read(path)
    assert.doesNotMatch(source, /tel:911|tel:122/)
  }
  assert.match(emergency, /tel:911/)
  assert.match(emergency, /tel:122/)
})

test("mock content is labelled at each repeated point of use", () => {
  for (const path of [
    "src/pages/consultations/List.tsx",
    "src/pages/consultations/Thread.tsx",
    "src/pages/doctors/Directory.tsx",
    "src/pages/doctors/Profile.tsx",
    "src/pages/articles/List.tsx",
    "src/pages/articles/Detail.tsx",
    "src/pages/Home.tsx",
  ]) {
    assert.match(read(path), /<DemoLabel/)
  }
})

test("privacy notice explicitly negates unsupported prototype capabilities", () => {
  const privacy = read("src/pages/legal/Privacy.tsx")
  for (const phrase of [
    "لا ندّعي توفير تشفير",
    "إخفاء هوية",
    "سجل تدقيق",
    "حذفها أو تصديرها",
  ])
    assert.match(privacy, new RegExp(phrase))
})

test("robots remain noindex and nofollow", () => {
  assert.match(read("index.html"), /name="robots" content="noindex, nofollow"/)
})
