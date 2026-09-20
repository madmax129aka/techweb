import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import EventCardImage from "../components/EventCardImage";
import EventHeroMedia from "../components/EventHeroMedia";
import EventScrollFeatureSection from "../components/EventScrollFeatureSection";
import { getEventImage, getEventIconSrc } from "../lib/eventImages";
import { getEventVideoSrc } from "../lib/eventVideos"; // kept imported (even though only referenced in a commented-out revert line below) so uncommenting that line to restore per-event video resolution needs zero other changes
import { getEventStatement } from "../lib/eventStatement";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import {
  fadeUp,
  staggerContainer,
  revealProps,
  viewportOnce,
  EASE_CINEMATIC,
} from "../lib/motion";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "rules", label: "Rules" },
  { key: "register", label: "Register" },
];

/**
 * Event story page - Rolls-Royce Motor Cars "Phantom model page" pattern:
 * a sticky sub-nav (event name + chevron model-switcher + Overview|Rules|
 * Register tabs) that shrinks and darkens once the hero scrolls past, then
 * six full-viewport sections: a video/image hero, a plain-background
 * editorial statement, alternating media+copy sections for the event
 * itself and its rules, a centered register/price/CTA section, and a
 * closing "Continue Your Journey" grid linking to other events.
 *
 * This is the SAME single template for every event - nothing here is
 * Hack-Nexus-specific. Every value rendered comes from the `event` object
 * fetched from `/api/events/:id`; two events with different data (one
 * with a real video file, one without; one with a long description, one
 * with a one-line description) render through this exact same JSX with
 * no branching on which event it is.
 */
export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [otherEvents, setOtherEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subNavScrolled, setSubNavScrolled] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { items, addItem } = useCart();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const switcherRef = useRef(null);

  // ROOT-CAUSE FIX ("top utility bar still shows solid background over
  // the Hero video, even after .nav-cinematic's own gradient was already
  // fixed to match the sub-nav"): the real cause isn't a CSS rule at
  // all - it's that React Router does NOT reset `window.scrollY` to 0 on
  // a client-side navigation (this is documented default behavior, and
  // there was no `useEffect`/`<ScrollRestoration>` anywhere in this app
  // resetting it either - confirmed by search). Navbar.jsx's own
  // `scrolled` state is computed from a synchronous `window.scrollY > 60`
  // check that runs immediately on mount - so arriving on this page
  // already scrolled down (e.g. the visitor scrolled the Events list
  // before clicking into an event) puts the shared header into its
  // `.nav-scrolled` near-solid state from EventDetail's very first
  // frame, regardless of what `.nav-cinematic`'s base (non-scrolled)
  // gradient looks like - which is exactly why the previous fix to that
  // gradient had no visible effect for a scrolled-in visitor. Scoped fix
  // here (this page only, not a global Navbar/App-level scroll-reset
  // change) resets the browser's actual scroll position on mount, so
  // the shared header's own existing scroll check correctly evaluates
  // to "not scrolled" and renders its transparent base state.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/events/${id}`)
      .then((data) => setEvent(data.event))
      .catch(() => toast.error("Could not load this event"))
      .finally(() => setLoading(false));

    api
      .get("/api/events")
      .then((data) => setOtherEvents((data.events || []).filter((e) => e.id !== id)))
      .catch(() => {});
  }, [id]);

  // Model-switcher popover (sub-nav chevron) shows only OTHER events in
  // the SAME category as the current one (e.g. Hack Nexus -> Technical
  // events only), matching the site's main Events mega-menu grouping
  // (FullScreenMenu.jsx's `byCategory`) - `otherEvents` itself stays
  // unfiltered by category since Section 6 ("Continue Your Journey")
  // still wants the full cross-category list.
  const switcherEvents = event
    ? otherEvents.filter((e) => (e.category === "non_technical" ? "non_technical" : "technical") === (event.category === "non_technical" ? "non_technical" : "technical"))
    : [];

  // Sub-nav shrink/darken past the hero (100vh) - same threshold idea as
  // Navbar.jsx's own scrolled-state check, just measured against this
  // page's hero height rather than a flat pixel constant, since the hero
  // IS the viewport height here (min-h-screen), not a fixed banner size.
  useEffect(() => {
    const onScroll = () => setSubNavScrolled(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the model-switcher popover on outside click or Escape - the
  // same interaction contract as any other dropdown on the site
  // (FullScreenMenu's own overlay-close pattern), not a bespoke one-off.
  useEffect(() => {
    if (!switcherOpen) return;
    const onClickOutside = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setSwitcherOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSwitcherOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [switcherOpen]);

  // Close the switcher whenever the route's own event id changes (i.e.
  // the user just jumped to a different event from inside the popover),
  // so it never reopens stale on the next page.
  useEffect(() => {
    setSwitcherOpen(false);
  }, [id]);

  const inCart = event ? items.some((i) => i.id === event.id) : false;
  const full = event ? event.seatsAvailable <= 0 : false;

  const handleRegister = () => {
    if (!event) return;
    if (!inCart) {
      const result = addItem(event);
      if (!result.ok) {
        toast.error(result.reason);
        return;
      }
    }
    navigate("/register");
  };

  // Smooth-scroll to a section by id, correctly offset (scroll-margin-top
  // on the target handles the offset itself - see index.css - so this is
  // just a plain native scrollIntoView, no manual pixel math needed).
  const scrollToSection = useCallback((sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }, [reduce]);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-6 py-24 text-center text-offwhite/50">Loading event...</div>;
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-offwhite/60 mb-6">This event could not be found.</p>
        <Link to="/events">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    );
  }

  const categoryLabel = event.track || (event.category === "non_technical" ? "Non-Technical" : "Technical");
  const statement = getEventStatement(event.description);

  // Per-event video, now that real files exist for several events (see
  // EVENT_VIDEO_FILES in lib/eventVideos.js for the exact event-name ->
  // filename map and why it's an explicit map rather than a derived
  // slug). Events without their own uploaded file automatically resolve
  // to the hack-nexus.mp4 placeholder from inside getEventVideoSrc
  // itself now - no override needed at this call site anymore.
  const heroVideoSrc = getEventVideoSrc(event.name);

  return (
    <div>
      {/* ==================================================================
          STICKY SUB-NAV
          ==================================================================
          `top-14` matches the Navbar's canonical h-14 (56px) so this
          sits flush under the main nav with no gap. `.event-subnav` /
          `.sub-nav-scrolled` (index.css) handle the height-compress +
          background-darken transition once the user scrolls past the
          hero - toggled here by `subNavScrolled`, same pattern as
          Navbar.jsx's own `scrolled` state. */}
      <div
        className={`event-subnav sticky top-14 z-30 flex items-center bg-gradient-to-b from-black/30 to-transparent backdrop-blur-xl border-t border-white/15 ${
          subNavScrolled ? "sub-nav-scrolled" : ""
        }`}
      >
        {/* ROOT-CAUSE FIX ("chevron dropdown does nothing"): `overflow-x-
            auto` on this row forces `overflow-y: auto` too per the CSS
            spec (you can't set one axis to a non-`visible` value while
            leaving the other `visible`) - so the switcher's `absolute`
            dropdown below, which needs to overflow this row's own
            bottom edge to be seen, was being clipped/hidden by this
            container the instant it opened. It LOOKED like the click did
            nothing; `switcherOpen` was actually flipping to `true` the
            whole time. Horizontal scroll on narrow widths (the original
            reason for `overflow-x-auto`) still isn't needed in practice -
            this row's few items already wrap/shrink fine - so the
            property is dropped rather than replicating the clipping bug
            with a workaround. */}
        <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">
          {/* Event name + functional chevron "model switcher" - clicking
              it opens a popover listing other events in the SAME
              category (Technical/Non-Technical) as this one, so a
              visitor can jump straight to a similar event's page
              without backing out to /events first. Reuses the
              `otherEvents` fetch already made for Section 6 below (via
              the category-filtered `switcherEvents`) - no second API
              call. */}
          <div ref={switcherRef} className="relative">
            <button
              type="button"
              onClick={() => setSwitcherOpen((v) => !v)}
              aria-expanded={switcherOpen}
              aria-haspopup="listbox"
              className="flex items-center gap-2 font-heading text-sm text-offwhite whitespace-nowrap group"
              style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.6)" }}
              data-log="event-subnav-switcher-toggle"
            >
              {event.name}
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-offwhite/60 group-hover:text-arc transition-transform duration-300 ${
                  switcherOpen ? "rotate-180" : ""
                }`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <AnimatePresence>
              {switcherOpen && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: EASE_CINEMATIC }}
                  className="absolute left-0 top-full mt-3 w-64 max-h-80 overflow-y-auto rounded-lg border border-white/10 bg-void/95 backdrop-blur-2xl shadow-cinematic py-2 z-40"
                  role="listbox"
                  aria-label="Jump to another event"
                >
                  {switcherEvents.length === 0 && (
                    <p className="px-4 py-2 text-xs text-offwhite/40">No other {categoryLabel} events yet</p>
                  )}
                  {switcherEvents.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      role="option"
                      onClick={() => {
                        setSwitcherOpen(false);
                        navigate(`/events/${e.id}`);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-offwhite/75 hover:text-arc hover:bg-white/5 transition-colors"
                      data-log={`event-subnav-switch-${e.id}`}
                    >
                      {e.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => scrollToSection(tab.key)}
                className="nav-link-cinematic whitespace-nowrap"
                data-log={`event-tab-${tab.key}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================================
          SECTION 1 - HERO (true full-viewport video, rolls-roycemotorcars.
          com reference pattern)
          ==================================================================
          `-mt-14 h-screen` pulls this section up by the Navbar's h-14
          (56px) and grows it to a full 100vh (`h-screen`, not `min-h-
          screen` - this section has no text content driving its height
          anymore, so it must be pinned to exactly 100vh rather than
          "at least 100vh"), so the video starts at the TRUE top of the
          viewport (y=0) instead of 56px down from it. The sticky sub-nav
          right above this section in the DOM is completely untouched -
          it still occupies its own 56px of normal flow immediately
          under the fixed Navbar - this negative margin only pulls THIS
          section's own box up to sit visually behind/under both of
          them, exactly like the transparent-header-over-hero pattern
          already used on Navbar.jsx (fixed, transparent nav overlaying
          whatever content is behind it) - reused here rather than
          reinvented.

          `videoBlur` softens the video layer itself (filter: blur+
          brightness on the <video> element) so the footage reads as
          atmospheric background rather than sharp foreground clip.
          `scrim="full"` stays (a flat dark wash) purely so the video
          reads as a moody backdrop consistent with the rest of the
          site's cinematic treatment - NOT for text contrast anymore,
          since no text is overlaid on this section now (moved to
          Section 2 below, see that section's own comment). */}
      <section className="relative h-screen -mt-14 overflow-hidden" id="overview">
        <EventHeroMedia
          videoSrc={heroVideoSrc}
          imageSrc={getEventImage(event.name)}
          alt={event.name}
          scrim="full"
          videoBlur
        />
      </section>

      {/* ==================================================================
          SECTIONS 2-6 WRAPPER - flat solid background, no cinematic/
          ambient bg anywhere on this page
          ==================================================================
          `.event-detail-solid-bg` (index.css) is a flat `background:
          var(--color-bg-base)` fill - the SAME token already used
          site-wide for `bg-void` (Login page, footer, card footers), not
          a new color. This wrapper starts right after the Hero's closing
          </section> (the Hero itself stays untouched - video only, no
          solid fill behind it) and covers every section from here to the
          end of the page, so once a visitor scrolls past the full-screen
          video there is a clean flat color underneath everything - no
          CinematicBackground showing through (that component isn't even
          mounted on this route anymore, see App.jsx's `isEventDetail`
          check), and no gradient/video bleed from anywhere else either. */}
      <div className="event-detail-solid-bg">
      {/* ==================================================================
          SECTION 2 - THE STATEMENT (full 100vh, plain background, no
          video/image at all)
          ==================================================================
          The eyebrow ("HACKATHON"-style category label) + event name
          headline used to be centered ON TOP of the Hero video (Section
          1). Moved here instead, at the TOP of this section, so it's
          the first thing revealed once the visitor scrolls past the
          now-textless full-screen video - same fonts/styling as before
          (font-italiana headline, arc/cyan eyebrow), just relocated.
          `statement` is derived from `event.description` via
          `getEventStatement()` (lib/eventStatement.js) - the first
          sentence, or the full description if it has no sentence break.
          No image/video layer here at all - this section sits on the
          flat solid-color wrapper above (`.event-detail-solid-bg`), not
          the shared app-wide CinematicBackground (which isn't mounted
          on this route at all anymore) - matching "plain background, no
          video" from the brief. */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          variants={staggerContainer}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={viewportOnce}
        >
          <motion.p variants={fadeUp} className="text-arc text-[11px] tracking-cinematic uppercase mb-5">
            {categoryLabel}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-italiana text-5xl sm:text-7xl lg:text-8xl text-offwhite leading-none tracking-wide mb-10"
          >
            {event.name}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="font-serif text-2xl sm:text-4xl lg:text-5xl text-offwhite/90 leading-relaxed"
          >
            {statement}
          </motion.p>
        </motion.div>
      </section>

      {/* ==================================================================
          SECTIONS 3-5 - THE EVENT / RULES & FORMAT / REGISTER
          ==================================================================
          Replaced the three separate whileInView-fade sections with one
          reusable scroll-feature component (ported from a 21st.dev
          "parallax scroll feature section" demo - see
          EventScrollFeatureSection.jsx's own header comment for the full
          adaptation notes). Same three panels, same alternating layout,
          same underlying event data (description/rulebook/fee/seats) -
          the difference is each panel's OWN scroll progress now drives
          an opacity+clip-path reveal + slight parallax translate,
          instead of a single viewport-enter fade. `id="rules"` /
          `id="register"` are passed through so the sub-nav's existing
          tab-jump + the `scroll-margin-top` CSS rule scoped to those
          exact ids (index.css) keep working unchanged. */}
      <EventScrollFeatureSection
        event={event}
        inCart={inCart}
        full={full}
        onRegister={handleRegister}
      />

      {/* ==================================================================
          SECTION 6 - CONTINUE YOUR JOURNEY (full-width, NOT 100vh -
          height is content-driven)
          ==================================================================
          Rebuilt grid: explicit `gap-6` between cards instead of the
          previous `border-r/border-b` cell-separator pattern, which is
          what produced the clipped/misaligned seams at the `sm`
          breakpoint (3 columns forced into a viewport too narrow for
          them, with shared borders doubling up unevenly at the edges).
          Each card is now a self-contained rounded/overflow-hidden box
          with its own spacing - nothing to clip regardless of how many
          columns end up per row at a given width. */}
      {otherEvents.length > 0 && (
        <section className="border-t border-crimson/10 pt-16 pb-16 sm:pt-20 sm:pb-20 px-6">
          <motion.div className="max-w-6xl mx-auto mb-12 text-center" {...revealProps(reduce, fadeUp)}>
            <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Continue Your Journey</p>
            <h2 className="font-serif text-2xl sm:text-4xl text-offwhite">Other Events to Explore</h2>
          </motion.div>

          <motion.div
            className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={viewportOnce}
          >
            {otherEvents.slice(0, 6).map((e) => (
              <motion.div key={e.id} variants={fadeUp}>
                <Link
                  to={`/events/${e.id}`}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden block"
                  data-log={`continue-journey-${e.id}`}
                >
                  {/* ROOT-CAUSE FIX ("Other Events to Explore" cards
                      never picked up the custom icon set, unlike the
                      main Events page carousel): this card was still
                      calling `CinematicImage` with ONLY the stock/Picsum
                      photo (`getEventImage`) - the icon-first resolution
                      logic added for the main Events carousel
                      (EventsCoverFlow.jsx) never got wired in here, so
                      the two places silently drifted out of sync.
                      Switched to the SAME shared `EventCardImage`
                      component EventsCoverFlow now also uses (see that
                      component's own header comment) - one place this
                      icon-vs-photo decision lives, used by both. Same
                      `getEventIconSrc()` call, same fallback-to-photo
                      behavior for any event whose icon isn't mapped yet.
                      `group-hover:scale-[1.02]`/`brightness-110` replace
                      CinematicImage's own built-in `zoomOnHover` (which
                      this component doesn't have) so the existing hover
                      lift on this card isn't lost. */}
                  <EventCardImage
                    iconSrc={getEventIconSrc(e)}
                    photoSrc={getEventImage(e.name)}
                    alt={e.name}
                    className="transition-transform duration-[400ms] ease-out group-hover:scale-[1.02] group-hover:brightness-110"
                  />
                  <div className="relative z-10 h-full flex flex-col items-start justify-end p-6">
                    <h3 className="font-serif text-lg sm:text-xl text-offwhite mb-2">{e.name}</h3>
                    <span className="text-[10px] tracking-cinematic uppercase text-arc opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Discover More &rarr;
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
      </div>
    </div>
  );
}
