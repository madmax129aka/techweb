import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import CinematicImage from "../components/CinematicImage";
import EventHeroMedia from "../components/EventHeroMedia";
import { getEventImage } from "../lib/eventImages";
import { getEventVideoSrc } from "../lib/eventVideos";
import { getEventStatement } from "../lib/eventStatement";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import {
  fadeUp,
  fadeInLeft,
  fadeInRight,
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

function formatTime(iso) {
  return new Date(iso).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

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
        <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between overflow-x-auto">
          {/* Event name + functional chevron "model switcher" - clicking
              it opens a popover listing every OTHER event, so a visitor
              can jump straight to a different event's page without
              backing out to /events first. Reuses the `otherEvents`
              fetch already made for Section 6 below - no second API
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
                  {otherEvents.length === 0 && (
                    <p className="px-4 py-2 text-xs text-offwhite/40">No other events yet</p>
                  )}
                  {otherEvents.map((e) => (
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
          SECTION 1 - HERO (full 100vh)
          ==================================================================
          `videoBlur` softens the video layer itself (filter: blur+
          brightness on the <video> element) so the footage reads as
          atmospheric background rather than sharp foreground clip, on
          top of the existing "full" scrim (a flat dark wash, needed
          because this headline is CENTERED rather than bottom-anchored -
          a bottom-only gradient would leave centered text sitting on
          unmodified pixels). Headline uses `font-italiana` - the tall,
          wide-tracked display serif already loaded site-wide and used
          on the Login page - matching the reference's model-name
          typography, still centered (not lower-third) per confirmed
          scope. */}
      <section className="relative min-h-screen flex items-center justify-center" id="overview">
        <EventHeroMedia
          videoSrc={getEventVideoSrc(event.name)}
          imageSrc={getEventImage(event.name)}
          alt={event.name}
          scrim="full"
          videoBlur
        />
        <motion.div
          className="relative z-10 max-w-3xl mx-auto px-6 text-center"
          variants={staggerContainer}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          <motion.p variants={fadeUp} className="text-arc text-[11px] tracking-cinematic uppercase mb-5">
            {categoryLabel}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-italiana text-5xl sm:text-7xl lg:text-8xl text-offwhite leading-none tracking-wide"
          >
            {event.name}
          </motion.h1>
        </motion.div>
      </section>

      {/* ==================================================================
          SECTION 2 - THE STATEMENT (full 100vh, plain background, no
          video/image at all)
          ==================================================================
          `statement` is derived from `event.description` via
          `getEventStatement()` (lib/eventStatement.js) - the first
          sentence, or the full description if it has no sentence break.
          No image/video layer here at all; the shared app-wide
          CinematicBackground still shows through very faintly behind
          this section (same as every other page), but nothing
          event-specific is rendered on top of it - matching "plain
          background, no video" from the brief. */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <motion.p
          className="relative z-10 max-w-3xl mx-auto text-center font-serif text-2xl sm:text-4xl lg:text-5xl text-offwhite/90 leading-relaxed"
          {...revealProps(reduce, fadeUp)}
        >
          {statement}
        </motion.p>
      </section>

      {/* ==================================================================
          SECTION 3 - THE EVENT (full 100vh, media left / text right)
          ==================================================================
          `min-h-screen` on the section + `h-full` on both grid children
          - the media block now fills real vertical space instead of a
          small centered aspect-ratio box. Image only (no video) here,
          per confirmed scope - the hero is the one video moment on this
          page. */}
      <section className="relative min-h-screen grid sm:grid-cols-2 items-stretch">
        <motion.div className="relative order-2 sm:order-1 h-full min-h-[50vh]" {...revealProps(reduce, fadeInLeft)}>
          {/* No text is overlaid on this image (the description sits
              beside it, not on top), so the contrast scrim is unneeded -
              "none" keeps this as a purely decorative photo. */}
          <CinematicImage src={getEventImage(event.name)} alt={event.name} accent="crimson" zoomOnHover={false} scrim="none" />
        </motion.div>
        <motion.div
          className="relative z-10 order-1 sm:order-2 flex flex-col justify-center px-8 sm:px-16 py-16"
          {...revealProps(reduce, fadeInRight)}
        >
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">The Event</p>
          <p className="text-offwhite/70 text-base sm:text-lg leading-relaxed max-w-lg">{event.description}</p>
          <div className="mt-8 space-y-1.5 text-sm text-offwhite/50">
            <p>{formatTime(event.startTime)} &mdash; {formatTime(event.endTime)}</p>
            <p>{event.venue || "Venue TBA"}</p>
            {event.isTeamEvent && <p>Team event</p>}
          </div>
        </motion.div>
      </section>

      {/* ==================================================================
          SECTION 4 - RULES & FORMAT (full 100vh, alignment FLIPPED: text
          left / media right, so the rhythm alternates against Section 3)
          ================================================================== */}
      <section id="rules" className="relative min-h-screen grid sm:grid-cols-2 items-stretch border-t border-crimson/10">
        <motion.div
          className="relative z-10 flex flex-col justify-center px-8 sm:px-16 py-16"
          {...revealProps(reduce, fadeInLeft)}
        >
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Rules &amp; Format</p>
          <p className="text-offwhite/70 text-base sm:text-lg leading-relaxed whitespace-pre-line max-w-lg">
            {event.rulebook || "Full rules will be shared closer to the event date."}
          </p>
        </motion.div>
        <motion.div className="relative h-full min-h-[50vh]" {...revealProps(reduce, fadeInRight)}>
          {/* Same as Section 3 - decorative only, no overlaid text. */}
          <CinematicImage src={getEventImage(event.name)} alt={event.name} accent="arc" zoomOnHover={false} scrim="none" />
        </motion.div>
      </section>

      {/* ==================================================================
          SECTION 5 - REGISTER (full 100vh, centered)
          ==================================================================
          Same data/logic as before (handleRegister, cart add, disabled-
          when-full) - just given the full viewport to breathe instead
          of a compact `py-24` block, with larger price/CTA typography. */}
      <motion.section
        id="register"
        className="relative min-h-screen flex items-center justify-center px-6 text-center border-t border-crimson/10"
        {...revealProps(reduce, fadeUp)}
      >
        <div className="max-w-2xl">
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-6">Register</p>
          <p className="font-serif text-5xl sm:text-6xl text-offwhite mb-4">&#8377;{event.fee}</p>
          <p className="text-offwhite/50 text-sm sm:text-base mb-14">
            {event.seatsAvailable} of {event.maxSeats} seats remaining
          </p>
          <Button
            size="lg"
            disabled={full}
            onClick={handleRegister}
            data-log="event-detail-register"
          >
            {full ? "Seats Full" : inCart ? "Continue to Registration" : "Register for This Event"}
          </Button>
        </div>
      </motion.section>

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
                  {/* CinematicImage's own `zoomOnHover` already gives the
                      scale + brightness lift the brief asks for - no
                      extra hover wiring needed here. */}
                  <CinematicImage src={getEventImage(e.name)} alt={e.name} accent="crimson" />
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
  );
}
