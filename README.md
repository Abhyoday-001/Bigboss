# The Dev House — Frontend

**Organized by:** Cognito Club, JAIN (Deemed-to-be University), Faculty of Engineering and Technology
**Date:** 7th October 2026, 9:00 AM – 3:00 PM
**Venue:** Seminar Hall 002
**Faculty Coordinator:** Dr. M. Tamilvelen · **Club President:** Yatin Mehta
**Tagline:** Tech × Strategy × Survival × Build — "It's not just a tech event, it's a reality."

A Bigg Boss–themed, multi-round tech event platform. Teams enter "the house," complete tasks,
fight for captaincy, survive nominations, and face eviction — before the survivors build a
website against hidden feature requirements in the finale. This repo contains **frontend only**.
Backend + database are owned by a separate team and deployed on Railway.

See `PRD.md` for full feature scope, `DESIGN.md` for the visual system, and the individual
`aryan.md` / `anjishth.md` / `dilraj.md` / `spoorthi.md` files for task-by-task ownership.

---

## Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **State/data:** React Query (or SWR) for polling-based data fetching + caching
- **Animation:** Framer Motion (UI transitions) + raw SVG/CSS for the eye and neural-network motifs
- **API:** REST, consumed from the backend team's Railway deployment (base URL via `.env`)

## Two Apps, One Repo

This is functionally two frontends sharing a design system and a backend contract:

```
/src
  /participant        → Aryan + Anjishth
  /admin               → Dilraj + Spoorthi
  /shared
    /components        → buttons, cards, modals, badges, timers, leaderboard
    /state-machine      → single source of truth for event phase → screen mapping
    /hooks               → usePolling, useAuth, useEventPhase
    /theme               → design tokens (colors, type, spacing) from DESIGN.md
    /animations          → eye-zoom sequence, neuron-network background
```

Both apps read event phase and data from the same shared state machine and API layer —
they do not duplicate polling logic or leaderboard components.

## Environment Setup

```bash
git clone <repo-url>
cd dev-house-frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL to the Railway backend URL
npm run dev
```

## Branching

- `main` — stable, demo-ready
- `feat/participant-*` — Aryan & Anjishth's work
- `feat/admin-*` — Dilraj & Spoorthi's work
- Merge into `main` only after a phase's screens are integration-tested against the live backend

## Real-Time Strategy

No confirmed WebSocket layer from backend as of writing. Build against **polling** (3–5s interval
on leaderboard/round-status/timers) via a single shared `usePolling` hook, so switching to
WebSockets later (if backend adds it) only requires changing the hook's internals, not every screen.

## Build Strategy

See `PRD.md` §5 for the high-level phase breakdown. Individual task files (`aryan.md`,
`anjishth.md`, `dilraj.md`, `spoorthi.md`) are organized as **independent modules**, not
sequential phases — all 4 devs can build their screens in parallel from Day 1 by mocking
interface contracts (API shapes, shared component props, state machine values). Integration
testing happens when modules connect, not as a gate before starting.

## Docs Index

| File | Purpose |
|---|---|
| `PRD.md` | Full feature list, state machine, API assumptions, non-functional requirements |
| `DESIGN.md` | Visual system derived from the event poster — colors, type, motifs, animation specs |
| `aryan.md` | Aryan's independent modules, interface contracts, acceptance criteria |
| `anjishth.md` | Anjishth's independent modules, interface contracts, acceptance criteria |
| `dilraj.md` | Dilraj's independent modules, interface contracts, acceptance criteria |
| `spoorthi.md` | Spoorthi's independent modules, interface contracts, acceptance criteria |
