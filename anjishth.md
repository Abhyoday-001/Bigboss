# anjishth.md — Participant Panel (Owner: Anjishth)

Paired with Aryan on the Participant Panel. Anjishth owns the **mid/late event flow**:
secret mission → nomination status → Round 3 (immunity, voting, eviction) → Round 4 (finale) →
final results. Also owns the shared **live-updates/polling integration layer** (built on top of
Aryan's `usePolling` hook) — making sure every screen actually stays in sync, not just the
leaderboard.

Read `PRD.md` and `DESIGN.md` fully before starting. Do not hardcode any team/round/score data —
everything comes from the API contract agreed in the Shared Contracts step.

## How to Use This File

Every module below is **independent** — build them in any order, in parallel with everyone else.
Each module lists the **interface contracts** it depends on (API shapes, shared component props,
state machine values). Build against mocks/stubs for those contracts from Day 1; swap in real
implementations when they're ready.

---

## Shared Contracts (do first, with the whole team — 1 session)

- [ ] Participate in API contract discussion with backend team — pay particular attention to
      how the **secret task visibility** (only 3 teams see it) and **nomination status** will be
      represented in the API (per-team flag vs. separate endpoint) — this affects your screens most
- [ ] Review Aryan's state machine + polling hook once built; confirm it can express
      round sub-phases (e.g. "Round 3: voting open" vs "Round 3: results revealed")

> These shared items are small, fast, and done once as a team. Everything below can start
> immediately after (or even during) this step by mocking the contracts.

---

## Module: Secret Mission Interface

**What to build:**
- [ ] Must be conditionally rendered/hidden for all teams except the 3 assigned (first/middle/last
      on leaderboard) — this is a real access-control requirement, not just a UI nicety; confirm
      with backend team whether hiding happens client-side (fed by an API flag) or the endpoint
      itself 403s for non-assigned teams, and design the screen to handle both gracefully
- [ ] Suspenseful framing per `DESIGN.md` mood (dark reveal, not a plain form)

**Interface contracts needed:**
- Secret mission endpoint shape (mission brief, assignment flag, completion status)
- Auth context (current team ID — for access-control check)
- State machine: `ROUND_2_SECRET_TASK` phase value

**Can build with:** Mock endpoint returning mission data for an "assigned" team + a 403 for a
"non-assigned" team. The UI/animation is fully independent.

---

## Module: Nomination Status

**What to build:**
- [ ] Clear indication of nominated/not-nominated with context (why, what happens next)
- [ ] Uses status badge styling from `DESIGN.md` §6

**Interface contracts needed:**
- Nomination status endpoint (boolean flag + context text)
- State machine: `ROUND_2_NOMINATIONS` phase value

**Can build with:** Mock nomination data — this is a display-only component.

---

## Module: Immunity Challenge Interface

**What to build:**
- [ ] Shows the nominated team's paired safe team, the challenge itself, and outcome

**Interface contracts needed:**
- Immunity endpoint (paired team info, challenge data, outcome)
- State machine: `ROUND_3_IMMUNITY` phase value

**Can build with:** Mock immunity data with a fake pairing.

---

## Module: Voting Interface

**What to build:**
- [ ] Build data-driven — exact voter identity (judges/participants/audience/mix) is still an open
      question per `PRD.md` §8; don't hardcode an assumption, make the component accept whoever the
      voter role turns out to be from the API/auth context

**Interface contracts needed:**
- Voting endpoint (candidates list, vote submission, vote status)
- Auth context (voter role — participant, judge, audience)
- State machine: `ROUND_3_VOTING` phase value

**Can build with:** Mock candidate list + a mock vote submission endpoint. The voter-role
flexibility is a props/config concern, not a dependency on other code.

---

## Module: Eviction/Reveal Screens

**What to build:**
- [ ] This is a key dramatic beat — use the eye motif / bracket framing / danger-red accent per
      `DESIGN.md` for maximum impact; coordinate visually with Spoorthi's admin-side eviction
      control screen so both reveal in sync

**Interface contracts needed:**
- Eviction result endpoint (who's safe, who's evicted)
- State machine: `ROUND_3_EVICTION_REVEAL` phase value

**Can build with:** Mock eviction result — the reveal animation/UI is a fully standalone visual
task. Coordinate the **visual design** with Spoorthi early (share screenshots/mockups), but the
code itself doesn't depend on her admin screen being built.

**Acceptance:** A nominated team can see their immunity result and, if evicted, gets a clear and
thematically consistent reveal screen — verify against a real backend-triggered eviction event,
not just a mocked state.

---

## Module: Round 4 Hidden-Feature Dashboard

**What to build:**
- [ ] Features/tasks appear as admin reveals them (poll-driven) — no page reload needed
- [ ] Clearly separates "required" vs any bonus/optional items if the API distinguishes them

**Interface contracts needed:**
- Hidden features endpoint (list of features with revealed/hidden status)
- `usePolling` hook
- State machine: `ROUND_4_FEATURES_REVEALED` phase value

**Can build with:** Mock features list that "reveals" items over time.

---

## Module: Final Submission Page

**What to build:**
- [ ] Team submits their vibe-coded site link/build for judging
- [ ] Confirmation state after submission, with ability to see submission status

**Interface contracts needed:**
- Submission endpoint (POST link/URL, GET status)
- State machine: `ROUND_4_SUBMISSION` phase value

**Can build with:** Mock submission endpoint.

---

## Module: Final Score/Result Page

**What to build:**
- [ ] Final standings + winner reveal, highest-impact visual moment of the whole app — go big on
      the poster's cinematic mood here

**Interface contracts needed:**
- Final results endpoint (all team scores, winner, rankings)
- State machine: `FINAL_RESULTS` phase value

**Can build with:** Mock final standings data. The reveal animation is a pure visual task.

---

## Polish Checklist (after all modules are built)

- [ ] Audit every screen you own for loading/error/empty states
- [ ] Full responsive pass (mobile-first)
- [ ] End-to-end test: run through Round 2 → Round 4 as a test "team" against the real backend,
      confirm nothing requires a manual refresh at any step
- [ ] Confirm secret-mission access control actually blocks non-assigned teams in a real test,
      not just visually hides the link

## Coordination Notes

- Your screens are all downstream of Aryan's Round Status + state machine — get the **interface
  contract** (prop types, phase enum values) from him in the Shared Contracts session, then build
  against mocks. You don't need his finished code.
- Your eviction/voting/finale screens need to visually and timing-wise sync with Spoorthi's
  matching admin-side controls — share visual mockups early, but build the code independently.
  Integration testing happens later, not during development.
- **Anyone can build against mocks from Day 1.** Real integration happens when modules connect —
  that's a swap, not a rewrite.
