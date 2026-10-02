# Launch audit — 2026-10-02

Decision: **not ready to launch as a complete medical consultation service**.
This decision applies to the reviewed source and local/CI fixtures. No live deployment,
production Supabase project, SMTP configuration, or backup recovery has been verified.

## Evidence and scope

- Existing CI runs Semgrep, Gitleaks history scan, OSV-Scanner, pgTAP migrations/RLS,
  Chromium desktop/mobile smoke, prototype publishing journeys, bundle budgets and Lighthouse.
- Local Trivy 0.75.0 scan includes development dependencies and reports no HIGH/CRITICAL
  vulnerabilities or detected secrets. There are no recognized infrastructure configuration files
  to assess; zero misconfiguration findings does not verify a deployment.
- Added a checksum-verified, pinned Trivy CI gate. No PR-Agent token or account was assumed.
  An independent code reviewer assessed authorization and clinical-data workflows instead.
- Existing browser tests do not exercise a real signup email, password reset, physician
  verification, live consultations or production publication. k6 currently loads the home
  document with at most 20 VUs; it is not a backend capacity test.

## Security corrections included in this audit

- Role transitions are validated server-side; the account endpoint cannot grant owner.
- Auth account banning replaces the invalid UUID-as-access-token sign-out call.
- Admin edge functions declare CORS headers/methods and reject non-POST mutations.
- Private consultation tables and their storage bucket require an active account, even
  when the client retains an old identity/JWT.
- Patient inserts cannot forge doctor assignment or a completed consultation.
- Doctor updates cannot transfer patient ownership or rewrite the clinical submission.
- Closed consultations reject messages in SQL; rating updates check completed ownership.
- Added functional role-boundary tests and adversarial pgTAP cases.

## Remaining release blockers

1. `/auth/update-password` has no implemented route although reset emails point to it.
2. Staff invitations are sent but no atomic token acceptance/role grant exists.
3. `/verification/apply` only changes React state; no real submission or review workflow.
4. Uploaded consultation files are not linked to durable metadata or displayed/downloaded
   in the thread. Partial upload failures may leave a saved consultation and cause duplicates on retry.
5. `/articles` reads hardcoded mock articles and its editor does not persist submissions.
6. The doctor consultation list is not an assigned-doctor work queue.
7. Rate limits for application writes/uploads, privileged MFA, operational alerts,
   retention rules, backup export and restore drill remain unverified/unimplemented.
8. No deployed HTTPS origin, security headers, SPA refresh behavior, production Auth redirect
   allowlist, email delivery, production migrations or edge deployment have been tested.

## ASVS 5.0.0 sample mapping

This is an initial evidence map, not a claim of full ASVS conformance.

| Requirement | Evidence/status |
| --- | --- |
| V1.2.4 — protected database queries | Supabase client queries and SQL policies; scanners run. |
| V2.4.1 — anti-automation | BLOCKED: application write/upload limits need implementation and abuse tests. |
| V6.4.3 — secure password reset | BLOCKED: callback route missing; actual email/session test required. |
| V7.4.2 — disabled-session termination | PARTIAL: account ban + private-data RLS; refresh/login/session tests on deployed Auth required. |
| V8.3.1 — trusted authorization | PARTIAL: corrected role endpoint and SQL boundaries; invitations and adversarial live tests outstanding. |
| V13.4.2 — production debug modes disabled | BLOCKED: no final production configuration verified. |

Source: https://github.com/OWASP/ASVS/tree/v5.0.0

## Free hosting path

Cloudflare Pages Free can host the built static frontend using a `pages.dev` address;
Supabase Free can supply Postgres, Auth and Storage within its quotas. This requires
the owner's accounts and a connected project, not a paid subscription or purchased domain.

Free projects can pause after low activity and require a deliberate off-site database
backup process. Do not equate a free preview with an available medical service.

After blockers are fixed, deploy to a separate test environment, apply all migrations,
deploy both edge functions, configure Auth redirects/SMTP, and run connected role-based
browser journeys. Then run the authorized ZAP baseline and k6 with real read/write
scenarios and gradual load. Record the tested commit, URL, limits and reports before launch.

References:
- https://developers.cloudflare.com/pages/platform/limits/
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://supabase.com/docs/guides/platform/backups
