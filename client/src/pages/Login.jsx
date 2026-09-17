import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import TechAstraLogo from "../components/TechAstraLogo";
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
 * "The Core" Login scene - a centered glassmorphism sign-in card (modern
 * 21st.dev-style layout: logo, title, email/password, primary CTA) over
 * the site's shared cinematic video background.
 *
 * The video itself is NOT rendered here anymore - it comes from the one
 * shared <CinematicBackground/> mounted in App.jsx behind the whole app
 * shell, so Login shows the exact same semi-blurred/dimmed treatment as
 * every other page instead of its own separately-tuned full-clarity copy.
 * This page only adds its own vignette on top for extra focal contrast
 * around the card.
 *
 * Adapted to this codebase rather than dropped in verbatim from the
 * pasted 21st.dev demo: it stays JSX (the app isn't TypeScript), and it
 * keeps TechAstra's REAL auth - the email/password form calls
 * useAuth().login and redirects by the SERVER-returned role via
 * PORTAL_PATH, with toast feedback - instead of the demo component's
 * non-functional Google/GitHub/Apple social buttons.
 *
 * All styling stays scoped under `.login-page` (see Login.css) so nothing
 * leaks onto other routes; the page still renders outside the global
 * Navbar/Footer (App.jsx route exception).
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { login } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const cursorInnerRef = useRef(null);
  const cursorOuterRef = useRef(null);

  // ============================================================
  // Custom two-ring cursor - inner ring snaps to the pointer instantly,
  // outer ring lerps toward it at 0.2/frame. Skipped under reduced motion
  // (the CSS also restores the default cursor then).
  // ============================================================
  useEffect(() => {
    if (reduce) return;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const outerPos = { ...pos };
    let frame;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (cursorInnerRef.current) {
        cursorInnerRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      }
    };

    const tick = () => {
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
  }, [reduce]);

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
      {/* ---- Extra focal vignette on top of the shared cinematic
          background, darkening the edges around the card ---- */}
      <div className="login-vignette" aria-hidden="true" />

      {/* ---- Two-ring custom cursor ---- */}
      {!reduce && (
        <>
          <div className="cursor-inner" ref={cursorInnerRef} />
          <div className="cursor-outer" ref={cursorOuterRef} />
        </>
      )}

      {/* ---- Sticky brand header ---- */}
      <header className="login-header">
        <Link to="/events" className="brand" data-log="login-logo">
          <TechAstraLogo size="sm" />
        </Link>
        <nav className="header-nav">
          <a href="/events">EVENTS</a>
          <span className="nav-dot" />
          <a href="/verify-certificate">VERIFY CERTIFICATE</a>
        </nav>
        <div className="header-actions">
          <Link to="/cart" aria-label="Cart" className="relative" style={{ display: "flex", color: "#ffffff" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {items.length > 0 && <span className="login-cart-badge">{items.length}</span>}
          </Link>
          <span className="login-label">LOGIN</span>
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

      {/* ---- Centered glassmorphism sign-in card ---- */}
      <main className="login-stage">
        <div className="login-card">
          <div className="login-card-logo">
            <TechAstraLogo size="sm" showGlow={false} />
          </div>
          <h1 className="login-card-title">Sign in to your portal</h1>
          <p className="login-card-subtitle">
            Participants can only log in once their registration is approved.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="login-email" className="login-field-label">
              EMAIL
            </label>
            <input
              id="login-email"
              className="login-input"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="login-password" className="login-field-label">
              PASSWORD
            </label>
            <input
              id="login-password"
              className="login-input"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <Link className="status-link" to="/status">
            CHECK REGISTRATION STATUS
          </Link>
        </div>
      </main>

      <FullScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
