/**
 * Shared Framer Motion variants and helpers for the whole client app.
 *
 * The app's established prefers-reduced-motion philosophy (set in
 * TechAstraCore / liquid-metal-hero) is: don't remove the ELEMENT, remove
 * the MOTION. These variants follow the same idea - when a component reads
 * `useReducedMotion()` and passes the result into `motionProps()` /
 * `withReducedMotion()`, the element still mounts and reveals, it just
 * skips the translate/scale and snaps to its final state with a zeroed
 * transition instead of animating in.
 *
 * Usage patterns:
 *   import { motion } from "framer-motion";
 *   import { fadeUp, staggerContainer, viewportOnce, hoverLift } from "@/lib/motion";
 *
 *   // Scroll-triggered fade-up (fires once when scrolled into view):
 *   <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce}>
 *
 *   // Staggered reveal of a list/grid:
 *   <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce}>
 *     {items.map(...) => <motion.div variants={fadeUp} />}
 *   </motion.div>
 *
 *   // Hover/tap on interactive elements:
 *   <motion.button {...hoverLift}>
 */

// The app's signature cinematic easing (same curve used by the hero's
// entrance transition) - a soft, expensive-feeling ease-out.
export const EASE_CINEMATIC = [0.16, 1, 0.3, 1];

// Standard viewport config for scroll-triggered reveals: fire once, and
// start a little before the element is fully on screen so it feels
// responsive rather than "popping in" late.
export const viewportOnce = { once: true, margin: "0px 0px -12% 0px" };

/**
 * Fade + rise. The default building block for scroll reveals and
 * entrances. `show` accepts an optional custom `i` (via the `custom`
 * prop) to offset its delay, but staggerContainer handles most of that
 * automatically.
 */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_CINEMATIC },
  },
};

/** Plain fade, no movement - for backgrounds/overlays/hero copy. */
export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: EASE_CINEMATIC } },
};

/** Fade + slide in from the left - for alternating section content. */
export const fadeInLeft = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_CINEMATIC } },
};

/** Fade + slide in from the right - for alternating section content. */
export const fadeInRight = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_CINEMATIC } },
};

/**
 * Container that staggers the entrance of its children. Give the children
 * a `fadeUp` (or similar) variant with matching "hidden"/"show" keys and
 * they'll cascade in.
 */
export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** A slightly slower cascade for larger hero-level groupings. */
export const staggerContainerSlow = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
};

/**
 * Smooth hover/tap treatment for interactive elements (buttons, cards).
 * Spread directly onto a motion element: `<motion.div {...hoverLift} />`.
 */
export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.25, ease: EASE_CINEMATIC } },
  whileTap: { scale: 0.98 },
};

/** A gentler hover for buttons - subtle scale, no lift. */
export const hoverScale = {
  whileHover: { scale: 1.03, transition: { duration: 0.2, ease: EASE_CINEMATIC } },
  whileTap: { scale: 0.97 },
};

/**
 * Reduced-motion helper. Pass the boolean from framer-motion's
 * `useReducedMotion()` hook. When motion is reduced this returns props
 * that keep the element visible in its final state and disable hover/tap
 * transforms; otherwise it returns the provided motion props unchanged.
 *
 *   const reduce = useReducedMotion();
 *   <motion.div {...withReducedMotion(reduce, { ...hoverLift })} />
 */
export function withReducedMotion(reduce, props = {}) {
  if (!reduce) return props;
  const { whileHover, whileTap, ...rest } = props;
  return rest;
}

/**
 * Returns the standard scroll-reveal props for a variant, honoring
 * reduced motion. When reduced, the element renders directly in its
 * "show" state (no initial hidden offset, no scroll trigger needed).
 *
 *   const reduce = useReducedMotion();
 *   <motion.section {...revealProps(reduce, fadeUp)} />
 */
export function revealProps(reduce, variants = fadeUp) {
  if (reduce) {
    return { variants, initial: false, animate: "show" };
  }
  return {
    variants,
    initial: "hidden",
    whileInView: "show",
    viewport: viewportOnce,
  };
}
