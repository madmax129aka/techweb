import React, { useEffect, useState, useMemo } from "react";
import confetti from "canvas-confetti";
import { Select } from "../components/ui/Input";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

const POSITION_LABEL = { 1: "1st", 2: "2nd", 3: "3rd" };

/**
 * Rebuilt per the brief: "treat like a hero section - large legible type
 * on a dark background, suited for a projector screen, no clutter."
 * Boxed Cards are gone entirely in favor of oversized serif type and thin
 * dividing rules, closer to a live results/scoreboard screen than a
 * dashboard widget. Confetti-on-update and the Socket.io live-update
 * subscription (`result:update`) are untouched.
 */
export default function Leaderboard() {
  const [results, setResults] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (eventFilter) params.set("eventId", eventFilter);
    if (collegeFilter) params.set("college", collegeFilter);
    api.get(`/api/results?${params.toString()}`).then((data) => setResults(data.results || []));
  };

  useEffect(() => {
    api.get("/api/events").then((data) => setEvents(data.events || []));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventFilter, collegeFilter]);

  useEffect(() => {
    const socket = getSocket();
    const handleUpdate = () => {
      load();
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.3 } });
      } catch {
        // canvas-confetti may not be available in some environments - non-critical
      }
    };
    socket.on("result:update", handleUpdate);
    return () => socket.off("result:update", handleUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventFilter, collegeFilter]);

  const colleges = useMemo(
    () => [...new Set(results.map((r) => r.college).filter(Boolean))],
    [results]
  );

  const grouped = useMemo(() => {
    const map = {};
    for (const r of results) {
      if (!map[r.eventName]) map[r.eventName] = [];
      map[r.eventName].push(r);
    }
    return map;
  }, [results]);

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20">
      <div className="text-center mb-14 animate-cinematic-fade">
        <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Live &middot; Updated in Real Time</p>
        <h1 className="font-serif text-4xl sm:text-6xl text-offwhite">Leaderboard</h1>
      </div>

      <div className="flex flex-wrap gap-6 justify-center mb-16">
        <Select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="max-w-xs">
          <option value="">All Events</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </Select>
        <Select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)} className="max-w-xs">
          <option value="">All Colleges</option>
          {colleges.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-offwhite/40 text-lg">No results announced yet &mdash; check back soon.</p>
      )}

      <div className="space-y-20">
        {Object.entries(grouped).map(([eventName, rows]) => (
          <section key={eventName}>
            <h2 className="font-serif text-2xl sm:text-3xl text-offwhite mb-8 pb-4 border-b border-crimson/15">
              {eventName}
            </h2>
            <div className="divide-y divide-crimson/10">
              {rows
                .sort((a, b) => a.position - b.position)
                .map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-6 py-6">
                    <span
                      className={`font-serif text-3xl sm:text-4xl shrink-0 w-20 sm:w-24 ${
                        r.position <= 3 ? "text-arc" : "text-offwhite/30"
                      }`}
                    >
                      {POSITION_LABEL[r.position] || r.position}
                    </span>
                    <div className="text-right flex-1">
                      <p className="font-heading text-xl sm:text-2xl text-offwhite">
                        {r.teamName || r.participantName}
                      </p>
                      <p className="text-sm text-offwhite/45 tracking-wide">{r.college}</p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
