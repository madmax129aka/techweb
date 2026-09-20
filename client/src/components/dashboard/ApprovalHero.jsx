import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { fadeUp, staggerContainer, EASE_CINEMATIC } from "../../lib/motion";

/**
 * "Registration Approved" welcome moment - the one deliberate exception
 * to this app's "no marketing hero anywhere" rule (see App.jsx's scope-
 * correction notes and DESIGN_BRIEF.md). Justified because it's a GATED,
 * POST-LOGIN, ONE-TIME celebratory screen for an already-approved
 * participant, not a public/pre-approval marketing moment - it never
 * appears on Events, Login, or anywhere in the public/pre-approval flow.
 * See Dashboard.jsx for the actual gating logic (registration.status ===
 * "approved" AND not already seen).
 *
 * REBUILT (was a WebGL "liquid metal" shader hero via a separate shadcn
 * component tree - LiquidMetalHero, components/shadcn/{card,badge,
 * button}.jsx): that version used a fundamentally different rendering
 * system (a real-time GPU shader background) and a different component
 * library (shadcn's default rounded-xl/rounded-md corners and generic
 * color tokens) than literally every other screen in this app, which is
 * exactly why it read as "some other UI" the moment a participant logged
 * in - direct feedback confirmed this. This version uses ONLY the site's
 * own established pieces: `components/ui/Card` (the same `rounded-sm`
 * sharp-cornered glass panel used on every other page), `components/ui/
 * Button` (same primary/outline variants as the rest of the app), the
 * crimson/void/arc/offwhite palette, and the same `font-serif` heading +
 * `tracking-cinematic` uppercase eyebrow pattern every other page's
 * section header already uses (see EventDetail.jsx's "The Portfolio" /
 * "Register" eyebrows for the identical treatment). No shader, no
 * separate design system - the shared `CinematicBackground` video
 * (mounted once in App.jsx, visible behind every page including this
 * one) is the only backdrop, same as everywhere else.
 */
export default function ApprovalHero({ participantName, registeredEvents, onDownloadIdCard, onViewEvents }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-24 text-center">
      <motion.div
        className="relative z-10 max-w-2xl"
        variants={staggerContainer}
        initial={reduce ? false : "hidden"}
        animate="show"
      >
        <motion.p variants={fadeUp} className="text-arc text-[11px] tracking-cinematic uppercase mb-5">
          Registration Approved
        </motion.p>
        <motion.h1 variants={fadeUp} className="font-serif text-4xl sm:text-5xl text-offwhite leading-tight mb-6">
          Welcome aboard, {participantName}.
        </motion.h1>
        <motion.p variants={fadeUp} className="text-offwhite/60 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-12">
          Your payment has been verified and your spot at TechAstra 2026 is confirmed. Your digital ID card is
          ready &mdash; download it now to check in on event day.
        </motion.p>

        {registeredEvents.length > 0 && (
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-left"
          >
            {registeredEvents.slice(0, 3).map((e) => (
              <Card key={e.id} className="!p-4">
                <p className="text-sm text-offwhite/85 font-medium">{e.name}</p>
              </Card>
            ))}
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 flex-wrap">
          <Button size="lg" onClick={onDownloadIdCard} data-log="approval-hero-download-id">
            Download ID Card
          </Button>
          <Button size="lg" variant="outline" onClick={onViewEvents} data-log="approval-hero-view-events">
            View My Events
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
