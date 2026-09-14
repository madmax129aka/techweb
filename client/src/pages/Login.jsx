import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import TechAstraCore from "../components/TechAstraCore";
import FullScreenMenu from "../components/FullScreenMenu";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Login.css";

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
 * "The Core" cinematic Login scene - built to an exact, literal build
 * spec (given verbatim by the user) rather than the site's usual
 * component-reuse conventions. Every class name, layout value, and CSS
 * rule lives in the co-located Login.css and is scoped to `.login-page`
 * so nothing here leaks onto any other route.
 *
 * Two deliberate departures from the spec's literal JSX, both because
 * the spec's own placeholders (<CartIcon/>, <MenuHamburger/>) don't
 * exist as real components anywhere in this codebase - using the site's
 * REAL working equivalents instead of inventing new placeholder
 * components that would just be decorative:
 *   - <CartIcon/> -> the exact same cart glyph + badge Navbar.jsx uses,
 *     reading live count from useCart() (not a static icon).
 *   - <MenuHamburger/> -> the site's real FullScreenMenu overlay
 *     (Events / My Dashboard / Help Desk / Verify Certificate), opened
 *     by the same three-line hamburger button, mounted directly on this
 *     page since Login intentionally does not render the global Navbar
 *     (see the App.jsx route-based exception for why).
 *
 * The email/password form's behavior (useAuth().login, role-based
 * redirect, toast feedback) is preserved exactly as it worked before
 * this rebuild - only the surrounding visual shell changed.
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { login } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  // ============================================================
  // Custom two-ring cursor (spec: "Inner ring snaps to the pointer
  // instantly ... Outer ring lerps toward the inner ring's position at
  // rate 0.2 per frame"). Refs used instead of React state for the
  // per-frame position updates so this doesn't trigger a re-render on
  // every mousemove/animation frame - only style.transform is mutated
  // directly, the same pattern VisionCursor.jsx (the app's other custom
  // cursor) already uses for the same reason.
  // ============================================================
  const cursorInnerRef = useRef(null);
  const cursorOuterRef = useRef(null);

  useEffect(() => {
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const outerPos = { ...pos };
    let frame;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      // Inner ring: snaps instantly, no lerp - set directly here rather
      // than waiting for the next rAF tick, per "snaps to the pointer
      // instantly" in the spec.
      if (cursorInnerRef.current) {
        cursorInnerRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      }
    };

    const tick = () => {
      // Outer ring: lerp factor 0.2 per frame toward the inner ring's
      // (i.e. the pointer's) position - the exact fixed value from the
      // spec's "Interaction & animation values" section.
      outerPos.x += (pos.x - outerPos.x) * 0.2;
      outerPos.y += (pos.y - outerPos.y) * 0.2;
      if (cursorOuterRef.current) {
        cursorOuterRef.current.style.transform = `translate(${outerPos.x}px, ${outerPos.y}px) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}`);
      navigate(PORTAL_PATH[user.role] || "/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="cursor-inner" ref={cursorInnerRef} />
      <div className="cursor-outer" ref={cursorOuterRef} />

      <header className="login-header">
        <div className="brand">
          TECHASTRA<span className="brand-year">26</span>
        </div>
        <nav className="header-nav">
          <a href="/events">EVENTS</a>
          <span className="nav-dot" />
          <a href="/verify-certificate">VERIFY CERTIFICATE</a>
        </nav>
        <div className="header-actions">
          {/* Real cart glyph + live badge count, not a static <CartIcon/> - see the file-level note above. */}
          <Link to="/cart" aria-label="Cart" className="relative" style={{ display: "flex", color: "#ffffff" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {items.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  background: "#EF4444",
                  color: "#ffffff",
                  fontSize: 9,
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {items.length}
              </span>
            )}
          </Link>
          <span className="login-label">LOGIN</span>
          {/* Real hamburger opening the site's FullScreenMenu overlay, not a static <MenuHamburger/> - see the file-level note above. */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, background: "none", border: "none", padding: 0 }}
          >
            <span style={{ display: "block", width: 24, height: 1, background: "rgba(255,255,255,0.85)" }} />
            <span style={{ display: "block", width: 24, height: 1, background: "rgba(255,255,255,0.85)" }} />
            <span style={{ display: "block", width: 16, height: 1, background: "rgba(255,255,255,0.85)" }} />
          </button>
        </div>
      </header>

      <div className="login-body">
        <div className="core-panel">
          <div className="core-canvas-frame">
            <TechAstraCore size={480} />
          </div>
          <p className="core-eyebrow">TECHASTRA &middot; 2026</p>
          <h2 className="core-tagline">
            One symposium. Eight
            <br />
            tracks. A single
            <br />
            unforgettable day.
          </h2>
        </div>

        <div className="form-panel">
          <p className="form-eyebrow">WELCOME BACK</p>
          <h1 className="form-title">Login</h1>
          <p className="form-subtitle">Participants can only log in once their registration is approved.</p>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <label htmlFor="login-email">EMAIL</label>
            <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

            <label htmlFor="login-password">PASSWORD</label>
            <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          <Link className="status-link" to="/status">
            CHECK REGISTRATION STATUS
          </Link>
        </div>
      </div>

      <FullScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
