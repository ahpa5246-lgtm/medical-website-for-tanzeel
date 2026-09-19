# Admin Content Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a live Supabase-backed medical content platform with fictional launch profiles, protected administration, granular roles, storage, audit history, and production readiness for thousands of monthly visits.

**Architecture:** The Vite React application uses one typed Supabase client and feature-local repositories. PostgreSQL/RLS remains the authority for permissions; Edge Functions perform privileged invitations and session revocation. Public routes query published records only, while lazy-loaded admin routes use authenticated role guards and a draft/review/publish workflow.

**Tech Stack:** React 19, TypeScript 5.7, React Router 7, Vite 8, Supabase JS/Auth/PostgreSQL/Storage/Edge Functions, Node test runner, Playwright for browser smoke tests, Lucide React, Tailwind CSS 4.

**Spec:** `docs/superpowers/specs/2026-09-19-admin-content-platform-design.md`

## Global Constraints

- Production must never silently fall back to mock data.
- Every fictional profile must visibly and semantically say `ملف تعريفي تجريبي`.
- Fictional profiles must not expose ratings, reviews, licenses, real hospitals, patient counts, or live availability.
- Authorization must be enforced by PostgreSQL RLS, not only by route guards.
- Only the owner can grant or revoke `admin`; admins may manage editors; editors cannot publish.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to Vite or commit it.
- Target WCAG 2.2 AA and Arabic RTL behavior.
- Public collection queries must paginate and select explicit columns.
- Administrative writes must produce immutable audit events.
- All work follows failing test → minimal implementation → passing test → commit.

## Review Focus

- Expired, reused, or role-escalating invitations must fail without creating a privileged profile; Task 8 pins this.
- A user whose admin role is revoked while a tab is open must lose access on the next protected request; Tasks 3 and 8 pin this.
- Concurrent edits must not silently overwrite a newer doctor revision; Task 7 pins optimistic concurrency.
- A failed image upload or network interruption must preserve the doctor draft and expose a retry path; Task 7 pins this.
- Slugs containing Arabic, duplicate text, or unsafe characters must become stable unique URLs; Tasks 2 and 5 pin this.

---

### Task 1: Supabase Client Contract and Test Harness

**Files:**
- Modify: `Build Medical Consultation Platform/package.json`
- Modify: `Build Medical Consultation Platform/pnpm-lock.yaml`
- Modify: `Build Medical Consultation Platform/.env.example`
- Create: `Build Medical Consultation Platform/src/lib/supabase.ts`
- Create: `Build Medical Consultation Platform/src/lib/database.types.ts`
- Create: `Build Medical Consultation Platform/tests/supabase-contract.test.mjs`

**Interfaces:**
- Produces: `supabase: SupabaseClient<Database>`, `isSupabaseConfigured(): boolean`, and initial `Database` schema types.
- Consumes: the existing `readRuntimeConfig` contract.

- [ ] **Step 1: Write the failing contract test**

```js
test("Supabase client uses only public Vite variables", () => {
  const source = readFile("src/lib/supabase.ts")
  assert.match(source, /VITE_SUPABASE_URL/)
  assert.match(source, /VITE_SUPABASE_ANON_KEY/)
  assert.doesNotMatch(source, /SERVICE_ROLE/)
})
```

- [ ] **Step 2: Run the focused test**

Run: `pnpm test -- supabase-contract`  
Expected: FAIL because `src/lib/supabase.ts` does not exist.

- [ ] **Step 3: Install the pinned client and implement the singleton**

Run: `pnpm add @supabase/supabase-js@^2.57.4`

```ts
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const url = import.meta.env.VITE_SUPABASE_URL ?? ""
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""

export const isSupabaseConfigured = () => Boolean(url && key)
export const supabase = createClient<Database>(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
```

Add documented public values to `.env.example`; keep the service-role value out of Vite.

- [ ] **Step 4: Verify**

Run: `pnpm test && pnpm typecheck && pnpm build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "Build Medical Consultation Platform"
git commit -m "feat: add typed Supabase client contract"
```

### Task 2: Database, RLS, Storage, and Audit Foundation

**Files:**
- Create: `supabase/migrations/20260919090000_admin_content_platform.sql`
- Create: `supabase/tests/admin_content_platform.integration.sql`
- Update: `Build Medical Consultation Platform/src/lib/database.types.ts`

**Interfaces:**
- Produces: `profiles`, `specialties`, `doctors`, `invitations`, `audit_events`, `doctor-images` bucket, `current_role()`, and `unique_doctor_slug(text, uuid)`.
- Consumes: Supabase Auth `auth.users.id`.

- [ ] **Step 1: Write failing pgTAP cases**

Cover anonymous published reads, draft denial, editor draft writes, editor publish denial, admin publish, owner-only admin grants, immutable audit rows, duplicate slug allocation, and storage MIME/size policies.

```sql
select throws_ok(
  $$ update public.profiles set role = 'owner' where id = auth.uid() $$,
  '42501',
  'ordinary users cannot elevate their role'
);
select is(
  public.unique_doctor_slug('د. سارة علي', null),
  'dr-sarah-ali',
  'slug normalizer produces a stable public slug'
);
```

- [ ] **Step 2: Run integration tests before the migration**

Run: `supabase db reset && supabase test db supabase/tests/admin_content_platform.integration.sql`  
Expected: FAIL because tables/functions are missing.

- [ ] **Step 3: Implement schema and policies**

Create enums `app_role`, `account_status`, `profile_kind`, `verification_status`, and `publication_status`; add timestamps, `revision integer not null default 1`, indexes on publication/specialty/slug, updated-at trigger, audit trigger, and RLS policies. Seed specialties only. Configure `doctor-images` with image MIME allow-list and 5 MB limit.

- [ ] **Step 4: Generate types and verify**

Run: `supabase db reset && supabase test db`  
Run: `supabase gen types typescript --local > "Build Medical Consultation Platform/src/lib/database.types.ts"`  
Expected: all database tests PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase "Build Medical Consultation Platform/src/lib/database.types.ts"
git commit -m "feat: add medical content schema and RLS"
```

### Task 3: Authentication State and Role Enforcement

**Files:**
- Create: `Build Medical Consultation Platform/src/features/auth/AuthProvider.tsx`
- Create: `Build Medical Consultation Platform/src/features/auth/RequireRole.tsx`
- Create: `Build Medical Consultation Platform/src/features/auth/authRepository.ts`
- Create: `Build Medical Consultation Platform/tests/auth-contract.test.mjs`
- Modify: `Build Medical Consultation Platform/src/main.tsx`
- Modify: `Build Medical Consultation Platform/src/pages/auth/Login.tsx`
- Modify: `Build Medical Consultation Platform/src/pages/auth/ForgotPassword.tsx`

**Interfaces:**
- Produces: `useAuth(): { session, profile, loading, signOut, refreshProfile }` and `<RequireRole allow={AppRole[]} />`.
- Consumes: `supabase`, `profiles`, and existing async states.

- [ ] **Step 1: Write failing tests**

Assert that login calls `signInWithPassword`, password reset uses the trusted reset URL, role guards deny inactive users, and a refreshed profile revokes stale admin access.

- [ ] **Step 2: Run tests**

Run: `pnpm test -- auth-contract`  
Expected: FAIL for missing feature files.

- [ ] **Step 3: Implement auth repository/provider/guard**

Subscribe to `onAuthStateChange`, fetch the profile after every session change, refresh the profile on window focus, and render loading, denied, or outlet states. Preserve a safe internal return path only.

- [ ] **Step 4: Verify**

Run: `pnpm test && pnpm typecheck && pnpm build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "Build Medical Consultation Platform/src"
git commit -m "feat: enforce authenticated role access"
```

### Task 4: Doctor Repository and Public Directory

**Files:**
- Create: `Build Medical Consultation Platform/src/features/doctors/types.ts`
- Create: `Build Medical Consultation Platform/src/features/doctors/doctorRepository.ts`
- Create: `Build Medical Consultation Platform/src/features/doctors/DoctorKindBadge.tsx`
- Create: `Build Medical Consultation Platform/tests/doctor-repository.test.mjs`
- Modify: `Build Medical Consultation Platform/src/pages/doctors/Directory.tsx`
- Modify: `Build Medical Consultation Platform/src/pages/doctors/Profile.tsx`

**Interfaces:**
- Produces: `listPublishedDoctors({ query, specialtyId, page, pageSize })`, `getPublishedDoctorBySlug(slug)`, `DoctorCardRecord`, and `DoctorDetailRecord`.
- Consumes: Supabase public read policies and `EmptyState/ErrorState/LoadingState`.

- [ ] **Step 1: Write failing repository tests**

Assert explicit column selection, `range(from, to)` pagination, published-only filtering, escaped search input, missing-slug handling, and no mock fallback.

- [ ] **Step 2: Run focused tests**

Run: `pnpm test -- doctor-repository`  
Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Implement repository and migrate public pages**

Use server-backed query state, debounced search, specialty filtering, URL query parameters, retry, empty states, lazy images, fixed dimensions, and semantic fictional badges. Replace IDs in routes with stable slugs. Remove ratings, patient counts, online indicators, and consultation CTAs from fictional profiles.

- [ ] **Step 4: Verify**

Run: `pnpm test && pnpm typecheck && pnpm build`  
Expected: PASS and no `MOCK_DOCTORS` import in doctor pages.

- [ ] **Step 5: Commit**

```bash
git add "Build Medical Consultation Platform/src/features/doctors" "Build Medical Consultation Platform/src/pages/doctors"
git commit -m "feat: connect public doctor directory to Supabase"
```

### Task 5: Lazy-Loaded Admin Shell and Dashboard

**Files:**
- Create: `Build Medical Consultation Platform/src/features/admin/AdminLayout.tsx`
- Create: `Build Medical Consultation Platform/src/features/admin/AdminDashboard.tsx`
- Create: `Build Medical Consultation Platform/src/features/admin/AdminDoctors.tsx`
- Create: `Build Medical Consultation Platform/src/features/admin/adminRepository.ts`
- Create: `Build Medical Consultation Platform/tests/admin-shell.test.mjs`
- Modify: `Build Medical Consultation Platform/src/App.tsx`

**Interfaces:**
- Produces: protected `/admin` and `/admin/doctors` routes plus `listAdminDoctors(filters)` and `getAdminSummary()`.
- Consumes: `RequireRole`, doctor tables, and shared async states.

- [ ] **Step 1: Write failing route and repository tests**

Assert lazy import, owner/admin/editor access, public denial, pagination, publication filters, and accessible table labels.

- [ ] **Step 2: Run focused tests**

Run: `pnpm test -- admin-shell`  
Expected: FAIL.

- [ ] **Step 3: Implement admin shell**

Add RTL side navigation, mobile drawer, dashboard totals, review queue, searchable doctor table, status badges, and links to create/edit pages. Keep destructive operations out of the list row until Task 6.

- [ ] **Step 4: Verify**

Run: `pnpm test && pnpm typecheck && pnpm build`  
Expected: PASS with a separate admin chunk.

- [ ] **Step 5: Commit**

```bash
git add "Build Medical Consultation Platform/src/features/admin" "Build Medical Consultation Platform/src/App.tsx"
git commit -m "feat: add protected admin workspace"
```

### Task 6: Doctor Editor, Images, and Publish Workflow

**Files:**
- Create: `Build Medical Consultation Platform/src/features/admin/DoctorEditor.tsx`
- Create: `Build Medical Consultation Platform/src/features/admin/DoctorPreview.tsx`
- Create: `Build Medical Consultation Platform/src/features/admin/doctorDraft.ts`
- Create: `Build Medical Consultation Platform/src/features/admin/imageUpload.ts`
- Create: `Build Medical Consultation Platform/tests/doctor-editor.test.mjs`
- Modify: `Build Medical Consultation Platform/src/features/admin/adminRepository.ts`
- Modify: `Build Medical Consultation Platform/src/App.tsx`

**Interfaces:**
- Produces: `saveDoctor(input, expectedRevision)`, `transitionDoctor(id, transition, expectedRevision)`, `uploadDoctorImage(file, doctorId)`, and draft recovery helpers.
- Consumes: `doctors.revision`, Storage bucket, authenticated role, and audit triggers.

- [ ] **Step 1: Write failing tests**

Cover required Arabic name/specialty/bio, unsupported files, files over 5 MB, interrupted upload, local recovery draft, editor review submission, admin publish, archive confirmation, and revision conflict returning a comparison prompt.

- [ ] **Step 2: Run tests**

Run: `pnpm test -- doctor-editor`  
Expected: FAIL.

- [ ] **Step 3: Implement the editor**

Use controlled fields, schema-free explicit validators, 500 ms local recovery draft, visible save state, preview panel, upload progress, WebP-ready display URLs, and state transition buttons filtered by role. Update by `eq("revision", expectedRevision)`; zero updated rows becomes a conflict instead of overwrite.

- [ ] **Step 4: Verify**

Run: `pnpm test && pnpm typecheck && pnpm build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "Build Medical Consultation Platform/src/features/admin"
git commit -m "feat: add resilient doctor publishing workflow"
```

### Task 7: Privileged Invitations and User Management

**Files:**
- Create: `supabase/functions/admin-invite/index.ts`
- Create: `supabase/functions/admin-user-status/index.ts`
- Create: `supabase/functions/_shared/authorize.ts`
- Create: `supabase/functions/tests/admin-functions.test.ts`
- Create: `Build Medical Consultation Platform/src/features/admin/AdminUsers.tsx`
- Create: `Build Medical Consultation Platform/src/features/admin/userAdminRepository.ts`
- Modify: `Build Medical Consultation Platform/src/App.tsx`

**Interfaces:**
- Produces: authenticated Edge Function endpoints for invitation and account status/role changes.
- Consumes: caller bearer token, server-only service role secret, `profiles`, `invitations`, and audit events.

- [ ] **Step 1: Write failing function tests**

Cover missing token, expired invite, reused invite, admin attempting to create owner/admin, owner inviting admin, admin inviting editor, self-disable prevention, owner protection, and revoked-user denial.

- [ ] **Step 2: Run function tests**

Run: `deno test --allow-env supabase/functions/tests/admin-functions.test.ts`  
Expected: FAIL before functions exist.

- [ ] **Step 3: Implement Edge Functions and management page**

Authorize the caller from the bearer token, re-read the caller profile on each request, validate an allow-list of operations, use the service role only inside the function, hash invitation tokens, set expiry, and write audit events. The UI lists accounts, creates invitations, changes editor status, and exposes admin-role controls only to owner.

- [ ] **Step 4: Verify**

Run: `deno test --allow-env supabase/functions/tests`  
Run: `pnpm test && pnpm typecheck && pnpm build`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions "Build Medical Consultation Platform/src/features/admin" "Build Medical Consultation Platform/src/App.tsx"
git commit -m "feat: add secure administrator invitations"
```

### Task 8: Fictional Launch Content and Generated Portrait Assets

**Files:**
- Create: `supabase/seed.sql`
- Create: `Build Medical Consultation Platform/public/doctors/*.webp`
- Create: `Build Medical Consultation Platform/tests/fictional-doctors.test.mjs`

**Interfaces:**
- Produces: eight idempotent `fictional_demo` published records and eight optimized portrait assets.
- Consumes: specialties and public doctor repository.

- [ ] **Step 1: Write failing content-safety tests**

Assert exactly eight unique fictional profiles, all with fictional kind/badge copy, no rating/license/hospital/patient/availability fields, valid specialty references, unique slugs, image alt text, and local optimized images under 250 KB each.

- [ ] **Step 2: Run focused tests**

Run: `pnpm test -- fictional-doctors`  
Expected: FAIL before seed/assets exist.

- [ ] **Step 3: Generate and integrate portraits**

Generate eight distinct, respectful studio portraits of fictional Iraqi medical professionals, with varied ages and genders, neutral clinical backgrounds, no logos, text, real-person likeness requests, or identifying documents. Inspect every asset, convert to WebP, and seed names, bios, languages, interests, and `fictional_demo` status. Make the seed idempotent with stable UUIDs and `on conflict`.

- [ ] **Step 4: Verify**

Run: `supabase db reset && pnpm test && pnpm typecheck && pnpm build`  
Expected: PASS and all eight cards render from database records.

- [ ] **Step 5: Commit**

```bash
git add supabase/seed.sql "Build Medical Consultation Platform/public/doctors" "Build Medical Consultation Platform/tests"
git commit -m "feat: add transparent fictional launch profiles"
```

### Task 9: SEO, Accessibility, Performance, and Operational Visibility

**Files:**
- Create: `Build Medical Consultation Platform/public/robots.txt`
- Create: `Build Medical Consultation Platform/public/sitemap.xml`
- Create: `Build Medical Consultation Platform/src/lib/seo.ts`
- Create: `Build Medical Consultation Platform/src/lib/telemetry.ts`
- Create: `Build Medical Consultation Platform/src/features/admin/ActivityLog.tsx`
- Create: `Build Medical Consultation Platform/src/features/admin/SystemStatus.tsx`
- Create: `Build Medical Consultation Platform/tests/production-readiness.test.mjs`
- Modify: `Build Medical Consultation Platform/index.html`
- Modify: `Build Medical Consultation Platform/src/App.tsx`

**Interfaces:**
- Produces: `setPageMetadata(meta)`, privacy-safe `captureAppError(error, context)`, activity route, and owner status route.
- Consumes: audit events, runtime configuration, route changes, and public doctor metadata.

- [ ] **Step 1: Write failing readiness tests**

Assert admin routes are `noindex`, public routes have canonical/title/description, fictional pages do not emit Physician schema, images have dimensions/lazy loading, reduced-motion styles exist, focus is visible, audit pages paginate, and telemetry strips emails/tokens/free-text form values.

- [ ] **Step 2: Run focused tests**

Run: `pnpm test -- production-readiness`  
Expected: FAIL.

- [ ] **Step 3: Implement readiness layer**

Add route metadata, sitemap/robots, accessible live announcements, privacy-safe error capture adapter, paginated audit UI, owner-only service status, cache-friendly asset naming, and performance budgets documented in CI.

- [ ] **Step 4: Run automated accessibility and bundle checks**

Run: `pnpm test && pnpm typecheck && pnpm build`  
Expected: PASS; main public bundle must not eagerly contain admin page modules.

- [ ] **Step 5: Commit**

```bash
git add "Build Medical Consultation Platform"
git commit -m "feat: harden public platform for production traffic"
```

### Task 10: Browser Journeys, CI, and Live Deployment Runbook

**Files:**
- Create: `Build Medical Consultation Platform/playwright.config.ts`
- Create: `Build Medical Consultation Platform/e2e/public-directory.spec.ts`
- Create: `Build Medical Consultation Platform/e2e/admin-doctors.spec.ts`
- Create: `Build Medical Consultation Platform/e2e/admin-permissions.spec.ts`
- Create: `docs/operations/admin-content-platform-runbook.md`
- Modify: `.github/workflows/medical-prototype-ci.yml`
- Modify: `Build Medical Consultation Platform/package.json`

**Interfaces:**
- Produces: repeatable public/admin smoke suites and exact production provisioning/deployment procedure.
- Consumes: seeded test database, owner/admin/editor test accounts, Supabase CLI, and existing CI.

- [ ] **Step 1: Write failing Playwright journeys**

Public: search, filter, paginate, open fictional profile, verify disclosure.  
Owner: login, create draft, upload image, publish, invite admin.  
Editor: edit/submit but cannot publish.  
Revocation: disable an open admin session and verify the next protected operation is denied.

- [ ] **Step 2: Run browser tests**

Run: `pnpm exec playwright test`  
Expected: FAIL until configuration and stable selectors exist.

- [ ] **Step 3: Implement test configuration and CI gates**

Add `test:e2e`; start Vite against local Supabase in CI; run database tests, unit tests, typecheck, format check, production build, and Playwright. Store traces only on failure and never upload environment secrets.

- [ ] **Step 4: Write and execute the live runbook**

The runbook must use these explicit steps:

1. Create/select the production Supabase project.
2. Set `SUPABASE_URL`, public anon key, and server-only service role secret in approved environments.
3. Apply migrations with `supabase db push`.
4. Deploy both Edge Functions and set their server secrets.
5. Upload/verify generated images and apply the idempotent seed.
6. Create the first owner through a one-time SQL transaction tied to the authenticated user UUID; remove the transaction script after use.
7. Enable email confirmation, configure trusted redirect origins, MFA for owner/admin, database backups, and alerting.
8. Configure the web host with public Vite variables and production domain.
9. Deploy the web bundle.
10. Execute public, owner, admin, editor, revocation, backup-status, 404, and mobile smoke tests against the live domain.
11. Record deployment commit, migration version, and rollback point.

Expected: a real production URL reads/writes the production database; a deliberately invalid write is rejected by RLS.

- [ ] **Step 5: Final verification and commit**

Run: `pnpm test && pnpm typecheck && pnpm format:check && pnpm build && pnpm exec playwright test`  
Run: `supabase test db`  
Expected: every command PASS.

```bash
git add .github "Build Medical Consultation Platform" docs/operations
git commit -m "test: verify live admin content platform"
```

## Completion Gate

The feature is complete only when:

- CI is green on the exact merge commit.
- The live domain loads published doctors from production Supabase.
- Owner, admin, and editor permissions are proven against production RLS.
- All eight fictional profiles show the disclosure and contain no fabricated real-world claims.
- A database backup exists and the restoration procedure has been rehearsed in a non-production environment.
- The owner can invite, revoke, create, edit, preview, publish, hide, and archive without code changes.
- Public mobile/desktop journeys and accessibility smoke checks pass.
- The deployment runbook records the active domain, project reference, migration version, and rollback commit without recording secrets.
