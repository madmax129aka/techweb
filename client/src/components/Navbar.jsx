import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import FullScreenMenu from "./FullScreenMenu";
import TechAstraLogo from "./TechAstraLogo";
// NOTE ON THE ABOVE IMPORT: TechAstraLogo + CoreWatermark used to be
// intentionally left OUT of this header entirely - the Events landing
// page redesign made the logo the CENTERED hero emblem of that page
// instead (Rolls-Royce style), and having it ALSO in the nav's top-left
// corner was judged a duplicate anchor fighting that page's intended
// symmetry.
//
// Re-added here (top-left, `size="sm"` - same size already used for
// this exact logo in a slim header bar on Login.jsx's own header) at the
// Event Detail page's request: that page's header now floats
// transparently over a full-screen video with no other logo/emblem
// anywhere else on the page (unlike Events.jsx, which still has its own
// large centered logo), so the "duplicate anchor" concern that justified
// removing it doesn't apply there. Showing it site-wide (rather than
// only on Event Detail) keeps this one shared header consistent across
// every route, including Events - where it now sits quietly in the
// corner alongside the nav links, additive to (not competing with) that
// page's own separate hero-sized logo, at a much smaller scale.

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
        used to just sit UNDERNEATH the menu overlay - which was not
        fully opaque, so at certain zoom levels/contrast settings the nav
        links ("EVENTS / VERIFY CERTIFICATE") could still ghost through
        faintly. Rather than chase that by making the overlay 100% opaque
        (which the menu component's `bg-void` also now is,
        belt-and-suspenders), the header itself is set to `invisible`
        (Tailwind's visibility: hidden) the moment the menu opens - it's
        removed from the visual render entirely (still in the
        DOM/layout, just not painted), so there is no way for it to
        bleed through regardless of what's on top of it.
      */}
      <header
        className={`nav-cinematic fixed top-0 left-0 right-0 z-50 ${scrolled ? "nav-scrolled" : ""} ${
          menuOpen ? "invisible" : ""
        }`}
      >
        {/* EXPLICIT h-14 (56px) - not py-3 - so this header has ONE
            canonical height that other layout code (App.jsx's main
            padding, EventDetail's sticky sub-nav top offset) can lock
            to. Padding-only heights are fragile: a later "make the nav
            slimmer" tweak silently breaks every hard-coded offset
            elsewhere. Anything that needs to sit flush under this bar
            should use `top-14` / `pt-14`. */}
        <nav className="max-w-7xl mx-auto h-14 flex items-center justify-between px-5 sm:px-8">
          {/* LEFT CLUSTER: logo (far top-left, before the nav links) +
              functional nav text links. `size="sm"` (no `showGlow`
              override, same default `true` the glow already uses) is
              an exact match for how this logo already renders in a slim
              header bar on Login.jsx's own header (`<TechAstraLogo
              size="sm" />` there too) - not a new size/treatment
              invented for this spot. `shrink-0` keeps it from being
              squeezed by the nav links on medium widths; `gap-6`/`gap-8`
              gives it the same breathing room as the links have from
              each other. */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link to="/events" className="shrink-0" data-log="nav-logo">
              <TechAstraLogo size="sm" />
            </Link>

            {/* Hidden below `md` for phone screens (the hamburger menu on
                the right exposes the same routes there). */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/events" className="nav-link-cinematic" data-log="nav-events">
                Events
              </Link>
              <Link to="/register" className="nav-link-cinematic" data-log="nav-register">
                Register
              </Link>
              <Link to="/verify-certificate" className="nav-link-cinematic" data-log="nav-verify-certificate">
                Verify Certificate
              </Link>
            </div>
          </div>

          {/* Placeholder that occupies the middle slot on phone widths
              where the text links above are hidden (logo still shows),
              so the right cluster (cart/login/hamburger) stays anchored
              right rather than collapsing toward the logo. `flex-1
              md:flex-none` gives the row its expected shape on both
              sides of the breakpoint without needing a whole extra
              media query. */}
          <div className="md:hidden flex-1" aria-hidden="true" />

          <div className="flex items-center gap-5">
            <Link to="/cart" className="relative p-3 -m-3 text-offwhite/85 hover:text-arc transition-colors" aria-label="Shopping cart" data-log="nav-cart">
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
              className="flex flex-col items-end gap-1.5 group cursor-hover p-3 -m-3"
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
