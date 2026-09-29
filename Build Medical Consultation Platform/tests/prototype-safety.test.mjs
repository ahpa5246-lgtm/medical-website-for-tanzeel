import { readFileSync } from "node:fs"
import test from "node:test"
import assert from "node:assert/strict"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("preview status remains backend-aware", () => {
  const app = read("src/App.tsx")
  const notice = read("src/components/PreviewNotice.tsx")
  assert.match(app, /<BrowserRouter>\s*<PreviewNotice \/>\s*<Routes>/)
  assert.match(notice, /isSupabaseConfigured/)
})

test("medical question content is never stored in URL parameters", () => {
  const home = read("src/pages/Home.tsx")
  const submit = read("src/pages/consultations/Submit.tsx")
  assert.doesNotMatch(home, /encodeURIComponent|\?q=/)
  assert.doesNotMatch(submit, /params\.get\(["']q["']\)/)
})

test("consultation upload is restricted and uses private storage repository", () => {
  const submit = read("src/pages/consultations/Submit.tsx")
  const repo = read("src/features/consultations/consultationRepository.ts")
  assert.match(submit, /type="file"/)
  assert.match(submit, /\.jpg,.jpeg,.png,.webp,.pdf/)
  assert.match(repo, /consultation-attachments/)
  assert.match(repo, /upload\(/)
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

test("consultation pages no longer consume mock consultation data", () => {
  for (const path of [
    "src/pages/consultations/List.tsx",
    "src/pages/consultations/Thread.tsx",
    "src/pages/consultations/Submit.tsx",
  ]) {
    const source = read(path)
    assert.doesNotMatch(source, /MOCK_CONSULTATIONS|MOCK_THREAD|mockData/)
  }
  assert.match(read("src/pages/consultations/List.tsx"), /listMyConsultations/)
  assert.match(read("src/pages/consultations/Thread.tsx"), /listMessages/)
  assert.match(read("src/pages/consultations/Submit.tsx"), /createConsultation/)
})

test("signup delegates to Supabase auth rather than a timer simulation", () => {
  const signup = read("src/pages/auth/Signup.tsx")
  const auth = read("src/features/auth/authRepository.ts")
  assert.match(signup, /signUp/)
  assert.doesNotMatch(signup, /setTimeout/)
  assert.match(auth, /supabase\.auth\.signUp/)
})

test("medical RLS excludes editor role from medical administration", () => {
  const migration = read(
    "../supabase/migrations/20260929233500_consultations_platform.sql",
  )
  assert.match(migration, /is_medical_admin/)
  assert.match(migration, /current_role\(\) in \('owner','admin'\)/)
  assert.match(migration, /sender_kind = 'doctor'/)
  assert.match(migration, /sender_kind = 'patient'/)
})

test("privacy and terms describe operational data handling without claiming payment collection", () => {
  const privacy = read("src/pages/legal/Privacy.tsx")
  const terms = read("src/pages/legal/Terms.tsx")
  assert.match(privacy, /مساحة تخزين خاصة/)
  assert.match(privacy, /محررو المحتوى لا تمنحهم/)
  assert.match(terms, /بوابة الدفع المعتمدة/)
  assert.match(terms, /لا يثبت\s+تحصيل المال/)
})

test("robots remain noindex until a production domain is deliberately launched", () => {
  assert.match(read("index.html"), /name="robots" content="noindex, nofollow"/)
})

test("home makes no unsupported verification claims", () => {
  const home = read("src/pages/Home.tsx")
  for (const unsupportedClaim of [
    "طبيب موثّق",
    "ترخيص مراجع",
    "الطبيب المستجيب",
    "حماية مضمونة",
    "اعتماد رسمي",
  ]) {
    assert.doesNotMatch(home, new RegExp(unsupportedClaim))
  }
})
