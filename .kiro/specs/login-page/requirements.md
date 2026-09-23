# Login Page — Requirements

## Introduction

The TechAstra Login page ("The Core") is the authenticated entry point for
every role in the symposium portal (participants, registration team,
coordinators, hospitality, certificate team, volunteers, master admin). It
is a full-viewport cinematic scene rendered outside the site's normal
Navbar/Footer chrome (see the route exception in `App.jsx`).

This spec (re)defines the page as a **split-screen layout** whose LEFT panel
is the original 3D "TechAstra Core" (React Three Fiber + drei + bloom) and
whose RIGHT panel is a glassmorphism login form. It supersedes the earlier
video-background revision — the 3D Core is restored as the hero visual.

Design tokens are read from the existing code, not invented: `Login.css`
(dark charcoal-red base, `#3DD9EB` cyan accent, Italiana display / Inter
body) and `TechAstraCore.jsx` (the 3D scene and its per-track stone colors).

Existing authentication behavior (`useAuth().login`, role-based redirect via
`PORTAL_PATH`, toast feedback) MUST be preserved exactly.

## Requirements

### Requirement 1 — 3D "TechAstra Core" visual (left panel)

**User story:** As a visitor, I want a striking, original 3D centerpiece on
the login scene, so that the portal feels premium and distinctly TechAstra.

#### Acceptance Criteria

1. WHEN the login page loads on a WebGL-capable browser THEN the left panel
   SHALL render the `TechAstraCore` component: one faceted glass icosahedron
   core orbited by six smaller faceted gemstones.
2. The six stones SHALL use six distinct hues representing event tracks
   (cyan, violet, amber, emerald, red, blue), each with its own orbit
   radius, period, tilt, phase, and own-axis spin.
3. The core SHALL rotate gently and "breathe" (subtle scale pulse); the
   whole group SHALL apply a subtle mouse-parallax tilt on fine-pointer
   (desktop) devices only.
4. The scene SHALL use drei `Environment` lighting and a bloom
   post-processing pass so the transmissive glass reads as glass, not flat
   plastic.
5. The design SHALL be fully original — not modeled on, named after, or a
   reproduction of any third-party trademarked character, film, or
   franchise.
6. WHEN `prefers-reduced-motion` is set, WebGL is unsupported, or the Canvas
   errors THEN the panel SHALL fall back to the static CSS graphic
   (`TechAstraCoreStatic`) in the same slot — never a blank gap.
7. WHEN the panel scrolls out of view THEN rendering SHALL pause
   (frameloop → "never") to save CPU/battery.

### Requirement 2 — Glassmorphism login form (right panel)

**User story:** As a user, I want a clear, modern sign-in form, so that
logging in feels effortless.

#### Acceptance Criteria

1. The right panel SHALL present the login form: eyebrow, title, subtitle,
   email + password inputs, submit button, and a "Check Registration
   Status" link.
2. The form container SHALL use a glassmorphism treatment (semi-transparent
   dark surface, backdrop blur, subtle light border).
3. Inputs SHALL show a cyan (`#3DD9EB`) focus state; the primary button
   SHALL use the crimson gradient established in `Login.css`.
4. Typography SHALL use Italiana for the display title and Inter for body,
   matching the existing tokens.

### Requirement 3 — Chrome: header, cursor, layout

**User story:** As a user, I want consistent branding and a polished shell
around the form.

#### Acceptance Criteria

1. A sticky brand header SHALL show the shared `TechAstraLogo`, primary nav
   links, cart glyph with live count, a LOGIN label, and a hamburger opening
   the existing `FullScreenMenu`.
2. A custom two-ring trailing cursor SHALL be present on fine-pointer
   devices (inner ring snaps to the pointer; outer ring lerps toward it).
3. WHEN viewed at desktop width (≥ 900px) THEN the layout SHALL be a
   two-column split (Core left, form right).
4. WHEN viewed below 900px THEN the layout SHALL collapse to a single
   stacked column (Core above the form) and remain scrollable/usable.

### Requirement 4 — Preserved authentication behavior

**User story:** As any user, I want sign-in to work exactly as before.

#### Acceptance Criteria

1. WHEN valid credentials are submitted THEN the system SHALL call
   `useAuth().login(email, password)` and redirect via
   `PORTAL_PATH[user.role]` using the SERVER-returned role.
2. WHEN login fails THEN the system SHALL surface the error via a toast and
   keep the user on the page.
3. WHEN a request is in flight THEN the submit control SHALL show a loading
   state and be disabled.
4. The "Check Registration Status" link SHALL route to `/status`.

### Requirement 5 — Cleanup

**User story:** As the maintainer, I want the abandoned video approach fully
removed so the page has one clear implementation.

#### Acceptance Criteria

1. The login video element/backdrop and its CSS SHALL be removed.
2. The staged video asset (`client/public/videos/login-core.mp4`) MAY be
   deleted since it is no longer referenced.
3. No unused role-selector or video-scrim styles SHALL remain in
   `Login.css`.
