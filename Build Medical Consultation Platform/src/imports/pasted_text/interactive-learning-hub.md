# Build Prompt — Interactive Learning Hub (Gamified 3D Medical Case Labs)

**Give this whole file to your AI coding agent as its own focused task.** It assumes the relational schema from `medical_platform_schema.sql` is already running in Supabase and that Figma Make is connected to it. It extends Section 4.13 of the master brief — read that section too if the agent needs the full business context.

---

## 1. What we're building

Adapt the hands-on, gamified practice-lab model used by cybersecurity training platforms (learn-by-doing, feels like play, not a lecture) to medical education. Instead of reading passively, learners work through interactive branching clinical case simulations and visual 3D modules, earning XP, streaks, and badges as they go.

This is the most technically ambitious feature on the platform. Build it as a small, complete pilot — not a large library — before expanding.

---

## 2. Access model (business rule — implement exactly this)

- **Free tier:** 1 hour of lab access per calendar day, resetting at midnight in the platform's primary timezone (Baghdad time).
- **Paid tier:** $5/month for unlimited access.
- **This must be enforced server-side.** A client-side JavaScript timer can be paused, refreshed away, or edited in devtools — it is not a security boundary, only a display. The server is the source of truth for remaining time.
- If the payment provider doesn't support true auto-recurring billing (verify this — many local MENA wallet gateways don't), fall back to a manual monthly renewal: charge $5, grant 30 days, remind before expiry, and quietly revert to the free daily cap if unrenewed. Never lock the whole account — just this feature.

---

## 3. Data already available — use it, don't reinvent it

These tables already exist in Supabase (from `medical_platform_schema.sql`): `learning_modules`, `user_module_progress`, `badges`, `user_badges`, `daily_lab_usage`, `subscriptions`.

**Do not create a separate key-value store for this feature.** Use these relational tables directly. If Figma Make suggests inventing its own storage shape for "simplicity," reject that and point it back to these tables.

---

## 4. Module types to support

- **Branching clinical case simulation** — a short choose-your-path scenario with decision points and immediate feedback (see the worked example in Section 7).
- **Interactive 3D anatomy viewer** — a rotatable, clickable model the learner explores (e.g. a heart, a joint).
- **Fast diagnostic challenge/quiz** — timed, multiple-choice, instant feedback, for quick daily practice.

---

## 5. Gamification mechanics

- XP awarded per decision/module completed (`learning_modules.xp_reward`, tracked in `user_module_progress.xp_earned`).
- Simple level thresholds derived from cumulative XP (e.g. every 200 XP = one level — pick whatever curve feels satisfying, this is a UX/tuning decision, not a fixed requirement).
- Daily streak counter (consecutive days with at least one completed module).
- Badges (`badges` / `user_badges`) — start with a handful, e.g. "First Case Completed," "7-Day Streak," "Perfect Diagnosis" (no wrong choices in a case).
- Optional leaderboard using a display name or anonymized handle, **not the user's real name by default** — many learners won't want their activity publicly tied to their identity. Make it opt-in.

---

## 6. Technical implementation (matches this project's actual stack: Vite + React 19 + Tailwind v4 + react-router-dom + Supabase)

- **3D rendering:** Three.js via `@react-three/fiber` and `@react-three/drei`. Import these **only inside the lab route components**, lazy-loaded via `React.lazy()` + route-based code splitting — never in a shared layout or the global bundle. Every other page (homepage, consultations, courses) must load exactly as fast as it does today, with zero added weight from this feature.
- **3D assets:** compressed glTF/GLB (Draco-compressed), low-poly. A model that loads in under a second on a weak connection beats a beautiful one that takes fifteen.
- **Lite mode:** a simple toggle (or automatic fallback on `prefers-reduced-motion`) that swaps the live 3D scene for a static 2D diagram — don't try to be clever with automatic device-performance detection, a manual toggle is more reliable and much simpler to build correctly.
- **Server-side quota enforcement:** while a lab session is open, the client calls a Supabase RPC every 30–60 seconds ("heartbeat") that logs elapsed time and returns the authoritative remaining seconds. The client UI only ever *displays* what the server returns — it never calculates the countdown itself. Example function to create in Supabase (SQL Editor):

```sql
create or replace function record_lab_heartbeat(p_seconds integer)
returns integer
language plpgsql
security definer
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Baghdad')::date;
  v_used integer;
  v_is_subscribed boolean;
begin
  select exists (
    select 1 from subscriptions
    where user_id = v_user and status = 'active' and current_period_end >= v_today
  ) into v_is_subscribed;

  if v_is_subscribed then
    return -1; -- -1 = unlimited, client shows no countdown
  end if;

  insert into daily_lab_usage (user_id, usage_date, seconds_used)
  values (v_user, v_today, p_seconds)
  on conflict (user_id, usage_date)
  do update set seconds_used = daily_lab_usage.seconds_used + excluded.seconds_used
  returning seconds_used into v_used;

  return greatest(0, 3600 - v_used); -- remaining free seconds today
end;
$$;
```

Client behavior: call this every 30–60s with the seconds elapsed since the last call. If it returns `0`, immediately lock the lab UI and show an upgrade prompt — and the *next* call to start a lab session or fetch module content must also be rejected server-side (e.g. via a Row-Level-Security check or a guard at the top of any lab-content RPC), so a user can't bypass the lock by just not calling the heartbeat.

- **Subscription check:** before starting any session, check `subscriptions.status = 'active' and current_period_end >= today` for the user; if not active, fall through to the free daily-cap logic above.

---

## 7. Worked example module (template to replicate — build this one first)

**"The Chest Pain Case"** — Beginner difficulty, General/Cardiology, 100 XP.

> ⚠️ The clinical content below is a **structural placeholder**, not reviewed medical training material. Build the game mechanics (branching scenes, choices, XP, feedback) exactly as described — but any case content that goes live for real users must be authored and signed off by a licensed medical reviewer first, same as every other piece of clinical content on the platform (Section 2 of the master brief).

- **Scene 1 — Presentation:** "A 52-year-old presents with sudden chest discomfort that started 30 minutes ago." Choices: (A) Take a focused history first — proceeds to Scene 2, small XP; (B) Order an ECG immediately — skips to Scene 3, smaller XP plus a "you moved fast, but here's what a history would have told you" note.
- **Scene 2 — History:** learner multi-selects which questions to ask from a list (onset, character, radiation, associated symptoms, risk factors); each correct selection reveals more detail and brief feedback on why it matters.
- **Scene 3 — Test ordering:** learner picks from a list (ECG, troponin, chest X-ray, CBC); the right combination unlocks results, an irrelevant choice costs a small XP penalty with a short explanation.
- **Scene 4 — Interpretation:** a simplified results summary is shown; learner picks the most likely category from a short list, with feedback either way.
- **Scene 5 — Outcome:** total XP earned, a one-line takeaway, and a badge unlock if this is the learner's first completed case.

Build this end-to-end (UI, data model usage, XP, feedback, badge unlock) before writing any other case — it's the reusable template for every case that follows.

---

## 8. Build order for the pilot

1. Lab shell UI + routing (module list, module detail page, "start" button) — no 3D yet, no timer yet.
2. Server-side quota system (the `record_lab_heartbeat` function above + `daily_lab_usage`). Test it with an artificially short cap first (e.g. 2 minutes instead of 1 hour) to prove enforcement actually works — including that it survives a page refresh or a new tab — before switching to the real 1-hour limit.
3. Wire up "The Chest Pain Case" fully, end-to-end, using the template above.
4. Add gamification for that one case: XP, streak counter, first badge.
5. Add subscription gating ($5/month or its manual-renewal fallback) so a subscribed test user can play past the free cap.
6. Only then: add the interactive 3D anatomy viewer and 2 more case modules.

---

## 9. Things the agent must NOT do

- Must **not** trust a client-side timer for the free-hour limit — server-enforced only.
- Must **not** load `@react-three/fiber`/Three.js outside the lab routes.
- Must **not** invent a new storage mechanism for this feature — use the existing Supabase tables.
- Must **not** publish real clinical case content without medical-reviewer sign-off — placeholder/example cases are fine for the pilot but must be clearly marked internally as unreviewed.
- Must **not** assume the payment provider supports auto-recurring billing without checking its documentation first.

---

## 10. Definition of done for this pilot

A learner can browse the lab list, complete "The Chest Pain Case" with XP and feedback at each step, hit the free-hour cap and see it actually enforced (even after refreshing or opening a new tab, proving it's server-side and not a client illusion), and a subscribed test account can play past the cap without interruption.