# Tech Boss — Demo Credentials & Testing Guide

This document lists all active demo credentials, roles, and testing shortcuts across the **Tech Boss** platform.

---

## 🚀 1-Click Direct Testing Options

1. **Floating Demo Switcher Widget**:
   - An interactive `[DEMO CREDENTIALS]` button is visible at the bottom-right of every screen.
   - Click it at any time to:
     - Instantly switch to any team or admin role.
     - Copy team IDs or passcodes.
     - Switch the event phase (e.g. `ROUND_1_ACTIVE`, `ROUND_2_CAPTAINCY`, `ROUND_2_SECRET_TASK`, `ROUND_3_NOMINATIONS`, etc.).
     - Jump directly to `/dashboard`, `/round-1`, `/round-2-captaincy`, `/profile`, `/login`, or `/`.

2. **Navbar Persona Switcher**:
   - In the top header (`ParticipantNavbar`), click the active team pill to open a drop-down menu and switch active teams on the fly without logging out.

3. **Login Terminal Presets (`/login` and `/`)**:
   - Use the **Login** buttons for instant 1-click authentication, or **Fill** to auto-populate the form inputs.

---

## 👥 Participant Demo Accounts

| Team Persona | Team ID | Passcode | Team Name | Team Lead | Rank | House Status & Privileges |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Team Alpha** | `team-01` | `devhouse` | CyberNexus | Aryan Sharma | **#1** | **House Captain** (Immunity), **Secret Mission Active** |
| **Team Beta** | `team-02` | `devhouse` | NullPointers | Anjishth Kumar | **#2** | Captaincy Challenger, Top Contender |
| **Team Gamma** | `team-03` | `devhouse` | ByteForce | Dilraj Singh | **#3** | High-tier Contender, Active Challenge Submissions |
| **Team Delta** | `team-04` | `devhouse` | GlitchHunters | Spoorthi Gowda | **#4** | Safe Zone Contestant, Squad Roster |
| **Team ZeroDay** | `team-05` | `devhouse` | ZeroDay Protocol | Tanmay Joshi | **#5** | **Leaderboard Middle** — Secret Saboteur Task Assigned |
| **Team SyntaxErrors** | `team-09` | `devhouse` | SyntaxErrors | Manish Das | **#9** | **Nominated for Eviction** + **Underdog Secret Mission** |

> **Note on Permissive Login:** Any custom team ID or name (e.g. `test-team`, `coders`, `alpha`, `1`) and any passcode will also log in permissively to ensure developers are never blocked.

---

## 🛡️ Control Room / Admin Credentials

| Role | Username / ID | Passcode | Description |
| :--- | :--- | :--- | :--- |
| **Control Room Master** | `admin` | `admin123` *(or `devhouse`)* | Unlocks administrator controls, global timer overrides, and round phase progression. |

---

## 🧭 Page Routes Ready for Testing

### Participant Experience:
- **`/`** — Mechanical Surveillance Eye Landing Sequence + Neural Particle Travel
- **`/login`** — Security Terminal House Verification + Post-Login Zoom Transition
- **`/dashboard`** — Live House Status, Leaderboard, Round 2-4 Quick Cards, and Secret Mission Status
- **`/profile`** — Team Profile, Member Roles, Table Number, Performance Stats
- **`/round-1`** — Round 1 Task Terminal (Protocol Breach, Test Suite runner, Repo submission)
- **`/round-2`** / **`/round-2-captaincy`** — Round 2 Hub: Captaincy Arena & Speed Run Challenge
- **`/round-2-secret-task`** / **`/secret-mission`** — Round 2 Hub: Classified Directive (restricted to #1, #5, #9)
- **`/round-2-nominations`** / **`/nomination-status`** — Round 2 Hub: House Nomination Ledger & Explanations
- **`/round-3`** / **`/round-3-immunity`** / **`/immunity-challenge`** — Round 3 Hub: Immunity Pairings & Duel Arena
- **`/round-3-voting`** / **`/voting`** — Round 3 Hub: Secure Cryptographic Voting Booth
- **`/round-3-eviction`** / **`/eviction-reveal`** — Round 3 Hub: Eviction Broadcast & Reality Reveal
- **`/round-4`** / **`/round-4-features`** — Round 4 Hub: Dynamic Hidden Specs & Live Feature Feed
- **`/round-4-submission`** — Round 4 Hub: Vibe-Coded Build & Repository Submission
- **`/final-results`** — Round 4 Hub: Grand Champions Podium & Victory Telemetry
- **`/participant-panel`** — Standalone Interactive Shell Harness for rapid testing

### Admin Experience:
- **`/admin`** — Core Admin Dashboard (Event Overview, Global Phase Machine, Timer Sync, Live Roster, Score Manager)
- **`/admin/rounds`** — Round Operations Console (Captaincy, Nominations, Secret Missions, Pairings, Immunity, Voting, Eviction, Hidden Features, Judging, Penalties, Finale)

---

## ⚡ Simulating Different Game States

Using the **Demo Access Drawer** (bottom-right button):
- Change `currentPhase` between:
  - `REGISTRATION`
  - `ROUND_1_ACTIVE` (Live task countdown)
  - `ROUND_1_EVALUATION`
  - `ROUND_2_CAPTAINCY` (Live speed challenge)
  - `ROUND_2_SECRET_TASK` (Only teams #1, #5, #9 see the secret briefing)
  - `ROUND_2_NOMINATIONS`
  - `ROUND_3_IMMUNITY`
  - `ROUND_3_VOTING`
  - `ROUND_4_FINALE`
  - `EVENT_CONCLUDED`
