import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import AnnouncementBanner from "../components/AnnouncementBanner";
import TechAstraLogo from "../components/TechAstraLogo";
import { api } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";

const STATS = [
  { label: "Events", value: "8+" },
  { label: "Colleges", value: "50+" },
  { label: "Participants", value: "1000+" },
  { label: "Prize Pool", value: "₹1L+" },
];

const ORBIT_DOTS = [
  { color: "bg-ring-red", radius: 190, duration: "14s", delay: "0s" },
  { color: "bg-ring-blue", radius: 190, duration: "14s", delay: "-3.5s" },
  { color: "bg-ring-green", radius: 190, duration: "14s", delay: "-7s" },
  { color: "bg-ring-yellow", radius: 190, duration: "14s", delay: "-10.5s" },
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
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-15%] left-[-10%] w-[520px] h-[520px] bg-gold/10 rounded-full blur-[130px]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[520px] h-[520px] bg-ring-blue/10 rounded-full blur-[130px]" />
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

        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center animate-hero">
          <div className="relative flex items-center justify-center mb-8" style={{ height: 200 }}>
            {ORBIT_DOTS.map((dot, i) => (
              <span
                key={i}
                className={`absolute w-2.5 h-2.5 rounded-full ${dot.color} animate-orbit shadow-ring`}
                style={{
                  "--orbit-radius": `${dot.radius}px`,
                  animationDuration: dot.duration,
                  animationDelay: dot.delay,
                }}
              />
            ))}
            <TechAstraLogo size="xl" className="animate-gold-pulse" />
          </div>

          <p className="text-gold-light font-display font-bold tracking-[0.2em] text-xs sm:text-sm mb-4 uppercase">
            ⚡ National Level Symposium · 2026 ⚡
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-black mb-5 leading-tight uppercase tracking-wide text-white">
            Where <span className="text-gold-light">Ideas</span> Ignite
          </h1>
          <p className="text-base sm:text-lg text-white/60 mb-10 max-w-2xl mx-auto">
            Register, compete, and get certified across a full day of technical events —
            all tracked live in one mission-control hub.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <Link to="/events">
              <Button size="lg">🚀 {t("registerNow")}</Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline">🏆 View Leaderboard</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="glass hud-corners rounded-xl py-4 px-2">
                <p className="font-display text-2xl sm:text-3xl font-bold text-gold-light">{s.value}</p>
                <p className="text-[11px] uppercase tracking-wider text-white/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnnouncementBanner />

      {/* Event highlights */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide">
            <span className="text-gold-light">//</span> Event Highlights
          </h2>
          <Link to="/events" className="text-gold-light text-sm hover:underline">View all events →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {events.length === 0 && (
            <p className="text-white/50 col-span-full">Events will appear here once published.</p>
          )}
          {events.map((e) => (
            <Card key={e.id} hud className="hover:border-gold/40 border border-transparent transition-colors">
              <p className="text-xs text-ring-yellow font-semibold mb-1 uppercase tracking-wide">{e.track || "General"}</p>
              <h3 className="font-heading font-bold text-lg mb-2">{e.name}</h3>
              <p className="text-sm text-white/60 mb-3 line-clamp-2">{e.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gold-light font-semibold">₹{e.fee}</span>
                <span className="text-white/50">{e.seatsAvailable} seats left</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Sponsors */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-gold/10">
        <h2 className="font-display text-lg font-bold mb-6 text-center text-white/80 uppercase tracking-wide">Our Sponsors</h2>
        <div className="flex flex-wrap items-center justify-center gap-8 text-gold-light/50 text-sm">
          <span className="px-6 py-3 border border-gold/15 rounded-lg">Sponsor Logo</span>
          <span className="px-6 py-3 border border-gold/15 rounded-lg">Sponsor Logo</span>
          <span className="px-6 py-3 border border-gold/15 rounded-lg">Sponsor Logo</span>
          <span className="px-6 py-3 border border-gold/15 rounded-lg">Sponsor Logo</span>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="font-display text-lg font-bold mb-6 text-center text-white/80 uppercase tracking-wide">Gallery</h2>
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
