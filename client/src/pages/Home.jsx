import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import AnnouncementBanner from "../components/AnnouncementBanner";
import TechAstraLogo from "../components/TechAstraLogo";
import Polyhedron3D from "../components/Polyhedron3D";
import VisionPillars from "../components/VisionPillars";
import { api } from "../lib/api";

/**
 * "Rolls-Royce cinematic" homepage: distinct full-bleed sections, each
 * given room to breathe, rather than a dense grid of cards. One idea per
 * screen - hero, then a single featured/flagship event, then a quiet
 * "Explore Further" image-card row - matching the reference site's
 * layout philosophy (rolls-roycemotorcars.com/en_GB/home.html).
 */

const EXPLORE_CARDS = [
  {
    to: "/events",
    title: "Events",
    desc: "Eight tracks of competition across a single unforgettable day.",
    accent: "crimson",
  },
  {
    to: "/register",
    title: "Register",
    desc: "Individual or team - secure your place before seats close.",
    accent: "arc",
  },
  {
    to: "/leaderboard",
    title: "Leaderboard",
    desc: "Live results as they're announced, event by event.",
    accent: "crimson",
  },
  {
    to: "/verify-certificate",
    title: "Certificates",
    desc: "Verify the authenticity of any TechAstra credential.",
    accent: "arc",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    api
      .get("/api/events")
      .then((data) => setFeatured((data.events || [])[0] || null))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ================= HERO ================= */}
      {/* Negative top margin pulls this section up behind the fixed,
          transparent navbar (App.jsx reserves pt-[76px] on <main> for
          every other page) so the hero image runs truly full-bleed. */}
      <section className="section-cinematic -mt-[76px]">
        <div className="cinematic-scrim bg-cinematic-overlay" />
        {/* Ambient Vision Core, kept subtle and off to one side rather
            than a centerpiece grid of stats/cards - "one idea per screen." */}
        <div className="absolute right-[6%] top-1/2 -translate-y-1/2 opacity-70 hidden lg:block">
          <Polyhedron3D size={340} className="animate-float-slow" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 text-center animate-cinematic-fade">
          <div className="flex justify-center mb-8">
            <TechAstraLogo size="lg" />
          </div>
          <p className="text-arc text-[11px] sm:text-xs tracking-cinematic uppercase mb-6">
            National Level Symposium &middot; 2026
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-offwhite mb-6">
            The Future is <span className="italic text-crimson-light">Vision</span>
          </h1>
          <p className="text-offwhite/60 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Virtual Intelligence. Information Security. Sustainable Innovation.
            Intelligent Healthcare. Optimization &amp; Automation. Next-generation Networks.
          </p>
          <Link to="/events">
            <Button variant="link" data-log="hero-explore-events">
              Explore Events
            </Button>
          </Link>
        </div>

        {/* Quiet scroll cue, the only other motion cue on this screen */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-[10px] tracking-cinematic uppercase text-offwhite/50">Scroll</span>
          <span className="w-px h-8 bg-offwhite/30" />
        </div>
      </section>

      <AnnouncementBanner />

      {/* ================= FEATURED EVENT ================= */}
      {featured && (
        <section className="section-cinematic min-h-[70vh] border-t border-crimson/10">
          <div className="cinematic-scrim bg-gradient-to-br from-crimson/15 via-transparent to-arc/10" />
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center animate-cinematic-fade">
            <p className="text-arc text-[11px] tracking-cinematic uppercase mb-5">Flagship Event</p>
            <h2 className="font-serif text-3xl sm:text-5xl text-offwhite mb-6">{featured.name}</h2>
            <p className="text-offwhite/60 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              {featured.description}
            </p>
            <Link to="/events">
              <Button variant="link" data-log="featured-event-explore">
                Discover More
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ================= EXPLORE FURTHER ================= */}
      <section className="py-24 sm:py-32 border-t border-crimson/10">
        <div className="max-w-6xl mx-auto px-6 mb-14 text-center">
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Explore Further</p>
          <h2 className="font-serif text-2xl sm:text-4xl text-offwhite">Everything TechAstra, at a glance</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {EXPLORE_CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group relative aspect-[3/4] overflow-hidden border-r border-b border-crimson/10 last:border-r-0"
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
