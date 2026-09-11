import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

/**
 * Live announcement marquee beneath the hero, plus a slide-in pop-up whenever
 * a new announcement is pushed by the Master Admin via Socket.io. Falls back
 * gracefully (marquee just shows whatever loaded initially) if sockets fail.
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

  const items = announcements.slice(0, 10);

  return (
    <>
      {items.length > 0 && (
        <div className="relative bg-onyx-light/70 border-y border-gold/20 overflow-hidden py-2.5 flex items-center">
          <div className="flex items-center gap-2 px-4 shrink-0 z-10 bg-onyx-light/90 border-r border-gold/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-ring-red animate-live-pulse" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ring-red" />
            </span>
            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-ring-red">Live</span>
          </div>

          <div className="flex-1 overflow-hidden no-scrollbar">
            <div className="flex gap-16 whitespace-nowrap animate-marquee">
              {[...items, ...items].map((a, i) => (
                <span key={`${a.id}-${i}`} className="flex items-center gap-2 shrink-0 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                  {a.message}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {latestPopup && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-slide-in-top">
          <div className="glass-gold rounded-xl p-4 shadow-gold-lg border-gold/50 flex items-start gap-3">
            <span className="text-gold-light text-xl animate-gold-pulse">✨</span>
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-wider text-gold-light mb-1">
                New Announcement
              </p>
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
