import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("password recovery and invitation acceptance are routed", () => {
  const app = read("src/App.tsx")
  const recovery = read("src/pages/auth/UpdatePassword.tsx")
  const accept = read("src/pages/auth/AcceptInvitation.tsx")
  const repository = read("src/features/auth/authRepository.ts")
  assert.match(app, /path="\/auth\/update-password"/)
  assert.match(app, /path="\/auth\/accept-invite"/)
  assert.match(repository, /\/auth\/update-password/)
  assert.match(recovery, /supabase\.auth\.updateUser/)
  assert.match(accept, /accept_admin_invitation/)
})

test("medical database restricts doctor edits, closed messages, and invite acceptance", () => {
  const sql = read(
    "../supabase/migrations/20261008231500_medical_workflow_hardening.sql",
  )
  assert.match(sql, /guard_doctor_consultation_update/)
  assert.match(sql, /doctor_update_forbidden/)
  assert.match(sql, /c\.status <> 'closed'/)
  assert.match(sql, /accept_admin_invitation/)
  assert.match(sql, /for update;/)
})

test("learning lab receives access tokens from authenticated sessions", () => {
  const lab = read("src/pages/labs/LabHub.tsx")
  assert.match(lab, /accessTokenProvider/)
  assert.match(lab, /supabase\.auth\.getSession/)
  assert.match(lab, /authSession\?\.user\.id/)
})

test("home question is carried to the consultation draft and upload retries reuse saved row", () => {
  const home = read("src/pages/Home.tsx")
  const submit = read("src/pages/consultations/Submit.tsx")
  assert.match(home, /initialQuestion: query\.trim\(\)/)
  assert.match(submit, /state\.initialQuestion/)
  assert.match(submit, /savedConsultationId/)
  assert.match(submit, /pendingFiles/)
})
