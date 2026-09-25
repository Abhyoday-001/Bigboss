# PRD — The Dev House (Frontend)

## 1. Overview

The Dev House is a Bigg Boss–themed multi-round technical event run by Cognito Club (JAIN FET),
7th October 2026. Teams register, compete across 4 rounds involving tasks, captaincy,
nominations, immunity, eviction voting, and a final hidden-feature build challenge judged live.

This document scopes the **frontend only**. Backend, database, and hosting (Railway) are owned
by a separate team. Frontend must be built against an API contract agreed with them in Phase 0.

## 2. Users / Personas

| Persona | Description | Primary app |
|---|---|---|
| **Participant (Team)** | A registered team of students competing in the house | Participant Panel |
| **Admin / Host** | Event organizer running rounds live, controlling state, entering scores | Admin Dashboard |
| **Judge** | Scores Round 4 submissions against hidden feature requirements (uses Admin Dashboard's judging screens) | Admin Dashboard |
| **Audience (optional, future)** | May view leaderboard publicly — not in current scope unless confirmed | — |

## 3. Goals

- Give every participant team a single, always-current view of "what's happening right now"
  in the event, with zero manual refreshing.
- Give the admin/host a control surface reliable enough to run a live, high-pressure event in
  front of an audience without UI ambiguity or accidental state changes (confirmation dialogs
  on anything destructive/irreversible: eviction, round-end, score submission).
- Fully realize the Bigg Boss / surveillance visual theme from the event poster (see `DESIGN.md`)
  without sacrificing usability or performance.
- Ship a dynamic, database-driven site — no hardcoded team/round data anywhere in the frontend.

## 4. Full Feature Scope

Nothing below is optional — every item must be built. If an item is genuinely infeasible before
the event date, flag it explicitly rather than silently dropping it.

### 4.1 Participant Panel

**Landing & Auth**
- Landing page — Bigg Boss branding, eye-zoom entrance animation, event info (date/venue/tagline)
- Team login (ID + password issued by admin — no self-registration)

**Team Space**
- Team dashboard — current round, current score, round status at a glance, quick links
- Team profile — team name, members, avatar/logo if applicable

**Live/Global**
- Live leaderboard — real-time rank, points, movement indicators (up/down since last poll)
- Round status — which round/sub-phase is currently active, what's coming next
- Timers/countdowns — shared component, used inside every timed round screen
- Live updates from backend — polling-driven, no manual refresh required anywhere
- Responsive UI — must work on phone (primary, teams will likely use phones in "the house") and laptop

**Round 1 — Task Round**
- Round 1 task interface — task brief, submission mechanism, live points confirmation

**Round 2 — Captaincy, Nominations, Secret Task**
- Captaincy task interface — competition mechanic + result reveal
- Secret mission interface — visible only to the 3 assigned teams (first/middle/last on leaderboard);
  must be invisible/inaccessible to all other teams
- Nomination status — shows a team whether they are nominated, with context

**Round 3 — Immunity & Eviction**
- Immunity challenge interface — for nominated teams, paired with a safe team
- Voting interface — for whoever the confirmed voting body is (see Open Questions)
- Eviction/reveal screens — dramatic reveal of who is safe / evicted, matching poster theme

**Round 4 — Finale**
- Hidden-feature dashboard — reveals required features/tasks as admin unlocks them
- Final submission page — team submits their vibe-coded website/link for judging
- Final score/result page — final standings, winner reveal

### 4.2 Admin / Host Dashboard

**Auth & Overview**
- Admin login
- Event overview — at-a-glance status of the whole event (current round, team count, active/eliminated split)

**Team Management**
- All teams list
- Active vs. eliminated teams (filterable view)
- Team detail view (drill into one team's history, scores, status)
- Score management — manual point entry/adjustment with an audit trail if possible

**Round Control (global)**
- Start/pause/end round controls
- Timer controls (set, pause, extend)

**Round 2 Admin Tools**
- Captaincy management — run/resolve the captaincy competition
- Captain reveal control
- Nomination management — mark nominated teams, adjust nomination count per registration scale
- Secret mission assignment — assign to first/middle/last teams; track completion status

**Round 3 Admin Tools**
- Safe/nominated team pairing interface
- Immunity round control (start, monitor, resolve)
- Voting control (open/close voting window)
- Vote results view
- Eviction/reveal screen (admin-triggered, mirrors participant-side reveal)

**Round 4 Admin Tools**
- Hidden feature management — add/edit/reveal features on a schedule or on-demand
- View team submissions
- Judge scoring interface — score per feature/task implemented
- Penalty interface — deduct points for out-of-scope features
- Final scoreboard / winner/result screen

## 5. Build Phases

Each phase should be demo-able end-to-end (participant + admin sides in sync) before the next
starts. See individual role files for per-person task breakdowns within each phase.

| Phase | Scope | Owners |
|---|---|---|
| **0 — Foundations** | Repo setup, design tokens (from poster), shared component library, event state machine, API contract with backend team, auth flow (both sides) | All 4 |
| **1 — Core Shell** | Landing + eye animation, login (both apps), team dashboard, team profile, admin event overview, all-teams list | Aryan (participant) + Dilraj (admin) |
| **2 — Round 1 + Leaderboard** | Live leaderboard (shared component), round status, Round 1 task interface, admin score management, round controls | Aryan + Dilraj |
| **3 — Round 2** | Captaincy interface + admin captaincy tools, secret mission (participant + admin), nomination status + admin nomination management | Anjishth (participant) + Spoorthi (admin) |
| **4 — Round 3** | Immunity interface + admin pairing/control, voting interface + admin voting control, eviction/reveal (both sides) | Anjishth + Spoorthi |
| **5 — Round 4 + Finale** | Hidden-feature dashboard + admin feature management, final submission, judge scoring + penalty interface, final score/result + winner screen | Anjishth + Spoorthi (with Aryan/Dilraj support) |
| **6 — Polish & Integration** | Full responsive QA, animation polish (eye zoom, neuron network, reveal transitions), end-to-end run-through against live backend, error/loading/empty states everywhere | All 4 |

## 6. Event State Machine (Frontend Contract)

The frontend must treat event progress as a single source of truth consumed by both apps:

```
LANDING → LOGIN
  → ROUND_1_ACTIVE → ROUND_1_RESULTS
  → ROUND_2_CAPTAINCY → ROUND_2_NOMINATIONS → ROUND_2_SECRET_TASK
  → ROUND_3_IMMUNITY → ROUND_3_VOTING → ROUND_3_EVICTION_REVEAL
  → ROUND_4_FEATURES_REVEALED → ROUND_4_SUBMISSION → ROUND_4_JUDGING
  → FINAL_RESULTS
```

Every screen renders conditionally based on this phase (fetched/polled from backend), never on
local/hardcoded assumptions about what round it "should" be. Build this in Phase 0 before any
round-specific screen.

## 7. Non-Functional Requirements

- **Real-time feel:** polling every 3–5s on leaderboard, round status, timers (see README for
  rationale; swap-in point for WebSockets if backend adds them later)
- **Responsive:** participant panel must work well on mobile; admin dashboard optimized for
  laptop/desktop but should not break on tablet
- **Resilience:** every data-fetching screen needs loading, error, and empty states — an admin
  fumbling a broken screen live is a real reputational risk
- **Destructive-action safety:** eviction, round-end, and final score submission require
  confirmation dialogs on the admin side
- **No hardcoded event data:** teams, scores, rounds, features must all come from the API

## 8. Open Questions for the Backend/Organizing Team

- Confirmed real-time mechanism: polling only, or will backend provide WebSockets?
- Who votes in Round 3 (judges / participants / audience / mix), and how many teams get evicted?
- Nomination cut-off formula relative to total registered teams
- What the captaincy advantage actually does, and in which round(s) it applies
- Secret task rewards/risks for first/middle/last teams
- Round 4 scoring sheet: points per feature, deduction per out-of-scope feature

## 9. Out of Scope (for now)

- Public/audience-facing leaderboard view (separate from participant + admin apps)
- Native mobile app (responsive web only)
- Anything backend/database — this document covers frontend only
