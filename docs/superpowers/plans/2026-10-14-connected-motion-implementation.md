# Connected platform and motion implementation plan

> **For agentic workers:** use superpowers:executing-plans; implement task-by-task with verification.

**Goal:** Complete the existing site's trusted feature adapters and add restrained navigation motion and a useful PHP deployment/reporting layer.
**Architecture:** Preserve React and Supabase identity/Postgres/Storage/RLS. PHP serves the production SPA and authenticated content reports; it does not create a second identity store.
**Tech Stack:** React 19, TypeScript, native Web Animations, Supabase/Postgres, PHP 8.3+, Node tests and browser tests.
**Spec:** ../specs/2026-10-14-completion-and-motion-design.md

## Global constraints

- 180ms route entry; opacity 0.2 -> 1; translateY 6px -> 0; cubic-bezier(0.2, 0.8, 0.2, 1).
- No animation package; query changes do not restart route motion.
- Reduced motion cancels/disables animation; stable shell and safe lazy loading.
- No service-role key in browser or arbitrary PHP upstream proxy.
- Persisted status is reported only after a successful trusted operation.
- No production migration or public deployment without a configured verified environment.

## Review focus

- Rapid navigation cancels old animation and stale network responses.
- Reduced-motion preference changes while animation is active.
- Tablet navigation between md and lg breakpoints.
- Cross-account writes/reads and caller-supplied privilege fields.
- Ambiguous writes/uploads and unavailable upstream configuration.

## Task 1: Navigation and motion

Files: src/components/system/RouteSurface.tsx, routeMotion.mjs and declarations; Layout, App, Header, AdminLayout, RouteAnnouncer, DoctorProfile, AuthProvider; tests/route-motion.test.mjs and interaction tests.
Consumes pathname and committed DOM; produces cancelable animateRouteEntry(element, preference) cleanup and RouteSurface(children).
- [ ] Write failing behavior tests for duration/keyframes, reduced motion, cancel and unsupported API.
- [ ] Implement shared route surface and stable lazy shell; repair tablet disclosure and session navigation.
- [ ] Exercise pointer/keyboard routes and rapid/preference changes; run suite/typecheck/build.

## Task 2: Durable content and verification

Files: additive supabase migration; features/content repository; article list/detail/editor/admin review; verification pages; courses/library pages; database types.
Consumes existing authenticated identity/current_role; produces RLS-protected drafts, review, published records, owned applications/bookmarks/progress.
- [ ] Write authorization/schema contract and repository behavior tests.
- [ ] Add constraints/policies/RPCs and adapters, then actual forms with loading/empty/error states.
- [ ] Exercise persistence and negative boundaries in available synthetic environment; report unavailable live verification explicitly.

## Task 3: Consultation and learning interactions

Files: consultation repository/Thread/Submit/provider workspace; task player/training repository; attachment/operation migration.
Consumes trusted identity; produces owned attachments and single-award completion with prerequisites.
- [ ] Write duplicate/progression/input validation tests.
- [ ] Implement actual player/detail/reset controls and database-backed progress; retain clinical approval boundaries.
- [ ] Add attachment retrieval and safe paging/deadlines; exercise failures and suite.

## Task 4: PHP serving and authenticated reports

Files: server/public/index.php, server/src/app.php, Dockerfile, server tests; report UI; additive report migration.
Consumes fixed backend origin and user bearer token; produces safe SPA/API routing, health and owned persisted report.
- [ ] Write HTTP tests for methods, unknown API, assets, no credentials, invalid/oversized JSON and safe failure.
- [ ] Implement allowlisted operation, deadline, fixed origin, headers and body bounds; no arbitrary proxy.
- [ ] Run PHP syntax/HTTP tests and production routing checks; document deployment/env requirements.

## Task 5: Verification and review

- [ ] Run all existing/new Node tests, typecheck, formatting, production build, PHP checks and browser interactions where available.
- [ ] Review changed code independently and fix important findings with regression evidence.
- [ ] Publish code and actual evidence; distinguish local/mocked/staging/live checks and remaining blockers.
