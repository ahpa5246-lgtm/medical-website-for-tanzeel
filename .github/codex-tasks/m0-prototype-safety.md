# M0 — Prototype Safety Hardening

Tracking issue: #1

## Objective
Make it impossible for a reasonable visitor to mistake the current Arabic RTL front-end prototype for an operational medical service. Do not add a backend or collect real personal or medical information.

## Required scope
1. Show a persistent, non-dismissible Arabic prototype warning on every route, including authentication routes.
2. Mark mock doctors, consultations, responses, articles, ratings, statistics, and identities as fictional demonstration data at the point of use.
3. Remove or clearly negate unsupported claims about encryption, anonymity, verified clinicians, message delivery, deletion/export, or auditing.
4. Ensure medical questions are never placed in URL query parameters.
5. Disable real file selection in prototype mode.
6. Centralize existing emergency UI and copy in one source. Do not invent, alter, or medically validate emergency numbers or clinical instructions.
7. Preserve `noindex, nofollow`.
8. Add focused automated tests for the safety gates changed.

## Validation
Use the committed lockfile and intended package manager. Run the existing TypeScript check, formatter check, production build, and all new tests. Report exact commands and results. Self-review for security, accessibility, regressions, and scope.

## Prohibited
No backend, database, authentication provider, secrets, production deployment, medical-data collection, paid service, destructive rewrite, direct push to `main`, merge, or unsupported clinical/legal claim.

## Delivery
Implement on this branch and update this pull request. Include summary, risks, validation evidence, and unresolved human-review items. Do not merge or deploy.
