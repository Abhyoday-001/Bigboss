# spoorthi.md — Admin Dashboard (Owner: Spoorthi)

Paired with Dilraj on the Admin Dashboard. Spoorthi owns the **round-specific admin tool
screens** for Rounds 2, 3, and 4 — built on top of the core shell, auth, team management, and
global round controls that Dilraj builds. These screens carry the most "live drama" risk
on the admin side (captain reveals, eviction, judging) — clarity and confirmation dialogs first.

Read `PRD.md` and `DESIGN.md` fully before starting.

## How to Use This File

Every module below is **independent** — build them in any order, in parallel with everyone else.
Each module lists the **interface contracts** it depends on (API shapes, shared component props,
state machine values). Build against mocks/stubs for those contracts from Day 1; swap in real
implementations when they're ready.

---

## Shared Contracts (do first, with the whole team — 1 session)

- [ ] Review the API docs provided by the backend team for Round 2/3/4-specific endpoints:
      secret task assignment, nomination list, vote tallies, judge scores

> These shared items are small, fast, and done once as a team. Everything below can start
> immediately after (or even during) this step by mocking the contracts.

---

## Module: Captaincy Management

**What to build:**
- [ ] Interface to run/resolve the captaincy competition from the admin side

**Interface contracts needed:**
- Captaincy admin endpoint (start competition, set result)
- Teams list (to select/display competing teams)

**Can build with:** Mock captaincy endpoint + mock teams list.

---

## Module: Captain Reveal Control

**What to build:**
- [ ] Admin-triggered reveal, should sync with Aryan's participant-side captain reveal moment —
      test together, not in isolation

**Interface contracts needed:**
- Captain reveal endpoint (trigger reveal)
- State machine: phase value for captain reveal

**Can build with:** Mock reveal endpoint. Coordinate the **visual timing** with Aryan early
(share mockups), but the admin-side trigger button/UI is your own independent work.

---

## Module: Nomination Management

**What to build:**
- [ ] Mark nominated teams; support a configurable nomination count that scales with total
      registered teams (`PRD.md` §8 — exact formula is still open, build this as a settable number,
      not hardcoded)

**Interface contracts needed:**
- Nomination endpoint (GET teams, POST nominations, nomination count config)
- Teams list endpoint

**Can build with:** Mock teams list + mock nomination endpoint.

---

## Module: Secret Mission Assignment/Status

**What to build:**
- [ ] Assign the secret task to the first/middle/last teams on the leaderboard (pull directly from
      live leaderboard data, don't let admin pick manually — the poster's whole mechanic depends on
      it being those exact three positions)
- [ ] Track completion status per assigned team

**Interface contracts needed:**
- Leaderboard endpoint (to auto-identify first/middle/last teams)
- Secret mission admin endpoint (assign, track completion)

**Can build with:** Mock leaderboard with ranked teams + mock assignment endpoint.

**Acceptance:** Admin can run captaincy end-to-end and see the correct 3 teams auto-populate for
secret mission assignment based on live leaderboard position.

---

## Module: Safe/Nominated Team Pairing

**What to build:**
- [ ] Pair each nominated team with a safe team for the immunity challenge

**Interface contracts needed:**
- Nominated teams endpoint (list of nominated teams)
- Safe teams endpoint (list of non-nominated teams)
- Pairing endpoint (POST pairings)

**Can build with:** Mock lists of nominated + safe teams.

---

## Module: Immunity Round Control

**What to build:**
- [ ] Start/monitor/resolve the immunity challenge per pairing

**Interface contracts needed:**
- Immunity admin endpoint (start, monitor status, resolve)
- Pairings data (from the pairing module above, or from API)

**Can build with:** Mock pairings + mock immunity endpoint.

---

## Module: Voting Control & Results

**What to build:**
- [ ] Open/close the voting window — build data-driven for whoever the confirmed voter role turns
      out to be (`PRD.md` §8)
- [ ] Vote results view

**Interface contracts needed:**
- Voting admin endpoint (open/close window, GET results/tallies)

**Can build with:** Mock voting endpoint with fake tallies.

---

## Module: Eviction/Reveal Screen (Admin Side)

**What to build:**
- [ ] Must trigger and visually sync with Anjishth's participant-side eviction reveal — this is a
      live, audience-facing moment; coordinate a joint test, don't build in isolation

**Interface contracts needed:**
- Eviction endpoint (trigger eviction, GET result)
- State machine: `ROUND_3_EVICTION_REVEAL` phase value

**Can build with:** Mock eviction endpoint. Coordinate the **visual design** with Anjishth early
(share screenshots), but the admin trigger UI is your own independent work.

---

## Module: Hidden Feature Management

**What to build:**
- [ ] Add/edit features, reveal them on schedule or on-demand — drives Anjishth's participant-side
      hidden-feature dashboard directly

**Interface contracts needed:**
- Hidden features admin endpoint (CRUD features, reveal/hide toggle)

**Can build with:** Mock features CRUD endpoint.

---

## Module: View Team Submissions

**What to build:**
- [ ] List of submitted builds/links per team

**Interface contracts needed:**
- Submissions endpoint (GET all team submissions)

**Can build with:** Mock submissions list.

---

## Module: Judge Scoring Interface

**What to build:**
- [ ] Score per feature/task implemented correctly, per `PRD.md` §4.2

**Interface contracts needed:**
- Judge scoring endpoint (POST score per team per feature)
- Features list (from hidden features data)
- Team submissions (from submissions endpoint)

**Can build with:** Mock features + mock submissions + mock scoring endpoint.

---

## Module: Penalty Interface

**What to build:**
- [ ] Deduct points for out-of-scope features (per event concept: adding features outside listed
      requirements costs points — make this explicit and clearly labeled, not just a generic
      negative-number field)

**Interface contracts needed:**
- Penalty endpoint (POST deduction with reason)
- Team detail (to see current score)

**Can build with:** Mock penalty endpoint.

---

## Module: Final Scoreboard / Winner Screen

**What to build:**
- [ ] Highest-stakes screen in the whole build — must sync perfectly with Anjishth's participant-
      side final results reveal

**Interface contracts needed:**
- Final results endpoint (all scores, winner, rankings)
- State machine: `FINAL_RESULTS` phase value

**Can build with:** Mock final results data. Coordinate the **reveal timing** with Anjishth
(share mockups), but the admin display is your own independent work.

---

## Polish Checklist (after all modules are built)

- [ ] Confirm nomination-count scaling logic once the organizing team locks the formula
      (`PRD.md` §8) — don't ship a guessed number
- [ ] Loading/error/empty states on every screen above, especially judging and penalty interfaces
      (these get used under real time pressure at the event)
- [ ] Full responsive pass (desktop-first, verify tablet doesn't break)
- [ ] Joint end-to-end run-through of Round 2 → Round 4 with Dilraj (admin) and Aryan/Anjishth
      (participant) all connected to the real API before the event date

## Coordination Notes

- Secret-mission and eviction/reveal timing must be tested live against Anjishth's matching
  participant screens — these are the most visible "wow" or "fail" moments of the event.
  Share visual mockups early, build code independently, integration-test later.
- Confirm phase enum values with Dilraj/Aryan's shared state machine in the Shared Contracts
  session — don't introduce a parallel set of round-state values.
- **Anyone can build against mocks from Day 1.** Real integration happens when modules connect —
  that's a swap, not a rewrite.
