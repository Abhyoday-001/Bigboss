# dilraj.md — Admin Dashboard (Owner: Dilraj)

Paired with Spoorthi on the Admin Dashboard. Dilraj owns the **core infrastructure and global
controls**: admin login, event overview, team management, score management, and the round
start/pause/end + timer controls that drive the whole event's state machine. Spoorthi builds the
round-specific admin tool screens (Round 2/3/4) on top of what you build here.

Read `PRD.md` and `DESIGN.md` fully before starting. The admin side carries real operational
risk during a live event — prioritize clarity and confirmation dialogs over visual flourish here,
per `PRD.md` §7.

## Implementation Status Summary (Branch: `feat/admin-overview-round-controls`)

| Module | Status | Key Components & Files Built |
|---|---|---|
| **Shared Contracts & System Design** | ✅ Complete | `src/shared/types/event.ts`, `src/index.css`, `tailwind.config.js` |
| **Confirmation & Safety System** | ✅ Complete | `src/shared/components/ConfirmationModal.tsx` (PRD §7 compliant) |
| **Event Overview & Status Metrics** | ✅ Complete | `src/admin/components/EventOverview.tsx`, `src/shared/components/TimerDisplay.tsx` |
| **Global Round & Timer Controls** | ✅ Complete | `src/admin/components/RoundControls.tsx`, `src/mocks/mockEventState.ts` |
| **All Teams List & Live Roster** | ✅ Complete | `src/admin/components/TeamsTable.tsx`, `src/mocks/mockTeams.ts` |
| **Team Detail Drill-down Modal** | ✅ Complete | `src/admin/components/TeamDetailModal.tsx` |
| **Score Management & Audit Logs** | 🚧 In Progress | Schema & types ready in `mockTeams.ts`, UI overlay next |
| **Admin Login** | ⏳ Planned | Dedicated auth screen |

---

## How to Use This File

Every module below is **independent** — build them in any order, in parallel with everyone else.
Each module lists the **interface contracts** it depends on (API shapes, shared component props,
state machine values). Build against mocks/stubs for those contracts from Day 1; swap in real
implementations when they're ready.

---

## Shared Contracts (do first, with the whole team — 1 session)

- [x] Review the API docs provided by the backend team for admin-privileged endpoints: admin auth,
      round-control (start/pause/end/set-timer), and score adjustment shapes
- [x] Decide how "loading" states are built on every control button (handle both sync and
      confirm-then-poll response patterns gracefully with disabled states & spinners)

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
- [x] At-a-glance: current round/phase (via shared state machine), team counts (total/active/eliminated/nominated),
      quick links into team management and round controls

**Interface contracts implemented:**
- `EventState` & `PHASE_METADATA` (`src/shared/types/event.ts`)
- Live sync timer display (`src/shared/components/TimerDisplay.tsx`)
- Status cards & quick navigation (`src/admin/components/EventOverview.tsx`)

**Built with:** Mock state machine with reactive counters.

---

## Module: All Teams List

**What to build:**
- [x] Table/list of all registered teams with status (active/nominated/evicted/captain/immune)
- [x] Filterable by active vs. eliminated (per `PRD.md` §4.2), status tabs, search bar by name/code/member
- [x] Live walk-in registration modal for quick additions

**Interface contracts implemented:**
- `TeamRecord`, `TeamStatus` (`src/mocks/mockTeams.ts`)
- `TeamsTable` component (`src/admin/components/TeamsTable.tsx`)

**Built with:** 16-team mock roster with active/nominated/immune/placeholder statuses.

---

## Module: Team Detail View

**What to build:**
- [x] Drill into one team: score history, current status, squad roster, round-by-round performance
- [x] Status override shortcuts for live emergencies

**Interface contracts implemented:**
- `TeamDetailModal` component (`src/admin/components/TeamDetailModal.tsx`)
- Round-by-round performance break-down & audit logs

**Acceptance:** Admin can log in, see a live count of active teams matching the current database
state, search/filter teams, and open any team's detail view.

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

**Can build with:** Mock score adjustment endpoint + mock audit trail (schema ready in `mockTeams.ts`).

---

## Module: Round Controls (Global)

**What to build:**
- [x] Start / pause / end round buttons — **every one of these needs a confirmation modal**, no
      exceptions, per `PRD.md` §7
- [x] Timer controls: set duration, pause, extend — wired to the shared Timer component's
      server-time source so admin and participant clocks never visibly disagree
- [x] Next Phase Milestone Advancement triggers

**Interface contracts implemented:**
- `RoundControls` component (`src/admin/components/RoundControls.tsx`)
- `ConfirmationModal` component (`src/shared/components/ConfirmationModal.tsx`)

**Built with:** Complete mock state machine with in-flight request protection.

**Acceptance:** Starting/ending a round from the admin dashboard correctly and immediately updates
the state machine.

---

## Polish Checklist (after all modules are built)

- [x] Stress-test round controls: rapid start/pause/end clicks should never leave the event in an
      inconsistent state — button disabling while request is in flight
- [x] Full responsive pass — desktop-first + tablet support (`DESIGN.md` §7)
- [x] Loading/error/empty states on team list and round controls
- [ ] Full run-through of the event timeline from the admin side alongside Spoorthi's screens

---

## Coordination Notes

- Spoorthi's Round 2/3/4 admin tools depend on the round-control state you expose — share the
  **interface** (phase enum values, control endpoint shapes) in the Shared Contracts session.
- Your round-end/eviction-trigger actions need to visually and timing-wise sync with the
  participant-side reveal screens Anjishth builds.
- **Anyone can build against mocks from Day 1.** Real integration happens when modules connect —
  that's a swap, not a rewrite.
