# Medical platform completion and restrained motion

Date: 2026-10-14
Status: selected architecture documented for written-spec review; implementation has not begun.

## Intent and selected architecture

The user wants the existing site completed for online deployment with real navigation, working controls, trusted persistence, PHP and JavaScript. The user delegated the architecture choice and added a requirement for restrained animation when changing pages/tabs, inspired by an uploaded navigation recording without copying its appearance.

Select the audit's Option B: retain React/Vite and the existing Supabase Auth/Postgres/Storage/RLS backend; add PHP only for concrete server operations and deployment serving. This selection differs from the earlier provisional preference for a full PHP migration: current source already contains connected account, doctor, consultation and quota workflows, and preserving those controls reduces migration risk and duplicated authentication. The user's objective is working behavior, not a wholesale backend rewrite.

PHP must do real useful work. It serves the production app with appropriate SPA/API routing and security headers and handles authenticated content-problem reports. It is not an unrestricted proxy, does not silently bypass RLS, and does not introduce a second account database. Existing protected administrative operations remain explicit Supabase functions until an independently justified change is reviewed.

Preserve the current visual identity. No new animation framework, heavyweight visual dependency or unrelated redesign is required for navigation motion.

## Subprojects and order

The completion request contains independent domains. Execute separately reviewable slices while retaining the full completion inventory:

1. Navigation and motion: route entry, active navigation state, tablet menu availability, account-aware navigation and auth return links.
2. Consultation reliability: real multi-identity workflow, attachment metadata/access, pagination, idempotent writes, provider worklist, stale-request protection.
3. Persistent content: articles and review, professional verification, academy/library content and user progress/bookmarks.
4. Real learning tasks: task player and trusted completion, prerequisites/XP, meaningful lab interactions with lightweight fallback.
5. PHP deployment/reporting: same-origin serving, health/config contract, authenticated reporting, staging and production handoff.

Each slice has its own implementation plan and tests. A slice being complete does not mean the whole platform is complete. The 155-element source inventory must be expanded and exercised at runtime, including dynamic controls.

## First slice: navigation and motion contract

### Evidence and cause

The uploaded 15.8-second recording shows a navigation bar changing the selected tab smoothly. It does not show full page content, so no full-page effect is inferred from it.

Current Layout attaches `page-enter` to an enduring main element. Its CSS animation runs on initial mount, not every pathname change. Existing nav links already transition color/background for 180ms; the missing behavior is a route-aware content entry and complete responsive navigation.

### Motion design

- Route content enters over 180ms using opacity from 0.2 to 1 and vertical translation from 6px to 0.
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Animate only opacity and transform. No blur, large scale, moving page background, autoplay effect or animation library.
- Header/footer remain stable; the reading surface changes. Auth and admin page content use the same restrained rule with their own stable shells.
- Do not wait for an exit animation before navigation. URL changes and route selection occur immediately; animation must not gate a network request or action.
- Trigger on pathname changes, including browser back/forward, after target route content commits. Search/filter query changes do not retrigger motion, reset form values or remount the shared shell.
- Cancel an earlier entry when rapid navigation replaces it. Latest route wins; no retained overlay may intercept input.
- `prefers-reduced-motion: reduce` disables spatial/fade route animation. Preference changes during animation cancel it.
- When the animation API is unavailable, show normal usable content immediately. No polyfill is needed.
- Loading and failure states remain explicit. Keep a stable shell while a lazy page loads; do not animate the fallback as if it were finished page content.

Implement a small shared `RouteSurface` React component. Its responsibility is route-aware entry and motion cleanup, not data loading, auth or navigation. Use native Web Animations where available and a layout effect tied to pathname; it must leave the element in its normal final state after cancellation/completion. Retain main DOM/focus semantics; no `key` that remounts the whole app or navigation shell.

### Tab and navigation feedback

- Selected navigation receives `aria-current="page"` and retains the current site's semantic active color.
- Hover/focus/selection feedback remains brief (approximately 140-180ms), with visible keyboard focus.
- Fix the 768-1023px gap: desktop navigation and menu-toggle/mobile-menu visibility use one consistent breakpoint. Test 360, 768, 820, 1023, 1024 and 1366 CSS-pixel widths.
- Mobile menu closes after route selection and Escape; dismissal returns focus to the toggle when appropriate. It is a disclosure menu, not a modal requiring a focus trap.
- Header reflects the actual auth state and supplies working account destinations/logout. Logout displays pending/failure state, clears protected content, and never silently simulates success.
- Use one interactive element per action; replace nested anchor/button controls with semantic links styled as controls as affected surfaces are completed.
- Auth pages offer home/login/signup/recovery destinations where relevant. Preserve and validate intended return destinations.

### Focus and scrolling

Keep the skip link and route announcements. Focus a committed page's main region after pathname navigation without unexpected scroll. Avoid focusing loading fallback before the target page exists. Same-route queries preserve focus. Back/forward and hash destinations must retain appropriate scroll behavior; do not force every transition to scroll to top. Define new-page scroll only where it does not override history/hash intent.

### First-slice acceptance

1. Navigate through main destinations by pointer and keyboard; path and content update with a brief entry animation.
2. Wait for lazy content; header remains stable and final content receives motion/focus.
3. Change search query on a page; no route animation/remount and current input remains intact.
4. Navigate rapidly and use back/forward; latest route displays, no animation residue or blocked controls.
5. Enable reduced motion before navigation and while an animation runs; no remaining spatial animation.
6. At 768/820/1023px there is always usable primary navigation.
7. Open/close menu, use Escape, choose a destination; expanded state and focus are correct.
8. Sign in/out with real staging accounts; header follows session, logout failure is visible, and direct protected access is denied after logout.
9. Production typecheck/build and existing tests remain green. Browser tests exercise real DOM interactions; source-text assertions alone cannot prove motion.
10. Record JS-size change; no added animation dependency. Trace representative navigation on a recorded constrained profile and inspect reduced-motion behavior.

## Persistent behavior contracts for subsequent slices

### Consultations

Patient identity is derived from authenticated session; assigned provider/admin capabilities are server-enforced. The same consultation survives refresh; another patient cannot read its body/messages/files. Operation keys scope create/send actions and reject mismatched replays. Upload intents, validated private objects and durable metadata support participant-scoped download and reconciliation; closing a consultation disallows new messages. Lists/messages are bounded with stable ordering. Provider worklist and reply/status controls must correspond to real assigned records.

### Articles and review

Replace connected-mode mock list/detail with published database content and explicit empty state. Authenticated permitted authors persist drafts; editing/review/publication rules are server-enforced. Sending to review creates a durable state and visible history, not a preview toast. A public page cannot expose draft/rejected content. Medical review identity/status must be real rather than invented.

### Professional verification

Persist an owned application and private documents with size/type/access controls. Applicant sees real state after refresh. Reviewer/owner decision is auditable, and an application alone grants no provider authority. Existing requested-role semantics remain separate from approved permissions.

### Academy/library

Real published records, detail screens, search and authorized enrollment/bookmarks/progress. Content can legitimately be empty. Do not fabricate courses, authors, certificates or reviewed material to make a route look populated. Every advertised action gets a persisted effect and failure state.

### Training/labs

Start opens an actual task rather than awarding completion. Details show task instructions. Results determine progress under a server contract; prerequisites and awards are enforced once, not trusted from client XP claims. Reset is an explicit user action with defined scope. Lab quota remains server-authoritative; quota start alone is not completion of a clinical task. Public clinical examples retain their actual approval status. Anatomy must remain usable with a lightweight fallback when 3D is unavailable.

## PHP service and deployment contract

Use a currently supported PHP version available on the chosen host, validated in CI; minimum project target PHP 8.3 with curl/json and appropriate process/web-server support. Pin the actual deployment image/version when hosting is chosen.

- Document root exposes only compiled public assets/front controller. Configuration, logs, private data and source are not downloadable.
- Same-origin `/api/health` returns minimal process health; readiness distinguishes missing backend configuration without exposing secrets.
- `/api/content-reports` accepts only a bounded validated JSON schema: content type, content ID and plain-text reason. It requires a valid authenticated Supabase identity and an active allowed profile.
- Forward the caller's token only to the fixed configured Supabase destination for the report operation, preserving RLS. Never accept a caller-supplied upstream URL/function/table, and never use service-role authority for arbitrary user reports.
- Introduce report schema/policies with additive SQL migration and RLS tests. Caller identity is authoritative; supplied owner/role fields are rejected. Limit request/body/report rate in trusted storage rather than relying only on in-process counters.
- Set dependency timeouts and bounded response sizes. Return safe error codes/request IDs; tokens/clinical text are excluded from logs. No automatic retry of a non-idempotent write without an explicit replay policy.
- Report confirmation only follows real persistence; failed requests preserve reason input.
- PHP and React remain one deployable origin where practical. SPA deep links must work on refresh; missing asset/API URLs must not receive HTML masquerading as successful JSON.
- HTTPS, fixed trusted origin, cache policy, CSP and other headers must fit actual auth/storage/font endpoints. Public assets may be cached; private responses are not shared.
- Deploy to staging first, verify account/email/storage flows with synthetic records and exercise backups/rollback. No live DB migration or paid hosting resource is provisioned by this design document.

## Evidence and remaining dependencies

Audit baseline remains 81 passing existing checks, passing typecheck/format/build, and no executed browser/live DB tests. Browser download failed in the environment and PHP is not currently installed; neither is assumed solved by this spec.

Implementation must provide a PHP runtime and actual browser execution environment, using CI if necessary. Connected staging requires Supabase project configuration and email/storage setup. No credential may be printed in the conversation, committed or embedded as a privileged browser variable.

Release evidence lists implemented/mock/blocked status per feature and actual commands/results. “All buttons work” is permitted only after the inventory's promised outcomes have been exercised. No public clinical readiness, legal compliance or flawless security claim follows from a green build.

## Review decision

Architecture chosen: preserve existing Supabase infrastructure and add scoped PHP behavior. Visual direction chosen: 180ms restrained route entry, 6px movement, no extra motion package. Native implementation is proposed to keep changes and evidence in one session.

The next required workflow stage is written-spec review before implementation planning. This document is concrete for review; it does not claim code has been implemented.
