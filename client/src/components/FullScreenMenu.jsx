import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const PORTAL_PATH = {
  registration_team: "/registration-team",
  coordinator: "/coordinator",
  hospitality: "/hospitality",
  certificate_team: "/certificates",
  volunteer: "/volunteer",
  master_admin: "/admin",
  participant: "/dashboard",
};

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/verify-certificate", label: "Verify Certificate" },
  { to: "/status", label: "Status" },
  { to: "/help", label: "Help Desk" },
];

/**
 * Full-screen dark slide-out menu, in place of a small dropdown - per the
 * cinematic/luxury layout brief (large nav links on a full-screen overlay
 * rather than a compact menu panel). Crossfades in/out via CSS rather than
 * sliding, keeping the "slow, deliberate" motion language from the brief.
 */
export default function FullScreenMenu({ open, onClose }) {
  const { user, logout } = useAuth();
  const { toggleLang, lang } = useLanguage();
  const navigate = useNavigate();

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

  return (
    <div
      className="fixed inset-0 z-[100] bg-base/97 backdrop-blur-md animate-menu-fade flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <div className="flex items-center justify-between px-6 sm:px-12 py-6">
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

      <nav className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8">
        {LINKS.map((link, i) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            className="font-serif text-3xl sm:text-5xl text-offwhite hover:text-arc transition-colors duration-300"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {link.label}
          </Link>
        ))}

        <div className="mt-6 flex flex-col items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => go(PORTAL_PATH[user.role] || "/dashboard")}
                className="nav-link-cinematic text-arc"
                data-log="menu-go-dashboard"
              >
                Dashboard
              </button>
              <button onClick={handleLogout} className="nav-link-cinematic" data-log="menu-logout">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => go("/login")} className="nav-link-cinematic text-arc" data-log="menu-login">
              Login
            </button>
          )}

          <button onClick={toggleLang} className="nav-link-cinematic" data-log="menu-toggle-lang">
            {lang === "en" ? "தமிழ் (Switch to Tamil)" : "English (Switch to English)"}
          </button>
        </div>
      </nav>

      <div className="text-center pb-8 text-[10px] uppercase tracking-cinematic text-offwhite/30">
        TechAstra National Symposium
      </div>
    </div>
  );
}
