import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { usePanels } from "../context/PanelContext";

const PORTAL_PATH = {
  registration_team: "/registration-team",
  coordinator: "/coordinator",
  hospitality: "/hospitality",
  certificate_team: "/certificates",
  volunteer: "/volunteer",
  master_admin: "/admin",
  participant: "/dashboard",
};

// Two-column menu, per the Rolls-Royce reference: a left column of broad
// nav categories, and a right-hand sub-list that swaps based on which
// category is active (hover on desktop, tap on touch). Each category
// resolves either to a direct route or to a slide-in panel action.
const CATEGORIES = [
  {
    key: "events",
    label: "Events",
    items: [
      { label: "Browse All Events", to: "/events" },
      { label: "Register Now", action: "openPanel:registration" },
      { label: "Live Leaderboard", to: "/leaderboard" },
    ],
  },
  {
    key: "gallery",
    label: "Gallery",
    items: [{ label: "Event Moments", to: "/gallery" }],
  },
  {
    key: "dashboard",
    label: "My Dashboard",
    items: [
      { label: "My Registration Status", to: "/status" },
      { label: "Login", to: "/login" },
    ],
  },
  {
    key: "help",
    label: "Help Desk",
    items: [
      { label: "Frequently Asked Questions", to: "/faq" },
      { label: "Contact Help Desk", action: "openPanel:help" },
      { label: "Verify a Certificate", to: "/verify-certificate" },
    ],
  },
];

/**
 * Full-screen dark slide-out menu, in place of a small dropdown - per the
 * cinematic/luxury layout brief. Two columns: broad categories on the
 * left, a sub-list on the right that changes with the active category
 * (mirrors the reference site's Models/Bespoke/Ownership menu pattern).
 */
export default function FullScreenMenu({ open, onClose }) {
  const { user, logout } = useAuth();
  const { toggleLang, lang } = useLanguage();
  const { openPanel } = usePanels();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);

  if (!open) return null;

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/");
  };

  const handleItemClick = (item) => {
    if (item.action === "openPanel:registration") {
      onClose();
      openPanel("registration");
    } else if (item.action === "openPanel:help") {
      onClose();
      openPanel("help");
    } else if (item.to) {
      go(item.to);
    }
  };

  const active = CATEGORIES.find((c) => c.key === activeCategory) || CATEGORIES[0];

  return (
    <div
      className="fixed inset-0 z-[100] bg-void/97 backdrop-blur-md animate-menu-fade flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <div className="flex items-center justify-between px-6 sm:px-12 py-6 border-b border-crimson/10">
        <span className="font-display text-xs uppercase tracking-cinematic text-arc">TechAstra</span>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="text-offwhite/80 hover:text-arc transition-colors text-3xl leading-none"
          data-log="close-fullscreen-menu"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 grid sm:grid-cols-2 overflow-y-auto">
        {/* Left: broad categories */}
        <nav className="flex flex-col justify-center gap-4 sm:gap-6 px-6 sm:px-16 py-10 border-b sm:border-b-0 sm:border-r border-crimson/10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onMouseEnter={() => setActiveCategory(cat.key)}
              onClick={() => setActiveCategory(cat.key)}
              className={`text-left font-serif text-2xl sm:text-4xl transition-colors duration-300 ${
                activeCategory === cat.key ? "text-arc" : "text-offwhite hover:text-crimson-light"
              }`}
              data-log={`menu-category-${cat.key}`}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Right: sub-list for the active category */}
        <div className="flex flex-col justify-center gap-4 px-6 sm:px-16 py-10">
          {active.items.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className="text-left text-offwhite/70 hover:text-offwhite text-sm sm:text-base tracking-wide transition-colors"
              data-log={`menu-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {item.label}
            </button>
          ))}

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
              {lang === "en" ? "தமிழ் (Switch to Tamil)" : "English (Switch to English)"}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center py-6 text-[10px] uppercase tracking-cinematic text-offwhite/30 border-t border-crimson/10">
        TechAstra National Symposium
      </div>
    </div>
  );
}
