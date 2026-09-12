import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import TiltCard from "../components/TiltCard";
import AnnouncementBanner from "../components/AnnouncementBanner";
import TechAstraLogo from "../components/TechAstraLogo";
import Polyhedron3D from "../components/Polyhedron3D";
import VisionPillars from "../components/VisionPillars";
import { api } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";

const STATS = [
  { label: "Events", value: "8+" },
  { label: "Colleges", value: "50+" },
  { label: "Participants", value: "1000+" },
  { label: "Prize Pool", value: "₹1L+" },
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    api.get("/api/events").then((data) => setEvents((data.events || []).slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gold/10">
        <div className="grain-overlay" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-15%] left-[-10%] w-[520px] h-[520px] bg-vision-v/10 rounded-full blur-[130px]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[520px] h-[520px] bg-vision-n/10 rounded-full blur-[130px]" />
          <div className="absolute top-[30%] right-[15%] w-[300px] h-[300px] bg-vision-s/8 rounded-full blur-[100px]" />
          {/* scattered twinkle dots for a "starfield / circuit node" feel */}
          {[...Array(14)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold-light animate-twinkle"
              style={{
                top: `${(i * 37) % 90}%`,
                left: `${(i * 61) % 95}%`,
                animationDelay: `${(i % 6) * 0.4}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center animate-hero">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
              <TechAstraLogo size="lg" className="animate-gold-pulse" />
            </div>

            <p className="text-gold-light font-display font-bold tracking-[0.2em] text-xs sm:text-sm mb-4 uppercase">
              ⚡ National Level Symposium · 2026 ⚡
            </p>
            <h1 className="font-serif italic text-4xl sm:text-6xl font-bold mb-5 leading-tight text-white">
              The Future is <span className="text-gold-light not-italic font-display">VISION</span>
            </h1>
            <p className="text-base sm:text-lg text-white/60 mb-4 max-w-xl mx-auto lg:mx-0">
              Six frontiers of tomorrow's technology — Virtual Intelligence, Information Security,
              Sustainable Innovation, Intelligent Healthcare, Optimization &amp; Automation, and
              Next-generation Networks — converge for one day of ideas, competition, and discovery.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-12">
              <Link to="/events">
                <Button size="lg">🚀 {t("registerNow")}</Button>
              </Link>
              <Link to="/leaderboard">
                <Button size="lg" variant="outline">🏆 View Leaderboard</Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto lg:mx-0">
              {STATS.map((s) => (
                <div key={s.label} className="glass-premium hud-corners rounded-xl py-4 px-2 text-center">
                  <p className="font-display text-2xl sm:text-3xl font-bold text-gold-light">{s.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-white/50 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3D centerpiece */}
          <div className="relative flex items-center justify-center h-[320px] sm:h-[380px]">
            <div className="absolute w-64 h-64 rounded-full bg-vision-gradient opacity-20 blur-3xl animate-gradient-shift" />
            <Polyhedron3D size={230} className="animate-float-slow" />
            <span className="absolute top-4 right-8 w-3 h-3 rounded-full bg-vision-i2 animate-float-medium shadow-vision-i2" />
            <span className="absolute bottom-10 left-4 w-2.5 h-2.5 rounded-full bg-vision-s animate-float-slow shadow-vision-s" />
            <span className="absolute bottom-4 right-16 w-2 h-2 rounded-full bg-vision-o animate-float-medium shadow-vision-o" />
          </div>
        </div>
      </section>

      <AnnouncementBanner />

      <VisionPillars />

      <div className="max-w-6xl mx-auto px-6">
        <div className="divider-vision" />
      </div>

      {/* Event highlights */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-white">
            Event <span className="text-gold-light not-italic">Highlights</span>
          </h2>
          <Link to="/events" className="text-gold-light text-sm hover:underline">View all events →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 [perspective:1200px]">
          {events.length === 0 && (
            <p className="text-white/50 col-span-full">Events will appear here once published.</p>
          )}
          {events.map((e) => (
            <TiltCard key={e.id} className="p-5" maxTilt={6}>
              <p className="text-xs text-ring-yellow font-semibold mb-1 uppercase tracking-wide">{e.track || "General"}</p>
              <h3 className="font-heading font-bold text-lg mb-2 text-white">{e.name}</h3>
              <p className="text-sm text-white/60 mb-3 line-clamp-2">{e.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gold-light font-semibold">₹{e.fee}</span>
                <span className="text-white/50">{e.seatsAvailable} seats left</span>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Sponsors */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-gold/10">
        <h2 className="font-serif italic text-xl font-bold mb-6 text-center text-white/80">Our Sponsors</h2>
        <div className="flex flex-wrap items-center justify-center gap-8 text-gold-light/50 text-sm">
          <span className="px-6 py-3 border border-gold/15 rounded-lg">Sponsor Logo</span>
          <span className="px-6 py-3 border border-gold/15 rounded-lg">Sponsor Logo</span>
          <span className="px-6 py-3 border border-gold/15 rounded-lg">Sponsor Logo</span>
          <span className="px-6 py-3 border border-gold/15 rounded-lg">Sponsor Logo</span>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="font-serif italic text-xl font-bold mb-6 text-center text-white/80">Gallery</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-white/5 border border-gold/10 flex items-center justify-center text-white/30 text-xs">
              Photo {i}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
