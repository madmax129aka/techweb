import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import TechAstraLogo from "../components/TechAstraLogo";
import EventsCoverFlow from "../components/ui/EventsCoverFlow";
import { getEventImage, getEventIconSrc } from "../lib/eventImages";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { fadeUp, fadeIn, staggerContainer, staggerContainerSlow, EASE_CINEMATIC } from "../lib/motion";

/**
 * Events landing page - REBUILT in the Rolls-Royce Motor Cars editorial
 * style. This is the entry point of the Registration Portal app (there
 * is no separate homepage - see the scope-correction note in App.jsx),
 * so first impression matters.
 *
 * Composition, top to bottom:
 *   1. A slim, transparent top nav (rendered by <Navbar>, mounted once
 *      in App.jsx - not part of this file). The nav's logo used to live
 *      in the top-left corner but has been REMOVED there for this page
 *      to work - the TechAstra emblem is now the hero centerpiece
 *      below, and having it in two places was pulling visual weight to
 *      the top-left and fighting the intended symmetry.
 *
 *   2. A full-viewport (min-h-screen) hero, laid out perfectly
 *      symmetrically around a large centered TechAstra logo. A soft
 *      radial glow (gold -> crimson -> transparent) sits behind the
 *      logo as a vignette to make it feel like a focal emblem rather
 *      than a nav-bar mark. Below the logo:
 *        - "EIGHT TRACKS. ONE DAY." eyebrow (cinematic uppercase)
 *        - single serif tagline
 *        - centered subtext instructions
 *        - three-tab filter (All / Technical / Non-Technical)
 *        - a thin down-arrow scroll indicator at the bottom of the
 *          viewport, matching how Rolls-Royce's landing page invites
 *          you into the next section
 *      NO redundant "Events" h1 - the logo IS the heading now.
 *
 *   3. Under the fold, "THE PORTFOLIO" section: an eyebrow, a serif
 *      section title, then the snap-scroll carousel (a clean flat row,
 *      not the earlier tilted coverflow fan), then the event details
 *      block that responds to whichever card is centered - same
 *      contract as before, just wired to the new carousel.
 *
 *   4. A quiet closing section pointing users to /register once they
 *      have events in their cart, styled as an editorial call-to-action
 *      rather than a SaaS marketing block.
 */
const CATEGORY_FILTERS = [
  { key: "all", label: "All Events" },
  { key: "technical", label: "Technical" },
  { key: "non_technical", label: "Non-Technical" },
];

function formatTime(iso) {
  return new Date(iso).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const { items, addItem, removeItem } = useCart();
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/events")
      .then((data) => setEvents(data.events || []))
      .catch(() => toast.error("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  const inCart = (id) => items.some((i) => i.id === id);

  // Reuse the same `category` field that drives the mega-menu split, so
  // the Technical/Non-Technical distinction is consistent everywhere.
  const visibleEvents = useMemo(
    () =>
      categoryFilter === "all"
        ? events
        : events.filter(
            (e) => (e.category === "non_technical" ? "non_technical" : "technical") === categoryFilter
          ),
    [events, categoryFilter]
  );

  // Reset active index whenever the filtered list changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [categoryFilter, events.length]);

  const slides = useMemo(
    () =>
      visibleEvents.map((event) => ({
        // `iconSrc` is tried FIRST (see EventsCoverFlow's onError
        // handler); `src` is the existing stock/Picsum photo, kept as
        // the fallback for any event whose custom icon file doesn't
        // exist yet in client/public/icons/senior-techastra/ - so a
        // gradual rollout never shows a broken image or an empty card.
        iconSrc: getEventIconSrc(event),
        src: getEventImage(event.name),
        alt: event.name,
        title: event.name,
        subtitle: event.track || (event.category === "non_technical" ? "Non-Technical" : "Technical"),
        // `desc` is what the CoverFlow renders as the one-line overlay
        // caption on the centered card. Truncate long descriptions here
        // (not inside the carousel component) so the truncation logic
        // stays with the data that knows about the event model - the
        // presentational component just prints whatever string it gets.
        desc:
          event.description && event.description.length > 140
            ? event.description.slice(0, 137).trimEnd() + "..."
            : event.description || "",
      })),
    [visibleEvents]
  );

  const focusedEvent = visibleEvents[activeIndex] || null;

  const handleAdd = (event) => {
    const result = addItem(event);
    if (!result.ok) {
      toast.error(result.reason);
    } else {
      toast.success(`${event.name} added to cart`);
    }
  };

  const handleRemove = (event) => {
    removeItem(event.id);
    toast.success(`${event.name} removed from cart`);
  };

  const handleActiveChange = useCallback((index) => setActiveIndex(index), []);

  // Clicking the CENTERED card in the coverflow opens that event's
  // detail page - `visibleEvents[index]` (not `slides[index]`) because
  // the carousel only knows slide data, but the id it needs to link to
  // lives on the underlying event object at the same index.
  const handleSlideOpen = useCallback(
    (index) => {
      const event = visibleEvents[index];
      if (event) navigate(`/events/${event.id}`);
    },
    [visibleEvents, navigate]
  );

  return (
    <div>
      {/* ==================================================================
          HERO SECTION - full viewport, symmetrical, logo-centered
          ==================================================================
          The section itself is transparent so the app-level cinematic
          video backdrop (mounted once in App.jsx) shows through. The
          only opaque things layered on top are the radial glow behind
          the logo and the content stack itself.

          Height: `min-h-[calc(100vh-3.5rem)]` = 100vh minus the Navbar's
          canonical h-14 (56px = 3.5rem), so the hero fills EXACTLY one
          screenful under the nav rather than one-and-a-bit (the earlier
          `min-h-screen` variant was 56px too tall and pushed the
          portfolio section's top into the bottom of the fold at odd
          increments).

          Padding: no `pt-*` needed - App.jsx's <main> already has
          `pt-14` to clear the fixed navbar for every page uniformly.
          `pb-28` reserves headroom for the "DISCOVER" scroll indicator
          and the bottom-corner metadata tags so the tabs above them
          never visually collide with the fixed-position bottom row. */}
      <section className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-6 pb-16 pt-6">
        {/* Radial glow vignette behind the logo. Uses the two colors
            that already exist in the logo's own drop-shadow filter
            (gold #F2C230, crimson #E5473A), so the glow feels like it's
            emanating from the emblem itself rather than being an
            unrelated backdrop wash. Sits at z-0 with pointer-events-none
            so it never blocks clicks on anything else. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        >
          <div
            className="w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] lg:w-[720px] lg:h-[720px] rounded-full blur-3xl opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(242,194,48,0.45) 0%, rgba(229,71,58,0.20) 42%, rgba(170,5,5,0.08) 68%, transparent 78%)",
            }}
          />
        </div>

        {/* Content stack. All items centered horizontally (via flex
            items-center on the section) and stacked vertically with
            deliberate gaps so the hierarchy reads as:
              LOGO  ->  eyebrow  ->  tagline  ->  instructions  ->  tabs
            No "Events" h1 - the logo is the heading. */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center max-w-3xl"
          variants={staggerContainerSlow}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          {/* THE EMBLEM. Sized to breakpoint - critically, the "xl"
              preset (246px tall) is only used at `xl:` (1280px+), not
              at `lg:` (1024+), because a common short-laptop resolution
              is 1366x768 (lg width, only 768px tall) where a 246px
              logo pushes the tabs into the scroll indicator at the
              bottom. Restricting xl-size to viewports that are usually
              also >=800px tall avoids that collision without needing a
              height-based media query. */}
          <motion.div variants={fadeIn} className="mb-6 sm:mb-8">
            <div className="hidden xl:block">
              <TechAstraLogo size="xl" showGlow={false} />
            </div>
            <div className="hidden sm:block xl:hidden">
              <TechAstraLogo size="lg" showGlow={false} />
            </div>
            <div className="sm:hidden">
              <TechAstraLogo size="md" showGlow={false} />
            </div>
            {/* showGlow=false: the section-level radial glow above is
                already providing the halo - the logo's built-in
                per-instance glow would stack and get muddy. */}
          </motion.div>

          {/* Eyebrow: the ~11px letter-spaced uppercase line that Rolls-
              Royce uses right under the wordmark. */}
          <motion.p
            variants={fadeUp}
            className="text-[11px] sm:text-xs tracking-cinematic uppercase text-arc mb-5"
          >
            Eight Tracks. One Day.
          </motion.p>

          {/* Serif tagline. Light weight, wide leading - editorial, not
              marketing-y. Sizes tuned down from 2xl/3xl/4xl to fit
              720-800px-tall laptops without overflowing the hero. */}
          <motion.p
            variants={fadeUp}
            className="font-serif font-light text-xl sm:text-2xl lg:text-3xl text-offwhite/85 leading-snug tracking-tight max-w-2xl mb-6 sm:mb-8"
          >
            Where technical brilliance meets cultural celebration.
          </motion.p>

          {/* Instructional subtext - kept small and quiet. */}
          <motion.p
            variants={fadeUp}
            className="text-offwhite/55 text-sm sm:text-[15px] max-w-xl leading-relaxed mb-9 sm:mb-11"
          >
            Drag or use the arrow keys to browse the collection. Adding an event that overlaps one
            already in your cart is blocked automatically.
          </motion.p>

          {/* Category filter tabs - centered, evenly spaced, underlined
              on active. This lives in the hero (visible above the fold)
              so users see the split before scrolling to the portfolio. */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-8 sm:gap-10">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setCategoryFilter(f.key)}
                className={`text-[11px] tracking-cinematic uppercase pb-2 border-b transition-colors ${
                  categoryFilter === f.key
                    ? "text-arc border-arc"
                    : "text-offwhite/50 border-transparent hover:text-offwhite"
                }`}
                data-log={`events-filter-${f.key}`}
              >
                {f.label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll-down indicator ("DISCOVER" hairline) removed. Once
            the hero was tightened to `min-h-[calc(100vh-8rem)]` so the
            portfolio peeks in at the bottom of the viewport (which is
            what makes the page feel continuous rather than page-broken),
            the absolute-positioned indicator at `bottom-8` collided
            directly with the filter tabs at the bottom of the centered
            content stack - the "DISCOVER" text and its vertical line
            were rendering ON TOP of "ALL EVENTS / TECHNICAL / NON-
            TECHNICAL". Since the portfolio's eyebrow already visually
            announces "there's more below", the indicator was doing a
            job the content itself was already doing. */}

        {/* Corner metadata tags removed - they were purely decorative
            (magazine-style dateline), but combined with the centered
            "DISCOVER" indicator they formed a horizontal bar across
            the bottom of the hero that read as a page footer, which
            reinforced the "this is a separate page from what's below"
            feel. Left the scroll indicator alone since it's a
            functional affordance (click to scroll to portfolio), not
            decoration. */}
      </section>

      {/* ==================================================================
          PORTFOLIO SECTION - the actual event carousel
          ==================================================================
          Separated from the hero by a thin top hairline (border-white/5)
          so the transition into the browse section reads as an
          intentional editorial break rather than the page just
          continuing. The section has its own eyebrow + serif title so
          it feels like turning a magazine page rather than a scroll
          into more marketing content. */}
      {/* No `border-t` between sections - the page reads as ONE
          continuous canvas rather than a stack of separate slides. The
          cinematic backdrop video (mounted once in App.jsx) already
          provides visual continuity behind everything; a hairline
          divider on top of that just looked like a page-break line.
          Top padding kept lighter than bottom so the "THE PORTFOLIO"
          eyebrow feels like it's continuing from the hero rather than
          opening a new section. */}
      <section className="relative pt-8 pb-10 sm:pt-12 sm:pb-14">
        <motion.div
          className="max-w-2xl mx-auto text-center px-6 mb-12 sm:mb-16"
          variants={staggerContainer}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        >
          <motion.p
            variants={fadeUp}
            className="text-[11px] tracking-cinematic uppercase text-arc mb-4"
          >
            The Portfolio
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-serif font-light text-3xl sm:text-4xl lg:text-5xl text-offwhite leading-tight tracking-tight mb-6"
          >
            Discover the Event Collection
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-offwhite/55 text-sm sm:text-base leading-relaxed"
          >
            Eight tracks, curated across a single day. Each event stands on its own - browse the
            row, then step into any one for the full story.
          </motion.p>
        </motion.div>

        {loading && (
          <p className="text-offwhite/50 text-center py-20 text-sm tracking-wide">Loading events...</p>
        )}

        {!loading && visibleEvents.length === 0 && (
          <p className="text-offwhite/50 text-center py-20 text-sm tracking-wide">
            No events in this category yet.
          </p>
        )}

        {!loading && visibleEvents.length > 0 && (
          <>
            {/* Re-key on the filter so the carousel resets fully
                whenever the underlying slide list changes (fresh
                internal state, no stranded scroll position from the
                previous category). */}
            <EventsCoverFlow
              key={categoryFilter}
              slides={slides}
              onActiveChange={handleActiveChange}
              onSlideOpen={handleSlideOpen}
              label="Events carousel"
              className="max-w-6xl mx-auto"
            />

            {/* Details block for whichever event is currently centered.
                Cross-fades in whenever the centered event changes. Kept
                inside the same section as the carousel so the visual
                relationship (image row above -> details below) reads at
                a glance. */}
            <AnimatePresence mode="wait">
              {focusedEvent && (
                <motion.div
                  key={focusedEvent.id}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE_CINEMATIC }}
                  className="max-w-2xl mx-auto px-6 mt-4 text-center"
                >
                  <p className="text-[10px] tracking-cinematic uppercase text-arc mb-3">
                    {focusedEvent.track ||
                      (focusedEvent.category === "non_technical" ? "Non-Technical" : "Technical")}
                  </p>
                  <h3 className="font-serif font-light text-2xl sm:text-3xl text-offwhite leading-tight mb-4">
                    {focusedEvent.name}
                  </h3>
                  {focusedEvent.description && (
                    <p className="text-offwhite/60 text-sm leading-relaxed mb-5 max-w-md mx-auto">
                      {focusedEvent.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-offwhite/55 text-[11px] tracking-wide mb-6">
                    <span>
                      {formatTime(focusedEvent.startTime)} &mdash; {formatTime(focusedEvent.endTime)}
                    </span>
                    <span>{focusedEvent.venue || "Venue TBA"}</span>
                    {focusedEvent.isTeamEvent && <span>Team event</span>}
                  </div>
                  <div className="flex items-center justify-center gap-8 mb-6">
                    <p className="font-serif text-xl text-offwhite">&#8377;{focusedEvent.fee}</p>
                    <p className="text-offwhite/70 text-[11px] font-medium tracking-wide">
                      {focusedEvent.seatsAvailable <= 0
                        ? "Seats full"
                        : `${focusedEvent.seatsAvailable} of ${focusedEvent.maxSeats} left`}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <Link
                      to={`/events/${focusedEvent.id}`}
                      data-log={`events-carousel-view-${focusedEvent.id}`}
                    >
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {inCart(focusedEvent.id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(focusedEvent)}
                        data-log={`events-carousel-remove-${focusedEvent.id}`}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={focusedEvent.seatsAvailable <= 0}
                        onClick={() => handleAdd(focusedEvent)}
                        data-log={`events-carousel-add-${focusedEvent.id}`}
                      >
                        {focusedEvent.seatsAvailable <= 0 ? "Full" : "Add to Cart"}
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </section>

      {/* ==================================================================
          CONTINUE THE JOURNEY - closing editorial CTA
          ==================================================================
          Quiet, dark, RR-style. Not a bright marketing panel - a full-
          width block with generous vertical padding, a thin eyebrow, a
          serif line, and one or two ghost buttons. Shown regardless of
          cart state (the buttons themselves adapt).  */}
      {/* Same reasoning as the portfolio section above: no `border-t`
          so the page reads as one continuous scroll rather than a
          separate closing panel. Top padding trimmed from py-24/py-32
          to pt-10/pt-14 (bottom kept generous) - the portfolio section
          above already reserves its own pb-10/pb-14, so using the full
          py-24 here on top of that stacked up to ~240px of dead empty
          space between the Add to Cart button and "Continue the
          Journey". */}
      <section className="relative pt-10 pb-24 sm:pt-14 sm:pb-32 text-center px-6">
        <motion.div
          className="max-w-2xl mx-auto"
          variants={staggerContainer}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        >
          <motion.p
            variants={fadeUp}
            className="text-[11px] tracking-cinematic uppercase text-arc mb-4"
          >
            Continue the Journey
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-serif font-light text-3xl sm:text-4xl text-offwhite leading-tight tracking-tight mb-6"
          >
            {items.length > 0
              ? "Your selections await."
              : "Choose your events. Craft your day."}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-offwhite/55 text-sm sm:text-base leading-relaxed mb-10 max-w-lg mx-auto"
          >
            {items.length > 0
              ? `${items.length} event${items.length === 1 ? "" : "s"} in your cart. Review and complete registration when you're ready.`
              : "Add any event above to begin. Everything comes together on the registration screen."}
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 flex-wrap">
            {items.length > 0 && (
              <Link to="/cart" data-log="events-cta-view-cart">
                <Button variant="outline" size="md">
                  View Cart
                </Button>
              </Link>
            )}
            <Link to="/register" data-log="events-cta-register">
              <Button size="md">
                {items.length > 0 ? "Complete Registration" : "Begin Registration"}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
