# Senior framework application: medical platform baseline

Date: 2026-10-14. Source snapshot: `77e2665a7c59ef8981fb57965aac2ae2c7ad06e8` on `main`.

Status: audit completed; requested functional completion and PHP implementation are NOT completed. No application code, live database, user account or deployment has been changed by this audit.

Framework: [Senior-level website development skills](https://github.com/ahpa5246-lgtm/Senior-level-website-development-skills). Its feature contracts, failure/evidence matrix and smallest-appropriate-architecture rules were applied to the existing code.

## User outcome

Make the existing Arabic medical site deployable with real navigation, functioning controls, persistent trusted behavior, PHP and JavaScript. Preserve useful existing code and visual identity; do not substitute a new static mockup. Success means exercised user outcomes, not just a production build.

## Verified baseline

| Check | Actual outcome | Limit |
| --- | --- | --- |
| Source access | GitHub connector retrieved the private repo's text files | Normal unauthenticated git clone fails; no token was placed in code |
| Frozen dependency install | Passed | Local pnpm 11.25.0, Node 24.19.0; repo requests pnpm 9.15.9, CI Node 22; not identical CI environment |
| `node --test tests/*.test.mjs` | 81 passed, zero failed | Many tests inspect source text; some exercise quota/progression helpers with doubles |
| `pnpm typecheck` | Passed | Does not exercise backend runtime |
| `pnpm format:check` | Passed, 97 files | Does not verify functionality |
| `pnpm build` | Passed | Default no-credential artifact deliberately blocks the connected application |
| `VITE_ENABLE_PROTOTYPE=true pnpm build` | Passed | Prototype rendering only; this flag is not a production solution |
| PHP runtime | Not installed in execution environment | No PHP implementation exists in the source snapshot |
| Browser E2E | Not executed | No installed browser; browser download failed with invalid/truncated archive. Do not report browser checks as passed |
| Database/RLS | Tests present, not executed here | No configured Supabase/staging credentials/database supplied |

Initial typecheck/build failures came from intentionally omitted `.figma/make/site.json` in the local source retrieval. Fetching the repository's existing file resolved them without a source change. Initial formatting mismatch came from a local retrieval newline artifact, which was removed; neither issue is a product defect.

Build warnings: Vite warns about future native config loading (`__dirname` and JSON import attributes). Main index chunk approximately 93.1kB gzip, Supabase chunk approximately 55.1kB gzip, CSS approximately 17.2kB gzip. These are emitted asset sizes, not measured user transfers, CPU cost, Core Web Vitals or proof of low-end performance.

## Route and feature inventory

| Area | Existing implementation | Missing outcome / necessary evidence |
| --- | --- | --- |
| Public navigation/home | React Router routes and real home-to-consultation draft handoff | Actual browser click/back/refresh checks on deployment; intermediate-width navigation fix |
| Auth | Supabase signup/login/recovery/update-password/invitation calls | Real email delivery, account sessions, role refresh, logout for normal users and denial tests |
| Doctors | Database-backed public directory/profile; pagination | Real configured DB, resilient search/profile loading, verified-provider consultation action |
| Consultations | DB creation/list/thread/messages/rating; private upload function | Real multi-account workflow, attachment metadata/read/download, idempotency, pagination, doctor work queue/status UX |
| Admin | Protected doctor editor, user invitations/status, consultation assignment | Real privilege-boundary and concurrent edit evidence; unknown admin route state |
| Articles | In-memory fictional article list/detail | DB authoring/review/publication, permissions and durable saved status |
| Verification | Form validates locally and displays preview | Private documents, persistent application/review state, role grant only after trusted review |
| Courses/library | Explicit phase-preview pages | Content model, actual list/detail/search, enrollment/progress/bookmarks where promised |
| Training | Local demo stages and localStorage progress | Actual task player, meaningful completion, server progress/XP and reset policy |
| Labs | Server quota RPC client/session contract; planned modules | Actual case/quiz/anatomy content engine and lite fallback; current start opens quota session only |
| Legal/error | Static text and app not-found route | Deployment-specific policies, HTTP routing/status behavior and launch metadata |

## Confirmed source-level findings and remedies

### F01: navigation disappears between 768 and 1023 CSS pixels

`src/components/layout/Header.tsx`: primary navigation is `hidden ... lg:flex`, but toggle/mobile menu is `md:hidden`. At intermediate widths neither primary menu is available.

Remedy: use one consistent breakpoint for navigation and toggle/menu, and exercise tablet widths, open/close, route selection and keyboard behavior. Matrix 17, 19, 21, 27.

### F02: a task-details button has no action

`src/pages/training/Training.tsx`: the final `button` labeled “تفاصيل المهمة” has no click handler, link or associated detail surface.

Remedy: open a named task details surface with accessible focus behavior, or link to a real task route. Verify content changes and dismissal/return. Matrix 17.

### F03: starting training immediately awards completion

Same file: “ابدئي المحاكاة” calls `completeSelected()`, stores the selected ID in localStorage and advances to the next stage. There is no simulation/task interaction preceding completion.

Remedy: start a real task screen, validate completion from the trusted result and award progress once; keep any purely local demo explicitly separate. Test failed attempts, prerequisites, replay and cross-device persistence. Matrix 17, 20, 41, 47.

### F04: article authoring and browsing are disconnected

`src/pages/articles/Editor.tsx`: submission only sets a preview message. List/detail import `MOCK_ARTICLES`, even when the rest of the app is configured as connected.

Remedy: protected persisted draft -> review -> publication workflow; public queries return published records; no fake saved message. Test author vs reviewer vs visitor, empty results and refresh persistence. Matrix 17, 41, 83.

### F05: verification has no trusted operation

`src/pages/verification/Application.tsx`: local `setSubmitted(true)` displays a preview. Document upload is disabled and no backend request is made.

Remedy: persist an owned application with private document metadata and review history. Keep requested doctor role separate from granted authority; only authorized review may approve it. Matrix 17, 41, 52, 58.

### F06: academy/library do not contain their promised functions

`src/pages/courses/List.tsx` and `src/pages/library/List.tsx` render `PhasePreview` only. They are honest placeholders, not completed features.

Remedy: real content queries and detail/search flows; enrollment/progress/bookmarks only when defined. Empty content is a valid state; fabricate neither clinical material nor progress. Matrix 17, 18, 83.

### F07: consultation attachments stop at upload

`src/features/consultations/consultationRepository.ts` uploads to a private bucket and returns a path; Thread does not load/display attachment metadata or offer authorized retrieval. Retry recovery does not resolve every ambiguous network completion.

Remedy: owned upload intent and persisted metadata, participant-scoped listing/signed downloads, safe file handling and reconciliation. Verify attachment visibility to the intended participants and denial to another patient. Matrix 47, 53, 58.

### F08: normal user navigation does not reflect authentication

Header always offers “دخول” and contains no normal-user account/logout action. AdminLayout has logout, but ordinary users cannot access that area. Login also lacks a visible return-home/signup link.

Remedy: session-aware header with account/consultation destinations and working logout, plus coherent auth-page navigation and failure feedback. Matrix 19, 20.

### F09: asynchronous stale-state risks

`src/pages/doctors/Profile.tsx` does not clear `error` on slug change or ignore superseded results. AuthProvider's async profile read has no identity guard; Thread reload is similarly susceptible to responses for previous IDs.

Remedy: request identity/cancellation and state reset tied to current entity/session. Test delayed old response arriving last and signout/account change during a profile read. Matrix 36, 40, 53; no unauthorized server disclosure is claimed from source inspection alone.

### F10: query/request volume needs bounding

Doctor directory updates search parameters on each keystroke. Consultation patient list and messages return all matching rows. No feature-level deadline or idempotent create-message contract is defined.

Remedy: debounce suitable searches, enforce bounded pages and deterministic ordering, explicit deadlines and scoped atomic operation keys. Verify realistic data sizes and duplicate/concurrent requests. Matrix 44-47, 66.

### F11: accessibility gaps remain

Several select/textarea labels lack associated IDs; consultation thread textarea relies on placeholder. Multiple anchors wrap buttons. Nested `main` remains on some routes (e.g. Training/Doctor pages inside Layout's main). Manual focus/screen-reader/reflow evidence is absent.

Remedy: semantic single interactive elements, associated labels, one primary landmark and tested keyboard/focus/announcements. Matrix 27-30. This is not an exhaustive accessibility audit.

### F12: deployable output is not a configured product

Default missing configuration produces a blocked screen. Build output keeps `noindex` and `robots.txt` disallowing crawling. No PHP runtime/API, real hosting configuration or connected staging verification is present.

Remedy: explicit backend configuration, same-origin app/API routing, production artifact checks, deployment-specific indexing and metadata, restore/rollback evidence. Matrix 91-100. Retain intentional noindex for private/staging pages.

### F13: green tests and old documentation overstate/understate different aspects

81 checks pass while known preview features remain. IMPLEMENTATION_STATUS says no real backend exists, while newer repository calls/migrations implement connected operations.

Remedy: feature-by-feature evidence and current status; keep source-presence tests as structural checks, add executed business, API and browser journeys. Matrix 82-85, 100.

## Full framework assessment

[100-item assessment](2026-10-14-framework-assessment.json) preserves every original matrix ID, constructive alternative and verification procedure. Current categories:

- 33 confirmed implementation or evidence gaps; this is not “33 proven vulnerabilities.”
- 17 relevant controls/structures exist in code but have not been behaviorally proved.
- 50 unverified items, requiring their specified checks before any pass claim.

[Control inventory](2026-10-14-control-inventory.json) lists 155 JSX control elements (links, buttons, forms and fields) with source locations. Inventory does not mean 155 actions were tested; generated/dynamic controls require runtime expansion.

## PHP architecture choices for review

Adding PHP is an architectural change, because auth, storage and SQL policies currently rely on Supabase. JavaScript already executes through React; PHP is not required to make route links work.

| Option | Behavior | Trade-off |
| --- | --- | --- |
| A: React + PHP application API + PostgreSQL (recommended if PHP is the required backend) | Keep UI, migrate repositories behind PHP endpoints, use maintained auth/session implementation, relational storage and private files | One trusted application backend; must port/reprove auth, object authorization, quota and workflows; PostgreSQL/container-capable hosting needed |
| B: React + Supabase, PHP for narrowly defined server operations | Preserve existing DB/Auth/RLS and add PHP only where it owns a concrete operation | Less migration; still needs a configured Supabase project; avoid a redundant unrestricted proxy or a second identity system |

Proposed Option A boundaries: auth/profile, doctors/admin, consultations/messages/attachments, content/review, professional verification and learning/progress. Use a maintained PHP framework rather than handcrafted authentication. PHP owns validation, object/action authorization and state transitions. Retain existing React views and replace data adapters incrementally. Do not publish live clinical functionality until its existing review/provider requirements are fulfilled.

First implementation slice: real accounts/session-aware navigation + all route/control repairs + one consultation journey with private attachments and an authorized provider/admin response. Then complete article/verification/content and learning slices with their own contracts and tests. Each visible feature remains tracked until exercised; unavailable content cannot be called complete merely because it is hidden.

Acceptance: patient A signs up/logs in/submits; refresh confirms the same record; authorized provider responds; patient B is denied; duplicate submission creates one record; protected attachment is downloadable only by participants; tablet/mobile navigation works; every control's promised outcome is exercised; production build plus PHP/API tests and route-refresh smoke tests pass. Later slices require equivalent persisted completion/review evidence.

No architecture has been approved by this audit. No code implementation or public deployment is claimed. Hosting/DB/mail/private-storage configuration must be selected and tested against synthetic staging data.

## References

- [Senior framework](https://github.com/ahpa5246-lgtm/Senior-level-website-development-skills)
- [PHP PDO prepared statements](https://www.php.net/manual/en/pdo.prepared-statements.php): parameterization at SQL boundaries; identifiers/dynamic SQL still require control.
- [Supabase server-side auth documentation](https://supabase.com/docs/guides/auth/server-side): relevant if retaining provider auth with server-side integration.
- Existing repository docs: `2026-09-18-production-readiness-design.md`, `2026-09-19-admin-content-platform-design.md`, `2026-10-08-medical-hardening.md`. Current PHP request supersedes an assumption that Supabase must remain; options are presented for review rather than silently choosing a destructive migration.
