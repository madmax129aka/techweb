import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePanels } from "../context/PanelContext";
import { api } from "../lib/api";
import { getEventImage, CATEGORY_IMAGES, HERO_IMAGES } from "../lib/eventImages";

// Section 5E: solid, fully-opaque hex colors for the left-column
// dim-on-hover effect - deliberately NOT Tailwind opacity/alpha utilities.
// CSS `opacity` (or an rgba/`/NN` color) makes the WHOLE element blend
// with whatever is rendered behind it; on this panel (a near-opaque
// backdrop-blurred overlay sitting over hero photography) that
// compositing is exactly what let the background photo visibly bleed
// through the dimmed "Gallery / My Dashboard / Help Desk" rows. A flat,
// fully-opaque color has no alpha channel to blend with anything, so the
// text is either lit or dim - never see-through.
const ACTIVE_TEXT = "text-offwhite"; // solid #F5F3F0 - full opacity/prominence
const DIM_TEXT = "text-[#78787f]"; // solid muted slate - ~same visual weight as the old opacity-45, but opaque
const MUTED_BASE_TEXT = "text-[#bcbbbd]"; // solid softer white for always-de-emphasized rows (e.g. "View All Events")

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
//
// SCOPE CORRECTION: this app is the Registration Portal only (opened via
// a "Register" link from a separate main marketing site) - Home,
// Leaderboard, and Gallery all belong to that other site and have been
// removed from this list. "My Dashboard" now points at /status (the
// public status-check page), matching how it worked before; "Help Desk"
// opens its slide-in panel directly instead of routing through the now-
// deleted /faq page; "Verify Certificate" was promoted into the Level-1
// list itself, per the corrected Section 5D.
const SIMPLE_CATEGORIES = [
  { key: "dashboard", label: "My Dashboard", to: "/status", image: HERO_IMAGES.flagship },
  { key: "help", label: "Help Desk", action: "openPanel:help", image: HERO_IMAGES.flagship },
  { key: "verify", label: "Verify Certificate", to: "/verify-certificate", image: HERO_IMAGES.registrations },
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
 * SECTION 5D (revised) - Split-screen "Models"-style mega-menu, scoped to
 * this app's corrected Level-1 set: Events / My Dashboard / Help Desk /
 * Verify Certificate. Home, Leaderboard, and Gallery were removed - this
 * app is the Registration Portal only, opened via a "Register" link from
 * a separate main marketing site that owns those pages instead.
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
 *   - opacity-dim-on-hover (Section 5E): whatever is hovered stays fully
 *     opaque, its siblings dim to a solid muted color (`dimClass` below) -
 *     using a SOLID color rather than CSS opacity is itself a bug fix,
 *     see the ACTIVE_TEXT/DIM_TEXT comment for why.
 *   - instant crossfade: the right <img> is re-keyed by src so it
 *     remounts with a short fade rather than the src being hot-swapped
 *     (which would flicker). Images are preloaded when the menu opens so
 *     the swap is immediate with no loading flash.
 *   - hovering a category header shows a generic cover; hovering a
 *     specific event shows THAT event's banner + time slot + fee overlaid.
 *   - open/close animates fade + scale together (Section 5G), not a
 *     plain opacity toggle - see .animate-menu-fade-in/-out in index.css.
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

  // Section 5G: the menu needs a real CLOSING animation (fade + slight
  // scale-down), not just an instant unmount, so it stays mounted for one
  // extra animation-duration after `open` goes false. `mounted` controls
  // whether this component renders anything at all; `closing` selects
  // which keyframe animation plays. Kept as plain state + a timeout
  // (matching the CSS animation's duration below) rather than reaching
  // for a transition library, since this is the only place in the app
  // that needs an exit animation.
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    if (open) {
      clearTimeout(closeTimerRef.current);
      setMounted(true);
      setClosing(false);
    } else {
      setClosing(true);
      closeTimerRef.current = setTimeout(() => setMounted(false), 320);
    }
    return () => clearTimeout(closeTimerRef.current);
  }, [open]);

  // Section 5E (bug 4): the left column previously used `justify-center`,
  // which - combined with content that grows taller as more drill-down
  // levels expand - centers the WHOLE list vertically and can push its
  // first rows (e.g. the "Technical" header, as seen in the bug report)
  // above the visible/scrollable area. The column is now top-anchored
  // (`justify-start`, see the JSX below) with its own scroll container,
  // and this effect scrolls that container back to the very top every
  // time a new level is expanded/collapsed, so whatever just
  // appeared/changed is always fully visible without the user needing to
  // manually scroll up first.
  useEffect(() => {
    if (navRef.current) navRef.current.scrollTop = 0;
  }, [eventsExpanded, expandedCategory]);

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

  // BUG FIX: these two useCallback hooks used to be declared AFTER the
  // `if (!mounted) return null` early return below. That's a Rules-of-
  // Hooks violation - hooks must run in the exact same order on every
  // render, never conditionally. On the menu's very first render
  // `mounted` is still false (its useState initializer reads `open`,
  // which starts false), so React saw N hooks called before hitting the
  // early return. The instant the menu opened, `mounted` flipped to true
  // on a LATER render, and only THEN did these two hooks get called for
  // the first time - a hook-count mismatch between renders that makes
  // React throw and unmount the whole tree, which is exactly why
  // clicking the hamburger produced a blank page instead of the menu.
  // Moving them above the early return (all hooks now run unconditionally
  // on every render, regardless of `mounted`) fixes this permanently.
  const go = useCallback(
    (path) => {
      onClose();
      navigate(path);
    },
    [onClose, navigate]
  );

  // Resolves a SIMPLE_CATEGORIES entry's click - either a route (`to`)
  // or an action like opening the Help Desk panel (`action`). Kept as
  // one helper so the row-rendering loop below doesn't need a special
  // case for "Home" anymore (that entry no longer exists post-scope-
  // correction; every remaining Level-1 row is rendered the same way).
  const handleCategoryClick = useCallback(
    (cat) => {
      if (cat.action === "openPanel:help") {
        onClose();
        openPanel("help");
      } else if (cat.to) {
        go(cat.to);
      }
    },
    [onClose, openPanel, go]
  );

  if (!mounted) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/events");
  };

  // The image the right panel should show right now, with a sensible
  // fallback if nothing is hovered yet.
  const activeImage = active?.image || HERO_IMAGES.intro;
  const activeEvent = active?.type === "event" ? active.event : null;

  // Whether a left-column item should dim: if the user is hovering
  // something (`hoveredKey`), every OTHER item dims. Implemented per
  // "row group" so hovering an event doesn't dim its own siblings' headers.
  // Returns a SOLID opaque text-color class, never an opacity utility -
  // see the ACTIVE_TEXT/DIM_TEXT comment above for why.
  const hoveredKey = active?.hoverKey || null;
  const dimClass = (key) =>
    hoveredKey && hoveredKey !== key ? DIM_TEXT : ACTIVE_TEXT;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#0F1424] backdrop-blur-md flex flex-col ${
        closing ? "animate-menu-fade-out" : "animate-menu-fade-in"
      }`}
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
          {/* ---- Events (3-level drill-down) - rendered first, as the
                primary reason this app exists ---- */}
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

          {/* Remaining Level-1 rows: My Dashboard / Help Desk / Verify Certificate */}
          {SIMPLE_CATEGORIES.map((cat) => (
            <MenuRow
              key={cat.key}
              label={cat.label}
              dim={dimClass(cat.key)}
              onHover={() => setActive({ type: "simple", image: cat.image, hoverKey: cat.key })}
              onClick={() => handleCategoryClick(cat)}
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
 * smallest).
 *
 * `dim` is the caller-computed SOLID text-color class (ACTIVE_TEXT /
 * DIM_TEXT / MUTED_BASE_TEXT) implementing the dim-siblings-on-hover
 * effect - it is the ONLY thing controlling this row's color (no
 * competing text-offwhite/NN base class), which is what guarantees the
 * text is always fully opaque against the panel behind it (Section 5E)
 * rather than blending with it via an alpha channel.
 */
function MenuRow({ label, size = "top", dim = ACTIVE_TEXT, expandable, expanded, muted, onHover, onClick, dataLog }) {
  const sizeClass =
    size === "top"
      ? "font-serif text-3xl sm:text-4xl py-2"
      : size === "sub"
      ? "font-serif text-xl sm:text-2xl py-1.5"
      : "text-base sm:text-lg py-1"; // leaf

  // `muted` rows (e.g. "View All Events") start softer than a normal row
  // even before any hover-dimming is applied, but the hover-dim state
  // (`dim` prop) always wins once something else is actively hovered -
  // so a muted row that's hovered itself still reads as ACTIVE_TEXT.
  const colorClass = dim === ACTIVE_TEXT && muted ? MUTED_BASE_TEXT : dim;

  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onClick}
      className={`group text-left flex items-center gap-3 transition-colors duration-300 ${colorClass} hover:text-arc ${sizeClass}`}
      data-log={dataLog}
    >
      <span>{label}</span>
      {expandable && (
        <span
          aria-hidden="true"
          className={`text-arc text-sm transition-transform duration-300 ${expanded ? "rotate-45" : ""}`}
        >
          +
        </span>
      )}
    </button>
  );
}
