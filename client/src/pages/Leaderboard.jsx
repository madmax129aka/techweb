import React, { useEffect, useState, useMemo } from "react";
import confetti from "canvas-confetti";
import Card from "../components/ui/Card";
import { Select } from "../components/ui/Input";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

const POSITION_LABEL = { 1: "🥇 1st", 2: "🥈 2nd", 3: "🥉 3rd" };

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
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-heading text-4xl font-bold mb-2 text-center">🏆 Live Leaderboard</h1>
      <p className="text-white/60 text-center mb-8">Updates in real time as coordinators submit results.</p>

      <div className="flex flex-wrap gap-4 justify-center mb-10">
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
        <p className="text-center text-white/50">No results announced yet — check back soon!</p>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([eventName, rows]) => (
          <Card key={eventName}>
            <h2 className="font-heading text-2xl font-bold mb-4 text-cyan">{eventName}</h2>
            <div className="space-y-3">
              {rows
                .sort((a, b) => a.position - b.position)
                .map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-white/5 rounded-xl px-5 py-3">
                    <span className="font-heading text-xl font-bold">{POSITION_LABEL[r.position] || r.position}</span>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{r.teamName || r.participantName}</p>
                      <p className="text-sm text-white/50">{r.college}</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
