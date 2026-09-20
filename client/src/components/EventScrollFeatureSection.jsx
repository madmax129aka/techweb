import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import EventCardImage from "./EventCardImage";
import Button from "./ui/Button";
import { getEventImage, getEventIconSrc } from "../lib/eventImages";

/**
 * EventScrollFeatureSection
 * -------------------------
 * Ported from a 21st.dev "parallax scroll feature section" demo
 * (Component/DemoOne in the original) to this project's stack and data
 * model. Replaces Sections 3-5 of EventDetail.jsx ("The Event",
 * "Rules & Format", "Register") with the same alternating image/text
 * layout those sections already had, but with the pasted component's
 * per-section scroll-driven reveal (opacity fade-in + clip-path wipe +
 * a slight vertical parallax translate as each panel's OWN scroll
 * progress crosses a threshold) instead of the whileInView fade the
 * rest of the page still uses for other sections.
 *
 * ADAPTATIONS FROM THE PASTED SOURCE (see design.md for the full
 * before/after mapping this was scoped against):
 *   - `"use client"` removed (Next.js directive, meaningless in Vite).
 *   - The two full-screen bookend sections ("PARALLAX SCROLL FEATURE
 *     SECTION" intro + "The End" outro) are NOT ported - those were
 *     demo framing, not part of the actual feature. This component
 *     renders ONLY the three alternating panels.
 *   - `sections` is no longer a hardcoded placeholder array - it's
 *     built inline (see `buildSections` below) from the real `event`
 *     prop: Section 1 = the event's own description + time/venue,
 *     Section 2 = rulebook, Section 3 = register/price/seats/CTA.
 *   - Section 3 ("Register") has NO image. Its media slot instead
 *     renders the app's existing price/seats/Button block, wrapped in
 *     the SAME opacity+clipPath reveal the image panels use elsewhere -
 *     reusing the animation, not inventing a second one for text.
 *   - Images go through `EventCardImage` (the shared icon-first,
 *     photo-fallback component also used by the Events grid carousel
 *     and Event Detail's "Other Events to Explore" grid), not a raw
 *     `<img>` or a bare `CinematicImage` - this keeps icon resolution
 *     consistent across all four places an event's image/icon can
 *     appear, rather than three places getting the icon treatment and
 *     this one staying stock-photo-only.
 *   - Colors: `text-white/70` -> `text-offwhite/70`; section eyebrows
 *     ("THE EVENT" / "RULES & FORMAT" / "REGISTER") use the same
 *     `text-arc text-[11px] tracking-cinematic uppercase` treatment
 *     Sections 3-5 already used before this replaced them, not a new
 *     style.
 *   - Titles use `font-italiana` (this app's Rolls-Royce-reference
 *     display serif, already used on the Hero's event-name headline)
 *     at a size consistent with other section headings on this page,
 *     not the pasted `text-6xl` Tailwind default.
 *   - `useReducedMotion()` gates all three `useTransform` outputs -
 *     when reduced motion is on, every panel renders at its final
 *     visible state immediately (opacity 1, no clip, no translate)
 *     instead of animating in. The pasted source had no reduced-motion
 *     handling at all.
 *   - Anchor ids: each entry in `buildSections` below carries an
 *     explicit `id` field ("rules" / "register", or `undefined` for
 *     the first panel) that `FeaturePanel` puts directly on its root
 *     div - NOT an arbitrary array-index id. This keeps the sub-nav's
 *     existing tab-jump behavior and the `scroll-margin-top` CSS rule
 *     already scoped to those exact ids (index.css) working unchanged.
 *
 * COMPATIBILITY WITH THE PAGE'S EXISTING SMOOTH-SCROLL (verified, see
 * design.md): `useScroll({ target: ref })` with a per-section ref only
 * READS scroll position via a passive listener - it never calls
 * `scrollTo`/`scrollIntoView`/`preventDefault`, so it cannot fight the
 * global `html { scroll-behavior: smooth }` or the sub-nav's own
 * `scrollIntoView` tab-click handler in EventDetail.jsx. Both systems
 * observe/drive the same native scroll position independently with no
 * shared state to conflict over.
 */

function buildSections(event, { inCart, full, onRegister }) {
  const image = getEventImage(event.name);
  // Same icon-first, photo-fallback resolution already used by the
  // Events grid carousel (EventsCoverFlow.jsx) and Event Detail's
  // "Other Events to Explore" grid (Section 6) - this is the SAME
  // `getEventIconSrc()` from lib/eventImages.js, not a separate copy,
  // so all four locations stay in sync automatically as icons are
  // added/changed in one place.
  const icon = getEventIconSrc(event);

  return [
    {
      key: "event",
      id: undefined, // "overview" already lives on the Hero section above; this panel has no anchor of its own
      eyebrow: "The Event",
      title: "The Event",
      reverse: false,
      media: { type: "image", src: image, iconSrc: icon, accent: "crimson" },
      // Text-column content only. The media column for this section is
      // always the "image" branch (see FeaturePanel) - never reads this.
      textContent: (
        <>
          <p className="text-offwhite/70 text-base sm:text-lg leading-relaxed max-w-lg">
            {event.description}
          </p>
          <div className="mt-8 space-y-1.5 text-sm text-offwhite/50">
            <p>
              {formatTime(event.startTime)} &mdash; {formatTime(event.endTime)}
            </p>
            <p>{event.venue || "Venue TBA"}</p>
            {event.isTeamEvent && <p>Team event</p>}
          </div>

          {/* COORDINATORS block - data-driven from `event.coordinatorContacts`
              (a variable-length array of {name, role, phone}, NOT a fixed
              pair of fields - some events have 2, some have 3+, and this
              must render however many exist without hardcoding a count).
              Placed directly under the existing time/venue metadata, inside
              the SAME "The Event" panel/text column - it inherits that
              panel's scroll-reveal animation for free rather than needing
              its own, and reads as a natural extension of "here's the
              event's practical details" rather than a bolted-on block
              elsewhere on the page. Skips rendering entirely if the array
              is empty (e.g. an event created before this field existed),
              so there's no empty "COORDINATORS" label with nothing under it. */}
          {Array.isArray(event.coordinatorContacts) && event.coordinatorContacts.length > 0 && (
            <div className="mt-8">
              <p className="text-arc text-[11px] tracking-cinematic uppercase mb-3">Coordinators</p>
              {/* 2-column grid on sm+ so 2-3 entries sit compactly side by
                  side rather than stacking into a long vertical list;
                  collapses to 1 column on mobile. A 4th+ entry just wraps
                  onto a new row - no layout change needed as the count
                  grows. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {event.coordinatorContacts.map((c, i) => (
                  <div
                    key={`${c.name}-${i}`}
                    className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5"
                  >
                    <p className="text-[10px] tracking-cinematic uppercase text-offwhite/45">{c.role}</p>
                    <p className="text-sm text-offwhite/85 mt-0.5">{c.name}</p>
                    <p className="text-xs text-offwhite/50 mt-0.5">{c.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      key: "rules",
      id: "rules",
      eyebrow: "Rules & Format",
      title: "Rules & Format",
      reverse: true,
      media: { type: "image", src: image, iconSrc: icon, accent: "arc" },
      textContent: (
        <p className="text-offwhite/70 text-base sm:text-lg leading-relaxed whitespace-pre-line max-w-lg">
          {event.rulebook || "Full rules will be shared closer to the event date."}
        </p>
      ),
    },
    {
      key: "register",
      id: "register",
      eyebrow: "Register",
      title: "Register",
      reverse: false,
      // No image for this panel. `media.type === "cta"` tells
      // FeaturePanel to render `mediaContent` (below) inside the media
      // slot's reveal wrapper instead of a CinematicImage - reusing the
      // same opacity+clipPath animation the image panels get, around
      // different content. The text column just gets the eyebrow/title
      // (via the shared header markup in FeaturePanel) and nothing
      // else, so the price/seats/button block renders exactly ONCE,
      // inside the media slot - not duplicated into both columns.
      media: { type: "cta" },
      textContent: null,
      mediaContent: (
        <>
          <p className="font-serif text-4xl sm:text-5xl text-offwhite mb-4">&#8377;{event.fee}</p>
          <p className="text-offwhite/50 text-sm sm:text-base mb-10">
            {event.seatsAvailable} of {event.maxSeats} seats remaining
          </p>
          {/* `plain` - no hover scale/lift, no shimmer sweep (see
              Button.jsx). Register already sits inside this panel's own
              scroll-reveal (opacity/clip-path/translate); the button's
              usual extra hover animation on top of that read as a
              second, competing effect and looked off per direct
              feedback. */}
          <Button size="lg" disabled={full} onClick={onRegister} plain data-log="event-detail-register">
            {full ? "Seats Full" : inCart ? "Continue to Registration" : "Register for This Event"}
          </Button>
        </>
      ),
    },
  ];
}

function formatTime(iso) {
  return new Date(iso).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

/** One alternating panel: text column + media column, each with its own scroll-driven reveal. */
function FeaturePanel({ section }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  // Per-section scroll progress - this is the pasted component's core
  // mechanism, unchanged: `target: ref` scopes the progress to THIS
  // panel's own scroll range (from when its top hits the viewport
  // bottom, to when its center hits the viewport top), not the whole
  // page's scroll position. Purely a read of scroll position via a
  // passive listener/IntersectionObserver internally - see the
  // compatibility note in the file header.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const clipPath = useTransform(scrollYProgress, [0, 0.7], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const translateY = useTransform(scrollYProgress, [0, 1], [-50, 0]);

  // Reduced motion: skip all three transforms, render the final visible
  // state immediately. `undefined` on a motion.div's `style` prop is a
  // no-op, so passing `undefined` here (rather than the live
  // MotionValue) means the element just keeps its plain CSS values -
  // opacity 1 (default), no clip-path, no transform.
  const textStyle = reduce ? undefined : { y: translateY };
  const mediaStyle = reduce ? undefined : { opacity, clipPath };

  // Register ("cta" media type) is NOT a two-column text/media split -
  // it's a single centered block (eyebrow, title, price, seats, button
  // all stacked in one column). Forcing it through the same text-column
  // + media-column layout as the image panels put "Register" in one
  // column and the price/button in the other, which is what made the
  // CTA look off-center - fixed by branching the whole panel's markup
  // here instead of reusing the two-column shell for content that was
  // never meant to be split into two columns.
  if (section.media.type === "cta") {
    // Both halves of the reveal (text-style translate + media-style
    // opacity/clip) are combined onto ONE wrapper here, since there's
    // only one column to animate in, not two.
    const ctaStyle = reduce ? undefined : { opacity, clipPath, y: translateY };
    return (
      <div
        id={section.id}
        ref={ref}
        className="min-h-screen flex items-center justify-center px-6 py-20"
      >
        <motion.div style={ctaStyle} className="max-w-2xl text-center">
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">{section.eyebrow}</p>
          <h2 className="font-italiana text-4xl sm:text-5xl text-offwhite leading-tight mb-8">{section.title}</h2>
          {section.mediaContent}
        </motion.div>
      </div>
    );
  }

  return (
    <div
      id={section.id}
      ref={ref}
      className={cn(
        "min-h-screen flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 px-6 md:px-16 py-20",
        section.reverse && "md:flex-row-reverse"
      )}
    >
      <motion.div style={textStyle} className="flex-1 max-w-lg text-center md:text-left">
        <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">{section.eyebrow}</p>
        <h2 className="font-italiana text-4xl sm:text-5xl text-offwhite leading-tight mb-6">{section.title}</h2>
        {section.textContent}
      </motion.div>

      <motion.div style={mediaStyle} className="relative flex-1 w-full max-w-md aspect-[4/3]">
        {/* Same shared icon-first/photo-fallback component used by the
            Events grid carousel and "Other Events to Explore" - see
            buildSections() above for where iconSrc comes from
            (getEventIconSrc, the one shared resolution function).
            `iconBackgroundClassName=""` - unlike the carousel/grid cards
            (which need the icon to stand out against a busy card box),
            this icon sits directly on the page's own dark background;
            the default `bg-surface` box would just be a redundant dark
            rectangle floating on top of that background with nothing to
            visually separate it from. Only affects the ICON branch -
            the photo fallback (any event without an icon yet) is
            unaffected and keeps its normal full-bleed look. */}
        <EventCardImage
          iconSrc={section.media.iconSrc}
          photoSrc={section.media.src}
          alt={section.title}
          iconPadding="32px"
          iconBackgroundClassName=""
        />
      </motion.div>
    </div>
  );
}

export default function EventScrollFeatureSection({ event, inCart, full, onRegister }) {
  const sections = buildSections(event, { inCart, full, onRegister });

  return (
    <div className="relative border-t border-crimson/10">
      {sections.map((section) => (
        <FeaturePanel key={section.key} section={section} />
      ))}
    </div>
  );
}
