# MedConnect / Tanzeel — public-preview release gate (2026-10-30)

## Decision and permitted scope

Decision: **GO for a nonclinical, read-only demonstration after CI and visual review; STOP for patient accounts, consultations, professional credential verification, payments, or real medical data**. The owner explicitly wishes to **keep fictional sample articles for now**. They remain labeled fictional and medically unreviewed. Do not replace them or imply they are authoritative.

This is a proposal on a feature branch, **not approval to merge or deploy**. A public preview should be treated as a marketing/interface demonstration, not a medical service. The original main branch is unchanged.

## External review methods applied (not installed as CLI plugins)

- **BMAD / adversarial idea assessment**: scope a defensible minimal public preview; refuse a clinically operational launch without evidence.
- **gstack / CEO and engineering review**: attack the easy false positives — a good-looking form that accepts sensitive data, a toast that does not save, and claims of doctor verification.
- **GitHub Spec Kit / testable contracts**: record all accepted preview journeys and explicit forbidden outcomes.
- **Superpowers / evidence before completion**: add negative route tests, run CI gates, inspect actual output; a green unit suite is not a clinical release certificate.
- **Senior-level-website-development-skills**: G01 journey outcome, G04 failure behavior, G07 object access, G11 medical data, G13 license provenance, G14 release/rollback; follow FACTORY_POLICY and QUALITY_POLICY.

The BMAD, gstack, Spec Kit and Superpowers command-line plugins were **not installed or executed** by this change; the review methodology was applied directly. Installing overlapping agent runtimes should be a separate, reviewed Codex environment change, not a new production dependency.

## Preview configuration

For a **read-only, no-backend** public build:
- set `VITE_PUBLIC_PREVIEW=true`;
- **do not supply** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, or `VITE_ENABLE_PROTOTYPE=true`;
- build from a reviewed commit with `pnpm install --frozen-lockfile && pnpm build`;
- retain `noindex, nofollow` and a conspicuous sample-content warning;
- verify public routes in a browser on mobile/tablet/desktop before any publication.

The configuration gate refuses a preview with database credentials. In preview mode all authentication, admin, doctor verification and directory data screens are replaced with an unavailable state. The public article samples and local training demonstration remain accessible. The article composer is closed because it never persisted submissions.

**Separate flag:** `VITE_CONSULTATIONS_ENABLED` defaults to false. Setting it to true changes only the browser UI; **it is not an authorization or database security boundary**. Never enable without audited, deployed server-side controls, clinical/legal sign-off, migrations, incident handling, retention/deletion, and successful real integration tests. Avoid using production patient data in any tests.

## Acceptance and negative evidence checklist

| Requirement | Evidence path | Current gate |
| --- | --- | --- |
| No consultation form on /consultations, /consultations/new, /consultations/:id | `tests/e2e/smoke.spec.mjs` | CI pending |
| No public-preview credentials | `tests/release-boundaries.test.mjs` and `src/lib/runtimeConfig.mjs` | CI pending |
| Sample articles retained + labeled fictional | `src/pages/articles/List.tsx`, `tests/release-boundaries.test.mjs` | CI pending |
| No fake article submission success | `src/App.tsx` routes inactive editor to unavailable page | CI pending |
| No frontend account or medical verification entry points in preview | `src/App.tsx`, `src/components/layout/Header.tsx` | CI pending |
| Missing doctor image has bundled local fallback | `public/doctors/placeholder.svg`, `doctorRepository.ts` | CI pending |
| Strong browser behavior and layout on low-end mobile | Playwright/Lighthouse workflow | Not yet measured on candidate |
| RLS / cross-account / backups and restore on real Supabase staging | Issue #24 | BLOCKED pending approved staging |
| Legal and clinical content approval, real-provider identity checks | Qualified human review | BLOCKED |
| Competitor comparison with real device screenshots | Senior Skills visual quality gate | NOT PERFORMED |

## How to test this revision

```sh
cd "Build Medical Consultation Platform"
corepack enable
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm format:check
VITE_PUBLIC_PREVIEW=true pnpm build
# After installing browsers and preview server tools:
pnpm exec playwright test -c playwright.config.mjs
```

The existing browser CI builds a separate `VITE_ENABLE_PROTOTYPE=true` test mode; this does **not** prove the public-preview configuration's end-to-end behavior. Run a separate public-preview browser build and record screenshots on the exact release commit before GO. Passing isolated tests, security scanners, or source checks cannot certify patient-data security.

## Risks and rollback

- Frontend gates do not revoke existing Supabase policies or disable production APIs: keep public preview unconnected and nonclinical.
- Existing medical/doctor workflows and their SQL migrations are still present in the source tree; they must be reviewed independently before enabling.
- Existing feature branches #22, #25, #26 and QA PR #28 overlap and must be reconciled deliberately. Do not merge everything by default.
- Rollback: revert this feature branch/PR; no SQL migrations, schema changes, dependencies, cost or deploy introduced.
- Do not change production, store secrets, accept medical data, or merge without qualified review.
