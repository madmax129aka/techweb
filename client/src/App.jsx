import React from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HelpDeskPanel from "./components/panels/HelpDeskPanel";

import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Cart from "./pages/Cart";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Status from "./pages/Status";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VerifyCertificate from "./pages/VerifyCertificate";

import RegistrationTeamPortal from "./pages/portals/RegistrationTeamPortal";
import CoordinatorPortal from "./pages/portals/CoordinatorPortal";
import HospitalityPortal from "./pages/portals/HospitalityPortal";
import CertificatePortal from "./pages/portals/CertificatePortal";
import VolunteerPortal from "./pages/portals/VolunteerPortal";
import AdminPortal from "./pages/portals/AdminPortal";

export default function App() {
  const { pathname } = useLocation();
  // "The Core" cinematic Login scene (Login.jsx) renders its own
  // full-viewport header, cursor, and background - it is intentionally
  // NOT another page living inside the site's normal chrome. Skipping
  // the global Navbar/Footer/top-padding ONLY for this one route (every
  // other page is completely unaffected) avoids stacking two headers/
  // cursors/footers on top of each other on /login.
  const isCinematicLogin = pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col">
      {!isCinematicLogin && <Navbar />}
      {/*
        The navbar is `fixed` (so it can transparently overlay hero
        imagery on pages like EventDetail's banner), so normal page flow
        needs top padding to avoid content sitting underneath it. Every
        route gets this uniformly now - there used to be a marketing
        homepage exempted from it (a full-bleed hero running behind the
        transparent nav), but this app's scope was corrected to be the
        Registration Portal only, with no homepage of its own (see
        Events.jsx, the actual entry point). /login is the one other
        exception, for the reason above - its own Login.css handles the
        page's full-viewport layout itself.
      */}
      <main className={isCinematicLogin ? "flex-1" : "flex-1 pt-[76px]"}>
        <Routes>
          {/* This app's entry point is /events, not a marketing
              homepage - the separate main site links "Register"
              straight into /events. */}
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/status" element={<Status />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["participant"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registration-team"
            element={
              <ProtectedRoute roles={["registration_team", "master_admin"]}>
                <RegistrationTeamPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator"
            element={
              <ProtectedRoute roles={["coordinator", "master_admin"]}>
                <CoordinatorPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitality"
            element={
              <ProtectedRoute roles={["hospitality", "master_admin"]}>
                <HospitalityPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <ProtectedRoute roles={["certificate_team", "master_admin"]}>
                <CertificatePortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute roles={["volunteer", "master_admin"]}>
                <VolunteerPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["master_admin"]}>
                <AdminPortal />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isCinematicLogin && <Footer />}

      {/*
        Help Desk is still a slide-in overlay panel (mounted once here,
        alongside FullScreenMenu) - only Registration moved off this
        pattern and onto routed pages. See PanelContext for how any page
        opens this via usePanels().openPanel("help"). Left mounted on
        every route including /login, since Login's own header still
        needs somewhere for its hamburger to open a menu from, and this
        is also where Help Desk's panel state lives.
      */}
      <HelpDeskPanel />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center flex-col gap-2">
      <h1 className="font-heading text-3xl font-bold">404</h1>
      <p className="text-white/60">Page not found.</p>
    </div>
  );
}

// A single minimal dark bar - small utility links only, nothing
// decorative - per the reference site's restrained footer treatment.
// FAQ was dropped (marketing content, lives on the separate main site
// now); Verify Certificate and Status remain since both are part of
// this Registration Portal's own flow.
function Footer() {
  return (
    <footer className="border-t border-crimson/10 bg-void">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] tracking-wide text-offwhite/35">
        <span>&copy; {new Date().getFullYear()} TechAstra National Symposium</span>
        <div className="flex items-center gap-6">
          <Link to="/verify-certificate" className="hover:text-arc transition-colors" data-log="footer-verify-certificate">
            Verify Certificate
          </Link>
          <Link to="/status" className="hover:text-arc transition-colors" data-log="footer-status">
            Status
          </Link>
        </div>
      </div>
    </footer>
  );
}
