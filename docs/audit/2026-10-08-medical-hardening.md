# Medical Website — Engineering Hardening Pass (2026-10-08)

## Scope and safety

Changes on `audit/medical-production-hardening-20261008` are proposed for review. Do **not** apply medical database migrations to production until they pass tests on an anonymized staging clone. No live service, user account, payment, production storage bucket, or third-party origin was contacted as part of the source-code changes.

The repository contains both prototype-only pages and connected Supabase features. An E2E green check cannot substitute for clinical sign-off, production authorization testing, or device measurements.

## Implemented

1. Database `guard_doctor_consultation_update`: providers assigned to an existing consultation may update its workflow state, not the patient identity, medical content, assignment, or specialty. Reject edits after closure.
2. Database RLS: closed consultations reject new messages for patient, doctor, and staff.
3. Transactional `accept_admin_invitation(p_token)`: validates the authenticated email and a non-expired SHA-256 invitation hash, promotes a profile from the invitation record, then marks the invitation accepted inside one transaction.
4. Edge function `admin-invite`: sends invite links to `/auth/accept-invite` under a trusted, configured `APP_SITE_URL`.
5. Password reset route with interactive form, validation, and real Supabase `auth.updateUser`.
6. Authenticated invitation acceptance route. Clinical/admin permissions remain backend-enforced.
7. Registers a fresh Supabase access-token provider for the learning-lab quota RPC.
8. Preserves the home-screen question when navigating into consultations.
9. When a consultation row is saved and an attachment upload fails, the form acknowledges the saved record and retries only the remaining files in that same page session.
10. Removes a nested `<main>` landmark, clarifies login UI, broadens Playwright projects, and ensures CI tests a genuine prototype application rather than the configuration error screen.

## Before deploying

- Configure **Supabase Auth → URL Configuration**: set the public Site URL and add `https://YOUR_DOMAIN/auth/update-password` and `https://YOUR_DOMAIN/auth/accept-invite` to approved redirect URLs. Use the appropriate verified staging origin for tests.
- Configure Edge Function secret `APP_SITE_URL=https://YOUR_DOMAIN` for `admin-invite`, then deploy the updated Edge Function. Reject unknown domains. Existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` remain server-side secrets.
- Apply all migrations (including `20261008231500_medical_workflow_hardening.sql`) to a **disposable staging Supabase** first. Run `supabase test db supabase/tests/database/consultations_rls.test.sql`.
- Test a real recovery email, a newly invited editor, an authorized owner invite of an admin, expired/replayed invitations, inactive users, and a full patient→doctor consultation workflow. Test two independent authenticated accounts to prove RLS prevents cross-account access.
- Test attachment failures and retries with **synthetic** files only, not real medical records. This change is not fully atomic across PostgreSQL and Supabase Storage: a network failure after a successful upload acknowledgment is lost can create a second uploaded object; robust production ingestion requires idempotent upload tokens and reconciliation.
- Verify email deliverability, backups/restores, audit logging, and all local medical/privacy obligations before switching to real patients.
- Production builds must supply real `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; never set `VITE_ENABLE_PROTOTYPE=true` on public deployments. The CI test build uses that variable **only** to display non-operational UI routes.

## Test commands

In `Build Medical Consultation Platform`:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
VITE_ENABLE_PROTOTYPE=true pnpm build
pnpm exec playwright install chromium firefox webkit
pnpm exec playwright test -c playwright.config.mjs
```

GitHub Actions additionally defines Semgrep, Gitleaks, OSV, Trivy, database/RLS tests, Lighthouse, bundle budget, and opt-in staging ZAP/k6 gates. Do not run k6/ZAP against production by default.

## Still unverified / not implemented

- Real end-to-end email delivery and role acceptance against deployed Supabase; staged migrations and Edge Function deployments.
- Browser/device screenshots and measured low-end CPU, memory, battery or real-user Core Web Vitals; broadened emulators are *not* physical-device proof.
- Exhaustive UX and accessibility audit (including screen readers), clinical verification, privacy/legal approval, account deletion/retention, billing, scaling under production load, and disaster-recovery drills.
- Complete interactive medical modules and clinical content approval; preview-only authoring and professional-verification pages remain intentionally non-operational.

**Readiness:** Not approved for live clinical use. Production safety is insufficiently proven even if CI passes.
