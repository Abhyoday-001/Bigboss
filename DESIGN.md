# DESIGN.md — The Dev House Visual System

Source of truth: the official event poster (JAIN FET × Cognito Club, "The Dev House"). Every
screen in both apps should feel like it belongs on the same poster — dark, cinematic,
surveillance-themed, with a single accent color doing all the emotional work.

## 1. Mood

Dark reality-TV control room meets hacker house. Confident, slightly ominous, high-contrast.
Not playful/cartoonish — the poster is moody and cinematic, not a typical bright hackathon UI.

## 2. Color Palette

| Token | Hex (approx) | Usage |
|---|---|---|
| `bg-primary` | `#050506` | Base background, near-black |
| `bg-elevated` | `#0d0f14` | Cards, panels, modals |
| `accent-blue` | `#1EA7FF` | Primary accent — glow, borders, active states, links |
| `accent-blue-glow` | `#4FC3FF` (with blur/box-shadow glow) | Hover states, active glow effects, eye iris |
| `text-primary` | `#F2F3F5` | Headlines, primary text |
| `text-secondary` | `#9AA1AC` | Supporting text, metadata |
| `metal-silver` | `#C9CDD3` → `#6E7278` gradient | Distressed "DEV HOUSE" style headline treatment |
| `danger-red` | `#FF3B4E` | Eliminations, penalties, destructive admin actions (used sparingly — poster is blue-dominant, red only for high-stakes moments) |
| `success-green` | `#2ED67B` | Safe/immunity confirmations, success states |

Rule: **blue is the default emotional register** (tension, tech, "the house is watching").
Red is reserved for eviction/penalty moments only, so it retains impact.

## 3. Typography

- **Display / Headlines** ("THE DEV HOUSE" style): a bold condensed/stencil face with a
  distressed metallic texture, matching the poster's title treatment. Closest accessible web
  fonts: **Anton**, **Bebas Neue**, or **Staatliches** (Google Fonts) — apply a subtle
  noise/scratch texture overlay via CSS `mix-blend-mode` or a background-image texture to
  approximate the metal-plate look, don't just use the flat font.
- **Body / UI text:** a clean geometric sans — **Inter** or **Space Grotesk** — for all
  dashboard content, forms, tables. Keeps the interface legible against the display font.
- **Labels / eyebrow text** (e.g. "TECH × STRATEGY × SURVIVAL × BUILD"): uppercase, wide
  letter-spacing, small size — used for section labels and status tags throughout the UI.

## 4. Core Motifs

- **The Eye.** The central poster image — a glowing blue mechanical/camera eye — is the
  brand anchor. Use it as: the landing-page hero animation (zooms in to fill the screen, then
  zooms further after login), a loading/transition motif, and a small persistent icon (e.g. a
  "being watched" indicator near the live leaderboard).
- **Neural network in the eye's corners.** Thin animated lines connecting small glowing nodes,
  replacing literal veins/nerves. Low-opacity, slow pulse by default; can be used as an ambient
  background layer on key screens (dashboard, leaderboard) at very low opacity so it doesn't
  compete with content.
- **Spotlight / CCTV beams.** The poster's side-lighting (diagonal light shafts from the
  corners) can inform hero-section backgrounds and empty states — subtle diagonal gradient
  overlays, not literal beams everywhere.
- **Bracket framing** (`[ ... ]`) around key quotes/taglines, as seen around "It's not just a
  tech event, it's a reality." — reuse this bracket motif around important callouts, round
  names, or reveal-screen headlines.

## 5. Landing Animation Spec

**First visit:**
1. Full black screen, faint neuron-network lines fading in at the corners.
2. The eye graphic fades in, centered, small.
3. Eye scales up (zoom-in) until the iris fills the viewport — timed 2.5–3.5s, eased
   (not linear) so it feels deliberate, not jarring.
4. Iris "opens"/dissolves into the landing page content (event name, date, tagline, login CTA).

**Post-login transition:**
1. On successful login, a lighter/faster version of the same zoom (1–1.5s) plays.
2. Transitions directly into the team dashboard — this is the "you're inside the house now" beat.

**Repeat visits (already logged in / returning):** skip the full first-visit sequence; use only
the short post-login zoom, or a simple fade, so the animation never becomes an obstacle to
checking the leaderboard repeatedly during the live event.

Build with Framer Motion for the UI-level transition and CSS/SVG (`transform: scale()`, radial
gradients, `filter: blur()`) for the eye and neuron-network graphics themselves — no need for a
heavy animation/game library.

## 6. Components

- **Cards/panels:** `bg-elevated`, 1px `accent-blue` border at low opacity, subtle glow on
  hover/active (`box-shadow` using `accent-blue-glow`), rounded corners (8–12px, not fully
  rounded — keep the "control panel" feel rather than soft/friendly).
- **Buttons (primary):** solid `accent-blue` background, `text-primary` label, glow on hover.
- **Buttons (destructive — admin only):** `danger-red` outline or fill, always paired with a
  confirmation modal.
- **Modals (confirmation):** dark overlay, `bg-elevated` panel, bracket-motif header treatment
  for high-stakes actions (eviction, round-end).
- **Leaderboard rows:** rank number in display font, subtle glow on the current team's own row
  so a team can find themselves instantly; up/down movement indicated with small colored arrows
  (green up, red down) rather than full re-coloring of the row.
- **Status badges** (Nominated / Safe / Evicted / Immune): pill-shaped, color-coded
  (`danger-red` / `success-green` / muted-gray / `accent-blue`), uppercase small text.

## 7. Responsive Notes

- Participant panel: mobile-first — the eye animation and layouts must degrade gracefully to a
  single column on phones (teams will likely be on phones inside "the house").
  Neural-network background layer should reduce node count / simplify on small screens for
  performance.
- Admin dashboard: desktop-first, but must not visually break on a tablet in case a host needs
  to run controls from one.

## 8. What NOT to do

- Don't turn the neuron-network motif into a distracting, constantly-busy background — it's
  ambient texture, not the focal point.
- Don't use red for anything except elimination/penalty/destructive-action contexts — it needs
  to stay meaningful.
- Don't replay the full first-visit eye-zoom animation on every page load — see §5.
