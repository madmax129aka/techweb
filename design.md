# Event Detail Page — Rolls-Royce "Phantom Page" Rebuild

**Scope:** one reusable template, driven by event data. Pilot on **Hack Nexus** (video already uploaded), then roll out to all 15 events with zero code changes — only data (video files) differ per event.

---

## 0. Architecture Decision

**No new component file.** `client/src/pages/EventDetail.jsx` is *already* the reusable template — it's mounted at route `/events/:id`, fetches `event` from the API, and renders based on that object. It is not "the Hack Nexus page" today and won't become one after this rebuild; every event that exists in the DB gets this exact same render tree with different data plugged in.

What changes is **what's inside that render function** — six full-bleed sections instead of the current compact stack. I will NOT extract a separate `EventDetailTemplate.jsx` wrapper, since that would just add a prop-drilling layer around the same single call site with no reuse benefit (nothing else renders this template).

**New helper file:** `client/src/lib/eventStatement.js` — a pure function that derives the Section 2 editorial statement from `event.description` (see §4, Section 2).

---

## 1. Data Mapping Table

| Event field (from API / Prisma `Event` model) | Used in |
|---|---|
| `event.name` | Sub-nav left label, Hero headline, page `<title>`-style heading |
| `event.track` | Sub-nav dropdown context, Hero eyebrow ("TECHNICAL"/category label) |
| `event.category` | Determines eyebrow text ("Technical" / "Non-Technical") |
| `event.description` | Section 2 statement (derived) + Section 3 full body copy |
| `event.rulebook` | Section 4 body copy |
| `event.startTime` / `event.endTime` | Section 3 logistics line |
| `event.venue` | Section 3 logistics line |
| `event.isTeamEvent` | Section 3 logistics line (badge) |
| `event.fee` | Section 5 price |
| `event.seatsAvailable` / `event.maxSeats` | Section 5 seats-remaining line, disables CTA when full |
| `event.id` | Cart add/remove, "Continue Your Journey" links |
| **derived:** `slug(event.name)` | Video path lookup (see §3) |
| **derived:** `otherEvents` (existing `/api/events` fetch, filtered) | Section 6 cards |

Nothing here requires a schema change — every field already exists in `schema.prisma` and is already fetched by the current `EventDetail.jsx`.

---

## 2. Sticky Sub-Nav — Refinement

**Keep:** event name left, OVERVIEW / RULES / REGISTER tabs right, transparent-blur base (`bg-gradient-to-b from-black/30 to-transparent backdrop-blur-xl`, `top-14` under the main nav).

**Add:**

1. **Chevron next to event name.** The reference's "PHANTOM ⌄" affordance implies a model-switcher. This app doesn't have one built. Proposed behavior: clicking the chevron opens a small popover (reusing the `otherEvents` data already fetched for Section 6) letting the user jump directly to another event without leaving the page — a real, functional equivalent of what the reference does, not a decorative icon. **Confirm before I build this** — alternative is a purely decorative chevron with no interaction if you'd rather keep it simple.

2. **Shrink + darken on scroll.** Same pattern already used by `Navbar.jsx` (`scrolled` state + `.nav-scrolled` class, toggled by a `scroll` listener at a threshold). Applied here:
   - Height: `h-14` (56px) → `h-11` (44px) past the threshold
   - Background: `rgba(0,0,0,0.3)` → `rgba(0,0,0,0.75)`, blur `xl` → `2xl`
   - Both transition via CSS (`transition: height 0.4s, background 0.4s`), not JS-animated, so it's cheap and won't jank on scroll
   - Threshold: past the hero (viewport height − sub-nav height), matching how `Navbar` triggers at a fixed scroll offset

3. **Smooth-scroll on tab click, correctly.** `html { scroll-behavior: smooth }` is already global — anchor clicks already animate. The actual current bug: sections have no `scroll-margin-top`, so `#rules`/`#register` land **behind** the sticky main-nav + sub-nav (56px + 56px = 112px of dead zone at the top). Fix: `scroll-margin-top: 7rem` (112px) on each section's anchor target. This is a CSS-only fix, no JS scroll library needed — confirms "JS-based smooth scrolling" isn't necessary here; native anchor + `scroll-behavior: smooth` + correct margin is more reliable than reimplementing scroll math.

---

## 3. Video Asset Plan

**Your brief specifies:** `/public/assets/videos/{event-slug}.mp4`
**What already exists in this repo:** `client/public/videos/{slug}.mp4` (wired via `lib/eventVideos.js` → `getEventVideoSrc()`, consumed by `components/EventHeroMedia.jsx`, which already handles lazy-load-on-scroll-into-view, autoplay/muted/loop, `prefers-reduced-motion` fallback to poster frame, and 404-fallback to the static banner image). This plumbing is fully built and tested against the reduced-motion/fallback requirements you're asking for again in this brief — I'd reuse it rather than duplicate it under a new path.

**The file you uploaded:** `client/public/videos/Hack Nexus.mp4` (space + capital letters). `getEventVideoSrc("Hack Nexus")` generates `hack-nexus.mp4` (lowercase, hyphenated) via the existing `slugify()` function — so the uploaded file's name doesn't match what the code looks for yet.

**Proposed fix (part of the Hack Nexus pilot, not a design change):** rename `Hack Nexus.mp4` → `hack-nexus.mp4`. No code changes needed — `getEventVideoSrc()` already produces the right path, the file just needs to match it.

**Confirm:** keep the existing `/videos/` convention (zero new plumbing, reuses tested fallback/reduced-motion logic), or do you specifically want the `/assets/videos/` path for some other reason (e.g. matching a folder structure outside this repo)? Defaulting to **reuse existing convention** unless you say otherwise.

---

## 4. Section-by-Section Breakdown

Every section is a `<section>` with `min-h-screen` (Tailwind, = 100vh) except Section 6.

### SECTION 0 — Sticky Sub-Nav
Covered in §2. Not a scroll section, persists throughout.

### SECTION 1 — Hero (`id="overview"`, 100vh)

| Element | Spec |
|---|---|
| Background | `EventHeroMedia` (existing component, unchanged internally) — video if it exists at the derived slug path, else static banner image |
| Video treatment | `filter: blur(3px) brightness(0.55)` applied to the `<video>` element itself (not just an overlay) — this is a **change** from the current component, which has no blur on the video layer, only a scrim on top. Brief explicitly asks for the footage itself to read "slightly soft," not just dimmed |
| Dark overlay | Existing `scrim="full"` (flat `bg-black/55`) kept on top of the blur, for text contrast |
| Eyebrow | `event.track` or category label, existing style (`text-arc text-[11px] tracking-cinematic uppercase`) |
| Headline | `event.name`, upgraded from `font-serif` to **`font-italiana`** (the `Italiana` font is already loaded site-wide via `index.html`'s Google Fonts link and already used on `Login.jsx` — just needs a Tailwind `fontFamily.italiana` token added and applied here) |
| Height | `min-h-screen` (was `min-h-[70vh]`) |
| Position | Centered (current behavior), not lower-third — matches your "centered or lower-third, exactly as currently styled" note; keeping centered since that's what exists today |

### SECTION 2 — Statement (100vh, no video, plain background)

| Element | Spec |
|---|---|
| Content | `getEventStatement(event.description)` — a new pure function in `lib/eventStatement.js` that takes the **first sentence** of `event.description` (up to and including the first `.`/`!`/`?`) and returns it standalone. This is the "derive one statement per event from its description" requirement, done deterministically from real data — no hardcoded per-event copy, no AI text generation (not available in this sandbox) |
| Fallback | If description has no sentence break (single short phrase), use the full description as-is |
| Typography | Large serif (`font-serif`, existing `Playfair Display` token), centered, generous `max-w-3xl` line length, big whitespace above/below |
| Background | Plain — `bg-void` or simply the shared `CinematicBackground` showing through faintly (site-wide fixed video), NO event-specific image/video here — matches "plain background, no video" instruction |

### SECTION 3 — The Event (100vh)

| Element | Spec |
|---|---|
| Layout | `grid sm:grid-cols-2`, media one side, text other — same pattern as current, but **each column now fills the 100vh section height** (`h-full` on both grid children) instead of a small `aspect-[4/3]` box |
| Media | Reuse `EventHeroMedia` (video-capable) here too, OR keep `CinematicImage` if you want Section 1 to be the only video moment and Sections 3/4 to stay static images (photo, not video) — **your brief says "video or image on one side," so I'll make it accept either; defaulting to static image here so the video "moment" stays special to the hero, not repeated three times on one page.** Flag if you want video here too |
| Text | `event.description` (full, not the truncated Section-2 sentence) + `event.startTime`/`endTime`/`venue`/`isTeamEvent` logistics line — same data already rendered today, just given full-height real estate |
| Alignment | Media left / text right (current default) |

### SECTION 4 — Rules & Format (`id="rules"`, 100vh)

| Element | Spec |
|---|---|
| Layout | Same grid pattern as Section 3, **alignment flipped**: text left / media right (currently already flipped via `order-2 sm:order-1` — this is preserved, just scaled to full height) |
| Text | `event.rulebook`, existing fallback string if null |
| Media | Static image (same reasoning as Section 3) |

### SECTION 5 — Register (`id="register"`, 100vh)

| Element | Spec |
|---|---|
| Content | Price (`event.fee`), seats line (`event.seatsAvailable`/`maxSeats`), CTA button — same data/logic as today (`handleRegister`, cart add, disabled-when-full) |
| Layout | Centered, but now given the **full 100vh** to breathe (currently a compact `py-24` block) — larger price/CTA typography, more vertical whitespace before/after |
| Button copy | Unchanged logic: "Seats Full" / "Continue to Registration" / "Register for This Event" |

### SECTION 6 — Continue Your Journey (full-width, NOT 100vh)

**Current bug to fix:** the 3-card row uses `grid-cols-1 sm:grid-cols-3` with `aspect-[4/5]` cards inside a `border-r border-b` grid — on narrower `sm` breakpoints this produces visible clipping/misalignment (the reported "clipped/broken" look). Rebuild:

| Element | Spec |
|---|---|
| Layout | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` (explicit `gap`, not border-based separation — borders between grid cells are what was causing the "broken" seams) |
| Card | Full `aspect-[3/4]` image card, `rounded-lg overflow-hidden`, no cropped edges |
| Hover | `scale-[1.03]` + `brightness-110` on the image (reuses `CinematicImage`'s existing `zoomOnHover` prop, already built for exactly this), plus the existing "Discover More →" label fade-in |
| Height | Auto (content-driven), NOT `min-h-screen` — matches your "not necessarily 100vh" note |

---

## 5. Global Scroll Behavior

**Decision: native smooth scroll, not CSS `scroll-snap`.**

Reasoning: Section 6 is explicitly *not* 100vh, so a page-wide `scroll-snap-type: y mandatory` would either (a) snap awkwardly on the one irregular section, or (b) need to be scoped to only 5 of 6 sections, which is fragile and fights natural trackpad/mobile scroll momentum. The existing `html { scroll-behavior: smooth }` (already global) plus the `scroll-margin-top` fix in §2 gives tab-click smooth-scroll-to-section with correct offset, without introducing snap's "stuck between sections" feel or extra JS scroll libraries. This satisfies "pick whichever is more reliable in this stack" — the stack already has global smooth-scroll wired and working; snap would be new, unproven, and actively conflicts with a non-uniform section height.

## 6. Reduced Motion

Already fully handled by existing code, unchanged:
- `EventHeroMedia` never renders `<video>` when `prefers-reduced-motion: reduce` — shows the static poster/banner image instead
- `motion.js`'s `revealProps()` / `withReducedMotion()` helpers already skip scroll-triggered transform animations for reduced-motion users, snapping content to its final visible state instead
- New requirement this adds: the sub-nav's scroll-triggered shrink (§2.2) should also respect reduced motion — I'll gate the CSS `transition` behind a `@media (prefers-reduced-motion: reduce)` override that sets `transition: none` (state still changes, just without the animated shrink)

---

## 7. Open Questions (please confirm before I write code)

1. **Chevron dropdown** — build as a functional "jump to another event" popover (reusing `otherEvents` data), or leave decorative for now?
2. **Video path** — reuse existing `/videos/{slug}.mp4` convention (rename your uploaded file to `hack-nexus.mp4`, zero code changes to the path logic), or do you need `/assets/videos/`  specifically?
3. **Sections 3 & 4 media** — static image only (video reserved for the Hero as a special moment), or should Section 3 also support video if one exists?
4. **Section 1 headline position** — confirmed centered (matches current code), not lower-third, correct?

## 8. Rollout Plan

1. Rename uploaded video to match slug convention (or confirm alternate path)
2. Add `Italiana` to `tailwind.config.js` font tokens
3. Build `lib/eventStatement.js`
4. Rebuild `EventDetail.jsx` render tree per §4 (single file change — this already applies to every event since the whole page is data-driven)
5. Fix Section 6 grid (§4, Section 6)
6. Add sub-nav scroll-shrink behavior (§2.2) + `scroll-margin-top` fix (§2.3)
7. Verify against Hack Nexus specifically (real video, real description/rulebook from seed data)
8. Spot-check 2-3 other events (e.g. one with a very short description, one with no video file) to confirm graceful fallback — no per-event code, just data differences

No code has been written yet. Once you confirm the four open questions above, I'll implement steps 1-8 in order and verify each against the Hack Nexus event before calling it done.
