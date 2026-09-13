# TechAstra Registration Portal - Design Brief

> **Provenance note:** this document captures the design brief as
> supplied piecemeal across a long chat session. Sections 1-3, 5A, and 5B
> were referenced by earlier messages in that conversation but their
> exact original text was never re-supplied to (or preserved by) the
> agent that wrote this file, so they are not reproduced here. If those
> sections are needed, they should be re-added from whatever earlier
> source has them. Everything below (the scope note, Section 4, Section
> 5C through 5G) is transcribed as given, including one later correction
> to the scope note itself (see below).

---

## SCOPE NOTE (revised - supersedes an earlier, stricter version of this note)

This build is the **Registration Portal + ALL role-based login portals**
for TechAstra - that responsibility (every login: Participant,
Registration Team, Event Coordinator, Hospitality, Certificate Team,
Volunteer, Master Admin) belongs to this app and stays exactly as
originally specified. None of those logins/portals were ever removed or
simplified.

The **only** thing out of scope is the marketing front-page content: the
hero carousel/banner, sponsor section, and photo gallery on the
homepage - those are built separately by another team on the main
website. This app's own front page (Events) does not need a hero banner.

**Unchanged from the original brief:**
- Participant Login (`/login`) - stays exactly as designed, post-approval
  access to Dashboard/ID card
- Registration Team Portal login
- Event Coordinator Portal login
- Hospitality Portal login
- Certificate Portal login
- Volunteer Portal login
- Master Admin Portal login
- Dashboard, ID Card, Status tracking, Certificate Verification - all
  unchanged

**Removed only:**
- Homepage hero/carousel banner
- Public Gallery page
- Public Leaderboard page (coordinators still submit results internally
  via `/coordinator`; that data can later be exposed via an API for the
  main website's own Leaderboard/Gallery pages, but this app does not
  render those pages itself)

Entry point for this app is still `/events` (Technical/Non-Technical
listing) as the first screen, with Login accessible from the
header/menu same as before.

> **Correction history:** an earlier pass at this note read more like
> "this app is the Registration Portal *only*" and, taken too literally
> by the agent implementing it, led to briefly treating the whole app as
> narrower than intended - nothing was actually deleted incorrectly (all
> logins/portals were always left in place), but the note above is the
> authoritative, corrected version and should be treated as such.

---

## 5C. TECHASTRA CORE - 3D ORBITING STONE SYMBOL

**CONCEPT** (original design, not a reproduction of any copyrighted
character or franchise symbol): a central glowing crystal core with six
smaller gemstones orbiting around it on tilted elliptical paths, each
stone a different color, representing the different event tracks/energy
of TechAstra. Do not name, label, or design this after any existing
copyrighted character, film, or franchise - keep all naming original
("TechAstra Core", "Nexus Stone", etc.) and keep the geometry/material
generic (faceted gem shapes), not a copy of any specific trademarked
design.

**PLACEMENT IN THIS APP:**
- Primary placement: Login page, as a centerpiece visual behind/beside
  the login form (form on one side, 3D object on the other, or object
  centered above the form)
- Secondary (optional): a small, static (non-orbiting) version of just
  the core gem as a subtle corner watermark in the header, present
  across all pages, reinforcing brand identity without being distracting

**STRUCTURE:**
- 1 central "core" object: an icosahedron or dodecahedron, larger than
  the orbiting stones, using `MeshTransmissionMaterial` or
  `MeshPhysicalMaterial` (`transmission: 1, roughness: 0.1, thickness: 0.8,
  ior: 1.45`) - clear/glass-like with a faint white-cyan inner glow (add
  a small emissive point light inside the core mesh)
- 6 smaller "stones" orbiting the core, each a smaller faceted gem
  (octahedron or low-poly icosahedron), each a distinct color using
  `MeshPhysicalMaterial` with emissive glow, e.g.: cyan (Technical
  track), magenta/violet (Non-Technical track), amber/gold
  (Hackathon/flagship), green (Robotics), red (Gaming/Esports), blue
  (Design/Creative) - colors are illustrative, align to whatever event
  categories/branding TechAstra actually uses

**ORBIT ANIMATION:**
- Each stone follows its own elliptical orbit path around the core, each
  tilted at a different angle (`x = radius * cos(t), z = radius * sin(t)
  * tiltFactor` in `useFrame`, with a unique radius, speed, and phase
  offset per stone so they don't move in sync)
- Orbit speed: slow and continuous, each stone taking 15-40 seconds per
  full revolution (vary per stone for visual richness)
- Core itself: slow independent rotation on its own axis (~30s per
  revolution) plus a very subtle pulsing scale (1.0 to 1.03) on a sine
  wave, like a heartbeat/breathing effect
- Each stone also spins on its own axis as it orbits, independent of its
  orbital motion

**LIGHTING & GLOW:**
- Use drei's `<Environment preset="night">` or `"studio"` for realistic
  glass refraction
- Add a bloom post-processing pass (`@react-three/postprocessing`'s
  `<Bloom>`) tuned subtly (intensity 0.4-0.8) so the stones and core have
  a soft glow halo, not an overblown flare
- Each stone's emissive color should bloom slightly in its own hue

**INTERACTION:**
- On mouse move (desktop), apply a very subtle parallax tilt to the
  entire group (core + stones) based on cursor position, so it feels
  alive/responsive without being distracting
- On mobile, skip the parallax (no mouse) - just keep the ambient
  orbit/rotation animation

**PERFORMANCE & FALLBACK:**
- Cap dpr to `[1,2]`, pause animation via `IntersectionObserver` when
  off-screen, respect `prefers-reduced-motion` (render a static single
  frame if reduced motion is set)
- Wrap in an error boundary; on WebGL failure, fall back to a static
  glass-orb PNG/SVG graphic in the same layout position

**DO NOT:**
- Do not label this component, its file, or any UI text with "Marvel",
  "Vision", "Infinity Stones", or any other third-party trademarked name
  - keep all naming and exact visual design original to avoid IP issues.

### Implementation notes (as built)

- `components/TechAstraCore.jsx` - the R3F component. `CoreGem` (a
  detail-1 icosahedron, `meshPhysicalMaterial` with
  `transmission/roughness/thickness/ior` per spec, an inner
  `pointLight`, slow Y rotation, and the 1.0->1.03 breathing scale pulse
  on a sine wave) + six `OrbitingStone` instances (each an octahedron
  with its own `radius`/`period`/`tilt`/`phase`/`spin` from
  `STONE_CONFIG`, computing elliptical position in `useFrame` exactly per
  the brief's `x = radius*cos(t), z = radius*sin(t)*tilt` formula, plus
  independent own-axis spin decoupled from the orbital motion).
  `Environment preset="night"` + an `EffectComposer`/`Bloom` pass
  (intensity 0.6, inside the brief's 0.4-0.8 range). A `ParallaxGroup`
  wraps the whole core+stones group and nudges its rotation toward the
  pointer position, but only when `isFinePointer()` reports a real mouse
  (mobile/touch gets the ambient animation with zero parallax).
- Fallback matrix: `prefers-reduced-motion` skips WebGL entirely and
  renders `TechAstraCoreStatic` with `animated={false}` (a genuinely
  still frame); WebGL-unsupported or any render error (caught by
  `TechAstraCoreErrorBoundary`) renders the same static component with
  `animated={true}` instead, so the page still has some life to it.
  `dpr={[1,2]}` and an `IntersectionObserver`-driven
  `frameloop="never"|"always"` toggle handle the performance
  requirements.
- `components/TechAstraCoreStatic.jsx` - the pure-CSS fallback graphic:
  a faceted-gem `clip-path` core with a radial glow, six smaller faceted
  stones placed around it via `rotate()+translateX()+scaleY()` (an
  ellipse, not a perfect circle, echoing the "tilted" orbit), animated
  with three new CSS keyframes in `index.css`
  (`.animate-core-ring-spin` / `.animate-core-stone-spin` /
  `.animate-core-breathe`) when `animated`, or a single static frame
  when not.
- `components/CoreWatermark.jsx` - the secondary placement: always
  `TechAstraCoreStatic` with `animated={false}`, mounted in
  `components/Navbar.jsx` beside the wordmark on every page (`sm+`
  screens only - hidden on narrow viewports where there's no room for a
  purely decorative element).
- `components/TechAstraCoreErrorBoundary.jsx` - same class-component
  error-boundary pattern used throughout this codebase for R3F trees.
- Wired into `pages/Login.jsx` as the primary placement, replacing what
  had been a static photo backdrop on the split layout's left/desktop
  panel - form on the right, `TechAstraCore` centered on the left, per
  the brief's suggested layout.
- Naming audit: every identifier in this feature (`TechAstraCore`,
  `TechAstraCoreStatic`, `TechAstraCoreErrorBoundary`, `CoreWatermark`,
  `CoreGem`, `OrbitingStone`, "Nexus Stone" in comments/aria-labels) is
  original - no reference to Marvel, Vision, Infinity Stones, or any
  other third-party trademark anywhere in code, comments, or user-facing
  text.
- **VERIFICATION CAVEAT:** `three`, `@react-three/fiber`,
  `@react-three/drei`, and `@react-three/postprocessing` are listed in
  `client/package.json` but this sandbox has no npm registry access, so
  none of these packages could actually be installed or rendered in a
  browser here. Written carefully to the documented APIs, but - unlike
  most of this codebase - this component has **not** been
  runtime-verified. Please test for real after `npm install`.

---

## 4. PAGES & USER FLOW (Registration Portal + all role portals)

**Entry point:** `/events` - this is the first page a user sees, not a
marketing homepage.

### Public / Participant-facing

1. **Events** (`/events`) - entry page. Technical/Non-Technical toggle at
   top, timetable-grid listing with time, fee, seats left; "Add to Cart"
   (disabled on time-clash)
2. **Cart** (`/cart`) - selected events, total, "Proceed to Checkout"
3. **Registration Form** (`/register`) - individual/team toggle, dynamic
   team member fields
4. **Checkout** (`/checkout`) - UPI QR, transaction ID + screenshot upload
5. **Status Page** (`/status`) - check Pending/Approved/Rejected by reg ID
   or email
6. **Login** (`/login`) - usable post-approval
7. **Dashboard** (`/dashboard`) - ID card download, registered events,
   feedback form, help desk query box, certificate download once issued
8. **Certificate Verification** (`/verify-certificate`) - public, enter
   certificate ID -> valid/invalid

### Role Portals (unchanged from the original brief)

9. Registration Team Portal (`/registration-team`)
10. Event Coordinator Portal (`/coordinator`)
11. Hospitality Portal (`/hospitality`)
12. Certificate Portal (`/certificates`)
13. Volunteer Portal (`/volunteer`)
14. Master Admin Portal (`/admin`)

**Removed from this app:** Homepage hero/carousel, public Gallery page,
public Leaderboard page. (Coordinators still submit results internally
via `/coordinator` - that data can be exposed via an API endpoint later
for the separate main website to consume and display its own
Leaderboard/Gallery, but this app does not render those pages itself.)

> **Implementation note:** Register/Checkout are implemented as two
> separate routed pages per this section (reverted from an earlier
> "forms as slide-in overlay panels" pattern used before this scope
> correction). `Register.jsx` hands its collected form data to
> `Checkout.jsx` via `sessionStorage` rather than lifted React state,
> since the two steps are no longer one mounted component.

---

## 5D. SPLIT-SCREEN EVENTS MENU (hamburger -> full-screen split view)

*(Same mechanics as originally specified: hamburger top-left, full-screen
dark overlay, 50/50 or 40/60 split, opacity-dim-on-hover, image crossfade
on the right panel.)*

**LEFT COLUMN - LEVEL 1** (revised, no Leaderboard/Gallery/Home):

```
Events / My Dashboard / Help Desk / Verify Certificate
```

**LEVEL 2** (clicking "Events" expands):

- Technical
- Non-Technical
- View All Events

**LEVEL 3** (expanding Technical or Non-Technical):

- Technical -> Hackathon, Coding Marathon, Paper Presentation, Poster
  Presentation, Robo Race, Web Design Contest
- Non-Technical -> Quiz, Treasure Hunt, Gaming, Photography, Debate

Behavior, hover image swap, single-branch-expanded rule, and the
dim-on-hover effect all remain exactly as previously specified (see
Section 5E for the contrast/opacity implementation detail that effect
actually requires).

> **Data implication** (Event model): `category` field, `technical` |
> `non_technical`. Added to the Prisma `Event` model as
> `category String @default("technical")`. The Events grid page and the
> mega-menu both read this same field so the split stays consistent
> everywhere it appears.

---

## 5E. BUG FIXES & CONTRAST REQUIREMENTS

- Every text element must maintain a minimum 4.5:1 contrast ratio against
  whatever is behind it, **including text sitting on top of photos**. For
  text over images (price, seats-left, event name, category label),
  always place it inside a scrim: a gradient overlay (linear-gradient
  from transparent to `rgba(0,0,0,0.75)`) covering at least the bottom
  35% of the image, so text never sits directly on raw photo pixels.
  Apply this to every event card - price and "X of Y left" text must use
  this scrim, not just the title.

- The price/seats row on event cards must never be clipped by the
  viewport or card boundary - reserve fixed padding-bottom space for it
  in the card layout, and test at common viewport heights (800px, 900px)
  to confirm it's never cut off.

- When the full-screen menu overlay opens, the header nav underneath
  (e.g. "EVENTS / VERIFY CERTIFICATE") must be set to `visibility: hidden`
  or unmounted entirely - not just covered by a translucent overlay. No
  ghosted/bleeding-through text is acceptable anywhere in the menu.

- Menu list items (and all event names) must render on a fully opaque or
  properly blurred solid backdrop - never with the background photo
  showing through the text itself. If using `backdrop-filter: blur()` on
  a panel, the TEXT color must be a solid opaque value (not inheriting any
  transparency), and the panel behind it needs its own `background-color`
  with sufficient opacity (minimum 0.85) independent of the blur.

- Fix any element (like a "Technical" category label) that renders
  partially above the visible scroll area of the menu panel - add proper
  top padding/margin so the first item in an expanded list is always
  fully visible without needing to scroll up.

- Audit every screen for this same text-over-image contrast issue before
  calling any page complete, not just the ones explicitly flagged in bug
  reports.

### Implementation notes (as built)

- `components/CinematicImage.jsx` gained a `scrim` prop (`"bottom"` |
  `"full"` | `"none"`) - a dedicated black gradient/overlay layer,
  independent of the site's crimson/arc color tint, sized for how the
  caller actually places text over that image. `"bottom"` (default) is
  the classic title/price-over-the-lower-part-of-a-photo pattern;
  `"full"` is for centered headline text (e.g. EventDetail's banner);
  `"none"` is for purely decorative images with no text on them at all
  (so they aren't needlessly darkened).
- Event cards (`pages/Events.jsx`) moved price/seats-left text inside the
  image overlay (on top of the strengthened scrim) instead of a separate
  flat-background footer strip, and gave that row its own `shrink-0`
  layout slot so it can't be squeezed out or clipped regardless of how
  much text renders above it.
- The mega-menu's dim-on-hover effect (`components/FullScreenMenu.jsx`)
  was rewritten to use **solid, fully-opaque hex text colors**
  (`text-offwhite` / `text-[#78787f]` / `text-[#bcbbbd]`) instead of
  Tailwind opacity utilities - `opacity` (or an alpha color) makes the
  whole element blend with whatever renders behind it, which is exactly
  what let the background photo bleed through dimmed rows.
- `components/Navbar.jsx`'s fixed header gets Tailwind's `invisible`
  (`visibility: hidden`) class the moment the full-screen menu opens,
  removing it from paint entirely rather than relying on the overlay
  above it being opaque enough.
- The mega-menu's left column switched from `justify-center` to a
  top-anchored, independently-scrollable column that resets its own
  scroll position to the top every time a drill-down level
  expands/collapses - fixing the "Technical" label rendering above the
  visible area when the list grew taller than the viewport.

---

## 5F. PER-EVENT PROMOTIONAL VIDEO (AI-GENERATED)

- Each event's detail page (and optionally the split-screen menu's right
  panel, on click rather than hover) should support a short looping video
  background instead of a static image, for a more premium feel.
- Since there's no real event footage yet, generate a short (5-10 second)
  looping AI video per event as placeholder content representing the
  event theme (e.g. a coding/hackathon scene, a robotics scene, a design
  workspace scene) - store these as `.mp4` files in the project's public
  assets folder, one per event, named to match the event's slug (e.g.
  `hackathon.mp4`, `robo-race.mp4`).
- On the event detail page, autoplay the video muted and looped as the
  hero background (same treatment Rolls-Royce uses on model pages), with
  the static banner image as a fallback poster frame shown until the
  video loads.
- In the split-screen menu, keep hover-preview as a static image (video
  autoplay would be too heavy for a fast-hovering interaction) but play
  the matching video once the user actually clicks into that event's
  detail page.
- Compress videos appropriately (target under 3-5MB each) so hero load
  time stays fast; lazy-load the video only when its section scrolls
  into view.

### Implementation notes (as built)

- **No actual video files were generated.** This sandbox has no
  video-generation tool and no way to render/preview media at all - only
  the plumbing described below exists so far.
- `lib/eventVideos.js` - slugifies an event's `name` into the exact
  expected filename (`getEventVideoSrc()`), e.g. `"Robo Race"` ->
  `/videos/robo-race.mp4`.
- `components/EventHeroMedia.jsx` - lazy-loads via `IntersectionObserver`
  (only starts loading once its section scrolls into view), autoplays
  muted/looped/`playsInline`, uses the static banner image as the
  `poster` attribute AND as the fallback shown until `onCanPlay` fires or
  if the video 404s, and skips video entirely for
  `prefers-reduced-motion` users. Falls back to the plain
  `CinematicImage` look with zero visual side effects (no broken-video
  icon) until real `.mp4` files are actually added.
- Wired into `pages/EventDetail.jsx`'s hero banner section only, per the
  brief ("keep hover-preview as a static image" in the menu - the menu's
  right panel was intentionally left as static images, unchanged).
- See `client/public/videos/README.md` for the exact filenames expected
  for the current seeded events and recommended `ffmpeg` compression
  settings.

---

## 5G. TRANSITION SMOOTHNESS & LOADING BEHAVIOR (match rolls-roycemotorcars.com)

- Every interactive state change (menu open/close, hover-dim on nav
  items, image crossfade on hover, page-to-page navigation, add-to-cart
  confirmation) must use an eased CSS transition of 250-400ms - never an
  instant/abrupt style change. Use `ease-in-out` or a custom
  cubic-bezier, never `linear` or default `ease`.
- Full-screen menu open/close: fade **and** slight scale (e.g. scale from
  0.98 to 1) combined, not just opacity toggling - this is what makes the
  menu feel weighty rather than a simple show/hide.
- Image/video hero elements must not pop in abruptly once loaded - fade
  them in from opacity 0 over ~500ms once the asset finishes loading, and
  show a simple solid-color placeholder (matching the dark theme, no
  spinner) in that space until then.
- Reserve exact aspect-ratio space for every image/video before it loads
  (using `aspect-ratio` CSS or explicit width/height) so nothing shifts
  position once media appears - zero layout shift is required.
- Hover states on cards (event cards, etc.) should include a subtle scale
  (1.0 -> 1.02) and brightness lift on the image, transitioning smoothly -
  never a hard jump.
- Test the whole click-through flow end to end and confirm there is no
  visual jank, flash of unstyled content, or abrupt cuts anywhere before
  considering any page done - this is a hard quality bar, not optional
  polish.

### Implementation notes (as built)

- `components/CinematicImage.jsx` - the `<img>` starts at `opacity-0`
  over a solid `bg-void` placeholder and fades to `opacity-100` on its
  `onLoad` event (no spinner); hover applies a combined
  `scale-[1.02]` + `brightness-110` over a shared 400ms transition.
- `components/FullScreenMenu.jsx` / `index.css` - open/close now animate
  opacity + `scale(0.98 -> 1)` together via
  `.animate-menu-fade-in`/`.animate-menu-fade-out` (cubic-bezier easing),
  and the component stays mounted for one extra animation-duration after
  closing so the closing animation actually gets to play instead of the
  menu just vanishing on unmount.
- Every image consumer already wraps `CinematicImage`/`EventHeroMedia` in
  a fixed-aspect-ratio container (e.g. `aspect-[4/5]`, `aspect-[4/3]`),
  so there is zero layout shift when media loads in.

---

## Known caveats / next steps for a human reviewer

- **No real event video assets exist yet** - Section 5F's plumbing is
  complete but inert until `.mp4` files are added (see
  `client/public/videos/README.md`).
- **No visual/browser verification was possible** while writing any of
  this - this sandbox has no npm registry access and cannot render a
  browser or preview images/video. Everything above was verified via
  `bun build` syntax checks and manual code review only. Please pull,
  run it for real, and report anything that looks wrong.
- Sections 1-3, 5A, and 5B of the original brief are not captured in this
  file (see the provenance note at the top) - if they matter for future
  work, they should be sourced from wherever they were originally written
  and appended here.
- **The "TechAstra Core" 3D object (Section 5C) has not been
  runtime-verified either**, for the same reason as 5F - no npm registry
  access in this sandbox. See that section's own verification caveat.
