import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Events from "./pages/Events";
import Cart from "./pages/Cart";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Status from "./pages/Status";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import VerifyCertificate from "./pages/VerifyCertificate";
import HelpDesk from "./pages/HelpDesk";

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
          <Route path="/cart" element={<Cart />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/status" element={<Status />} />
          <Route path="/login" element={<Login />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />
          <Route path="/help" element={<HelpDesk />} />

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

function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 text-center text-white/40 text-sm">
      TechAstra National Symposium · Built with Kiro
    </footer>
  );
}
