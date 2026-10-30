# Healthcare website QA and benchmark review

Date: 25 October 2026 (Baghdad). Baseline: `77e2665` on `main`.

## Executed results

**291 tests passed, 0 failed, 0 skipped** with `npm test` on Node 24.22.1. This includes 210 newly added cases and the 81 existing checks. Counts are named test cases, not assertion counts or repeated suite runs. Parameterized cases represent different inputs or operations. Full console results: [test-results.txt](test-results.txt).

| Group | Cases | What was actually exercised |
| --- | ---: | --- |
| Existing suite | 81 | Existing contracts, source checks, runtime configuration, quota/session client behavior and training logic |
| Behavior matrix | 174 | 46 training availability/progress cases; 14 runtime configuration cases; 88 quota/RPC boundary cases; 26 existing emergency-trigger/non-trigger cases |
| Accessibility regressions | 6 | Actual React server-rendered header, input, and article markup |
| Directory regressions | 2 | Rendered query value and landmark; source guards for controlled search and replacement history |
| Public rendering | 23 | 17 public page components rendered with the real router/auth provider; 6 field attribute/escaping/description contracts |
| Session/training regressions | 5 | Delayed successful/failed heartbeat versus end/refresh, and an unknown training-stage ID |
| **Total** | **291** | **Node logic, RPC boundary simulation, React server rendering, and source contracts** |

RPC tests run the real client and transport against controlled HTTP responses, inspecting method, URL, credentials and JSON body. They do not call the production database. Server-rendered pages test component output; they do not run effects, measure CSS layout, or prove browser interaction. Emergency phrase tests preserve existing behavior and do not validate a clinical triage system.

Also executed: TypeScript type checking, repository formatting check, production Vite build, and `git diff --check`. The production build keeps the existing configuration gate when credentials are absent. A prototype-mode build also succeeded during investigation.

## Reproduced issues and fixes

| Issue | Evidence and resulting behavior |
| --- | --- |
| Navigation gap from 768px to 1023px | The desktop nav used `lg:flex` but the menu toggle used `md:hidden`. Both the toggle and menu now remain available until `lg`. |
| Active navigation conveyed only through color | Header destinations now expose `aria-current="page"`. |
| Mobile menu lacked Escape dismissal | Escape closes the menu and restores focus to its toggle. A browser regression is added; runtime browser execution remains pending. |
| Field IDs derived from labels | Shared inputs now use React `useId`, preserving explicit caller IDs and avoiding duplicate IDs for repeated labels. |
| Field errors and hints were not linked to inputs | Inputs now expose `aria-invalid`, merge caller descriptions, and reference error/hint IDs; errors use an alert role. |
| Article search/filter state was unnamed or visual-only | Search has an explicit accessible name and search type; filter buttons expose pressed state; results have a status count. |
| Doctor search could diverge from the URL | Search is controlled by the URL query. Typing replaces the current history entry rather than creating a Back step per keystroke. |
| Stale doctor cards could remain while a new request loaded/failed | Previous results are cleared when a new request begins. Existing cancellation protection is retained. |
| Directory nested a main landmark inside the layout's main | The directory now uses a normal container. |
| Late heartbeat could reactivate an ended/refreshed lab session | Heartbeat success and failure are ignored when a newer operation has changed the request version. Both race reproductions failed before the fix and pass afterward. |
| Unknown training IDs could appear complete | Stage existence is checked before the completed-ID list. |

Six accessibility and two directory regression cases were observed failing before their corresponding fixes. The original three logic regressions were also observed failing before their fixes; two additional cases cover stale heartbeat failures.

## Comparison with established healthcare websites

This is a scoped comparison of documented user journeys and accessibility expectations against repository behavior. It is not a visual screenshot comparison, a comparative performance benchmark, or a claim of equivalent clinical capability.

| Reference | Established behavior | Project finding and action |
| --- | --- | --- |
| [NHS accessibility statement](https://www.nhs.uk/accessibility-statement/) | Keyboard use, screen-reader support, clear labels, accessible forms, and zoom/reflow are stated goals. The NHS also reports its own remaining accessibility issues. | Fixed the verified navigation breakpoint mismatch, field relationships, search labels, selected states and directory landmark. Actual screen-reader, contrast and 400% zoom checks remain unverified. |
| [Mayo Clinic appointment journey](https://www.mayoclinic.org/scheduling-an-appointment-online/vid-20521112) | Authenticated appointment selection, review, explicit confirmation, instructions and cancellation/rescheduling. | This repository has no equivalent verified live appointment service. It must not imply parity. Consultation availability was left untouched as requested; no booking, payment or medical-service activation was added. |
| [Mayo Clinic portal assistance](https://onlineservices.mayoclinic.org/patientportal/support) | Distinct account, appointment, records, billing and technical-support topics. | The project has recovery/privacy/legal routes and prototype notices, but no verified staffed support operation. Render coverage now checks the public recovery and legal surfaces. A real support operation requires an operator/contact policy. |

## Consultation preservation

No files under `src/pages/consultations/` were changed. `PreviewNotice.tsx`, consultation repositories, emergency contact content and database migrations were also left unchanged. In this baseline, the global notice says: “وضع المعاينة: فعّل اتصال قاعدة البيانات لتشغيل الحسابات والحفظ والنشر.” The signed-out consultation list says: “استشاراتك خاصة بحسابك” and “سجّل الدخول لعرض الاستشارات المحفوظة.” There is no separate literal “currently unavailable” consultation screen in the inspected default-branch source. This change does not replace those messages or enable consultations.

## Remaining verification gaps

- No browser executable was installed in this environment. New Playwright tests cover tablet navigation, Escape/focus return, and article filtering; they are included in the existing browser CI workflow but **are not counted among the 291 executed cases**. Existing Playwright smoke checks were not executed locally either.
- No live Supabase credentials or local Postgres stack was used. Real patient/doctor/admin authentication, RLS, uploads, invitation email delivery, account recovery email delivery and persisted writes remain unverified here. Existing database CI gates remain in place.
- No real patient information, test account registration, production consultation, email, payment or load-test traffic was created.
- Doctor profiles and articles include explicit fictional/demo labeling. Real clinician credentials and editorial review remain an operational requirement, not something the tests establish.
- Performance, mobile layout, screen-reader operation, WCAG compliance and production availability require browser/staging validation. Passing these tests is not evidence that every feature or clinical workflow functions in production.

## Reproduce

From `Build Medical Consultation Platform` with the repository's pinned pnpm:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm format:check
pnpm build
```

For browser checks, follow the existing `.github/workflows/performance-gates.yml` sequence: build with `VITE_ENABLE_PROTOTYPE=true` for an isolated preview, install its pinned browser tools and browser binaries, then run the Playwright configuration. Never deploy that isolated prototype artifact as the connected production site.
