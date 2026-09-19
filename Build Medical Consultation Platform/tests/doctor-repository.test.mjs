import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("public doctor queries require published records and pagination", () => {
  const source = read("src/features/doctors/doctorRepository.ts")
  assert.match(source, /eq\("publication_status", "published"\)/)
  assert.match(source, /\.range\(from, to\)/)
  assert.match(source, /select\(PUBLIC_DOCTOR_COLUMNS/)
})

test("doctor pages do not fall back to mock records", () => {
  for (const page of [
    "src/pages/doctors/Directory.tsx",
    "src/pages/doctors/Profile.tsx",
  ]) {
    const source = read(page)
    assert.doesNotMatch(source, /MOCK_DOCTORS|mockData/)
    assert.match(source, /DoctorKindBadge/)
  }
})

test("fictional cards cannot claim ratings, availability, or consultations", () => {
  const source = read("src/pages/doctors/Directory.tsx")
  assert.doesNotMatch(
    source,
    /rating|reviewCount|isOnline|consultationsAnswered/,
  )
  assert.match(source, /تعرّف إلى شكل الخدمة/)
})
