import React from "react";
import LiquidMetalHero from "@/components/ui/liquid-metal-hero";

/**
 * "Registration Approved" welcome moment - the one deliberate exception
 * to this app's "no marketing hero anywhere" rule (see App.jsx's scope-
 * correction notes and DESIGN_BRIEF.md). This is justified specifically
 * because it's a GATED, POST-LOGIN, ONE-TIME celebratory screen for an
 * already-approved participant, not a public front-page/marketing
 * moment - it never appears on Events, Login, or anywhere in the
 * public/pre-approval flow. See Dashboard.jsx for the actual gating
 * logic (registration.status === "approved" AND not already seen).
 */
export default function ApprovalHero({ participantName, registeredEvents, onDownloadIdCard, onViewEvents }) {
  return (
    <LiquidMetalHero
      badge="✅ REGISTRATION APPROVED"
      title={`Welcome aboard, ${participantName}.`}
      subtitle="Your payment has been verified and your spot at TechAstra 2026 is confirmed. Your digital ID card is ready — download it now to check in on event day."
      primaryCtaLabel="DOWNLOAD ID CARD"
      secondaryCtaLabel="VIEW MY EVENTS"
      onPrimaryCtaClick={onDownloadIdCard}
      onSecondaryCtaClick={onViewEvents}
      features={registeredEvents.slice(0, 3).map((e) => e.name)}
    />
  );
}
