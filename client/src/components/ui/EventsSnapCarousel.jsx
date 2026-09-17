import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * EventsSnapCarousel
 * ------------------
 * A clean, Rolls-Royce-editorial style horizontal scroll-snap carousel
 * built for the Events landing page. Replaces the earlier
 * CoverflowCarousel on that page (kept elsewhere in the codebase for
 * anyone who still wants the 3D tilt style).
 *
 * KEY BEHAVIOR CHANGES vs the initial version:
 *
 *   1. Active-card detection is now "closest to the visual center of
 *      the track", NOT "highest IntersectionObserver ratio". The old
 *      approach was wrong when three or more cards were fully visible
 *      at the same time (all had ratio === 1) - it fell back to the
 *      first one in DOM order (i.e. the leftmost visible card), which
 *      is why "Paper Presentation" was highlighted even though "Poster
 *      Presentation" was clearly the one in the middle of the viewport.
 *      Distance-to-center matches what the user's eye already thinks
 *      the "centered" card is.
 *
 *   2. The track has generous side padding (`px-[50%]`-ish, via a real
 *      calc so it works with card width) so the FIRST and LAST cards
 *      can actually scroll-snap to the center. Without this, at
 *      scrollLeft=0 the first card is stuck at the left edge with no
 *      room to shift right and center itself - the whole carousel
 *      reads as permanently unbalanced.
 *
 *   3. Prev/Next arrows now have a solid dark backdrop + higher
 *      contrast border so they stay legible when they happen to
 *      overlap card artwork rather than empty background.
 */

export default function EventsSnapCarousel({
  slides,
  onActiveChange,
  showNavigation = true,
  label = "Events carousel",
  className,
}) {
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset our internal refs array whenever the slide list changes size.
  cardRefs.current = useMemo(() => new Array(slides.length).fill(null), [slides.length]);

  // Fire the parent's onActiveChange whenever the centered slide changes.
  useEffect(() => {
    if (typeof onActiveChange === "function") {
      onActiveChange(activeIndex);
    }
  }, [activeIndex, onActiveChange]);

  // Reset active index + scroll position whenever the underlying slide
  // list changes (e.g. the parent switches Technical/Non-Technical
  // filter). Also center the first card by scrolling it into view -
  // simply resetting scrollLeft to 0 wouldn't center the first card
  // now that the track has left padding equal to half the container
  // width (see the padding math on the track element below).
  useEffect(() => {
    setActiveIndex(0);
    // Use RAF so the DOM has laid out with the new slides before we
    // measure/scroll (otherwise `cardRefs.current[0]` might still be a
    // node from the previous list on the first paint after a filter
    // switch).
    const id = requestAnimationFrame(() => {
      cardRefs.current[0]?.scrollIntoView({
        behavior: "auto",
        inline: "center",
        block: "nearest",
      });
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, slides[0]?.title]);

  // ACTIVE DETECTION - "closest to track center" instead of "biggest
  // intersection ratio". Runs on every scroll frame, throttled by rAF
  // so the O(N) sweep happens at most once per paint.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || slides.length === 0) return;

    let rafId = null;

    const measure = () => {
      rafId = null;
      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;

      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < cardRefs.current.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        // Skip cards that are completely off-screen (this can happen
        // during fast fling scrolls where every card is briefly out of
        // bounds - we don't want to snap the "active" state to whatever
        // happens to be nearest an empty region).
        if (r.right < trackRect.left || r.left > trackRect.right) continue;
        const cardCenter = r.left + r.width / 2;
        const dist = Math.abs(cardCenter - trackCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      setActiveIndex((prev) => (prev === bestIdx ? prev : bestIdx));
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(measure);
    };

    // Initial measure so the very first paint has the correct active
    // index (before the user has scrolled at all).
    measure();

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [slides.length]);

  // scrollBy an amount equal to one card + one gap, measured LIVE from
  // the DOM so the JSX can change card width/gap without also updating
  // a hardcoded constant here.
  const scrollByOneCard = useCallback((direction) => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = cardRefs.current[0];
    if (!firstCard) return;
    const cardWidth = firstCard.getBoundingClientRect().width;
    const trackStyle = window.getComputedStyle(track);
    const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || "0") || 0;
    const step = (cardWidth + gap) * direction;
    track.scrollBy({ left: step, behavior: "smooth" });
  }, []);

  if (slides.length === 0) return null;

  return (
    <div className={cn("relative", className)} aria-roledescription="carousel" aria-label={label}>
      {/*
        THE SCROLL TRACK.

        Left/right padding = 50% of the track width minus half a card
        width, so the first card can slide right into the center of the
        viewport (scrollLeft = 0 places its left edge at the padding
        boundary, which IS the center of the track). Same trick on the
        right so the last card can also center.

        Tailwind can't express "50% of self minus 140px" in a single
        utility, so it lives in the inline `paddingInline` style. Values:
          - Mobile card width 240px  -> padding = calc(50% - 120px)
          - Desktop card width 280px -> padding = calc(50% - 140px)
        We use the desktop value uniformly - a slightly larger padding
        on mobile is harmless (the first/last cards just get a little
        extra breathing room, they still center via scroll-snap-align).

        `tabIndex={0}` lets keyboard users focus the track and use
        Left/Right/Home/End natively.

        `scroll-smooth snap-x snap-mandatory` is what actually creates
        the "settles onto a card" feel.
      */}
      <div
        ref={trackRef}
        tabIndex={0}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide py-10 focus:outline-none"
        style={{ paddingInline: "calc(50% - 140px)" }}
      >
        {slides.map((slide, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={`${slide.title}-${i}`}
              type="button"
              ref={(el) => (cardRefs.current[i] = el)}
              data-index={i}
              onClick={() => {
                // Clicking a non-centered card centers it.
                cardRefs.current[i]?.scrollIntoView({
                  behavior: "smooth",
                  inline: "center",
                  block: "nearest",
                });
              }}
              className={cn(
                "group relative flex-none snap-center overflow-hidden text-left transition-all duration-500 ease-out",
                // Fixed portrait card dimensions - identical across the
                // row so the visual rhythm reads as an editorial gallery
                // rather than a variable-size collage.
                "w-[240px] h-[340px] sm:w-[280px] sm:h-[380px]",
                // Base treatment: thin border, dark card, subtle blur so
                // the app's cinematic backdrop shows through faintly.
                "rounded-sm border border-white/10 bg-void/40 backdrop-blur-sm",
                // Active vs non-active: only the CENTER card is fully
                // lit. Everything else recedes so the eye knows where
                // to look. The scale-down on non-active cards is what
                // creates the "one card is the focus" feel without
                // needing any 3D tilt.
                isActive
                  ? "scale-[1.04] border-arc/50 shadow-[0_0_40px_rgba(242,194,48,0.28)] z-10 opacity-100"
                  : "scale-[0.94] opacity-55 hover:opacity-80"
              )}
              aria-label={`${i + 1} of ${slides.length}: ${slide.title}`}
              aria-current={isActive ? "true" : undefined}
              data-log={`events-carousel-card-${i}`}
            >
              {slide.src && (
                <img
                  src={slide.src}
                  alt={slide.alt || slide.title || ""}
                  loading={i < 3 ? "eager" : "lazy"}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              )}

              {/* Bottom scrim + caption. */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                {slide.subtitle && (
                  <p className="text-[9px] tracking-cinematic uppercase text-arc/90 mb-1.5">
                    {slide.subtitle}
                  </p>
                )}
                {slide.title && (
                  <p className="font-serif text-base sm:text-lg text-offwhite leading-tight">
                    {slide.title}
                  </p>
                )}
              </div>

              {/* Active-state hairline along the top - a color-independent
                  cue for the centered card (useful when the image itself
                  already has a lot of gold in it and the shadow glow
                  gets absorbed). */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-0 left-0 right-0 h-px transition-opacity duration-500",
                  isActive ? "bg-gold/70 opacity-100" : "opacity-0"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Prev/Next arrows. Solid dark backdrop + arc-tinted border on
          hover so they stay readable when overlapping card artwork
          rather than empty background. Hidden below `sm` (mobile is
          touch-drag). */}
      {showNavigation && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollByOneCard(-1)}
            aria-label="Previous event"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full items-center justify-center bg-void/85 border border-white/25 text-offwhite backdrop-blur-md shadow-lg transition-colors hover:bg-void hover:text-arc hover:border-arc/60 z-20"
            data-log="events-carousel-prev"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 6 9 12 15 18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByOneCard(1)}
            aria-label="Next event"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full items-center justify-center bg-void/85 border border-white/25 text-offwhite backdrop-blur-md shadow-lg transition-colors hover:bg-void hover:text-arc hover:border-arc/60 z-20"
            data-log="events-carousel-next"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </>
      )}

      {/* Pagination hairline row - understated "where am I" cue. */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 pb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                cardRefs.current[i]?.scrollIntoView({
                  behavior: "smooth",
                  inline: "center",
                  block: "nearest",
                });
              }}
              aria-label={`Go to event ${i + 1} of ${slides.length}`}
              aria-current={i === activeIndex ? "true" : undefined}
              className={cn(
                "h-px transition-all duration-500 ease-out",
                i === activeIndex ? "w-8 bg-arc" : "w-4 bg-offwhite/25 hover:bg-offwhite/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
