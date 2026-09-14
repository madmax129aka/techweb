import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LiquidMetal } from "@paper-design/shaders-react";
import { Button } from "@/components/shadcn/button";
import { Badge } from "@/components/shadcn/badge";
import { Card, CardContent } from "@/components/shadcn/card";
import { cn } from "@/lib/utils";

/**
 * `LiquidMetalHero` - a full-viewport hero section with a real-time
 * "liquid metal" WebGL shader background (`@paper-design/shaders-react`'s
 * `LiquidMetal` component), a badge/title/subtitle/two-CTA content block,
 * and an optional row of up to 3 feature cards.
 *
 * PROVENANCE / HONESTY NOTE: this component was requested as an adaptation
 * of a specific third-party component published on 21st.dev / cult-ui's
 * shadcn registry ("hero-liquid-metal"). That exact source file could not
 * be retrieved in this sandbox - both cult-ui.com's component page/JSON
 * registry endpoint and the likely GitHub source path returned HTTP 403
 * (blocked), and this sandbox has no npm registry access to install the
 * package and inspect it locally either. What follows is a FAITHFUL
 * RECONSTRUCTION built from: (a) the third party's own public description
 * of the component ("split-layout hero section with responsive LiquidMetal
 * shader visuals, CTA content, and tech stack badges"), (b) the real,
 * documented public API of `@paper-design/shaders-react`'s `LiquidMetal`
 * shader (confirmed via that package's own docs/examples), and (c) every
 * structural/theming requirement given directly for this integration
 * (badge/title/subtitle/dual-CTA/features props, dark theme overrides,
 * fixed full-bleed shader background at z-index -10, reduced-motion
 * handling). It is NOT a verified byte-for-byte copy of the original file -
 * flagging this clearly since presenting a reconstruction as an exact copy
 * would be misleading.
 *
 * TYPE-LEVEL ADAPTATION (per the integration instructions): this is a
 * plain .jsx file - no "use client" directive (a Next.js App Router
 * concept with no meaning in a Vite SPA, so it's omitted rather than kept
 * as dead code), no `interface LiquidMetalHeroProps` block, no parameter
 * type annotations. Destructured props + default values are kept exactly
 * as such syntax would look with the types stripped out.
 */

/**
 * Locally-authored preset palette (NOT the original component's literal
 * `liquidMetalPresets` array, which was never retrieved - see the
 * provenance note above). Five entries, indices 0-4, so that
 * `presetIndex` can be swapped the same way the original instructions
 * describe ("test presets 0 through 4 ... pick the one that reads as
 * dark crimson/bronze"). Preset 2 is selected below as TechAstra's
 * dark-crimson/bronze molten-metal look, replacing whatever silver/
 * chrome-leaning default the third-party component originally shipped
 * with, per the explicit "silver default will clash with the theme"
 * instruction.
 */
const liquidMetalPresets = [
  { colorBack: "#0d0303", colorTint: "#e2e8f0" }, // 0 - cold chrome/silver (the kind of default this integration explicitly rejects)
  { colorBack: "#0d0303", colorTint: "#8fd8ff" }, // 1 - cool cyan-steel
  { colorBack: "#12080a", colorTint: "#aa3a1f" }, // 2 - dark crimson/bronze molten metal (TechAstra's pick)
  { colorBack: "#1a0d0f", colorTint: "#d9a840" }, // 3 - warm gold/bronze (closer to the site's trim-gold accent)
  { colorBack: "#0d0303", colorTint: "#7a1620" }, // 4 - deep blood-red, minimal highlight contrast
];

const ENTRANCE_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function LiquidMetalHero({
  badge,
  title,
  subtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  features = [],
  presetIndex = 2, // TechAstra's dark crimson/bronze preset - see liquidMetalPresets above
}) {
  // Section 5C's TechAstraCore already established the pattern this app
  // uses for prefers-reduced-motion: don't remove the element, remove the
  // MOTION. useReducedMotion (framer-motion's own hook, not a hand-rolled
  // matchMedia check) mirrors that here - when true, entrance animations
  // render in their final "visible" state immediately (transition
  // duration 0) rather than animating in, and Framer's `transition` object
  // below is skipped/zeroed rather than the whole motion.div being ripped
  // out, per this integration's explicit instruction to shorten/remove
  // transitions rather than removing the elements.
  const shouldReduceMotion = useReducedMotion();

  const preset = useMemo(
    () => liquidMetalPresets[presetIndex] ?? liquidMetalPresets[2],
    [presetIndex]
  );

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/*
        Full-bleed shader background. `position: fixed, inset: 0,
        z-index: -10` per the integration's explicit verification
        requirement - fixed (not absolute) so it stays put even if this
        section's own content scrolls past its own height, and z-[-10]
        keeps it behind literally everything else in the app, including
        the custom cursor (z-index 9999/9998) and the fixed header
        (z-index 20) that might render above this section in the page.

        VERIFICATION CAVEAT: @paper-design/shaders-react cannot be
        installed in this sandbox (no npm registry access), so the exact
        prop names/value ranges below are taken from that package's own
        published usage examples, but this specific combination has not
        been rendered or visually confirmed. `shape="circle"` (rather than
        supplying an `image`) uses the shader's built-in abstract-shape
        mode - if the real API rejects that value or renders differently
        than expected, the values here (colorBack/colorTint/scale/speed/
        etc.) are the first things to adjust after a real `npm install`.
      */}
      <div className="fixed inset-0 z-[-10]" aria-hidden="true">
        <LiquidMetal
          style={{ width: "100%", height: "100%" }}
          shape="circle"
          colorBack={preset.colorBack}
          colorTint={preset.colorTint}
          repetition={4}
          softness={0.4}
          shiftRed={0.3}
          shiftBlue={0.1}
          distortion={0.15}
          contour={0.5}
          angle={45}
          speed={shouldReduceMotion ? 0 : 0.6}
          scale={1}
        />
        {/* Extra darkening scrim between the shader and the content -
            the shader alone (a bright, high-contrast metal surface) would
            fight with foreground text for legibility; this keeps the
            TechAstra deep charcoal-red reading as the dominant tone. */}
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          initial={shouldReduceMotion ? "visible" : "hidden"}
          animate="visible"
          variants={ENTRANCE_VARIANTS}
          transition={transition}
        >
          {badge && (
            <Badge
              variant="outline"
              className="mb-6 border-accent/50 text-accent bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em]"
            >
              {badge}
            </Badge>
          )}
        </motion.div>

        <motion.h1
          initial={shouldReduceMotion ? "visible" : "hidden"}
          animate="visible"
          variants={ENTRANCE_VARIANTS}
          transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.1 }}
          className="max-w-3xl font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            variants={ENTRANCE_VARIANTS}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.2 }}
            className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            {subtitle}
          </motion.p>
        )}

        <motion.div
          initial={shouldReduceMotion ? "visible" : "hidden"}
          animate="visible"
          variants={ENTRANCE_VARIANTS}
          transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          {primaryCtaLabel && (
            <Button
              onClick={onPrimaryCtaClick}
              size="lg"
              className={cn(
                // Required override: the primary CTA uses the TechAstra
                // red gradient already used elsewhere in the app
                // (Login.css's .login-btn), NOT the component's default
                // bg-foreground/text-background treatment - same hover
                // scale/shadow animation logic as before, just restyled.
                "bg-gradient-to-br from-red-500 to-red-900 text-white shadow-[0_0_24px_rgba(239,68,68,0.35)]",
                "px-8 py-6 text-sm font-semibold uppercase tracking-wider transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_4px_32px_rgba(239,68,68,0.5)]"
              )}
            >
              {primaryCtaLabel}
            </Button>
          )}
          {secondaryCtaLabel && (
            <Button
              onClick={onSecondaryCtaClick}
              variant="outline"
              size="lg"
              className="border-accent/40 px-8 py-6 text-sm font-semibold uppercase tracking-wider text-accent hover:bg-accent/10 hover:text-accent"
            >
              {secondaryCtaLabel}
            </Button>
          )}
        </motion.div>

        {features.length > 0 && (
          <motion.div
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            variants={ENTRANCE_VARIANTS}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.4 }}
            className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3"
          >
            {features.map((feature, i) => (
              <Card
                key={typeof feature === "string" ? feature : feature.name ?? i}
                className="border-border/50 bg-card/60 text-left backdrop-blur-sm"
              >
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-foreground">
                    {typeof feature === "string" ? feature : feature.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
