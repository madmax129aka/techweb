import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

/**
 * Live announcement ticker beneath the hero, plus a slide-in pop-up whenever
 * a new announcement is pushed by the Master Admin via Socket.io. Falls back
 * gracefully (ticker just shows whatever loaded initially) if sockets fail.
 */
export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [latestPopup, setLatestPopup] = useState(null);

  useEffect(() => {
    api
      .get("/api/announcements")
      .then((data) => setAnnouncements(data.announcements || []))
      .catch(() => {});

    const socket = getSocket();
    const handleNew = (announcement) => {
      setAnnouncements((prev) => [announcement, ...prev]);
      setLatestPopup(announcement);
      toast.success("New announcement posted");
      setTimeout(() => setLatestPopup(null), 8000);
    };
    socket.on("announcement:new", handleNew);
    return () => socket.off("announcement:new", handleNew);
  }, []);

  return (
    <>
      {announcements.length > 0 && (
        <div className="bg-violet/15 border-y border-violet/30 overflow-hidden py-2">
          <div className="whitespace-nowrap animate-none flex gap-12 text-sm text-white/90 px-4 overflow-x-auto no-scrollbar">
            {announcements.slice(0, 8).map((a) => (
              <span key={a.id} className="flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan inline-block" />
                {a.message}
              </span>
            ))}
          </div>
        </div>
      )}

      {latestPopup && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-slide-in-top">
          <div className="glass rounded-xl p-4 border border-cyan/40 shadow-glow flex items-start gap-3">
            <span className="text-cyan text-lg">📢</span>
            <div>
              <p className="text-sm font-semibold text-cyan mb-1">New Announcement</p>
              <p className="text-sm text-white/90">{latestPopup.message}</p>
            </div>
            <button
              className="text-white/50 hover:text-white ml-auto"
              onClick={() => setLatestPopup(null)}
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
