import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_CINEMATIC } from "@/lib/motion";

/**
 * Shared panel primitive. Recolored from the old gold-glow "glass" look
 * to the crimson/arc cinematic palette (the .glass CSS class itself is
 * already crimson-tinted, see index.css) so every page that still used
 * the default Card styling - Leaderboard, Login, Status, Cart,
 * VerifyCertificate, Dashboard, and every staff portal - picks up the
 * theme automatically instead of looking like a separate, older design.
 * Corners are squared off (rounded-sm) rather than heavily rounded,
 * matching the sharper-edged look of the rest of the cinematic UI.
 *
 * Opt-in animation props (both respect prefers-reduced-motion):
 *   - `hover`  : lifts the card slightly on hover, for interactive cards.
 *   - `reveal` : fades/rises the card into view on scroll. Only use this
 *                on a card that is NOT already inside a motion stagger
 *                container (otherwise let the parent drive the reveal).
 */
export default function Card({
  children,
  className = "",
  glow = false,
  hud = false,
  hover = false,
  reveal = false,
  as: Tag = "div",
  ...props
}) {
  const reduce = useReducedMotion();
  const classes = `glass rounded-sm p-6 ${glow ? "shadow-crimson" : ""} ${hud ? "hud-corners" : ""} ${className}`;

  // Plain, non-animated card - keep it a lightweight host element so
  // nothing changes for the many existing callers that don't opt in.
  if ((!hover && !reveal) || reduce) {
    return (
      <Tag className={classes} {...props}>
        {children}
      </Tag>
    );
  }

  const MotionTag = motion(Tag);
  const revealProps = reveal
    ? {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "0px 0px -12% 0px" },
        transition: { duration: 0.6, ease: EASE_CINEMATIC },
      }
    : {};
  const hoverProps = hover
    ? { whileHover: { y: -4, transition: { duration: 0.25, ease: EASE_CINEMATIC } } }
    : {};

  return (
    <MotionTag className={classes} {...revealProps} {...hoverProps} {...props}>
      {children}
    </MotionTag>
  );
}
