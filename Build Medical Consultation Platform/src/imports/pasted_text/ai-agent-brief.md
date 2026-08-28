# AI Coding Agent Master Brief — Medical Consultation, Education & Reference Platform

**Working title:** use a placeholder name (e.g. `MedConnect`) until the founder finalizes branding.
**Founder profile:** non-technical domain expert with a medical/academic background, specialized in course creation and educational content. Building 100% via AI-assisted ("vibe") coding. Has no programming background — the AI agent must make sound technical decisions independently, but must explain and confirm major/business-impacting decisions rather than silently deciding.

---

## 0. How the AI agent should use this document

This document is the single source of truth for scope, architecture, and constraints. Read it fully before writing any code.

Working rules for the agent:

1. **Build in the phased order defined in Section 9.** Do not start Phase 2 or 3 features before Phase 1 is fully functional, tested, and deployed. A working narrow slice beats a broad, half-finished surface.
2. **Confirm before deciding, don't confirm everything.** Library/framework choices already specified in Section 5 are final — don't re-litigate them. But business-impacting decisions not specified here (pricing, commission %, moderation staffing, specific specialty list) must be flagged to the founder, not silently assumed. See Section 12 for the running list of open decisions.
3. **This is a healthcare-adjacent product.** Treat correctness, data privacy, and security as more important than feature velocity or visual polish. A broken payment flow or a leaked verification document is a much bigger problem here than in a typical app.
4. **Write production-quality code, not demo code.** No placeholder logic left silently in a path a real user can hit. If something is stubbed, mark it clearly (`// TODO:` + a one-line explanation) and tell the founder in plain language what's still missing.
5. **Do not add narration comments.** Comment only where the *why*, not the *what*, needs explaining. Do not write a comment above every line restating what the line does.
6. **Keep the codebase small and legible.** Prefer boring, well-understood patterns over clever abstractions. The founder cannot review code herself — the agent's discipline is the only quality gate.

---

## 1. Product overview

A bilingual (Arabic-first, RTL; English secondary), mobile-first web platform that gives people in regions with limited access to healthcare:

- **Free medical consultations** — patients submit a question tagged by specialty; verified doctors in that specialty respond.
- **Courses** — free and paid, created by the founder initially, later opened to verified external instructors.
- **A digital library** of medical books, references, and concise summaries of paid textbooks (legally scoped — see 4.6).
- **A health article hub** answering common public questions (nutrition, chronic disease, mental health, myths and misconceptions), written or reviewed by qualified contributors.
- **An interactive, gamified learning hub** — hands-on clinical case simulations and visual/3D learning modules in the spirit of hands-on practice-lab platforms (e.g. cybersecurity training sites), free for one hour per day and unlimited via a low-cost monthly subscription. See 4.13.

The unifying design principle: **trust is the product.** Every feature — verification, disclaimers, review queues — exists to make sure the platform is actually safe to use, not just functional.

---

## 2. Non-negotiable safety & trust principles

These override convenience or speed everywhere in the product:

- **Only verified, licensed doctors may respond to consultations.** No AI-generated clinical answers are ever shown to a patient as if from a doctor. AI may assist with non-clinical tasks only: tagging suggestions, spam/abuse detection, search ranking, translation assistance, summarizing a doctor's own draft at their request.
- **Every consultation page carries a persistent, unmissable disclaimer**: this service does not replace an in-person examination, is not for emergencies, and creates no doctor–patient liability relationship beyond what the responding doctor explicitly offers.
- **Emergency detection:** if a patient's submitted text matches red-flag patterns (e.g. chest pain, severe bleeding, suicidal ideation, loss of consciousness), show an immediate banner directing them to real emergency services *before* they even finish submitting — do not make them wait for a doctor's reply.
- **Doctor and instructor identity verification is mandatory** before any public-facing privileges are granted (answering consultations, publishing courses/articles). Verification documents (license, syndicate ID, diploma) are visible only to the admin/reviewer role, never public, never returned in any general API response.
- **All medical content (articles, course claims) goes through a medical-reviewer approval step before publishing.** This is especially important for high-risk topics like rapid weight loss, unsupervised exercise programs, or medication-adjacent advice — enforce an editorial policy that rejects unsafe or unrealistic claims and requires evidence-based framing.
- **Data protection:** treat health-related messages, documents, and profiles as sensitive data by default — encrypted at rest, access-logged, exportable/deletable by the user on request, never sold or shared with third parties.
- Recommend the founder have a local lawyer confirm any telemedicine/healthcare-information regulations that apply in her country before launch — rules on doctors answering patients online vary a lot by jurisdiction and this brief cannot substitute for that review.

---

## 3. User roles & permissions

| Role | Can do |
|---|---|
| **Guest / unauthenticated** | Browse public articles, course catalog, library catalog (read-only) |
| **Patient** (default signed-up user) | Submit consultations, enroll in courses (free/paid), rate/review, save/bookmark content |
| **Doctor (pending)** | Same as patient, plus a verification application in progress; cannot answer consultations yet |
| **Doctor (verified)** | Answer consultations in their approved specialty, appear in the public doctor directory, optionally author articles (still subject to medical-reviewer approval) |
| **Instructor (pending)** | Same as patient, plus a verification application in progress |
| **Instructor (verified)** | Create and submit courses (go live only after admin/content review), see their own enrollment analytics and revenue |
| **Medical reviewer** | Approve/reject articles and course content for medical accuracy; cannot manage users or payments |
| **Admin** | Full access: user management, verification queues, content moderation, reports, analytics, role assignment, audit log |

Authorization must be enforced **server-side on every request**, never inferred from hiding a UI button. Prefer a system with declarative row-level access rules (see Section 5) over hand-written `if (user.role === 'admin')` checks scattered through the codebase — hand-written checks are exactly where AI-generated code tends to introduce security holes.

---

## 4. Feature modules

### 4.1 Authentication & onboarding
- Email/password **and** phone number + OTP (phone-based auth is widely trusted and used in the target region — do not make email the only option).
- Email/SMS verification before granting posting privileges.
- Role selection at signup: "I'm a patient" vs "I'm a doctor" vs "I want to teach" — the latter two immediately start a verification application instead of granting the role.
- Password reset, session management, optional 2FA (recommended mandatory for doctor/instructor/admin accounts given their elevated privileges).

### 4.2 Doctor & instructor verification workflow
- Application form: full name, specialty (single choice from a controlled taxonomy — see Section 11), medical syndicate/license number, years of experience, short bio, document upload (license/diploma, government ID).
- Status states: `pending → under_review → approved / rejected (with reason) / needs_more_info`.
- Admin/reviewer queue with document viewer, approve/reject actions, and a free-text reason field that is sent back to the applicant.
- Approved doctors appear in a public, filterable directory (by specialty). Rejected/pending applicants never appear publicly and cannot answer consultations.
- Consider requiring re-verification or license-expiry tracking as a later enhancement — not required for MVP but leave a `verified_until` field in the schema so it's easy to add.

### 4.3 Medical consultations
- Patient submits: title, free-text description, one or more specialty tags, optional image attachments, optional "anonymous" toggle (shown to the doctor and publicly as "Patient #1234" instead of real name).
- Consultation enters a specialty-filtered queue; verified doctors in that specialty are notified and can claim/answer it. Default model: **one assigned responding doctor per consultation** (avoids conflicting public advice); a "request a second opinion" flow can reopen it to another doctor later.
- Threaded follow-up: patient can reply to the doctor's answer within the same consultation; keep the whole exchange in one thread, not scattered messages.
- Emergency-pattern detection on submission (see Section 2).
- Rating + optional written feedback after the doctor closes the consultation.
- Rate-limit consultation submissions per user (prevents spam/abuse of free doctor time).
- Full audit trail of who answered what, for accountability.

### 4.4 Courses & academy
- Course builder: title, description, specialty/category, level, price (or free), cover image, structured into modules → lessons.
- Lesson types: video (hosted externally, see 5.4), downloadable resource, text/article-style lesson, quiz (auto-graded, multiple choice/true-false at minimum).
- Progress tracking per enrolled user; certificate (PDF, auto-generated) issued on reaching a configurable completion threshold.
- Free courses are enrollable immediately after signup; paid courses require successful payment (see 5.3) before content unlocks.
- Course reviews/ratings, visible on the catalog page.
- Catalog filtering: specialty, price (free/paid), level, rating.

### 4.5 Instructor / contributor marketplace
- Verified instructors (see 4.2) get a "create course" flow, but the course stays in `draft` until an admin/content reviewer approves it — this applies to *every* instructor including the founder herself, to keep one consistent quality bar.
- Instructor dashboard: their own courses, enrollment counts, ratings, and (if paid courses are enabled for them) revenue reporting.
- Configurable platform commission percentage on paid third-party courses (business decision — see Section 12).

### 4.6 Digital library & reference summaries
- Upload (admin/verified contributor) of PDFs or e-book files, with title, author, specialty category, description, and a rights/license field.
- **Copyright compliance check is mandatory before anything is published**: only upload material the platform has rights to distribute (public domain, open-access, or explicitly licensed works). Build the upload flow so the uploader must confirm rights ownership/licensing before the file goes live, and give admins an easy takedown action.
- Search and filter by category/specialty; track download/view counts; optional in-browser reader in addition to download.
- **Book & reference summaries (new).** Qualified contributors write concise summaries of medical textbooks/references so learners get the core ideas without buying an expensive book. **Legal nuance the founder must understand before this scales:** a summary is not automatically exempt from copyright just because it's shorter than the original — the risk depends on how much of the book's substance it captures and whether it could realistically substitute for buying it. A short, conceptual "key ideas" write-up in the summarizer's own words is on much safer ground than a comprehensive chapter-by-chapter reproduction of a paid textbook, especially one explicitly positioned as a free alternative to purchasing it. Practical guardrails to build in:
  - Prioritize public-domain and open-access references for full, detailed summaries — no ambiguity there.
  - For commercially-sold, copyrighted textbooks, keep summaries short and clearly original wording (not close paraphrase following the book's own structure/examples) — a study-guide overview, not a substitute for the book.
  - Always credit the original title, author, and edition, and link to a legitimate way to access the full work where possible.
  - This carries real legal risk, not just a formality — get a local lawyer to review the summaries feature specifically (copyright/fair-use rules differ by country) before scaling it beyond a small pilot.

### 4.7 Health articles / content hub
- CMS with categories (e.g. Ramadan nutrition, weight management, mental health, chronic disease management, myth-busting).
- Any non-admin author's article is `draft` until a medical reviewer approves it. Reviewer can request edits with inline comments, not just accept/reject.
- Editorial policy baked into the review checklist: no unsafe/extreme claims (e.g. no specific rapid-weight-loss numeric targets without medical caveats), evidence-based framing, encourage professional consultation for individualized cases.
- SEO-friendly structure (clean URLs, meta descriptions), related-articles suggestions, category browsing.

### 4.8 Site-wide search
- Single search bar covering articles, courses, library items, and the doctor directory, with results grouped by type.
- See Section 5.5 for the recommended search engine — this should not be a simple `LIKE '%query%'` SQL query; it needs to handle Arabic text reasonably well and rank results by relevance.

### 4.9 Notifications
- In-app notification center (new consultation reply, verification status change, course update, new review) at minimum for MVP.
- Transactional email for account/security events and verification status changes.
- Push notifications are a reasonable Phase 3 addition if the app becomes a PWA — not required for MVP.

### 4.10 Reviews & ratings
- Applies to: doctors (post-consultation), courses, instructors (aggregate of their courses).
- Basic abuse protection: one review per completed interaction, ability to report/flag an abusive review, admin can remove.

### 4.11 Admin & moderation dashboard
- Doctor verification queue, instructor verification queue, course approval queue, article approval queue — each with approve/reject/request-info actions.
- User management: search, view profile, suspend/ban, change role.
- Reports/flags queue for user-reported content or answers.
- Basic analytics: active users, consultation volume by specialty, revenue by course, most-viewed articles.
- **Audit log** of every admin action (who approved/rejected/removed what, and when) — critical for accountability on a platform handling medical trust decisions.

### 4.12 Legal & static pages
- Terms of Service, Privacy Policy, **Medical Disclaimer** (prominent, linked from every consultation-related page), Refund Policy (for paid courses), Cookie notice if applicable.
- These should exist even in a minimal form before Phase 1 launch — do not ship consultations live without the disclaimer page in place.

### 4.13 Interactive learning hub (gamified, hands-on "labs")

The concept: adapt the hands-on, gamified practice-lab model used by platforms like cybersecurity training sites to medical education — instead of reading passively, learners work through interactive clinical case simulations and visual/spatial learning modules that feel like play. Treat this as the single most technically ambitious feature in this brief; build it last, and only as a small pilot at first.

**Core mechanics:**
- **Modules ("labs")**: self-contained interactive units — e.g. a branching virtual patient case ("a 45-year-old presents with chest pain — order tests, narrow the diagnosis, choose treatment, get immediate feedback"), an interactive 3D anatomy model the learner can rotate and click through, or a fast-paced diagnostic challenge/quiz format.
- **Gamification layer**: XP per completed module, levels, daily streaks, badges/achievements, and an optional leaderboard. Use display names or anonymized handles on the leaderboard, not real identities by default — many learners won't want their activity/rank publicly tied to their real name.
- **Suggested learning paths and difficulty tiers** so the module library reads as a structured curriculum, not a random pile of content.

**Access model (exactly as specified):**
- **Free tier:** one hour of access per calendar day, reset at a fixed time — recommend midnight in the platform's primary timezone (e.g. Baghdad time) and state this clearly in the UI so travelers/diaspora users aren't confused by a reset that doesn't match their local midnight.
- **Paid tier:** $5/month for unlimited access.
- **Critical implementation detail:** enforce the daily quota **server-side**, never on a client-side JavaScript timer alone — a browser-only timer can be paused or bypassed by the user. Track elapsed time with periodic server-side heartbeats (e.g. every 30–60 seconds while a lab session is open), sum them per user per day, and cut off access when the free quota is reached regardless of what the client displays.

**Technical build notes:**
- **Two very different things are both being called "3D" here — do not conflate them:**
  1. *Decorative marketing illustrations* — the flowing gradient "blob" shapes common on modern SaaS/health landing pages. These are cheap: optimized SVG or a lightweight CSS/Lottie animation. Safe to use anywhere, including the homepage.
  2. *Real interactive 3D/gamified content* — rotatable anatomy models, interactive scenes. This needs an actual 3D rendering library (recommend Three.js via React Three Fiber) and is significantly heavier. **Load this library only on the specific lab routes that use it, never in the global app bundle** — otherwise every page on the site, including the homepage and consultation flow, slows down for a feature most visitors aren't even using.
- Use compressed 3D asset formats (glTF/GLB, ideally Draco-compressed) and keep models low-poly — a simple heart model that loads in under a second on a weak connection beats a beautiful one that takes fifteen.
- Provide a "lite mode" fallback (static images/2D diagrams instead of the live 3D scene) for low-end devices or slow connections — genuinely important given real bandwidth constraints in the target region; don't force everyone through a heavy 3D experience just to reach basic educational content.
- Start with a pilot of 3–5 well-built modules, not a large library on day one. This is expensive to build well — validate that people actually use and pay for it before investing further.

**Subscription billing caveat (easy to miss, important):**
- A recurring monthly charge is a materially different technical problem from the one-off course payments described in Section 5.3. Global processors like Stripe natively support auto-recurring subscriptions with retry logic; the local mobile-wallet gateways recommended in this brief are generally built around one-off wallet payments and may not support true auto-recurring debits the same way — **verify this directly against the chosen provider's docs before assuming it works.**
- If auto-recurring billing isn't available, the realistic fallback is a **manual monthly renewal model**: charge $5, grant 30 days of unlimited access, remind the user a few days before expiry, and let access quietly revert to the free daily-hour tier if they don't renew — never lock the whole account, just the lab feature.

New data model additions for this feature (add to Section 5.2): `learning_modules`, `user_module_progress`, `badges` / `user_badges`, `daily_lab_usage(user_id, date, seconds_used)`, `subscriptions(user_id, plan, status, current_period_end, provider, provider_ref)`.

---

## 5. Technical architecture

### 5.1 Recommended stack (optimized for AI-agent-built, security-by-default development)

The overriding goal here is to minimize the amount of custom security-sensitive code the AI agent has to write from scratch, since that is the highest-risk area in fully AI-built applications.

- **Frontend + backend:** Next.js (React, TypeScript, App Router) as a single full-stack app for the MVP. Keeping frontend and backend in one codebase reduces complexity for an AI-driven build; split into a separate backend service later only if there's a concrete scaling reason to.
- **Styling/UI:** Tailwind CSS with a small shared component library (e.g. shadcn/ui) so the UI stays visually consistent instead of every screen being styled ad hoc.
- **Database + auth + storage:** Postgres via a managed backend-as-a-service platform such as Supabase (or an equivalent that provides Row-Level Security policies, built-in auth, and object storage). This is the single most important architectural choice for this project: **Row-Level Security (RLS) policies let you declare "a patient can only read their own consultations" or "only admins can read verification_documents" directly in the database**, so access control isn't solely dependent on the AI agent remembering to check permissions in every API route. Enforce authorization at the database layer, not only in application code.
- **ORM/typed queries:** Prisma if using a custom backend, or the platform's typed client (e.g. Supabase's generated types) if using a BaaS — either way, no raw string-concatenated SQL, ever (SQL-injection prevention).
- **Validation:** Zod (or equivalent) schemas shared between client and server for every form and API input — never trust client-submitted data without server-side re-validation.
- **i18n:** next-intl or equivalent, with Arabic as the default locale and full RTL layout support (mirrored icons, correct text alignment) — do not bolt RTL on as an afterthought; build every screen RTL-first.
- **Interactive 3D (learning hub only):** Three.js via React Three Fiber, code-split so it loads only on the lab routes that need it — never in the shared/global bundle. See Section 4.13 for the full performance rationale and the decorative-vs-interactive 3D distinction.
- **Hosting:** Vercel (for the Next.js app) + the managed database/auth/storage provider's cloud offering. A cheaper self-hosted VPS is a valid alternative once traffic/cost patterns are known, but adds ops burden the founder cannot absorb alone at MVP stage.

### 5.2 Core data model (starting point — refine during implementation)

```
users(id, email, phone, password_hash, role, locale, status, created_at)
doctor_profiles(user_id, specialty, license_number, verification_status, bio, years_experience, verified_until)
instructor_profiles(user_id, verification_status, bio, credentials_summary)
verification_documents(id, user_id, doc_type, file_url, status, reviewed_by, reviewed_at, review_reason)
consultations(id, patient_id, specialty_tag, title, description, is_anonymous, status, assigned_doctor_id, created_at)
consultation_messages(id, consultation_id, sender_id, content, attachment_urls, created_at)
consultation_ratings(consultation_id, rating, feedback)
courses(id, instructor_id, title, description, specialty, level, price, is_free, status, created_at)
course_modules(id, course_id, title, order)
lessons(id, module_id, title, type, video_url, resource_url, order)
quizzes(id, lesson_id) / quiz_questions(...) / quiz_attempts(...)
enrollments(id, user_id, course_id, progress_percent, completed_at, certificate_url)
payments(id, user_id, course_id, amount, currency, provider, provider_ref, status, created_at)
library_items(id, title, author, category, file_url, license_note, uploader_id, download_count)
articles(id, author_id, title, content, category, status, reviewed_by, published_at)
reviews(id, target_type, target_id, user_id, rating, comment, created_at)
notifications(id, user_id, type, payload, read_at, created_at)
reports(id, reporter_id, target_type, target_id, reason, status, created_at)
audit_logs(id, admin_id, action, target_type, target_id, metadata, created_at)
learning_modules(id, title, specialty, difficulty, type, xp_reward, asset_url, status)
user_module_progress(id, user_id, module_id, status, xp_earned, completed_at)
badges(id, name, criteria) / user_badges(user_id, badge_id, earned_at)
daily_lab_usage(user_id, date, seconds_used)
subscriptions(id, user_id, plan, status, current_period_end, provider, provider_ref)
```

Design every table that can contain sensitive data (`verification_documents`, `consultations`, `consultation_messages`, `payments`, `subscriptions`) with row-level access rules from day one, not retrofitted later.

### 5.3 Payments (region-aware)

The target market (Iraq / broader MENA) is not well served by Stripe/PayPal-style global card processors — local mobile-wallet gateways dominate real usage. As of the current landscape:

- **ZainCash** is a strong default choice: it offers <cite index="1-1">a documented payment gateway with a secure redirect flow and real-time status updates via API and webhooks</cite>, making it realistically integrable by an AI coding agent following its docs.
- Other locally-relevant wallets worth supporting as alternatives include <cite index="2-1">AsiaHawala and QiCard</cite>.
- **Build a payment-provider abstraction layer** (a single internal interface like `createPayment()`, `handleWebhook()`, `checkStatus()`) so adding a second or third provider later doesn't require touching course/enrollment logic.
- Always support a **manual/offline fallback**: bank transfer or cash-agent payment with an admin confirmation step, for users the automated gateways don't reach.
- If/when international students are targeted, add Stripe or a regional card gateway (e.g. PayTabs, Telr, HyperPay) as an additional provider behind the same abstraction — don't design payments assuming only one provider will ever exist.
- Never trust client-side "payment succeeded" signals — the enrollment must only unlock after the server verifies the transaction via the provider's webhook/callback.
- **Recurring subscriptions (learning hub) are a different problem from one-off course payments.** Confirm with the chosen local provider whether it actually supports auto-recurring billing before designing around it; if not, use the manual-monthly-renewal fallback described in Section 4.13. Whatever webhook handling is built must be idempotent — a webhook firing twice must never double-charge, double-extend a subscription, or double-enroll a course.

### 5.4 File & video storage

- Documents/images (verification docs, consultation attachments, library PDFs): object storage (Supabase Storage or S3-compatible, e.g. Cloudflare R2) with signed, time-limited URLs — never public buckets for anything sensitive.
- **Do not self-host or store raw video files in your own database/server.** For MVP, the cheapest reliable path is unlisted video hosting (e.g. YouTube unlisted embeds) for course videos to avoid streaming infrastructure costs and complexity; migrate to a proper video CDN (Cloudflare Stream, Bunny Stream, Mux) once course volume justifies it.
- Validate file type and size on upload, strip metadata from images where relevant, and never execute or directly serve uploaded files from the same domain as the app without safeguards.

### 5.5 Search

Use a dedicated search engine rather than raw SQL `LIKE` queries once the catalog grows past a trivial size — a lightweight, self-hostable option such as Meilisearch or Typesense is a reasonable default for a cost-conscious MVP; verify Arabic tokenization quality during implementation and adjust if results are poor.

### 5.6 Internationalization / RTL

Arabic is the primary language and must be the default, fully right-to-left experience (not a translated-in-place English layout). English can be added as a secondary locale once the Arabic experience is solid. Test every new screen in RTL before considering it done.

---

## 6. Security requirements (mandatory checklist)

- Enforce authorization **server-side / at the database layer** on every read and write — never rely on hiding a button in the UI.
- All traffic over HTTPS; secure, `httpOnly`, `sameSite` cookies for sessions; CSRF protection on state-changing requests.
- Validate and sanitize all input on the server, even if it was already validated on the client.
- File uploads: restrict allowed types/sizes, store outside any directly web-servable path, serve via signed URLs.
- Rate-limit: login attempts, consultation submissions, signup, and any public API endpoint that could be abused for spam or brute-force.
- Verification documents and any personally identifying medical data are readable only by the admin/reviewer role and the document owner — never included in general API responses (e.g. a public doctor-profile endpoint must never leak their uploaded ID document URL).
- No secrets, API keys, or credentials in client-side code or committed to version control — environment variables + a secret manager only.
- Strong password requirements; 2FA available (recommended mandatory) for doctor/instructor/admin/reviewer accounts.
- Audit-log every admin action that changes trust state (verification approvals/rejections, content removal, refunds, role changes).
- Keep dependencies up to date; avoid unmaintained or unnecessary third-party packages — every new dependency is new attack surface the founder cannot personally review.
- Give users a way to request export or deletion of their own data, given the health-sensitive nature of the content.

---

## 7. Performance requirements

- Paginate every list endpoint (consultations, courses, articles, library items) — never return unbounded result sets.
- Optimize and lazy-load images (`next/image` or equivalent); serve video exclusively from a CDN, never from the app server.
- Cache public, rarely-changing content (published articles, course catalog) at the edge/CDN layer.
- Avoid N+1 database queries — use proper joins/includes, and check query counts on any list page during development.
- Keep an eye on client bundle size; code-split by route.

---

## 8. Code quality & AI-agent working discipline

- **TypeScript everywhere**, with real types — avoid `any` unless genuinely unavoidable, and explain why when it is.
- **Feature-based folder structure** (e.g. `/features/consultations`, `/features/courses`, `/features/library`) rather than one giant flat folder of components.
- **No duplicated logic** — extract shared utilities/hooks instead of copy-pasting between similar features (e.g. the verification-review-queue pattern is nearly identical for doctors, instructors, courses, and articles — build it once, reuse it).
- **Comment sparingly and purposefully.** Explain non-obvious business rules or workarounds; do not narrate self-explanatory code line by line.
- **No silent placeholders in reachable code paths.** If a feature is stubbed for later, guard it so users can't hit it, and clearly flag it as incomplete to the founder.
- **Confirm before major architectural changes.** If a new library, a schema redesign, or a different hosting approach is being considered mid-build, explain the tradeoff in plain language and get confirmation before proceeding — don't decide silently on anything with lasting cost or lock-in implications.
- **Build incrementally, vertically.** Get one complete flow (e.g., signup → submit consultation → doctor answers → patient sees reply) fully working and manually tested end-to-end before broadening to the next feature.
- **Automated tests, at minimum, for the highest-risk flows**: authentication, authorization boundaries (a patient cannot read another patient's consultation), payment/webhook handling, and doctor verification gating.
- **Handle errors gracefully everywhere** — no unhandled promise rejections, and every user-facing error should be a clear, non-technical message.
- **Never invent packages, APIs, or method signatures that haven't been verified to exist.** If unsure, say so and check, rather than guessing.
- **Use a staging environment** before production for anything touching payments or verification, and version-control database migrations with backups scheduled once real user data exists.

---

## 9. Build roadmap (phased)

### Phase 1 — MVP (trust + information access)
- Auth (email/phone), roles, doctor verification workflow.
- Consultations: submit, specialty routing, doctor response, threaded follow-up, rating, emergency-pattern banner, disclaimer.
- Articles: authoring + medical-reviewer approval flow, category browsing.
- Legal pages (ToS, Privacy, Medical Disclaimer).
- Arabic RTL, mobile-responsive throughout.
- **Definition of done:** a real patient can sign up, ask a question tagged to a specialty, and get a reply from a real verified doctor, with the disclaimer and emergency-detection working, on a mobile browser, in Arabic.

### Phase 2 — Courses & monetization
- Course builder, modules/lessons/quizzes, enrollments, progress tracking, certificates.
- Payment integration (ZainCash first, abstraction layer in place, manual-payment fallback).
- Library module (upload, categorize, search, copyright-confirmation flow).
- **Definition of done:** a founder-created course can be purchased end-to-end by a real payment method and completed with a certificate issued.

### Phase 3 — Marketplace & scale
- Instructor verification + third-party course submission and review pipeline.
- Site-wide search, notification center, ratings/reviews across doctors/courses/instructors.
- Admin analytics dashboard, audit log UI, reports/flags handling.
- Optional: second payment provider, PWA + push notifications, community/forum features.

### Phase 4 — Interactive learning hub (pilot)
- Build only after Phases 1–3 are stable and generating real usage — this is the most technically ambitious feature in the brief and depends on the payments and content-review infrastructure already existing.
- Ship a small pilot: 3–5 interactive modules, server-side daily-quota enforcement, the $5/month subscription (or its manual-renewal fallback), and basic gamification (XP, streaks, badges).
- **Definition of done:** a real learner can use a lab for free up to the daily one-hour cap (enforced server-side, verified by trying to exceed it), and a paying subscriber gets uninterrupted access for their paid period.
- Expand the module library and add the leaderboard only once the pilot proves people actually return daily and convert to paid.

Do not begin a later phase until the previous phase's Definition of Done is genuinely met in production, not just locally.

---

## 10. UX/UI direction

- Arabic-first RTL, calm and clinical-trustworthy visual language (avoid flashy, ad-like styling) — think clean whitespace, legible typography, a restrained color palette (blues/teals read as trustworthy in healthcare contexts).
- Mobile-first: assume most users are on phones with variable connection quality; keep pages light and fast.
- On every consultation-related screen, the disclaimer and the doctor's verified badge must be visually prominent, not buried in fine print.
- Accessible by default: sufficient color contrast, readable font sizes, alt text on meaningful images, fully keyboard-navigable forms.

### 10.1 Reference-informed layout patterns

Based on the founder's reference screenshots (modern healthcare-SaaS landing pages), these are concrete, buildable patterns to reuse rather than re-invent per page:

- **Hero pattern:** short trust-building headline + one-line subtext + a search bar or primary CTA + a supporting photo/illustration, with a **stats bar directly beneath the hero** ("24/7 support · X verified doctors · X consultations answered"). Powerful for a new platform's credibility — but the numbers must be pulled live from the database and update automatically; never leave hardcoded placeholder stats in production.
- **Specialty/service card grid:** icon + short title + one-line description in a responsive 3–4 column grid. Build this as one reusable component and reuse it for specialties, course categories, and article categories instead of three separate card designs.
- **Color direction:** the references span trust-blue, calm mint/green, and creative purple. Keep blue-teal as the primary brand color (per the clinical-trust rationale above) and add a single warm accent (e.g. coral/amber) reserved for calls-to-action and gamification elements (XP, badges) — this gives the learning hub a distinct, playful feel without breaking overall brand consistency.
- **Decorative illustration budget:** gradient "blob" background shapes like the ones in the references are lightweight when built as static, optimized SVG — safe to use freely on marketing pages. Reserve genuine interactive 3D strictly for the learning-hub module (Section 4.13) — don't let a "make it look like the reference" instruction cause the agent to load a heavy 3D library on the homepage.
- **Doctor imagery:** once real verified doctors exist, use their actual (consented) photos in the directory and homepage rather than generic stock photography — this matters more for trust than visual polish.
- **Card-based mobile patterns:** the appointment/profile card style from the reference mobile mockup is worth reusing for the doctor-directory and consultation-thread screens on mobile, even though this is a responsive website rather than a native app.

---

## 11. Seed data / taxonomy suggestions

Starting specialty tag list (expand as needed): General/Family Medicine, Dermatology, Neurology, Nutrition & Dietetics, Psychiatry/Mental Health, Pediatrics, Cardiology, Endocrinology (Diabetes), Gynecology & Obstetrics, Orthopedics, Dentistry, ENT (Otolaryngology), Ophthalmology, Gastroenterology, Pulmonology, Urology, Rheumatology, Infectious Diseases.

Starting article categories: Ramadan & seasonal nutrition, weight management (evidence-based only), mental health basics, chronic disease living guides (diabetes, hypertension), myth-busting, first aid & when to seek emergency care, maternal & child health.

---

## 12. Open business decisions the founder must confirm (do not assume these)

- Platform commission percentage on third-party paid courses.
- Currency/pricing strategy (local currency only, or multi-currency later).
- Who staffs the medical-reviewer role initially, and expected review turnaround time.
- Whether doctor consultations stay free indefinitely or a tiered model is introduced later.
- Final specialty and article-category taxonomy (the lists above are a starting draft, not final).
- Branding, domain name, and final platform name.
- Exact reset rule for the learning hub's free daily hour (recommended default: midnight in the platform's primary timezone — confirm).
- Whether $5/month needs regional pricing/promotions, and how it's actually billed (see 4.13's recurring-billing caveat).
- Scope of the first interactive-lab content pilot: how many modules, which specialties, who builds them.
- Who legally reviews the book/reference summaries feature before it scales beyond public-domain sources.

---

## 13. Common AI/vibe-coding pitfalls & real-world engineering practices

AI coding agents are very good at producing code that looks complete and runs once on a first demo, and much weaker at the unglamorous details that make a real product reliable, fast, and cheap to operate long-term. This section is a pre-flight checklist to run through at every phase — most of these problems are invisible in a local demo and only surface once real users, real networks, and real money are involved.

### 13.1 Performance & loading speed
- Optimize images (modern formats like WebP/AVIF, responsive `srcset` sizes, lazy-load anything below the fold).
- Careful font loading (`font-display: swap`, subset the font, don't load five weights when two will do).
- Code-split by route and lazy-load heavy libraries — most importantly the 3D library (Section 4.13), but the same applies to any PDF viewer, rich text editor, or charting library: load it only on the page that actually uses it.
- Server-render or statically generate public pages (articles, course catalog, doctor directory) for fast first paint and so search engines can actually index them.
- Cache public content at the CDN/edge layer; add database indexes on foreign keys and any column used to filter lists (specialty tags, status fields).
- Debounce search-as-you-type inputs; don't fire a request on every keystroke.
- Periodically check client bundle size — it's easy for an AI agent to add a large dependency for a small feature without anyone noticing.

### 13.2 SEO & discoverability
- Public content must be crawlable — not locked behind client-side-only rendering.
- Meta titles/descriptions per page, `sitemap.xml`, `robots.txt`.
- `hreflang` tags once the English locale exists, so search engines serve the right language to the right audience.
- Structured data (schema.org) for articles and courses — this is what enables rich search results and costs little to add.

### 13.3 Error handling & edge cases
- Design empty states deliberately (what does a specialty with zero doctors yet look like? what does "no consultations yet" look like?) instead of a blank or broken-looking screen.
- Loading skeletons instead of a blank flash while data fetches.
- Inline, field-level form validation messages — never a raw `alert()` popup.
- Custom 404 and error pages, not the framework's default.
- The site should degrade gracefully, not go fully blank, if a script fails to load.

### 13.4 Operational reality (what breaks in production, not in a demo)
- **Timezone handling matters concretely here** — the learning hub's daily free-hour reset (Section 4.13) is meaningless without a clearly defined "day" boundary.
- **Webhook idempotency**: a payment or subscription webhook can fire more than once for the same event — handling it must not double-charge, double-extend access, or double-enroll a course.
- Session/token expiry and silent refresh, so users aren't randomly logged out mid-task.
- Error tracking/monitoring (e.g. Sentry or equivalent) so the founder finds out about a bug from a dashboard alert, not from a frustrated user's message.
- Backups that are actually test-restored occasionally, not just scheduled and forgotten — an untested backup is not a real backup.
- Separate credentials/databases for development, staging, and production — never test a payment integration against real user data.

### 13.5 The "empty platform" cold-start problem
This one is a business problem the agent should flag, not purely a code problem: a consultation platform with zero doctors and zero prior questions looks broken or untrustworthy to its first visitors. Plan for it: recruit a first batch of verified doctors before public launch, seed a handful of example (anonymized, composite) consultations and answers so the format is self-explanatory, and be upfront in the UI ("we just launched") rather than implying a scale the platform doesn't have yet.

### 13.6 Mobile & real-device reality
- Test on actual mid/low-end Android devices and a throttled 3G/4G connection, not only a fast desktop browser — a large share of the target audience will be on exactly this kind of device and connection.
- iOS Safari has real quirks (video autoplay restrictions, the viewport height shifting as the browser's address bar shows/hides) that desktop testing will not catch.
- Touch targets need to be large enough to tap reliably, not sized for a mouse cursor.

### 13.7 Process discipline the founder should insist on
- **Every meaningful change should be a Git commit with a clear message.** The founder can't read code, but this is what makes it possible to undo a bad change instead of being stuck with a broken app and no way back — explicitly ask the agent to confirm it's committing regularly.
- Ask the agent to actually run and click through what it built rather than just asserting a feature "should work."
- Prefer portable data formats and avoid unnecessary vendor lock-in, in case a provider ever needs to be switched.
- Watch for cost surprises: video hosting, database reads, and search-engine hosting all scale with usage — ask for a rough monthly cost estimate at each phase and set a billing alert with each provider.

### 13.8 Security details beyond Section 6
- The application's own database credentials should be scoped to least privilege — not a superuser/admin account.
- Keep dependencies patched (`npm audit` or equivalent, and a tool like Dependabot) — most real-world breaches exploit an old, already-known vulnerability in a dependency, not a novel attack.
- Correct CORS configuration — never default to allowing all origins.
- A basic Content-Security-Policy header once the app is stable enough not to break constantly from it.

---

*End of brief. Build Phase 1 first.*