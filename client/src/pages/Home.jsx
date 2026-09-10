import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import AnnouncementBanner from "../components/AnnouncementBanner";
import { api } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const [events, setEvents] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    api.get("/api/events").then((data) => setEvents((data.events || []).slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet/20 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 py-24 text-center animate-hero">
          <p className="text-cyan font-semibold tracking-wide text-sm mb-4">NATIONAL LEVEL SYMPOSIUM · 2026</p>
          <h1 className="font-heading text-4xl sm:text-6xl font-bold mb-5 leading-tight">
            Tech<span className="text-cyan">Astra</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 mb-8">
            Where Ideas Launch. Register, compete, and get certified — all in one mission hub.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/events">
              <Button size="lg">{t("registerNow")}</Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline">View Leaderboard</Button>
            </Link>
          </div>
        </div>
      </section>

      <AnnouncementBanner />

      {/* Event highlights */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold">Event Highlights</h2>
          <Link to="/events" className="text-cyan text-sm hover:underline">View all events →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {events.length === 0 && (
            <p className="text-white/50 col-span-full">Events will appear here once published.</p>
          )}
          {events.map((e) => (
            <Card key={e.id} className="hover:border-cyan/40 border border-transparent transition-colors">
              <p className="text-xs text-violet font-semibold mb-1">{e.track || "General"}</p>
              <h3 className="font-heading font-bold text-lg mb-2">{e.name}</h3>
              <p className="text-sm text-white/60 mb-3 line-clamp-2">{e.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan font-semibold">₹{e.fee}</span>
                <span className="text-white/50">{e.seatsAvailable} seats left</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Sponsors */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-white/10">
        <h2 className="font-heading text-xl font-bold mb-6 text-center text-white/80">Our Sponsors</h2>
        <div className="flex flex-wrap items-center justify-center gap-8 text-white/40 text-sm">
          <span className="px-6 py-3 border border-white/10 rounded-lg">Sponsor Logo</span>
          <span className="px-6 py-3 border border-white/10 rounded-lg">Sponsor Logo</span>
          <span className="px-6 py-3 border border-white/10 rounded-lg">Sponsor Logo</span>
          <span className="px-6 py-3 border border-white/10 rounded-lg">Sponsor Logo</span>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="font-heading text-xl font-bold mb-6 text-center text-white/80">Gallery</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-xs">
              Photo {i}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
