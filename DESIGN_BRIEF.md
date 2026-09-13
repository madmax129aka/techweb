# TechAstra Registration Portal - Design Brief

> **Provenance note:** this document captures the design brief as
> supplied piecemeal across a long chat session, starting from Section
> 5D onward. Sections 1-3 and 5A-5C were referenced by earlier messages
> in that conversation but their exact original text was never re-supplied
> to (or preserved by) the agent that wrote this file, so they are not
> reproduced here. If those sections are needed, they should be re-added
> from whatever earlier source has them. Everything below (the scope
> correction, Section 4, Section 5D through 5G) is transcribed as given.

---

## SCOPE NOTE (supersedes any earlier full-site assumptions)

This build is **ONLY the Registration Portal sub-application** for
TechAstra. A separate team is building the main marketing website
(homepage, hero banners, event storytelling, sponsors, photo gallery).
This app is what opens when a visitor clicks "Register" on that main
site - so:

- Do **not** build a marketing homepage, hero carousel, sponsor section,
  or photo gallery. This app's entry point is the Events listing page.
- Do **not** include a public Gallery page or a public Leaderboard/results
  page in this app - those live on the main website instead.
- This app starts directly at Events (Technical/Non-Technical) and
  covers: browsing events -> cart -> registration -> checkout/payment
  verification -> login -> dashboard/ID card, plus all backend role
  portals (Registration Team, Event Coordinator, Hospitality, Certificate
  Team, Volunteer, Master Admin).
- Keep the app linkable/embeddable - assume it may be opened in a new tab
  or an iframe from the main site's "Register" button, so don't assume it
  needs its own full brand storytelling.

---

## 4. PAGES & USER FLOW (Registration Portal only)

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
- Sections 1-3 and 5A-5C of the original brief are not captured in this
  file (see the provenance note at the top) - if they matter for future
  work, they should be sourced from wherever they were originally written
  and appended here.
