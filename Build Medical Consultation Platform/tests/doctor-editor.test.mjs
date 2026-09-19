import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("doctor draft validates required Arabic content and survives refresh", () => {
  const source = read("src/features/admin/doctorDraft.ts")
  assert.match(source, /الاسم العربي مطلوب/)
  assert.match(source, /التخصص مطلوب/)
  assert.match(source, /النبذة يجب ألا تقل/)
  assert.match(source, /localStorage\.setItem/)
  assert.match(source, /localStorage\.getItem/)
})

test("image upload rejects unsafe files and keeps retryable state", () => {
  const source = read("src/features/admin/imageUpload.ts")
  assert.match(source, /image\/jpeg/)
  assert.match(source, /image\/png/)
  assert.match(source, /image\/webp/)
  assert.match(source, /5 \* 1024 \* 1024/)
  assert.match(source, /doctor-images/)
  assert.match(source, /upsert: true/)
})

test("repository prevents silent concurrent overwrites", () => {
  const source = read("src/features/admin/adminRepository.ts")
  assert.match(source, /expectedRevision/)
  assert.match(source, /\.eq\("revision", expectedRevision\)/)
  assert.match(source, /DoctorRevisionConflict/)
  assert.match(source, /transitionDoctor/)
})

test("editor provides preview, save, review and role-filtered publishing", () => {
  const source = read("src/features/admin/DoctorEditor.tsx")
  assert.match(source, /DoctorPreview/)
  assert.match(source, /حفظ المسودة/)
  assert.match(source, /إرسال للمراجعة/)
  assert.match(
    source,
    /profile\?\.role === "owner" \|\| profile\?\.role === "admin"/,
  )
  assert.match(source, /تعارض في التعديلات/)
})

test("admin routes expose doctor creation and editing", () => {
  const source = read("src/features/admin/AdminLayout.tsx")
  assert.match(source, /path="doctors\/new"/)
  assert.match(source, /path="doctors\/:id"/)
})
