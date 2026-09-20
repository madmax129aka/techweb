# Login Page — Design

## Overview

Restore the login scene to a split-screen layout: LEFT = the original 3D
`TechAstraCore` (React Three Fiber + drei `Environment` + bloom), RIGHT =
glassmorphism login form. Remove the interim video backdrop. Keep the sticky
brand header, the two-ring trailing cursor, and the mobile stacked fallback.

The page stays scoped under `.login-page` (see `Login.css`) and continues to
render outside the global Navbar/Footer (`App.jsx` route exception).

## Existing assets to reuse (read, don't reinvent)

- **`client/src/components/TechAstraCore.jsx`** — already implements the full
  requirement: faceted glass icosahedron `CoreGem`, six `OrbitingStone`s
  from `STONE_CONFIG` (cyan `#22D3EE`, violet `#B565F0`, amber `#F2B84B`,
  emerald `#34D399`, red `#E8495B`, blue `#4C8DF6`), `Environment preset="studio"`,
  key/fill lights, `ContactShadows`, `EffectComposer` + `Bloom`,
  `ParallaxGroup` (fine-pointer only), an `IntersectionObserver` frameloop
  pause, and a fallback matrix (reduced-motion / no-WebGL / render error →
  `TechAstraCoreStatic`). No changes needed to this component.
- **`client/src/components/TechAstraCoreStatic.jsx`** — pure-CSS fallback.
- **`Login.css` tokens** — `#12080a`-family charcoal base, cyan `#3DD9EB`,
  Italiana / Inter, crimson gradient button, the `.core-panel` / `.form-panel`
  split, the two-ring `.cursor-inner` / `.cursor-outer`.

## Component structure (`Login.jsx`)

```
<div class="login-page">
  ├── two-ring custom cursor (fine-pointer)
  ├── <header class="login-header">   TechAstraLogo, nav, cart, LOGIN, hamburger
  ├── <div class="login-body">        2-col grid ≥900px, 1-col below
  │     ├── <div class="core-panel">  ← LEFT
  │     │     ├── <div class="core-canvas-frame"><TechAstraCore size={480} /></div>
  │     │     ├── .core-eyebrow  "TECHASTRA · 2026"
  │     │     └── .core-tagline  Italiana headline
  │     └── <div class="form-panel glass-card">  ← RIGHT
  │           eyebrow / title / subtitle / form / status link
  └── <FullScreenMenu />
```

## Key decisions

1. **Revert the left panel to `<TechAstraCore/>`.** The video `<video>`
   element, `showVideo`/`videoFailed` state, and the `.login-video-bg` /
   `.login-video-scrim` CSS are removed. Re-import `TechAstraCore` and put it
   back inside `.core-canvas-frame` (that frame's CSS still exists).

2. **Keep the glassmorphism form.** The right panel keeps the glass-card
   treatment added previously (semi-transparent dark surface + backdrop
   blur + subtle border), since Requirement 2 wants glassmorphism. Inputs
   keep the cyan focus ring.

3. **Remove the role selector.** It was dropped per prior user direction and
   is not part of this spec; its JSX and `.role-*` CSS are removed.

4. **Cursor + parallax coexist.** The page's own two-ring CSS cursor is
   independent of the Core's in-scene mouse parallax; both key off the
   pointer and both are disabled under reduced motion.

5. **Page background.** With the video gone, `.login-page` restores a solid
   charcoal base (or the CSS `::before` wash) behind the transparent Canvas,
   so the Core's `gl={{ alpha: true }}` transparent background composites
   over the page, not over a video layer.

6. **Reduced motion.** `TechAstraCore` already handles this internally
   (static fallback). The two-ring cursor and any Framer entrance are gated
   on `useReducedMotion()`.

## Framer Motion (design-system steering)

- Right-panel form content: staggered `whileInView` entrance
  (`viewport={{ once: true }}`), gated by `useReducedMotion`.
- Primary button + inputs: spring interactions
  (`type: "spring", stiffness: 300, damping: 20`).
- The 3D Core is not wrapped in Framer motion; its animation is intrinsic to
  the R3F frameloop.

## Styling approach

- Restore `.core-canvas-frame` usage; remove `.login-video-*`.
- Keep `.glass-card`, `.role-*` removed, cyan focus token.
- All under `.login-page` scope — no leakage.

## Responsiveness

- `.login-body`: `grid-template-columns: 1fr 1fr` ≥ 900px, `1fr` below.
- On mobile the Core sits above the form; page scrolls
  (`overflow-y: auto`, `min-height: 100dvh`).
- Core `size` can shrink via the frame's `max-width`/`aspect-ratio`.

## Verification

- `npm run build` compiles cleanly.
- Manual (browser, since this env can't render WebGL): Core shows six
  orbiting stones with bloom; parallax on desktop; static fallback under
  reduced motion; form submits and redirects by server role; mobile stacks.
- Confirm no `.login-video-*` / `.role-*` rules remain and no dead imports.
