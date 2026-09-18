# MedConnect production-readiness design

Date: 2026-09-18  
Status: approved direction  
Repository: `ahpa5246-lgtm/medical-website-for-tanzeel`

## 1. Outcome

Turn the existing Arabic-first React prototype into a connected, presentation-ready product whose primary journeys behave end to end. The platform must be credible for a Ministry of Health presentation while keeping clinical content, sample clinicians, and simulated consultations clearly labelled until licensing and medical review are complete.

“Working” means that a user action has an observable, persistent result; every asynchronous action has loading, success, empty, denied, and failure behavior; navigation is valid on refresh; keyboard and mobile interaction work; and automated end-to-end tests cover every primary journey.

## 2. Product boundaries

### Included

- Patient, doctor, reviewer, and administrator accounts.
- Authentication, password recovery, profile management, role-aware navigation, and protected routes.
- Doctor directory, filters, profile pages, verification status, and verification applications.
- Consultation creation, attachment upload, threaded replies, status changes, second-opinion requests, ratings, and audit history.
- Article browsing, authoring, review state, publication state, search, and categories.
- Courses, library resources, completion tracking, bookmarks, and search.
- Training path with real task screens, stage prerequisites, persistent XP, levels, streaks, and badges.
- A reusable branching clinical-case engine.
- A lazy-loaded 3D anatomy module with a lightweight 2D fallback.
- Responsive Arabic RTL design, accessibility, performance, error states, and automated tests.
- Deployment documentation and environment validation.

### Excluded until separate approval

- Real diagnosis, prescriptions, emergency dispatch, or autonomous clinical decisions.
- Claims that sample doctors are licensed or available.
- Public use of unreviewed clinical material.
- Production payments before a provider, currency flow, refund policy, and recurring-billing support are legally and technically verified.
- Integrations with Iraqi government or health-record systems without written authorization.

## 3. Architecture

Keep the existing Vite, React 19, TypeScript, Tailwind CSS v4, and React Router structure. A framework migration would add risk without solving the immediate product-completion problem.

Use Supabase for:

- Auth and identity.
- Postgres relational data.
- Storage for private attachments and verification documents.
- Row-Level Security for patient, doctor, reviewer, and administrator boundaries.
- Database functions for atomic workflows, lab quota enforcement, XP awards, streaks, and audit events.

Client additions:

- `@supabase/supabase-js` for the backend connection.
- TanStack Query for server state, invalidation, retries, and cache boundaries.
- Zod for shared form and response validation.
- Radix Primitives for accessible dialogs, menus, tabs, and confirmation surfaces.
- Sonner for concise action feedback.
- Motion for state transitions and training-map choreography.
- `@react-three/fiber` and `@react-three/drei`, imported only inside lazy lab routes.
- Playwright and axe-core for end-to-end and accessibility checks.

The application must boot into a deliberate configuration-error screen when required environment values are absent. It must never silently switch production actions to fake success.

## 4. Data model

The database will use UUID primary keys, timestamps, explicit status enums or constrained text values, and audit metadata.

Core domains:

- `profiles`: display name, role, language, avatar, onboarding state.
- `doctor_profiles`: specialty, biography, verification state, public fields.
- `doctor_verification_applications`: submitted documents, reviewer decision, notes, timestamps.
- `consultations`: patient, specialty, subject, body, urgency screening result, lifecycle status.
- `consultation_participants` and `consultation_messages`: access membership and threaded communication.
- `consultation_attachments`: private storage object metadata.
- `second_opinion_requests` and `consultation_ratings`.
- `articles`, `article_categories`, and `article_reviews`.
- `courses`, `course_lessons`, `course_enrollments`, and `lesson_progress`.
- `library_resources` and `resource_bookmarks`.
- Existing learning-lab tables: `learning_modules`, `user_module_progress`, `badges`, `user_badges`, `daily_lab_usage`, and `subscriptions`.
- `audit_events`: actor, action, target, safe metadata, and timestamp.

Migrations will be additive and repeatable. Seed data will use fictional names and clearly marked demonstration content.

## 5. Authorization and privacy

RLS is mandatory on every user-data table.

- Patients can access only consultations they created or are explicitly participating in.
- Doctors can access consultations assigned to them and only public fields of other users.
- Reviewers can access verification submissions and content-review queues, not unrelated patient consultations.
- Administrators receive explicit scoped policies; client role claims alone never grant access.
- Private storage uses per-user or per-record paths and short-lived signed URLs.
- Service-role credentials never enter the browser.
- File type, size, and ownership are validated before metadata is committed.
- Sensitive clinical text is excluded from analytics, URLs, logs, and toast messages.
- Account export and deletion workflows are represented, but their final retention rules require legal review.

## 6. Primary journeys

### Account

Sign up → verify email → choose role → complete profile → enter role-aware dashboard. Login, logout, forgotten password, expired links, duplicate email, weak password, offline, and session expiry all receive explicit states.

### Consultation

Patient creates a consultation → emergency-language screening runs → submission is blocked for emergency wording with immediate emergency guidance → valid consultation persists → eligible doctor/reviewer assignment occurs → participants exchange messages and private files → patient may request a second opinion → consultation closes → rating is stored.

For the licensing presentation, sample consultations are seeded and marked as demonstration records.

### Doctor verification

Doctor completes structured profile → uploads documents → submits → reviewer sees a queue → requests changes, rejects, or approves → public badge reflects the persisted decision. No UI-only verified badge is permitted.

### Publishing

Author saves a draft → submits for review → reviewer returns or approves → approved article becomes public. The editor includes autosave status and unsaved-change protection.

### Learning

Learner enrolls → opens lesson/resource → progress persists → bookmarks and search work → completion updates course progress.

### Training and labs

Learner selects an unlocked stage → opens a real mission screen rather than instantly completing it → answers or interacts → receives immediate feedback → completion is committed atomically → XP, streak, badge, and next-stage availability update.

The first complete case is the fictional chest-pain structural example already described in the repository brief. It remains labelled unreviewed demonstration content. The engine supports scenes, choices, multi-select questions, results, scoring, feedback, and a final summary.

The anatomy lab lazy-loads its renderer and model. Lite mode shows an accessible labelled 2D diagram. WebGL failure and reduced motion automatically retain a usable fallback.

## 7. Visual direction

### Thesis

A calm, precise Arabic healthcare and learning environment composed like a living clinical pathway: editorial information layers, specimen-like training surfaces, humanist Arabic typography, restrained depth, and motion that explains progress.

### Principles

1. Use an ivory/slate canvas with deep navy structural surfaces and a meaningful teal accent.
2. Let consultation threads resemble clear care timelines; let training screens resemble connected diagnostic stations.
3. Use typography, spacing, and borders before glow or decoration.
4. Reserve spatial depth and 3D for learning, anatomy, and selected hero moments.
5. Make every status recognizable by text and icon, not color alone.

### Anti-goals

- No generic purple/cyan gradient identity.
- No repeated stock 24px cards with equal visual weight.
- No fake metrics, testimonials, physicians, or ornamental medical charts.
- No glassmorphism on every surface.
- No motion that delays reading or blocks low-power devices.

### Token direction

- Canvas: warm ivory.
- Primary structure: ink navy.
- Accent: clinical teal.
- Secondary learning accent: controlled amber.
- Critical: red reserved for emergency and destructive actions.
- Focus: high-contrast cyan/blue ring.
- Radii vary by function: compact controls, medium records, larger learning canvases.
- Motion uses 120–240ms for UI state and longer interruptible transitions only for the training journey.

## 8. Component strategy

Use one accessible primitive foundation: Radix. Existing local Button, Input, Card, and Badge components remain the owned visual layer and are refactored around shared tokens rather than replaced wholesale.

Use upstream projects as maintained dependencies or behavioral references:

- Radix Primitives: accessible interaction foundations.
- TanStack Query: server-state behavior.
- Zod: validation.
- Sonner: notifications.
- Motion: training and state motion.
- React Three Fiber/Drei: isolated 3D anatomy.
- Playwright and axe-core: verification.

Do not clone complete showcase repositories, mix multiple design systems, or copy protected assets and brand trade dress.

## 9. Reliability and state coverage

Every connected surface implements:

- Skeleton/loading state.
- Empty state with next action.
- Recoverable error with retry.
- Offline or timeout message.
- Permission-denied state.
- Success confirmation.
- Optimistic updates only where rollback is safe.
- Duplicate-submission prevention.
- Deep-link and refresh behavior.
- Mobile, keyboard, RTL, zoom, and reduced-motion behavior.

A route-level error boundary prevents one feature from blanking the entire application.

## 10. Testing and definition of done

Automated checks:

- Unit tests for validation, training progression, scoring, emergency screening, and permission helpers.
- SQL integration tests for RLS, quota, XP, badges, role boundaries, and storage metadata.
- Component tests for forms and state variants.
- Playwright journeys for account, consultation, verification, article publishing, course progress, training case, and 3D fallback.
- axe-core checks on representative pages.
- Typecheck, formatting, build, route refresh, and bundle checks.

Manual acceptance:

- Phone, tablet, laptop, wide screen.
- Keyboard-only use and visible focus.
- Arabic RTL and long content.
- 200% zoom.
- Reduced motion.
- Slow connection and failed request.
- WebGL unavailable.
- New user, empty account, populated demo account, doctor, reviewer, and administrator roles.

The product is presentation-ready when all primary journeys pass automated tests, no visible action is inert, demonstration content is labelled, protected data cannot cross role boundaries in SQL tests, and the production build completes without blocking warnings.

## 11. Delivery sequence

1. Foundation: tokens, application shell, error boundaries, environment contract.
2. Supabase schema, auth, profiles, RLS, storage, and seed data.
3. Consultations and doctor verification.
4. Articles, courses, and library.
5. Training case engine, gamification, quota, and persistence.
6. 3D anatomy with lite fallback.
7. Visual unification and responsive/accessibility completion.
8. Full end-to-end verification, performance review, and deployment handoff.

## 12. External requirements

Live verification requires a Supabase project URL and anon/publishable key supplied as Codespaces secrets. Applying migrations and testing privileged workflows also requires authenticated Supabase CLI access or a project connection. Payment activation and real clinical publication remain blocked until provider and licensed-reviewer decisions are supplied.
