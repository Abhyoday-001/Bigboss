# dilraj.md — Admin Dashboard (Owner: Dilraj)

Paired with Spoorthi on the Admin Dashboard. Dilraj owns the **core infrastructure and global
controls**: admin login, event overview, team management, score management, and the round
start/pause/end + timer controls that drive the whole event's state machine. Spoorthi builds the
round-specific admin tool screens (Round 2/3/4) on top of what you build here.

Read `PRD.md` and `DESIGN.md` fully before starting. The admin side carries real operational
risk during a live event — prioritize clarity and confirmation dialogs over visual flourish here,
per `PRD.md` §7.

## How to Use This File

Every module below is **independent** — build them in any order, in parallel with everyone else.
Each module lists the **interface contracts** it depends on (API shapes, shared component props,
state machine values). Build against mocks/stubs for those contracts from Day 1; swap in real
implementations when they're ready.

---

## Shared Contracts (do first, with the whole team — 1 session)

- [ ] Review the API docs provided by the backend team for admin-privileged endpoints: admin auth,
      round-control (start/pause/end/set-timer), and score adjustment shapes
- [ ] Decide how "loading" states are built on every control button (handle both sync and
      confirm-then-poll response patterns gracefully)

> These shared items are small, fast, and done once as a team. Everything below can start
> immediately after (or even during) this step by mocking the contracts.

---

## Module: Admin Login

**What to build:**
- [ ] Separate auth flow/role from team login — admin role is distinguished via the API response

**Interface contracts needed:**
- Admin auth endpoint shape (POST body, response shape, role field)

**Can build with:** Mock auth endpoint returning an admin token/role.

---

## Module: Event Overview

**What to build:**
- [ ] At-a-glance: current round/phase (via shared state machine), team counts (total/active/eliminated),
      quick links into team management and round controls

**Interface contracts needed:**
- Event-phase endpoint (current phase)
- Teams summary endpoint (counts by status)
- State machine module

**Can build with:** Mock phase + fake team counts.

---

## Module: All Teams List

**What to build:**
- [ ] Table/list of all registered teams with status (active/nominated/evicted/etc.)
- [ ] Filterable by active vs. eliminated (per `PRD.md` §4.2)

**Interface contracts needed:**
- Teams list endpoint (array of teams with name, status, score)

**Can build with:** Mock array of 10–15 teams with mixed statuses.

---

## Module: Team Detail View

**What to build:**
- [ ] Drill into one team: score history, current status, round-by-round performance if the API
      exposes it

**Interface contracts needed:**
- Team detail endpoint (score history, status, round performance)

**Can build with:** Mock team detail data for one team.

**Acceptance:** Admin can log in, see a live count of active teams matching the current database
state, and open any team's detail view.

---

## Module: Live Leaderboard (Admin View)

**What to build:**
- [ ] Reuse Aryan's shared leaderboard component — admin view may add inline score-edit affordance,
      but do not rebuild the component from scratch

**Interface contracts needed:**
- Aryan's Leaderboard component props interface (get this from Shared Contracts, not from his
  finished code)
- Leaderboard endpoint

**Can build with:** Import the shared component (or stub it with a placeholder) + mock
leaderboard data. The admin-specific score-edit overlay is your own independent work.

---

## Module: Score Management

**What to build:**
- [ ] Manual point entry/adjustment UI, with a visible audit trail (who changed what, when) if the
      API supports it

**Interface contracts needed:**
- Score adjustment endpoint (POST adjustment, GET audit trail)
- Teams list (to select which team to adjust)

**Can build with:** Mock score adjustment endpoint + mock audit trail.

---

## Module: Round Controls (Global)

**What to build:**
- [ ] Start / pause / end round buttons — **every one of these needs a confirmation modal**, no
      exceptions, per `PRD.md` §7
- [ ] Timer controls: set duration, pause, extend — wired to the shared Timer component's
      server-time source so admin and participant clocks never visibly disagree

**Interface contracts needed:**
- Round control endpoints (start/pause/end round, set/pause/extend timer)
- Aryan's Timer component props (for timer display, get the interface early)

**Can build with:** Mock round-control endpoints that return success. The confirmation modals
and UI are fully standalone.

**Acceptance:** Starting/ending a round from the admin dashboard correctly and immediately updates
the participant panel's Round Status component (test with Aryan/Anjishth live, not in isolation) —
no team should see a stale phase for more than one poll interval.

---

## Polish Checklist (after all modules are built)

- [ ] Stress-test round controls: rapid start/pause/end clicks should never leave the event in an
      inconsistent state — add button disabling while a request is in flight
- [ ] Full responsive pass — desktop-first is fine, but verify nothing breaks on a tablet
      (`DESIGN.md` §7)
- [ ] Loading/error/empty states on every screen above, especially team list and score management
- [ ] Full run-through of the event timeline from the admin side alongside Spoorthi's screens,
      to confirm handoff between your global controls and their round-specific tools is seamless

## Coordination Notes

- Spoorthi's Round 2/3/4 admin tools depend on the round-control state you expose — share the
  **interface** (phase enum values, control endpoint shapes) in the Shared Contracts session.
  She doesn't need your finished UI to start building.
- Your round-end/eviction-trigger actions need to visually and timing-wise sync with the
  participant-side reveal screens Anjishth builds — coordinate a live test together later, but
  build independently now.
- **Anyone can build against mocks from Day 1.** Real integration happens when modules connect —
  that's a swap, not a rewrite.
