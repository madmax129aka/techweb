import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "./ui/Button";
import TechAstraLogo from "./TechAstraLogo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { t, toggleLang, lang } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const portalPath = (role) =>
    ({
      registration_team: "/registration-team",
      coordinator: "/coordinator",
      hospitality: "/hospitality",
      certificate_team: "/certificates",
      volunteer: "/volunteer",
      master_admin: "/admin",
      participant: "/dashboard",
    }[role] || "/dashboard");

  return (
    <header className="sticky top-0 z-40 glass-gold border-b border-gold/15">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5">
        <Link to="/" className="flex items-center">
          <TechAstraLogo size="sm" />
        </Link>

        <div className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wide text-white/70">
          {[
            { to: "/", label: t("home") },
            { to: "/events", label: t("events") },
            { to: "/leaderboard", label: t("leaderboard") },
            { to: "/verify-certificate", label: t("verifyCertificate") },
            { to: "/status", label: "Status" },
            { to: "/help", label: "Help Desk" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative py-1 hover:text-gold-light transition-colors group"
            >
              {link.label}
              <span className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 bg-gold-gradient group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="text-xs px-2.5 py-1 rounded-full border border-gold/30 text-gold-light/80 hover:border-gold hover:text-gold-light"
            aria-label="Toggle language"
          >
            {lang === "en" ? "தமிழ்" : "EN"}
          </button>

          <Link to="/cart" className="relative text-white/80 hover:text-gold-light">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-ring-red text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center animate-live-pulse">
                {items.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link to={portalPath(user.role)}>
                <Button size="sm" variant="outline">{t("dashboard")}</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:block">
              <Button size="sm" variant="primary">{t("login")}</Button>
            </Link>
          )}

          <button
            className="md:hidden text-gold-light"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm font-medium text-white/80 border-t border-gold/10 pt-3">
          <Link to="/" onClick={() => setOpen(false)}>{t("home")}</Link>
          <Link to="/events" onClick={() => setOpen(false)}>{t("events")}</Link>
          <Link to="/leaderboard" onClick={() => setOpen(false)}>{t("leaderboard")}</Link>
          <Link to="/verify-certificate" onClick={() => setOpen(false)}>{t("verifyCertificate")}</Link>
          <Link to="/status" onClick={() => setOpen(false)}>Status</Link>
          <Link to="/help" onClick={() => setOpen(false)}>Help Desk</Link>
          {user ? (
            <>
              <Link to={portalPath(user.role)} onClick={() => setOpen(false)}>{t("dashboard")}</Link>
              <button className="text-left" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}>{t("login")}</Link>
          )}
        </div>
      )}
    </header>
  );
}
