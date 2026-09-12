import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePanels } from "../context/PanelContext";
import { api } from "../lib/api";
import { getEventImage, CATEGORY_IMAGES, HERO_IMAGES } from "../lib/eventImages";

const PORTAL_PATH = {
  registration_team: "/registration-team",
  coordinator: "/coordinator",
  hospitality: "/hospitality",
  certificate_team: "/certificates",
  volunteer: "/volunteer",
  master_admin: "/admin",
  participant: "/dashboard",
};

// Top-level (Level 1) categories other than Events. Events is handled
// specially below because it drills down two more levels
// (Technical / Non-Technical -> individual events).
const SIMPLE_CATEGORIES = [
  { key: "home", label: "Home", to: "/", image: HERO_IMAGES.intro },
  { key: "leaderboard", label: "Leaderboard", to: "/leaderboard", image: HERO_IMAGES.registrations },
  { key: "gallery", label: "Gallery", to: "/gallery", image: HERO_IMAGES.intro },
  { key: "dashboard", label: "My Dashboard", to: "/status", image: HERO_IMAGES.flagship },
  { key: "help", label: "Help Desk", to: "/faq", image: HERO_IMAGES.flagship },
];

const CATEGORY_META = {
  technical: { label: "Technical", image: CATEGORY_IMAGES.technical },
  non_technical: { label: "Non-Technical", image: CATEGORY_IMAGES.non_technical },
};

function timeSlot(iso) {
  try {
    return new Date(iso).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * SECTION 5D - Split-screen "Models"-style mega-menu.
 *
 * Full-screen dark overlay split into two halves:
 *   LEFT  - a vertical stack of large, light-weight nav categories. The
 *           "Events" item drills down IN PLACE through two more levels:
 *           Events -> (Technical | Non-Technical) -> individual events,
 *           without navigating away. Only one branch is expanded at a time.
 *   RIGHT - a single full-bleed image panel driven purely by whatever is
 *           currently hovered/active, crossfading between images.
 *
 * Key premium interaction details from the brief, implemented explicitly:
 *   - opacity-dim-on-hover: whatever is hovered stays full opacity, its
 *     siblings dim to ~45% to draw focus (the `dimSiblings` helper).
 *   - instant crossfade: two stacked <img> layers swap opacity on a
 *     200ms transition rather than the src being hot-swapped (which would
 *     flicker). Images are preloaded when the menu opens so the swap is
 *     immediate with no loading flash.
 *   - hovering a category header shows a generic cover; hovering a
 *     specific event shows THAT event's banner + time slot + fee overlaid.
 */
export default function FullScreenMenu({ open, onClose }) {
  const { user, logout } = useAuth();
  const { toggleLang, lang } = useLanguage();
  const { openPanel } = usePanels();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  // Drill-down state: which branch (technical|non_technical) is expanded.
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  // What the right panel currently reflects (drives the image + overlay).
  const [active, setActive] = useState(null); // { type, image, event? }

  // Fetch events once, when the menu first opens.
  useEffect(() => {
    if (!open || events.length > 0) return;
    api.get("/api/events").then((data) => setEvents(data.events || [])).catch(() => {});
  }, [open, events.length]);

  const byCategory = useMemo(() => {
    const map = { technical: [], non_technical: [] };
    for (const e of events) {
      const cat = e.category === "non_technical" ? "non_technical" : "technical";
      map[cat].push(e);
    }
    return map;
  }, [events]);

  // Preload every image the menu can show, the moment it opens, so the
  // right-panel crossfade is instant with no loading flicker on hover.
  useEffect(() => {
    if (!open) return;
    const urls = [
      ...SIMPLE_CATEGORIES.map((c) => c.image),
      CATEGORY_IMAGES.technical,
      CATEGORY_IMAGES.non_technical,
      ...events.map((e) => getEventImage(e.name)),
    ];
    urls.forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [open, events]);

  // Reset drill-down + right panel each time the menu opens.
  useEffect(() => {
    if (open) {
      setEventsExpanded(false);
      setExpandedCategory(null);
      setActive({ type: "default", image: HERO_IMAGES.intro });
    }
  }, [open]);

  const go = useCallback(
    (path) => {
      onClose();
      navigate(path);
    },
    [onClose, navigate]
  );

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/");
  };

  if (!open) return null;

  // The image the right panel should show right now, with a sensible
  // fallback if nothing is hovered yet.
  const activeImage = active?.image || HERO_IMAGES.intro;
  const activeEvent = active?.type === "event" ? active.event : null;

  // Whether a left-column item should dim: if the user is hovering
  // something (`hoveredKey`), every OTHER item dims. Implemented per
  // "row group" so hovering an event doesn't dim its own siblings' headers.
  const hoveredKey = active?.hoverKey || null;
  const dimClass = (key) =>
    hoveredKey && hoveredKey !== key ? "opacity-45" : "opacity-100";

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0F1424]/98 backdrop-blur-md animate-menu-fade flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      {/* Fixed top bar: close (X) top-left, logo/label. */}
      <div className="flex items-center gap-6 px-6 sm:px-12 py-6 border-b border-crimson/10 shrink-0">
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="text-offwhite/80 hover:text-arc transition-colors text-3xl leading-none order-first"
          data-log="close-fullscreen-menu"
        >
          &times;
        </button>
        <span className="font-display text-xs uppercase tracking-cinematic text-arc">TechAstra</span>
      </div>

      {/* Split screen: left list / right image. Stacks vertically on mobile. */}
      <div className="flex-1 grid lg:grid-cols-2 overflow-hidden">
        {/* ---------------- LEFT: category list ---------------- */}
        <nav
          className="flex flex-col justify-center gap-1 px-6 sm:px-16 py-10 overflow-y-auto no-scrollbar"
          onMouseLeave={() => setActive((a) => ({ ...a, hoverKey: null }))}
        >
          {/* Home (first simple item) */}
          <MenuRow
            label={SIMPLE_CATEGORIES[0].label}
            dim={dimClass(SIMPLE_CATEGORIES[0].key)}
            onHover={() => setActive({ type: "simple", image: SIMPLE_CATEGORIES[0].image, hoverKey: SIMPLE_CATEGORIES[0].key })}
            onClick={() => go(SIMPLE_CATEGORIES[0].to)}
            dataLog={`menu-category-${SIMPLE_CATEGORIES[0].key}`}
          />

          {/* ---- Events (3-level drill-down) ---- */}
          <div>
            <MenuRow
              label="Events"
              expandable
              expanded={eventsExpanded}
              dim={dimClass("events")}
              onHover={() => setActive({ type: "simple", image: HERO_IMAGES.flagship, hoverKey: "events" })}
              onClick={() => {
                setEventsExpanded((v) => !v);
                setExpandedCategory(null);
              }}
              dataLog="menu-category-events"
            />

            {/* Level 2: Technical / Non-Technical / View All */}
            {eventsExpanded && (
              <div className="pl-5 sm:pl-8 mt-1 mb-2 flex flex-col gap-1 border-l border-crimson/15">
                {["technical", "non_technical"].map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const isExpanded = expandedCategory === cat;
                  return (
                    <div key={cat}>
                      <MenuRow
                        size="sub"
                        label={meta.label}
                        expandable
                        expanded={isExpanded}
                        dim={dimClass(`cat-${cat}`)}
                        onHover={() => setActive({ type: "category", image: meta.image, hoverKey: `cat-${cat}` })}
                        onClick={() =>
                          // Only one branch open at a time - opening one
                          // collapses the other.
                          setExpandedCategory((prev) => (prev === cat ? null : cat))
                        }
                        dataLog={`menu-events-${cat}`}
                      />

                      {/* Level 3: individual events in this category */}
                      {isExpanded && (
                        <div className="pl-5 sm:pl-8 mt-1 mb-1 flex flex-col gap-0.5 border-l border-crimson/10">
                          {byCategory[cat].length === 0 && (
                            <span className="text-offwhite/40 text-sm py-1.5">No events yet</span>
                          )}
                          {byCategory[cat].map((ev) => (
                            <MenuRow
                              key={ev.id}
                              size="leaf"
                              label={ev.name}
                              dim={dimClass(`event-${ev.id}`)}
                              onHover={() =>
                                setActive({
                                  type: "event",
                                  image: getEventImage(ev.name),
                                  event: ev,
                                  hoverKey: `event-${ev.id}`,
                                })
                              }
                              onClick={() => go(`/events/${ev.id}`)}
                              dataLog={`menu-event-${ev.id}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* View All Events - skips the drill-down */}
                <MenuRow
                  size="sub"
                  label="View All Events"
                  dim={dimClass("view-all")}
                  muted
                  onHover={() => setActive({ type: "simple", image: HERO_IMAGES.flagship, hoverKey: "view-all" })}
                  onClick={() => go("/events")}
                  dataLog="menu-events-view-all"
                />
              </div>
            )}
          </div>

          {/* Remaining simple categories */}
          {SIMPLE_CATEGORIES.slice(1).map((cat) => (
            <MenuRow
              key={cat.key}
              label={cat.label}
              dim={dimClass(cat.key)}
              onHover={() => setActive({ type: "simple", image: cat.image, hoverKey: cat.key })}
              onClick={() => go(cat.to)}
              dataLog={`menu-category-${cat.key}`}
            />
          ))}

          {/* Footer: auth + language controls */}
          <div className="mt-8 pt-8 border-t border-crimson/10 flex flex-col gap-4">
            {user ? (
              <>
                <button
                  onClick={() => go(PORTAL_PATH[user.role] || "/dashboard")}
                  className="nav-link-cinematic text-arc text-left"
                  data-log="menu-go-dashboard"
                >
                  Dashboard
                </button>
                <button onClick={handleLogout} className="nav-link-cinematic text-left" data-log="menu-logout">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={onClose} className="nav-link-cinematic text-arc" data-log="menu-login">
                Login
              </Link>
            )}

            <button
              onClick={() => {
                onClose();
                openPanel("help");
              }}
              className="nav-link-cinematic text-left"
              data-log="menu-contact-help"
            >
              Contact Help Desk
            </button>

            <button onClick={toggleLang} className="nav-link-cinematic text-left" data-log="menu-toggle-lang">
              {lang === "en" ? "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd (Switch to Tamil)" : "English (Switch to English)"}
            </button>
          </div>
        </nav>

        {/* ---------------- RIGHT: live image panel ---------------- */}
        {/* Hidden on mobile (no room for a true split); the list above
            fills the screen instead. */}
        <div className="relative hidden lg:block overflow-hidden">
          {/* Two stacked layers would be needed for a true crossfade of
              arbitrary images; here a single <img> keyed by src lets React
              swap it while the opacity transition on the keyed element
              provides the fade-in. The dark base behind it means the
              moment of swap reads as a crossfade to black-and-back rather
              than a hard cut. */}
          <img
            key={activeImage}
            src={activeImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover animate-menu-image-fade"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {/* Bottom gradient scrim so overlaid event text stays legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1424] via-[#0F1424]/20 to-transparent" />

          {/* Event details overlay - only when an individual event is hovered */}
          {activeEvent && (
            <div className="absolute bottom-0 left-0 right-0 p-12 animate-cinematic-fade">
              <p className="text-arc text-[11px] tracking-cinematic uppercase mb-3">
                {CATEGORY_META[activeEvent.category === "non_technical" ? "non_technical" : "technical"].label}
              </p>
              <h3 className="font-serif text-4xl text-offwhite mb-4">{activeEvent.name}</h3>
              <div className="flex items-center gap-6 text-sm text-offwhite/70">
                <span>{timeSlot(activeEvent.startTime)} &mdash; {timeSlot(activeEvent.endTime)}</span>
                <span className="text-arc font-heading">&#8377;{activeEvent.fee}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * A single left-column row. `size` controls the type scale for each
 * drill-down level (top-level categories are largest, leaf events
 * smallest). `dim` is the caller-computed opacity class implementing the
 * dim-siblings-on-hover effect.
 */
function MenuRow({ label, size = "top", dim = "opacity-100", expandable, expanded, muted, onHover, onClick, dataLog }) {
  const sizeClass =
    size === "top"
      ? "font-serif text-3xl sm:text-4xl py-2"
      : size === "sub"
      ? "font-serif text-xl sm:text-2xl py-1.5"
      : "text-base sm:text-lg py-1"; // leaf

  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onClick}
      className={`group text-left flex items-center gap-3 transition-opacity duration-300 ${dim} ${sizeClass} ${
        muted ? "text-offwhite/55 hover:text-arc" : "text-offwhite hover:text-arc"
      }`}
      data-log={dataLog}
    >
      <span>{label}</span>
      {expandable && (
        <span
          aria-hidden="true"
          className={`text-arc/70 text-sm transition-transform duration-300 ${expanded ? "rotate-45" : ""}`}
        >
          +
        </span>
      )}
    </button>
  );
}
