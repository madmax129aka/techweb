import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import TechAstraLogo from "./TechAstraLogo";
import FullScreenMenu from "./FullScreenMenu";

const PORTAL_PATH = {
  registration_team: "/registration-team",
  coordinator: "/coordinator",
  hospitality: "/hospitality",
  certificate_team: "/certificates",
  volunteer: "/volunteer",
  master_admin: "/admin",
  participant: "/dashboard",
};

/**
 * Slim, mostly-transparent navbar that overlays hero imagery, solidifying
 * to a dark bar only once the page has scrolled past the hero - per the
 * "Rolls-Royce cinematic" layout brief (minimal persistent chrome, nav
 * becomes solid on scroll rather than always being an opaque bar).
 *
 * The full nav menu lives in a full-screen slide-out overlay
 * (FullScreenMenu), not a dropdown - only a couple of quiet text links
 * plus the hamburger/cart/login stay in the persistent bar itself.
 */
export default function Navbar() {
  const { user } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/*
        Section 5E bug fix: when the full-screen menu is open, this header
        used to just sit UNDERNEATH the menu overlay - which is at
        bg-[#0F1424]/98 (98% opaque, not fully opaque), so at certain
        zoom levels/contrast settings the nav links ("EVENTS / LEADERBOARD
        / VERIFY CERTIFICATE") could still ghost through faintly. Rather
        than chase that by making the overlay 100% opaque (which the menu
        component also now does, belt-and-suspenders), the header itself
        is set to `invisible` (Tailwind's visibility: hidden) the moment
        the menu opens - it's removed from the visual render entirely
        (still in the DOM/layout, just not painted), so there is no way
        for it to bleed through regardless of what's on top of it.
      */}
      <header
        className={`nav-cinematic fixed top-0 left-0 right-0 z-50 ${scrolled ? "nav-scrolled" : ""} ${
          menuOpen ? "invisible" : ""
        }`}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 py-4">
          {/* Logo now links to /events, not "/" - this app has no
              homepage of its own (see the scope-correction note in
              App.jsx); /events IS the entry point, so this is just the
              more direct target ("/" still redirects here anyway). */}
          <Link to="/events" className="flex items-center" data-log="nav-logo">
            <TechAstraLogo size="sm" />
          </Link>

          {/* Leaderboard link removed - that page now lives on the
              separate main marketing site, not this Registration Portal
              app (see App.jsx's scope-correction note). */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/events" className="nav-link-cinematic" data-log="nav-events">
              Events
            </Link>
            <Link to="/verify-certificate" className="nav-link-cinematic" data-log="nav-verify-certificate">
              Verify Certificate
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/cart" className="relative text-offwhite/85 hover:text-arc transition-colors" data-log="nav-cart">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-crimson text-offwhite text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <button
                onClick={() => navigate(PORTAL_PATH[user.role] || "/dashboard")}
                className="hidden sm:block nav-link-cinematic text-arc"
                data-log="nav-dashboard"
              >
                Dashboard
              </button>
            ) : (
              <Link to="/login" className="hidden sm:block nav-link-cinematic text-arc" data-log="nav-login">
                Login
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex flex-col items-end gap-1.5 group cursor-hover"
              data-log="nav-open-menu"
            >
              <span className="block w-6 h-px bg-offwhite/85 group-hover:bg-arc transition-colors" />
              <span className="block w-6 h-px bg-offwhite/85 group-hover:bg-arc transition-colors" />
              <span className="block w-4 h-px bg-offwhite/85 group-hover:bg-arc transition-colors" />
            </button>
          </div>
        </nav>
      </header>

      <FullScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
