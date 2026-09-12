import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

/**
 * Live announcement marquee beneath the hero, plus a slide-in pop-up whenever
 * a new announcement is pushed by the Master Admin via Socket.io. Restyled
 * to the minimal cinematic look - a thin hairline strip rather than a
 * boxed/glass panel, crimson "LIVE" indicator + arc-cyan accent dot
 * instead of gold, matching the rest of the reworked palette.
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
        <div className="relative border-y border-crimson/15 overflow-hidden py-3 flex items-center bg-base/40">
          <div className="flex items-center gap-2 px-5 sm:px-8 shrink-0 z-10 bg-base border-r border-crimson/15">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-crimson animate-live-pulse" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson" />
            </span>
            <span className="text-[10px] tracking-cinematic uppercase text-crimson-light">Live</span>
          </div>

          <div className="flex-1 overflow-hidden no-scrollbar">
            <div className="flex gap-16 whitespace-nowrap animate-marquee">
              {[...items, ...items].map((a, i) => (
                <span key={`${a.id}-${i}`} className="flex items-center gap-3 shrink-0 text-sm text-offwhite/75">
                  <span className="w-1 h-1 rounded-full bg-arc inline-block" />
                  {a.message}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {latestPopup && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 max-w-sm animate-slide-in-top">
          <div className="bg-base border border-crimson/30 p-5 flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-arc mt-1.5 shrink-0" />
            <div>
              <p className="text-[10px] tracking-cinematic uppercase text-crimson-light mb-1.5">
                New Announcement
              </p>
              <p className="text-sm text-offwhite/85 leading-relaxed">{latestPopup.message}</p>
            </div>
            <button
              className="text-offwhite/40 hover:text-arc ml-auto"
              onClick={() => setLatestPopup(null)}
              aria-label="Dismiss"
              data-log="dismiss-announcement-popup"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
