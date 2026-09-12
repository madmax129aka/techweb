import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import AnnouncementBanner from "../components/AnnouncementBanner";
import TechAstraLogo from "../components/TechAstraLogo";
import VisionStone from "../components/VisionStone";
import VisionPillars from "../components/VisionPillars";
import { api } from "../lib/api";
import { usePanels } from "../context/PanelContext";

/**
 * "Rolls-Royce cinematic" homepage: distinct full-bleed sections, each
 * given room to breathe, rather than a dense grid of cards - matching
 * the reference site's layout philosophy
 * (rolls-roycemotorcars.com/en_GB/home.html):
 *   hero carousel -> "Explore Further" image-card row -> theme pillars.
 */

const AUTOPLAY_MS = 7000;

// "Explore Further" - exactly 3 cards per the reference site's pattern
// (Events / Leaderboard / Gallery). Registration/Verify-Certificate are
// reachable via the header and the slide-in registration panel instead
// of competing for space here.
const EXPLORE_CARDS = [
  {
    to: "/events",
    title: "Events",
    desc: "Eight tracks of competition across a single unforgettable day.",
    accent: "crimson",
  },
  {
    to: "/leaderboard",
    title: "Leaderboard",
    desc: "Live results as they're announced, event by event.",
    accent: "arc",
  },
  {
    to: "/gallery",
    title: "Gallery",
    desc: "Moments from past editions of TechAstra.",
    accent: "crimson",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { openPanel } = usePanels();
  const timerRef = useRef(null);

  useEffect(() => {
    api
      .get("/api/events")
      .then((data) => setFeatured((data.events || [])[0] || null))
      .catch(() => {});
  }, []);

  // Full-bleed hero carousel: 2-3 slides, each a short two-line headline
  // and a single understated text-link CTA - per the reference site's
  // "one campaign per slide" pattern. Slide 2 adapts to whichever event
  // loads first as the "flagship event close-up" slide.
  const slides = [
    {
      key: "intro",
      eyebrow: "National Level Symposium \u00b7 2026",
      heading: (
        <>
          The Future is <span className="italic text-crimson-light">Vision</span>
        </>
      ),
      body: "Virtual Intelligence. Information Security. Sustainable Innovation. Intelligent Healthcare. Optimization & Automation. Next-generation Networks.",
      cta: { label: "Explore Events", to: "/events" },
      tint: "from-crimson/25 via-void to-arc/10",
    },
    {
      key: "flagship",
      eyebrow: "Flagship Event",
      heading: featured ? featured.name : "Eight Tracks. One Day.",
      body: featured
        ? featured.description
        : "From code to circuitry, every track of TechAstra converges on a single unforgettable day.",
      cta: { label: "Discover More", to: "/events" },
      tint: "from-arc/20 via-void to-crimson/10",
    },
    {
      key: "registrations",
      eyebrow: "Now Open",
      heading: "Registrations Are Open",
      body: "Individual or team \u2014 secure your place across every track before seats close.",
      cta: { label: "Register Now", action: "openPanel" },
      tint: "from-crimson/30 via-void to-crimson/5",
    },
  ];

  const goTo = useCallback((i) => {
    setSlideIndex((i + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => goTo(slideIndex + 1), [goTo, slideIndex]);
  const prev = useCallback(() => goTo(slideIndex - 1), [goTo, slideIndex]);

  // Autoplay, paused while the hero is hovered - restarts its timer
  // whenever the active slide changes (manual navigation resets the clock).
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [slideIndex, paused, slides.length]);

  const activeSlide = slides[slideIndex];

  const handleCta = (slide) => {
    if (slide.cta.action === "openPanel") {
      openPanel("registration");
    }
  };

  return (
    <div>
      {/* ================= HERO CAROUSEL ================= */}
      {/* Negative top margin pulls this section up behind the fixed,
          transparent navbar (App.jsx reserves pt-[76px] on <main> for
          every other page) so the hero image runs truly full-bleed. */}
      <section
        className="section-cinematic -mt-[76px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="grain-overlay" />

        {/* Floating "Vision Stone" - a WebGL glass/crystal gem (real
            refraction via React Three Fiber + drei's
            MeshTransmissionMaterial), kept off to one side behind the
            hero copy rather than centered, so it doesn't compete with
            readability - "one signature visual moment," not a
            centerpiece grid of stats/cards. VisionStone transparently
            falls back to the pure-CSS Polyhedron3D gem itself (no WebGL
            support, prefers-reduced-motion, or a render error), so no
            conditional rendering is needed here. */}
        <div className="absolute right-[6%] top-1/2 -translate-y-1/2 opacity-80 hidden lg:block z-[1]">
          <VisionStone size={340} />
        </div>

        {/* Each slide is layered absolutely and crossfaded via opacity -
            a slow, deliberate transition rather than a hard cut. */}
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            className={`cinematic-scrim bg-cinematic-overlay bg-gradient-to-br ${slide.tint} transition-opacity duration-1000 ease-in-out ${
              i === slideIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
            aria-hidden={i !== slideIndex}
          />
        ))}

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 text-center">
          {slideIndex === 0 && (
            <div className="flex justify-center mb-8 animate-cinematic-fade">
              <TechAstraLogo size="lg" />
            </div>
          )}

          <div key={activeSlide.key} className="animate-cinematic-fade">
            <p className="text-arc text-[11px] sm:text-xs tracking-cinematic uppercase mb-6">
              {activeSlide.eyebrow}
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-offwhite mb-6">
              {activeSlide.heading}
            </h1>
            <p className="text-offwhite/60 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
              {activeSlide.body}
            </p>

            {activeSlide.cta.to ? (
              <Link to={activeSlide.cta.to}>
                <Button variant="link" data-log={`hero-slide-${activeSlide.key}-cta`}>
                  {activeSlide.cta.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="link"
                onClick={() => handleCta(activeSlide)}
                data-log={`hero-slide-${activeSlide.key}-cta`}
              >
                {activeSlide.cta.label}
              </Button>
            )}
          </div>
        </div>

        {/* Manual controls: prev/next arrows */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-offwhite/40 hover:text-arc transition-colors text-2xl z-20"
          data-log="hero-carousel-prev"
        >
          &#8249;
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-offwhite/40 hover:text-arc transition-colors text-2xl z-20"
          data-log="hero-carousel-next"
        >
          &#8250;
        </button>

        {/* Manual controls: slide indicator dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === slideIndex}
              className="p-1.5"
              data-log={`hero-carousel-dot-${i}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === slideIndex ? "w-6 h-1.5 bg-arc" : "w-1.5 h-1.5 bg-offwhite/40"
                }`}
              />
            </button>
          ))}
        </div>
      </section>

      <AnnouncementBanner />

      {/* ================= EXPLORE FURTHER ================= */}
      <section className="py-24 sm:py-32 border-t border-crimson/10">
        <div className="max-w-6xl mx-auto px-6 mb-14 text-center">
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Explore Further</p>
          <h2 className="font-serif text-2xl sm:text-4xl text-offwhite">Everything TechAstra, at a glance</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3">
          {EXPLORE_CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group relative aspect-[4/5] overflow-hidden border-r border-b border-crimson/10 last:border-r-0"
              data-log={`explore-${card.title.toLowerCase()}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-t ${
                  card.accent === "crimson" ? "from-crimson/40 via-crimson/5" : "from-arc/25 via-arc/5"
                } to-transparent transition-transform duration-700 ease-out group-hover:scale-105`}
              />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-8">
                <h3 className="font-serif text-xl sm:text-2xl text-offwhite mb-2">{card.title}</h3>
                <p className="text-offwhite/55 text-xs sm:text-sm leading-relaxed mb-4 max-w-[220px]">
                  {card.desc}
                </p>
                <span className="text-[10px] tracking-cinematic uppercase text-arc opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Discover More &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <VisionPillars />
    </div>
  );
}
