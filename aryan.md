# aryan.md — Participant Panel (Owner: Aryan)

Paired with Anjishth on the Participant Panel. Aryan owns the **early/mid event flow**:
landing → login → dashboard → leaderboard → Round 1 → Round 2 captaincy. Also owns the
shared **Timer/Countdown** component (used by everyone, both apps, from the start).

Read `PRD.md` and `DESIGN.md` fully before starting. Do not hardcode any team/round/score data —
everything comes from the API provided by the backend team.

## How to Use This File

Every module below is **independent** — build them in any order, in parallel with everyone else.
Each module lists the **interface contracts** it depends on (API shapes, shared component props,
state machine values). Build against mocks/stubs for those contracts from Day 1; swap in real
implementations when they're ready.

---

## Shared Contracts (do first, with the whole team — 1 session)

- [x] Scaffold repo: Vite + Tailwind + React Router
- [x] Implement design tokens from `DESIGN.md` §2–3 as a shared Tailwind config / CSS variables file
- [x] Build the shared event **state machine** module (`PRD.md` §6) — single function/hook that
      maps API phase → what should render, used by both apps
- [x] Build shared `usePolling` hook (3–5s interval, configurable per screen)

> These shared items are small, fast, and done once as a team. Everything below can start
> immediately after (or even during) this step by mocking the contracts.

---

## Module: Landing Page & Eye Animation

**What to build:**
- [x] Full event branding (name, date, venue, tagline) per `DESIGN.md`
- [x] Eye-zoom entrance animation (first-visit only — see `DESIGN.md` §5)
- [x] Neuron-network ambient background in corners
- [x] CTA to login

**Interface contracts needed:**
- Design tokens (colors, fonts) from shared Tailwind config
- Router path for login page

**Can build with:** Static content + local animation — no API dependency.

---

## Module: Team Login

**What to build:**
- [x] ID + password fields (admin-issued credentials, no self-registration)
- [x] Error state for invalid credentials
- [x] Post-login lighter eye-zoom transition into dashboard (`DESIGN.md` §5)

**Interface contracts needed:**
- Auth API endpoint shape (POST body, response shape, token format)
- State machine: what phase to route to after login

**Can build with:** Mock auth endpoint returning a fake token + phase.

---

## Module: Team Dashboard

**What to build:**
- [x] Current round/phase (from state machine), current score, quick status summary
- [x] Links to team profile and live leaderboard

**Interface contracts needed:**
- Event-phase endpoint response shape
- Team-data endpoint response shape (score, name, status)
- `usePolling` hook (or a mock that returns static data on interval)

**Can build with:** Mock API returning hardcoded phase + team data.

---

## Module: Team Profile

**What to build:**
- [x] Team name, members, avatar/logo if the API provides one

**Interface contracts needed:**
- Team-data endpoint response shape (name, members, avatar fields)

**Can build with:** Mock team-data response.

---

## Module: Timer/Countdown (Shared Component)

**What to build:**
- [x] Build once in `/shared/components`, must accept a target end-time from the API and count
      down client-side without drifting — do not rely on local `setInterval` alone for accuracy,
      resync against server time periodically
- [x] Visual state changes as time runs low (e.g. color shift) per `DESIGN.md` accent rules

**Interface contracts needed:**
- Timer API shape: how the target end-time is received from the API
- Server time endpoint (for resync)

**Can build with:** A hardcoded future timestamp — no dependency on anyone else's screens.

> This component is used by everyone across both apps. Publish its props interface early so
> Anjishth, Dilraj, and Spoorthi can integrate it without waiting for you to finish.

---

## Module: Live Leaderboard (Shared Component)

**What to build:**
- [x] Build in `/shared/components` — Anjishth and both admin devs reuse this
- [x] Real-time rank + points via polling
- [x] Up/down movement indicators since last poll (`DESIGN.md` §6)
- [x] Current team's row visually distinguished

**Interface contracts needed:**
- Leaderboard endpoint response shape (array of teams with rank, score, previous rank)
- `usePolling` hook
- Auth context (to identify "current team" for highlighting)

**Can build with:** Mock leaderboard data (5–10 fake teams with scores).

> Publish this component's props interface early so Dilraj can build the admin leaderboard view
> on top of it without waiting.

---

## Module: Round Status Component

**What to build:**
- [x] Shows current phase name + what's next, using the state machine

**Interface contracts needed:**
- State machine module (phase → display name + next phase mapping)
- Event-phase endpoint

**Can build with:** Mock phase value — component just maps phase → text.

> Anjishth's screens depend on this component. Share the interface (props) early.

---

## Module: Round 1 Task Interface

**What to build:**
- [x] Task brief display, submission mechanism, confirmation of points awarded
- [x] Loading/error/empty states

**Interface contracts needed:**
- Round 1 task endpoint (task brief, submission endpoint, points response)
- State machine: `ROUND_1_ACTIVE` phase value

**Can build with:** Mock task data + a mock submission endpoint.

**Acceptance:** Leaderboard updates without refresh when points change on the API; Round 1
task screen correctly reflects submission status after a page reload.

---

## Module: Round 2 Captaincy Interface

**What to build:**
- [x] Competition mechanic UI + captain reveal moment (use bracket-motif framing per `DESIGN.md` §4)
- [x] Reflects captaincy advantage status once assigned (exact mechanic TBD — see `PRD.md` §8 open
      questions; build the UI to be data-driven so it adapts once the mechanic is confirmed)

**Interface contracts needed:**
- Captaincy endpoint (competition data, captain result, advantage status)
- State machine: `ROUND_2_CAPTAINCY` phase value

**Can build with:** Mock captaincy data — the reveal moment is a pure UI/animation task.

---

## Polish Checklist (after all modules are built)

- [x] Full responsive pass on all screens owned above (mobile-first, per `DESIGN.md` §7)
- [x] Verify Timer component resyncs correctly across a real network delay/pause scenario
- [x] Verify leaderboard component performs fine at expected team-count scale (ask organizers
      for expected registration numbers)
- [x] Loading/error/empty states double-checked on every screen above

## Coordination Notes

- Anjishth's screens (secret mission, nominations onward) depend on your Round Status component
  and the shared state machine — share the **props interface** early, don't wait until your code
  is polished.
- Dilraj's admin round-controls will trigger the phase changes your screens react to — align on
  the exact phase enum values together in Shared Contracts, don't invent them independently.
- **Anyone can build against mocks from Day 1.** Real integration happens when modules connect —
  that's a swap, not a rewrite.

**Acceptance for Phase 1 screens:** A team can log in, land on their dashboard, see their real
score from the API, and log out/back in without re-triggering the full landing animation.
