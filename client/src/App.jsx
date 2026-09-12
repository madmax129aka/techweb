import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RegistrationPanel from "./components/panels/RegistrationPanel";
import HelpDeskPanel from "./components/panels/HelpDeskPanel";

import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Cart from "./pages/Cart";
import Status from "./pages/Status";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import VerifyCertificate from "./pages/VerifyCertificate";
import Gallery from "./pages/Gallery";
import FAQ from "./pages/FAQ";

import RegistrationTeamPortal from "./pages/portals/RegistrationTeamPortal";
import CoordinatorPortal from "./pages/portals/CoordinatorPortal";
import HospitalityPortal from "./pages/portals/HospitalityPortal";
import CertificatePortal from "./pages/portals/CertificatePortal";
import VolunteerPortal from "./pages/portals/VolunteerPortal";
import AdminPortal from "./pages/portals/AdminPortal";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/*
        The navbar is now `fixed` (so it can transparently overlay hero
        imagery, per the cinematic layout). That means normal page flow
        needs top padding to avoid content sitting underneath it - EXCEPT
        the homepage, whose hero is deliberately meant to run full-bleed
        behind the transparent nav. Home.jsx compensates for this itself
        with a matching negative top margin on its hero section.
      */}
      <main className="flex-1 pt-[76px]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/status" element={<Status />} />
          <Route path="/login" element={<Login />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/faq" element={<FAQ />} />

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
      <Footer />

      {/*
        Slide-in form overlays, mounted once here (like FullScreenMenu)
        rather than as routed pages - see PanelContext for how any page
        opens these via usePanels().openPanel("registration" | "help").
      */}
      <RegistrationPanel />
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
function Footer() {
  return (
    <footer className="border-t border-crimson/10 bg-void">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] tracking-wide text-offwhite/35">
        <span>&copy; {new Date().getFullYear()} TechAstra National Symposium</span>
        <div className="flex items-center gap-6">
          <Link to="/faq" className="hover:text-arc transition-colors" data-log="footer-faq">
            FAQ
          </Link>
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
