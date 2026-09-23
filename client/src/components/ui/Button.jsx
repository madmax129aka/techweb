import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_CINEMATIC } from "@/lib/motion";

const VARIANTS = {
  primary:
    "relative overflow-hidden bg-cta-gradient text-white font-bold shadow-crimson hover:shadow-crimson-lg border border-crimson-light/50 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] rounded-xl uppercase",
  secondary: "bg-arc text-onyx font-bold hover:bg-arc-light shadow-arc rounded-xl uppercase",
  outline: "border border-crimson/40 text-crimson-light hover:border-crimson hover:bg-crimson/10 bg-transparent rounded-xl uppercase",
  danger: "bg-danger text-white hover:bg-danger/80 rounded-xl uppercase",
  ghost: "bg-transparent text-white hover:bg-white/10 rounded-xl uppercase",
  // Understated underlined text-link CTA ("EXPLORE EVENTS" style), for
  // cinematic hero/section calls-to-action - per the "Rolls-Royce" layout
  // brief, hero CTAs should read as a quiet text link, not a filled
  // button. Filled variants above are kept as-is for portal/form usability
  // (approve/reject, submit, generate, etc.) where a clear button affordance
  // still matters. Reuses the .link-cta CSS utility (index.css) so the
  // exact same treatment is available outside the Button component too.
  link: "link-cta !p-0 !rounded-none bg-transparent",
};

const SIZES = {
  sm: "px-3 py-2.5 text-sm min-h-[44px]",
  md: "px-5 py-3 text-sm min-h-[44px]",
  lg: "px-8 py-4 text-base tracking-wide min-h-[48px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  // `plain`: opts a single button instance OUT of the hover
  // scale/lift + primary-variant shimmer sweep, without touching the
  // shared defaults every other Button on the site still uses. Added
  // for the Event Detail Register CTA specifically - inside that
  // section's scroll-reveal wrapper (opacity/clip-path/translate all
  // already animating in as the panel scrolls into view), the
  // button's OWN extra hover-scale + shimmer read as a second,
  // competing animation layered on top and looked off / "weird" per
  // direct feedback - not a site-wide styling complaint.
  plain = false,
  ...props
}) {
  const isLink = variant === "link";
  const reduce = useReducedMotion();

  // Smooth hover/tap feedback via Framer Motion. Reduced-motion users and
  // disabled buttons get no transform animation (per the app's "remove the
  // motion, not the element" convention). The link variant is an
  // understated text CTA that already animates its own underline in CSS,
  // so it's left with just a light tap response.
  const interactive = !disabled && !reduce && !plain;
  const motionFeedback = interactive
    ? {
        whileHover: isLink ? { x: 2 } : { scale: 1.03, y: -1 },
        whileTap: { scale: 0.97 },
        transition: { duration: 0.2, ease: EASE_CINEMATIC },
      }
    : {};

  return (
    <motion.button
      type={type}
      disabled={disabled}
      {...motionFeedback}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${isLink ? "" : "text-xs sm:text-sm"} ${VARIANTS[variant]} ${isLink ? "" : SIZES[size]} ${className}
      `}
      {...props}
    >
      {variant === "primary" && !disabled && !plain && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/3"
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {isLink && <span aria-hidden="true">&rarr;</span>}
      </span>
    </motion.button>
  );
}
