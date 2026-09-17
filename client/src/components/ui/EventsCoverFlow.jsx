import React, { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * EventsCoverFlow
 * ---------------
 * Ported from a 21st.dev TypeScript demo ("CoverFlowCarousel.tsx") to
 * plain JSX for this project (this codebase is Vite + JSX, not TS/Next).
 *
 * REPLACES the earlier EventsSnapCarousel on the Events landing page.
 * We only run ONE portfolio carousel on that page - having both would
 * mean the user browses cards, gets settled, and is then handed another
 * carousel doing the same job. This CoverFlow version has the drama
 * that the earlier flat scroll-snap didn't (a real "centerpiece"
 * browsing moment), while also avoiding the mess of the ORIGINAL
 * coverflow-carousel.jsx (which tilted cards so aggressively that
 * neighbors overlapped and hid each other).
 *
 * Fixes applied while porting (the pasted source had real bugs, not
 * just TS types to strip):
 *   - Two broken template literals - the source wrote:
 *         className=`...${className}`         (missing = and {})
 *         aria-label=`Go to slide ${idx+1}`   (same shape)
 *     Both are proper JSX expression forms now:
 *         className={cn(..., className)}
 *         aria-label={`Go to slide ${idx + 1}`}
 *   - "use client" directive removed (Vite doesn't recognize it).
 *   - All TS types/interfaces stripped.
 *   - Hardcoded "Butter Chicken / Tandoori Chops" default items removed
 *     - parent MUST pass real slides now.
 *   - Palette remapped from the source's warm-tan #c5a880 / #0c0a09
 *     restaurant palette to this project's tokens: gold #D9A840 (from
 *     the TechAstra logo artwork), void #0D0303 (base), offwhite
 *     #F5F3F0 (text), arc #22D3EE (the tiny track-name eyebrow, since
 *     that's the accent color used everywhere else on this site for
 *     that role).
 *   - In-card CTA button removed. The pasted source had a "View Menu"
 *     pill on each centered card - but on this page the primary action
 *     is stateful (Add to Cart / Remove for THIS event, disabled when
 *     seats are full), which lives cleanly in the parent's details bar
 *     under the carousel. Duplicating a static "View Details" CTA
 *     inside the card AND having the same button below would be
 *     visually noisy and hide the more important Add-to-Cart control.
 *   - Autoplay defaults to `false`. The Events page copy explicitly
 *     says "Drag or use the arrow keys to browse" - autoplay is
 *     hostile to that instruction and to users doing considered
 *     selection. The parent can opt it back on if desired.
 *   - Added an `onActiveChange(index)` prop so the parent's details
 *     bar can follow whichever card is centered (same contract as the
 *     earlier EventsSnapCarousel, so the Events.jsx wiring is a
 *     one-line prop swap).
 *
 * Slide shape (each item in `slides` prop):
 *   {
 *     src:      string,                  // image URL
 *     alt?:     string,                  // img alt text
 *     title:    string,                  // event name (main headline)
 *     subtitle?: string,                 // small track eyebrow
 *     desc?:    string,                  // one-line description on card
 *   }
 */

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export default function EventsCoverFlow({
  slides = [],
  onActiveChange,
  onSlideOpen,
  autoplay = false,
  autoplayDelay = 6000,
  className,
  label = "Events carousel",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx) => {
    if (total === 0) return;
    setCurrentIndex(((idx % total) + total) % total);
  };

  // Reset to first slide whenever the slide LIST changes (e.g. the
  // parent switches Technical/Non-Technical filter). Keyed on
  // total + first title so we react to actual content change, not just
  // a re-render of the same array reference.
  useEffect(() => {
    setCurrentIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, slides[0]?.title]);

  // Fire parent's onActiveChange whenever the centered slide changes.
  useEffect(() => {
    if (typeof onActiveChange === "function") {
      onActiveChange(currentIndex);
    }
  }, [currentIndex, onActiveChange]);

  // Autoplay - only when enabled AND user isn't hovering AND we have
  // more than one slide. Paused-on-hover matches the pattern users
  // expect from image carousels (they stop moving while you're reading).
  useEffect(() => {
    if (!autoplay || isHovered || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, nextSlide, total]);

  // Keyboard arrows - scoped to `window` because the carousel might not
  // hold DOM focus but users still expect Left/Right to work when
  // they're clearly looking at it. Left as-is from the original.
  useEffect(() => {
    if (total <= 1) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, total]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!slides || total === 0) return null;

  return (
    <section
      className={cn(
        "relative w-full min-h-[720px] flex items-center justify-center overflow-hidden py-12 select-none",
        className
      )}
      style={{
        // Genuinely transparent - no background color, no ambience
        // scrim. The AMBIENCE layer that used to live here (a blurred
        // copy of the centered card's photo behind a near-opaque
        // rgba(13,3,3,0.95) radial gradient) was effectively painting
        // a solid black rectangle over the whole section, blocking the
        // shared cinematic video backdrop (mounted once in App.jsx)
        // that every other section on this page shows through. Removed
        // entirely rather than just lowering its opacity, since the
        // effect it was going for (room glows with the color of the
        // centered card) fought the "clean over transparent hero
        // footage" language established site-wide.
        color: "#F5F3F0",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative w-full max-w-6xl mx-auto px-4 z-10 flex flex-col items-center">
        {/* THE 3D COVERFLOW STAGE.
            perspective creates the depth for the rotateY() transforms
            on the neighbor cards. 5-card visible window (center + 2
            on each side) - if `total < 5` we only show what exists
            (extra offsets just fall into the invisible default state). */}
        <div
          className="relative w-full h-[520px] flex justify-center items-center mb-8"
          style={{ perspective: "1400px" }}
        >
          {slides.map((slide, idx) => {
            const offset = (idx - currentIndex + total) % total;
            let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
            let opacity = 0;
            let zIndex = 0;
            let filter = "brightness(0.4) blur(2px)";
            let isCenter = false;

            if (offset === 0) {
              // The CENTER card - fully lit, front-facing, no rotation.
              isCenter = true;
              transform = "translateX(0px) scale(1) rotateY(0deg)";
              opacity = 1;
              zIndex = 30;
              filter = "brightness(1)";
            } else if (offset === 1) {
              // Immediate right neighbor - tilts away from viewer,
              // slight scale down, mid opacity.
              transform = "translateX(285px) scale(0.84) rotateY(-24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === 2) {
              // Far-right - deeper tilt, smaller, dimmer.
              transform = "translateX(510px) scale(0.68) rotateY(-38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            } else if (offset === total - 1) {
              // Immediate left neighbor.
              transform = "translateX(-285px) scale(0.84) rotateY(24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === total - 2) {
              // Far-left.
              transform = "translateX(-510px) scale(0.68) rotateY(38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            }

            return (
              <div
                key={`${slide.title}-${idx}`}
                // Clicking a SIDE card re-centers it (standard coverflow
                // browsing gesture). Clicking the CENTERED card opens
                // that event's detail page via the parent's
                // `onSlideOpen` callback - without this, clicking the
                // one card that's actually front-and-center and fully
                // interactive did nothing at all, which is exactly what
                // was reported.
                onClick={() => {
                  if (isCenter) {
                    onSlideOpen?.(idx, slide);
                  } else {
                    goToSlide(idx);
                  }
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${idx + 1} of ${total}: ${slide.title}`}
                aria-current={isCenter ? "true" : undefined}
                data-log={`events-coverflow-card-${idx}`}
                style={{
                  position: "absolute",
                  width: "330px",
                  height: "500px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#1A0505",
                  border: isCenter
                    ? "1px solid rgba(217,168,64,0.35)"
                    : "1px solid rgba(255,255,255,0.10)",
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformOrigin: "center center",
                  transition: "all 800ms cubic-bezier(0.25, 1, 0.5, 1)",
                  boxShadow: isCenter
                    ? "0 25px 60px rgba(0,0,0,0.9), 0 0 42px rgba(217,168,64,0.28)"
                    : "0 15px 35px rgba(0,0,0,0.5)",
                  // Was `"default"` for the center card, which visually
                  // told users "this isn't clickable" - exactly wrong,
                  // since it's the one card that opens the event page.
                  cursor: "pointer",
                }}
              >
                {/* Card photo. eager-load the 5 cards in the visible
                    window, lazy-load the rest. */}
                {slide.src && (
                  <img
                    src={slide.src}
                    alt={slide.alt || slide.title || ""}
                    loading={Math.abs(idx - currentIndex) <= 2 ? "eager" : "lazy"}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}

                {/* Dark scrim over the photo - keeps text legible
                    without needing a solid caption bar. */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.95) 100%)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />

                {/* Content overlay - track eyebrow (top-right), title +
                    description (bottom-centered). Fades in only on the
                    center card so the neighbors read as purely visual
                    thumbnails rather than three simultaneous captions
                    competing for attention. */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    padding: "22px 20px 26px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "center",
                    zIndex: 20,
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? "translateY(0px)" : "translateY(16px)",
                    transition: "opacity 500ms ease, transform 500ms ease",
                    pointerEvents: isCenter ? "auto" : "none",
                  }}
                >
                  {slide.subtitle && (
                    <div style={{ textAlign: "right", width: "100%" }}>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "0.66rem",
                          fontWeight: 500,
                          letterSpacing: "0.28em",
                          textTransform: "uppercase",
                          color: "#22D3EE",
                          textShadow: "0 2px 6px rgba(0,0,0,0.85)",
                        }}
                      >
                        {slide.subtitle}
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "3px",
                      marginTop: "auto",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.65rem",
                        fontWeight: 400,
                        color: "#F5F3F0",
                        margin: 0,
                        lineHeight: 1.15,
                        letterSpacing: "-0.005em",
                        textShadow: "0 3px 12px rgba(0,0,0,0.95)",
                      }}
                    >
                      {slide.title}
                    </h3>

                    <div
                      aria-hidden="true"
                      style={{
                        width: "36px",
                        height: "1px",
                        backgroundColor: "#D9A840",
                        margin: "12px auto 10px",
                        boxShadow: "0 0 8px rgba(217,168,64,0.7)",
                      }}
                    />

                    {slide.desc && (
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "rgba(245,243,240,0.78)",
                          maxWidth: "260px",
                          margin: 0,
                          lineHeight: 1.45,
                          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                        }}
                      >
                        {slide.desc}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PREV / NEXT arrows. Absolute-positioned inside the section,
            circular ghost buttons, higher contrast than the earlier
            snap carousel had so they stay readable when they overlap
            neighbor card artwork. */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous event"
              className="hidden sm:flex"
              data-log="events-coverflow-prev"
              style={{
                position: "absolute",
                left: "24px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "48px",
                height: "48px",
                borderRadius: "9999px",
                backgroundColor: "rgba(13,3,3,0.72)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "#F5F3F0",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                zIndex: 40,
                transition: "all 200ms ease",
              }}
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next event"
              className="hidden sm:flex"
              data-log="events-coverflow-next"
              style={{
                position: "absolute",
                right: "24px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "48px",
                height: "48px",
                borderRadius: "9999px",
                backgroundColor: "rgba(13,3,3,0.72)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "#F5F3F0",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                zIndex: 40,
                transition: "all 200ms ease",
              }}
            >
              <ChevronRightIcon />
            </button>
          </>
        )}

        {/* PAGINATION dots - understated pill row, expands the active
            one horizontally for a "where am I in the collection" cue. */}
        {total > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              zIndex: 30,
            }}
          >
            {slides.map((_, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to event ${idx + 1} of ${total}`}
                  aria-current={isActive ? "true" : undefined}
                  data-log={`events-coverflow-dot-${idx}`}
                  style={{
                    height: "6px",
                    width: isActive ? "28px" : "6px",
                    borderRadius: "9999px",
                    backgroundColor: isActive ? "#D9A840" : "rgba(245,243,240,0.25)",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: isActive ? "0 0 10px rgba(217,168,64,0.6)" : "none",
                    transition: "all 300ms ease",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
