import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePanels } from "../context/PanelContext";
import { api } from "../lib/api";
import { getEventImage, HERO_IMAGES, CATEGORY_IMAGES } from "../lib/eventImages";
import TechAstraLogo from "./TechAstraLogo";

/**
 * Rolls-Royce inspired full-screen menu overlay with Events drill-down
 *
 * RIGHT PANEL has two states:
 *   - IDLE (menu just opened, or hovering something with no photo of
 *     its own, e.g. "My Dashboard"/"Help Desk") - plain frosted glass,
 *     the exact same tint+blur (`glassStyle`) as the left nav, with NO
 *     image on top. This is what fixed the earlier bug where a
 *     hardcoded stock photo appeared immediately on open and visually
 *     disagreed with the left side's actual page/video backdrop.
 *   - EVENTS PREVIEW (hovering "Events" itself, a category, an
 *     individual event, "View All Events", or "Verify Certificate") -
 *     the relevant real photo (generic events cover / that category's
 *     cover / that specific event's photo / the certificate cover)
 *     fades in ON TOP of the same frosted-glass base, through a
 *     translucent scrim so it stays moody rather than a plain crisp
 *     photo. A bottom-center pill CTA ("Discover Events" / "Discover
 *     More" / etc., matching the Rolls-Royce reference's own button
 *     placement) fades in with it, linking straight to that row's
 *     page - lets a user jump directly into "Hackathon" from the
 *     preview without first clicking the row on the left.
 *
 * FROSTED-GLASS FORMULA (top bar, left nav, right panel's base layer
 * all match): a heavy translucent dark tint (rgba(13,3,3,0.75)) PLUS a
 * strong blur (72px, applied via inline style since Tailwind's
 * backdrop-blur-* scale tops out at 64px - not enough to fully dissolve
 * large high-contrast content like the site's logo/hero text into
 * abstract color the way the reference site does). Tint alone looks
 * like a flat dark filter with no depth; blur alone leaves text/shapes
 * underneath readable, competing with the menu's own labels. Both
 * together is what actually reads as "frosted glass".
 */

const ACTIVE_TEXT = "text-offwhite";
const DIM_TEXT = "text-[#78787f]";
const MUTED_TEXT = "text-[#bcbbbd]";

const PORTAL_PATH = {
  registration_team: "/registration-team",
  coordinator: "/coordinator",
  hospitality: "/hospitality",
  certificate_team: "/certificates",
  volunteer: "/volunteer",
  master_admin: "/admin",
  participant: "/dashboard",
};

// Primary navigation items (Events will have drill-down)
const PRIMARY_NAV = [
  { key: "register", label: "Register", to: "/register" },
  { key: "dashboard", label: "My Dashboard", to: "/status" },
  { key: "help", label: "Help Desk", action: "openPanel:help" },
  { key: "verify", label: "Verify Certificate", to: "/verify-certificate" },
];

const CATEGORY_META = {
  technical: { label: "Technical" },
  non_technical: { label: "Non-Technical" },
};

// Small magnifier glyph for the top-right utility slot - mirrors the
// reference site's "FIND A DEALER" search icon treatment.
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

export default function FullScreenMenu({ open, onClose }) {
  const { user, logout } = useAuth();
  const { toggleLang, lang } = useLanguage();
  const { openPanel } = usePanels();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  // What the right panel shows on top of the frosted-glass base:
  //   { image, to, label } - a photo, the route it links to, and the
  //   CTA button's text (mirrors the reference site's bottom-center
  //   "DISCOVER" pill that appears once a specific model is being
  //   previewed).
  // `null` = nothing but the plain frosted glass (IDLE state). Only
  // ever set by rows inside the Events tree (or Verify Certificate) -
  // rows with no dedicated photo (Dashboard/Help Desk) explicitly reset
  // this back to `null` on hover, they never inherit a stale preview
  // from whatever was hovered before.
  const [preview, setPreview] = useState(null);

  // Animation state for clean open/close transitions
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef(null);
  const navRef = useRef(null);

  // Group events by category
  const byCategory = useMemo(() => {
    const map = { technical: [], non_technical: [] };
    for (const e of events) {
      const cat = e.category === "non_technical" ? "non_technical" : "technical";
      map[cat].push(e);
    }
    return map;
  }, [events]);

  // Fetch events when menu opens
  useEffect(() => {
    if (!open || events.length > 0) return;
    api.get("/api/events")
      .then((data) => setEvents(data.events || []))
      .catch(() => {});
  }, [open, events.length]);

  // Reset drill-down on menu close/open. Right panel starts back at
  // IDLE (no preview) every time the menu (re)opens.
  useEffect(() => {
    if (open) {
      setEventsExpanded(false);
      setExpandedCategory(null);
      setPreview(null);
    }
  }, [open]);

  // Auto-scroll to top when drill-down changes
  useEffect(() => {
    if (navRef.current) navRef.current.scrollTop = 0;
  }, [eventsExpanded, expandedCategory]);

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

  const go = useCallback(
    (path) => {
      onClose();
      navigate(path);
    },
    [onClose, navigate]
  );

  const handleNavClick = useCallback(
    (item) => {
      if (item.action === "openPanel:help") {
        onClose();
        openPanel("help");
      } else if (item.to) {
        go(item.to);
      }
    },
    [onClose, openPanel, go]
  );

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/events");
  };

  if (!mounted) return null;

  // Dim effect: hovered item stays bright, others dim
  const dimClass = (key) =>
    hoveredKey && hoveredKey !== key ? DIM_TEXT : ACTIVE_TEXT;

  // Shared frosted-glass style object - used identically on the top
  // bar, left nav, AND right panel so all three read as ONE consistent
  // surface over the same backdrop rather than three different
  // treatments.
  const glassStyle = {
    background: "rgba(13,3,3,0.75)",
    backdropFilter: "blur(72px)",
    WebkitBackdropFilter: "blur(72px)",
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-transparent flex flex-col ${
        closing ? "animate-menu-fade-out" : "animate-menu-fade-in"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      {/* THE ROOT WRAPPER IS `bg-transparent`, deliberately, not a solid
          color - `backdrop-filter` only has something to blur if the
          layers PAINTED BENEATH the element are visible. An opaque
          ancestor covering the full viewport would leave nothing but
          flat color underneath every `backdrop-filter` child below, so
          this root must stay see-through for the whole frosted-glass
          effect to work at all. What actually shows through is the
          shared cinematic video backdrop + whatever page is open behind
          this overlay (both mounted once in App.jsx). */}

      {/* Top bar */}
      <div
        className="relative flex items-center justify-between px-8 sm:px-16 py-7 shrink-0"
        style={glassStyle}
      >
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="group flex items-center gap-3 text-offwhite/80 hover:text-arc transition-colors"
          data-log="close-fullscreen-menu"
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-full border border-white/25 group-hover:border-arc/60 transition-colors text-base leading-none">
            ×
          </span>
          <span className="text-[11px] tracking-cinematic uppercase">Close</span>
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <TechAstraLogo size="sm" showGlow={false} />
        </div>

        {user ? (
          <button
            onClick={() => go(PORTAL_PATH[user.role] || "/dashboard")}
            className="flex items-center gap-2 text-offwhite/70 hover:text-arc transition-colors text-[11px] tracking-cinematic uppercase"
            data-log="menu-top-dashboard"
          >
            <SearchIcon />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        ) : (
          <Link
            to="/login"
            onClick={onClose}
            className="flex items-center gap-2 text-offwhite/70 hover:text-arc transition-colors text-[11px] tracking-cinematic uppercase"
            data-log="menu-top-login"
          >
            <SearchIcon />
            <span className="hidden sm:inline">Login</span>
          </Link>
        )}
      </div>

      {/* Thin full-width divider directly under the top bar, matching
          the hairline the reference site runs under its logo row. */}
      <div className="h-px bg-white/10 mx-8 sm:mx-16 shrink-0" aria-hidden="true" />

      {/* Split screen: left navigation / right panel - BOTH frosted
          glass over the same backdrop now, see the JSDoc note above. */}
      <div className="flex-1 grid lg:grid-cols-2 overflow-hidden">
        {/* LEFT: Primary navigation */}
        <nav
          ref={navRef}
          className="flex flex-col justify-start px-8 sm:px-16 py-16 overflow-y-auto"
          style={glassStyle}
          onMouseLeave={() => {
            setHoveredKey(null);
            setPreview(null);
          }}
        >
          {/* Events section with hover-based drill-down (Rolls-Royce style) */}
          <div 
            className="mb-8"
            onMouseEnter={() => {
              setHoveredKey("events");
              setEventsExpanded(true);
              setPreview({ image: HERO_IMAGES.flagship, to: "/events", label: "Discover Events" });
            }}
            onMouseLeave={() => {
              setEventsExpanded(false);
              setExpandedCategory(null);
            }}
          >
            <MenuRow
              label="Events"
              expandable
              expanded={eventsExpanded}
              dim={dimClass("events")}
              onClick={() => go("/events")}
              dataLog="menu-category-events"
            />

            {/* Level 2: Technical / Non-Technical / View All - appears on hover */}
            {eventsExpanded && (
              <div className="pl-5 sm:pl-8 mt-3 mb-3 flex flex-col gap-2 border-l border-crimson/15">
                {["technical", "non_technical"].map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const isExpanded = expandedCategory === cat;
                  return (
                    <div 
                      key={cat}
                      onMouseEnter={() => {
                        setHoveredKey(`cat-${cat}`);
                        setExpandedCategory(cat);
                        setPreview({
                          image: CATEGORY_IMAGES[cat],
                          to: "/events",
                          label: `Discover ${meta.label}`,
                        });
                      }}
                    >
                      <MenuRow
                        size="sub"
                        label={meta.label}
                        expandable
                        expanded={isExpanded}
                        dim={dimClass(`cat-${cat}`)}
                        onClick={() => go("/events")}
                        dataLog={`menu-events-${cat}`}
                      />

                      {/* Level 3: individual events in this category - appears on hover */}
                      {isExpanded && (
                        <div className="pl-5 sm:pl-8 mt-2 mb-2 flex flex-col gap-1 border-l border-crimson/10">
                          {byCategory[cat].length === 0 && (
                            <span className="text-offwhite/40 text-sm py-1.5">
                              No events yet
                            </span>
                          )}
                          {byCategory[cat].map((ev) => (
                            <MenuRow
                              key={ev.id}
                              size="leaf"
                              label={ev.name}
                              dim={dimClass(`event-${ev.id}`)}
                              onHover={() => {
                                setHoveredKey(`event-${ev.id}`);
                                setPreview({
                                  image: getEventImage(ev.name),
                                  to: `/events/${ev.id}`,
                                  label: "Discover More",
                                });
                              }}
                              onClick={() => go(`/events/${ev.id}`)}
                              dataLog={`menu-event-${ev.id}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* View All Events */}
                <MenuRow
                  size="sub"
                  label="View All Events"
                  dim={dimClass("view-all")}
                  muted
                  onHover={() => {
                    setHoveredKey("view-all");
                    setPreview({ image: HERO_IMAGES.flagship, to: "/events", label: "Discover Events" });
                  }}
                  onClick={() => go("/events")}
                  dataLog="menu-events-view-all"
                />
              </div>
            )}
          </div>

          {/* Other primary navigation items - uniform styling. */}
          <div className="flex flex-col gap-6 mb-auto">
            {PRIMARY_NAV.map((item) => (
              <MenuRow
                key={item.key}
                label={item.label}
                dim={dimClass(item.key)}
                onHover={() => {
                  setHoveredKey(item.key);
                  // Only "Verify Certificate" has a dedicated cover +
                  // CTA; Dashboard/Help Desk explicitly clear back to
                  // IDLE (no preview) rather than keeping whatever was
                  // previously hovered.
                  setPreview(
                    item.key === "verify"
                      ? { image: HERO_IMAGES.registrations, to: item.to, label: "Discover More" }
                      : null
                  );
                }}
                onClick={() => handleNavClick(item)}
                dataLog={`menu-category-${item.key}`}
              />
            ))}
          </div>

          {/* Utility links at bottom - separated and smaller */}
          <div className="mt-16 pt-8 border-t border-crimson/10 flex flex-wrap gap-6 text-sm text-offwhite/60">
            {user ? (
              <>
                <button
                  onClick={() => go(PORTAL_PATH[user.role] || "/dashboard")}
                  className="hover:text-arc transition-colors"
                  data-log="menu-util-dashboard"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="hover:text-arc transition-colors"
                  data-log="menu-util-logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={onClose}
                className="hover:text-arc transition-colors"
                data-log="menu-util-login"
              >
                Login
              </Link>
            )}
            <button
              onClick={toggleLang}
              className="hover:text-arc transition-colors"
              data-log="menu-util-lang"
            >
              {lang === "en" ? "தமிழ்" : "English"}
            </button>
          </div>
        </nav>

        {/* RIGHT: frosted-glass BASE layer (identical `glassStyle` to
            the left nav) is always present. When `preview` is set -
            i.e. the user is hovering something inside the Events tree,
            or Verify Certificate - the relevant photo crossfades in ON
            TOP of that base through a dark scrim, so it reads as "a
            photo revealed through the frosted glass" rather than a
            plain crisp image sitting flatly on the panel. A bottom-
            center "Discover"-style pill CTA (matching the Rolls-Royce
            reference's button placement) fades in alongside it,
            linking straight to that event/category/certificate page -
            so a user previewing "Hackathon" can jump directly into it
            without first clicking through the drill-down tree. Both
            the photo and the button are re-keyed by their target route
            so `.animate-menu-image-fade` plays a fresh crossfade each
            time the hovered row changes. When `preview` is null,
            nothing renders here at all and the plain frosted base
            (matching the left nav) is all that's visible. */}
        <div className="relative hidden lg:block overflow-hidden" style={glassStyle}>
          {preview && (
            <img
              key={preview.image}
              src={preview.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover animate-menu-image-fade"
              style={{ filter: "brightness(0.55) saturate(0.9)" }}
            />
          )}
          {/* Dark scrim over the photo (when present) so it stays
              moody and consistent with the rest of the overlay's tone,
              rather than a bright, fully-saturated photo breaking the
              mood. */}
          {preview && <div className="absolute inset-0 bg-void/35" aria-hidden="true" />}

          {/* Bottom-center CTA pill - only present while previewing
              something specific. `onClick` reuses the same `go()`
              helper every other row's click uses (closes the menu,
              then navigates), so this behaves identically to clicking
              the row itself on the left. */}
          {preview && (
            <div
              key={`${preview.to}-cta`}
              className="absolute inset-x-0 bottom-12 flex justify-center animate-menu-image-fade"
            >
              <button
                type="button"
                onClick={() => go(preview.to)}
                className="px-8 py-3 rounded-full bg-arc text-void text-[11px] font-semibold tracking-cinematic uppercase hover:bg-arc/90 transition-colors shadow-lg"
                data-log="menu-preview-discover"
              >
                {preview.label}
              </button>
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
 * `dim` is the caller-computed text-color class (ACTIVE_TEXT / DIM_TEXT / MUTED_TEXT)
 * implementing the dim-siblings-on-hover effect.
 */
function MenuRow({ 
  label, 
  size = "top", 
  dim = ACTIVE_TEXT, 
  expandable, 
  expanded, 
  muted, 
  onHover, 
  onClick, 
  dataLog 
}) {
  // Reference site (Rolls-Royce) uses small, uppercase, letter-spaced
  // sans-serif labels for its top-level nav ("INSPIRING GREATNESS",
  // "MODELS", "BESPOKE"...) with generous vertical rhythm between rows -
  // NOT giant serif headlines.
  const sizeClass =
    size === "top"
      ? "text-base sm:text-lg tracking-cinematic uppercase py-3.5"
      : size === "sub"
      ? "text-sm sm:text-base tracking-cinematic uppercase py-2.5"
      : "text-sm py-1.5"; // leaf - individual event names, sentence case is fine here

  // Muted rows (e.g. "View All Events") start softer than a normal row
  const colorClass = dim === ACTIVE_TEXT && muted ? MUTED_TEXT : dim;

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
          className={`text-arc text-sm transition-transform duration-300 ${
            expanded ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      )}
    </button>
  );
}
